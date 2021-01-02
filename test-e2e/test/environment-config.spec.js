const { runSpecsTests } = require("./support/testsRunner");

runSpecsTests("When it is enabled using only environment variable in cypress.json", {
  specs: "environment-config-only",
  specsResults: [
    {
      executed: 4,
      passed: 1,
      failed: 1,
      skipped: 2,
    },
    {
      executed: 4,
      passed: 0,
      failed: 0,
      skipped: 4,
    },
    {
      executed: 3,
      passed: 0,
      failed: 0,
      skipped: 3,
    },
  ],
});

runSpecsTests("When it is disabled using only environment variable", {
  specs: "environment-config-only",
  specsResults: [
    {
      executed: 4,
      passed: 3,
      failed: 1,
      skipped: 0,
    },
    {
      executed: 4,
      passed: 4,
      failed: 0,
      skipped: 0,
    },
    {
      executed: 3,
      passed: 2,
      failed: 1,
      skipped: 0,
    },
  ],
  env: {
    CYPRESS_FAIL_FAST: false,
  },
});