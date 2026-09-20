const fs = require('fs');
const path = require('path');

const jiraBaseUrl = process.env.JIRA_BASE_URL?.replace(/\/$/, '');
const jiraUserEmail = process.env.JIRA_USER_EMAIL;
const jiraApiToken = process.env.JIRA_API_TOKEN;
const jiraReporterAccountId = process.env.JIRA_REPORTER_ACCOUNT_ID;
const jiraProject = process.env.JIRA_PROJECT || 'BSQA';
const recoveryIssueMap = new Map(
  (process.env.AFT_RECOVERY_ISSUE_MAP || '')
    .split(',')
    .map((entry) => entry.split('=').map((value) => value.trim()))
    .filter(([spec, issueKey]) => spec && issueKey)
);
const branch = process.env.GITHUB_REF_NAME || 'local';
const commitId = process.env.GITHUB_SHA || 'local';
const runUrl = process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID
  ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
  : 'local run';

if (!jiraBaseUrl || !jiraUserEmail || !jiraApiToken || !jiraReporterAccountId) {
  console.error('Jira credentials and JIRA_REPORTER_ACCOUNT_ID are required to run AFT processing.');
  process.exit(1);
}

const authHeader = `Basic ${Buffer.from(`${jiraUserEmail}:${jiraApiToken}`).toString('base64')}`;

function adfText(text) {
  return {
    type: 'doc',
    version: 1,
    content: [{
      type: 'paragraph',
      content: [{ type: 'text', text }],
    }],
  };
}

async function jiraRequest(endpoint, options = {}) {
  const response = await fetch(`${jiraBaseUrl}${endpoint}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      Authorization: authHeader,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Jira ${options.method || 'GET'} ${endpoint} failed (${response.status}): ${body}`);
  }

  return response.status === 204 ? null : response.json();
}

function collectJsonFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? collectJsonFiles(entryPath) : entry.name.endsWith('.json') ? [entryPath] : [];
  });
}

function getTestResults() {
  const tests = [];
  for (const filePath of collectJsonFiles(path.join(process.cwd(), 'cypress', 'results'))) {
    const report = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    for (const result of report.results || []) {
      const addSuiteTests = (suite) => {
        for (const test of suite.tests || []) {
          tests.push({
            spec: result.file || result.fullFile || 'unknown-spec',
            title: test.fullTitle || `${suite.title} ${test.title}`,
            state: test.state,
          });
        }
        for (const childSuite of suite.suites || []) addSuiteTests(childSuite);
      };
      for (const suite of result.suites || []) addSuiteTests(suite);
    }
  }
  return tests;
}

function getScreenshotForTest(test) {
  const screenshotsDir = path.join(process.cwd(), 'cypress', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) return null;
  const specName = path.basename(test.spec).replace(/\.[^.]+$/, '');
  const title = test.title.toLowerCase();
  const files = [];

  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(entryPath);
      else if (entry.name.endsWith('.png')) files.push(entryPath);
    }
  }

  walk(screenshotsDir);
  return files.find((filePath) => filePath.toLowerCase().includes(title))
    || files.find((filePath) => filePath.toLowerCase().includes(specName.toLowerCase()))
    || files[0]
    || null;
}

function testIdentity(test) {
  return `${path.basename(test.spec)}::${test.title}`;
}

function issueSummary(test) {
  return `AFT: ${testIdentity(test)} failed on ${branch}`;
}

function testLabel(test) {
  return `aft-test-${testIdentity(test).replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase().slice(0, 200)}`;
}

async function findIssuesByJql(jql, maxResults = 100) {
  const result = await jiraRequest(`/rest/api/3/search/jql?jql=${encodeURIComponent(jql)}&maxResults=${maxResults}&fields=summary,status,labels,description,comment`);
  return result.issues || [];
}

async function findIssueByKey(issueKey) {
  const issue = await jiraRequest(`/rest/api/3/issue/${encodeURIComponent(issueKey)}?fields=summary,status,labels,description,comment,reporter`);
  if (!isOpenIssue(issue)) return null;
  return issue;
}

function isOpenIssue(issue) {
  const status = issue.fields.status || {};
  return status.statusCategory?.key !== 'done'
    && !/closed|resolved|done/i.test(status.name || '');
}

function commentText(comment) {
  return JSON.stringify(comment.body || comment);
}

function hasComment(issue, marker) {
  return (issue.fields.comment?.comments || []).some((comment) => commentText(comment).includes(marker));
}

function uniqueIssues(issues) {
  return [...new Map(issues.map((issue) => [issue.key, issue])).values()];
}

async function findIssues(test) {
  const label = testLabel(test);
  const identity = testIdentity(test);
  const automationIssues = await findIssuesByJql(
    `project = ${jiraProject} AND statusCategory != Done AND labels = automation-failure ORDER BY created DESC`
  );
  const matchingIssues = automationIssues.filter((issue) => {
    const description = JSON.stringify(issue.fields.description || '');
    return (issue.fields.labels || []).includes(label)
      || issue.fields.summary === issueSummary(test)
      || description.includes(identity);
  });

  const mappedIssueKey = recoveryIssueMap.get(test.title);
  if (mappedIssueKey) {
    matchingIssues.push(await findIssueByKey(mappedIssueKey));
  }

  return uniqueIssues(matchingIssues.filter(Boolean).filter(isOpenIssue));
}

async function createIssue(test) {
  const summary = issueSummary(test);
  const issues = await findIssues(test);
  if (issues.length) return issues[0];

  const result = await jiraRequest('/rest/api/3/issue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: {
        project: { key: jiraProject },
        issuetype: { name: 'Bug' },
        summary,
        labels: ['automation-failure', testLabel(test)],
        ...(jiraReporterAccountId ? { reporter: { accountId: jiraReporterAccountId } } : {}),
        description: adfText(`Automated Cypress failure for exact test case: ${testIdentity(test)}. Commit: ${commitId}. Run: ${runUrl}`),
      },
    }),
  });
  return { key: result.key, fields: { labels: ['automation-failure'] } };
}

async function addComment(issueKey, text) {
  await jiraRequest(`/rest/api/3/issue/${issueKey}/comment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body: adfText(text) }),
  });
}

async function addLabel(issue, label) {
  await jiraRequest(`/rest/api/3/issue/${issue.key}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ update: { labels: [{ add: label }] } }),
  });
}

async function setReporter(issueKey) {
  await jiraRequest(`/rest/api/3/issue/${issueKey}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: { reporter: { accountId: jiraReporterAccountId } } }),
  });

  const issue = await jiraRequest(`/rest/api/3/issue/${issueKey}?fields=reporter`);
  if (issue.fields.reporter?.accountId !== jiraReporterAccountId) {
    throw new Error(`Jira reporter was not set to JIRA_REPORTER_ACCOUNT_ID for ${issueKey}.`);
  }
}

async function attachScreenshot(issueKey, screenshotPath) {
  if (!screenshotPath) return;
  const form = new FormData();
  form.append('file', new Blob([fs.readFileSync(screenshotPath)]), path.basename(screenshotPath));
  await jiraRequest(`/rest/api/3/issue/${issueKey}/attachments`, {
    method: 'POST',
    headers: { 'X-Atlassian-Token': 'no-check' },
    body: form,
  });
}

async function closeIssue(issue) {
  const transitions = await jiraRequest(`/rest/api/3/issue/${issue.key}/transitions`);
  const transition = transitions.transitions.find(({ name, to }) =>
    /close|done|resolve/i.test(name) || /close|done|resolve/i.test(to?.name || '')
  );
  if (!transition) {
    throw new Error(`No closeable Jira transition found for ${issue.key}.`);
  }
  await jiraRequest(`/rest/api/3/issue/${issue.key}/transitions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transition: { id: transition.id } }),
  });
}

async function processFailure(test) {
  const issues = await findIssues(test);
  const failureIssues = issues.length ? issues : [await createIssue(test)];
  for (const issue of failureIssues) {
    if (!isOpenIssue(issue)) continue;
    if (hasComment(issue, `Commit: ${commitId}`)) {
      console.log(`AFT failure already recorded for ${issue.key} at commit ${commitId}.`);
      continue;
    }
    await setReporter(issue.key);
    await addComment(issue.key, `Exact test case still failing: ${testIdentity(test)}. Commit: ${commitId}. Run: ${runUrl}`);
    console.log(`AFT failure recorded in ${issue.key}`);
  }
}

async function processRecovery(test) {
  const issues = await findIssues(test);
  if (!issues.length) {
    console.log(`No previous AFT issue found for ${testIdentity(test)}.`);
    return;
  }

  const screenshotPath = getScreenshotForTest(test);
  for (const issue of issues) {
    if (!isOpenIssue(issue)) continue;
    if (hasComment(issue, `Exact test case now passed: ${testIdentity(test)}. Commit: ${commitId}.`)) {
      console.log(`AFT recovery already recorded for ${issue.key} at commit ${commitId}.`);
      continue;
    }
    await setReporter(issue.key);
    await attachScreenshot(issue.key, screenshotPath);
    await addComment(issue.key, `Exact test case now passed: ${testIdentity(test)}. Commit: ${commitId}. Passing-run screenshot attached. Run: ${runUrl}`);

    if ((issue.fields.labels || []).includes('aft-closable')) {
      await closeIssue(issue);
      console.log(`AFT issue ${issue.key} closed after recovery.`);
    } else {
      await addLabel(issue, 'aft-closable');
      console.log(`AFT issue ${issue.key} marked aft-closable after recovery.`);
    }
  }
}

async function main() {
  const results = getTestResults();
  if (!results.length) throw new Error('No Cypress JSON results found.');

  for (const result of results) {
    if (result.state === 'failed') await processFailure(result);
    else if (result.state === 'passed') await processRecovery(result);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
