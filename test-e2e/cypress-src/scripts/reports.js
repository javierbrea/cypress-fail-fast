const path = require("path");
const fsExtra = require("fs-extra");
const { merge } = require("mochawesome-merge");

function cypressPathBase() {
  return path.resolve(__dirname, "..", "cypress");
}

function cypressPath(filePath) {
  return path.resolve(cypressPathBase(), filePath);
}

function deletePreviousReports() {
  fsExtra.removeSync(cypressPath("results"));
  fsExtra.removeSync(cypressPath("mochawesome.json"));
  fsExtra.removeSync(path.resolve(__dirname, "..", "mochawesome-report"));
}

function mergeReports() {
  merge({
    files: ["./cypress/results/*.json"],
  }).then((report) => {
    fsExtra.writeJsonSync(cypressPath("mochawesome.json"), report);
  });
}

function run() {
  const command = process.argv[2];
  switch (command) {
    case "clean":
      deletePreviousReports();
      break;
    case "merge":
      mergeReports();
      break;
    default:
      console.log("Command not found");
  }
}

run();
