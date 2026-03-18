const { runSpecsTests } = require("./support/testsRunner");

runSpecsTests("When it has default configuration", {
  cypressVariant: "cypress-latest",
  specsFolder: "environment-config-only",
  specsResults: [
    {
      executed: 4,
      passed: 1,
      failed: 1,
      pending: 2,
    },
    {
      executed: 4,
      passed: 0,
      failed: 0,
      pending: 4,
    },
    {
      executed: 3,
      passed: 0,
      failed: 0,
      pending: 3,
    },
  ],
});
