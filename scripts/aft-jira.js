const fs = require('fs');
const path = require('path');

const jiraBaseUrl = process.env.JIRA_BASE_URL?.replace(/\/$/, '');
const jiraUserEmail = process.env.JIRA_USER_EMAIL;
const jiraApiToken = process.env.JIRA_API_TOKEN;
const jiraProject = process.env.JIRA_PROJECT || 'BSQA';
const recoveryIssueMap = new Map(
  (process.env.AFT_RECOVERY_ISSUE_MAP || '')
    .split(',')
    .map((entry) => entry.split('=').map((value) => value.trim()))
    .filter(([spec, issueKey]) => spec && issueKey)
);
const branch = process.env.GITHUB_REF_NAME || 'local';
const runUrl = process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID
  ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
  : 'local run';

if (!jiraBaseUrl || !jiraUserEmail || !jiraApiToken) {
  console.error('Jira credentials are required to run AFT processing.');
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

function getSpecResults() {
  return collectJsonFiles(path.join(process.cwd(), 'cypress', 'results'))
    .map((filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8')))
    .filter((report) => report.stats && report.results)
    .map((report) => ({
      spec: report.results[0]?.file || report.results[0]?.fullFile || report.info?.spec || 'unknown-spec',
      failures: report.stats.failures || 0,
      passes: report.stats.passes || 0,
    }));
}

function getScreenshotForSpec(spec) {
  const screenshotsDir = path.join(process.cwd(), 'cypress', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) return null;
  const specName = path.basename(spec).replace(/\.[^.]+$/, '');
  const files = [];

  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(entryPath);
      else if (entry.name.endsWith('.png')) files.push(entryPath);
    }
  }

  walk(screenshotsDir);
  return files.find((filePath) => filePath.toLowerCase().includes(specName.toLowerCase())) || files[0] || null;
}

function issueSummary(spec) {
  return `AFT: ${path.basename(spec)} failed on ${branch}`;
}

function testLabel(spec) {
  return `aft-test-${path.basename(spec).replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase()}`;
}

async function findIssuesByJql(jql, maxResults = 100) {
  const result = await jiraRequest(`/rest/api/3/search/jql?jql=${encodeURIComponent(jql)}&maxResults=${maxResults}&fields=summary,status,labels,description`);
  return result.issues || [];
}

async function findIssueByKey(issueKey) {
  return jiraRequest(`/rest/api/3/issue/${encodeURIComponent(issueKey)}?fields=summary,status,labels,description`);
}

function uniqueIssues(issues) {
  return [...new Map(issues.map((issue) => [issue.key, issue])).values()];
}

async function findIssues(spec) {
  const label = testLabel(spec);
  const specName = path.basename(spec);
  const automationIssues = await findIssuesByJql(
    `project = ${jiraProject} AND statusCategory != Done AND labels = automation-failure ORDER BY created DESC`
  );
  const matchingIssues = automationIssues.filter((issue) => {
    const description = JSON.stringify(issue.fields.description || '');
    return (issue.fields.labels || []).includes(label)
      || issue.fields.summary === issueSummary(spec)
      || description.includes(specName);
  });

  const mappedIssueKey = recoveryIssueMap.get(specName);
  if (mappedIssueKey) {
    matchingIssues.push(await findIssueByKey(mappedIssueKey));
  }

  // Recover issues created by the previous generic Jira workflow.
  if (!matchingIssues.length) {
    const legacyIssues = await findIssuesByJql(
      `project = ${jiraProject} AND statusCategory != Done AND summary = "CI Failure: Cypress BDD Test Failed on Branch ${branch}"`
    );
    matchingIssues.push(...legacyIssues);
  }

  return uniqueIssues(matchingIssues.filter(Boolean));
}

async function createIssue(spec) {
  const summary = issueSummary(spec);
  const issues = await findIssues(spec);
  if (issues.length) return issues[0];

  const result = await jiraRequest('/rest/api/3/issue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: {
        project: { key: jiraProject },
        issuetype: { name: 'Bug' },
        summary,
        labels: ['automation-failure', testLabel(spec)],
        description: adfText(`Automated Cypress failure for ${spec}. Run: ${runUrl}`),
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

async function processFailure(spec) {
  const issues = await findIssues(spec);
  const failureIssues = issues.length ? issues : [await createIssue(spec)];
  for (const issue of failureIssues) {
    await addComment(issue.key, `Cypress still fails for ${spec}. Run: ${runUrl}`);
    console.log(`AFT failure recorded in ${issue.key}`);
  }
}

async function processRecovery(spec) {
  const issues = await findIssues(spec);
  if (!issues.length) {
    console.log(`No previous AFT issue found for ${spec}.`);
    return;
  }

  const screenshotPath = getScreenshotForSpec(spec);
  for (const issue of issues) {
    await attachScreenshot(issue.key, screenshotPath);
    await addComment(issue.key, `Cypress passed for ${spec}. Passing-run screenshot attached. Run: ${runUrl}`);

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
  const results = getSpecResults();
  if (!results.length) throw new Error('No Cypress JSON results found.');

  for (const result of results) {
    if (result.failures > 0) await processFailure(result.spec);
    else if (result.passes > 0) await processRecovery(result.spec);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
