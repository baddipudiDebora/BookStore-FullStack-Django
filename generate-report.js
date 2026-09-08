const { merge } = require("mochawesome-merge");
const marge = require("mochawesome-report-generator");
const fs = require("fs");
const path = require("path");

async function generateReport() {
  const reportsDir = path.join(__dirname, "cypress", "reports");
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const mergedJson = await merge({
    files: ["./cypress/results/*.json"],
  });

  await marge.create(mergedJson, {
    reportDir: "cypress/reports",
    reportTitle: "Django Bookstore BDD Test Results",
    inline: true,
  });

  console.log("✅ HTML Report created at cypress/reports/mochawesome.html");
}

generateReport().catch((err) => {
  console.error("❌ Failed to generate report:", err);
  process.exit(1);
});