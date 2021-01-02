const { runSpecsTests } = require("./support/testsRunner");

runSpecsTests("When it is enabled in environment and describe but disabled in test", {
  specs: "describe-enabled-test-disabled",
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
      passed: 1,
      failed: 1,
      skipped: 1,
    },
  ],
});

runSpecsTests("When it is enabled in environment, disabled in describe and enabled in test", {
  specs: "describe-disabled-test-enabled",
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

runSpecsTests("When it is disabled in describe, enabled in test but disabled in environment", {
  specs: "describe-disabled-test-enabled",
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
    CYPRESS_FAIL_FAST: "false",
  },
});

runSpecsTests("When it has configuration in grandparent suites", {
  specs: "grandparent-describe-enabled",
  specsResults: [
    {
      executed: 4,
      passed: 3,
      failed: 1,
      skipped: 0,
    },
    {
      executed: 4,
      passed: 1,
      failed: 2,
      skipped: 1,
    },
    {
      executed: 3,
      passed: 0,
      failed: 0,
      skipped: 3,
    },
  ],
});
