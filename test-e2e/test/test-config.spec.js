const { runSpecsTests } = require("./support/testsRunner");

runSpecsTests("When it is enabled in describe but disabled in test", {
  specs: "describe-enabled-test-disabled",
  skipVariants: false,
  specsResults: [
    {
      logBefore: true,
      executed: 4,
      passed: 3,
      failed: 1,
      skipped: 0,
    },
    {
      logBefore: true,
      executed: 4,
      passed: 4,
      failed: 0,
      skipped: 0,
    },
    {
      logBefore: true,
      executed: 3,
      passed: 1,
      failed: 1,
      skipped: 1,
    },
  ],
});

runSpecsTests("When it is disabled in describe but enabled in test", {
  specs: "describe-disabled-test-enabled",
  skipVariants: false,
  specsResults: [
    {
      logBefore: true,
      executed: 4,
      passed: 1,
      failed: 1,
      skipped: 2,
    },
    {
      logBefore: false,
      executed: 4,
      passed: 0,
      failed: 0,
      skipped: 4,
    },
    {
      logBefore: false,
      executed: 3,
      passed: 0,
      failed: 0,
      skipped: 3,
    },
  ],
});

runSpecsTests("When it is disabled in environment, disabled in describe and enabled in test", {
  specs: "describe-disabled-test-enabled",
  skipVariants: true,
  specsResults: [
    {
      logBefore: true,
      executed: 4,
      passed: 1,
      failed: 1,
      skipped: 2,
    },
    {
      logBefore: false,
      executed: 4,
      passed: 0,
      failed: 0,
      skipped: 4,
    },
    {
      logBefore: false,
      executed: 3,
      passed: 0,
      failed: 0,
      skipped: 3,
    },
  ],
  env: {
    CYPRESS_FAIL_FAST_ENABLED: "false",
  },
});

runSpecsTests(
  "When it is disabled in describe, enabled in test but plugin is disabled in environment",
  {
    specs: "describe-disabled-test-enabled",
    skipVariants: true,
    specsResults: [
      {
        logBefore: true,
        executed: 4,
        passed: 3,
        failed: 1,
        skipped: 0,
      },
      {
        logBefore: true,
        executed: 4,
        passed: 4,
        failed: 0,
        skipped: 0,
      },
      {
        logBefore: true,
        executed: 3,
        passed: 2,
        failed: 1,
        skipped: 0,
      },
    ],
    env: {
      CYPRESS_FAIL_FAST_PLUGIN: "false",
    },
  }
);

runSpecsTests(
  "When it is disabled in environment but enabled in configuration in grandparent suites",
  {
    specs: "grandparent-describe-enabled",
    skipVariants: true,
    specsResults: [
      {
        logBefore: true,
        executed: 4,
        passed: 3,
        failed: 1,
        skipped: 0,
      },
      {
        logBefore: true,
        executed: 4,
        passed: 1,
        failed: 2,
        skipped: 1,
      },
      {
        logBefore: false,
        executed: 3,
        passed: 0,
        failed: 0,
        skipped: 3,
      },
    ],
    env: {
      CYPRESS_FAIL_FAST_ENABLED: "false",
    },
  }
);
