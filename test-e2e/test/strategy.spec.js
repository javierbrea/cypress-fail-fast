const { runSpecsTests } = require("./support/testsRunner");

runSpecsTests("When strategy is spec", {
  specs: "describe-disabled-test-enabled",
  specsResults: [
    {
      logBefore: true,
      executed: 4,
      passed: 1,
      failed: 1,
      skipped: 2,
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
  env: {
    CYPRESS_FAIL_FAST_STRATEGY: "spec",
  },
});

runSpecsTests("When strategy is run", {
  skipVariants: true,
  specs: "describe-disabled-test-enabled",
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
    CYPRESS_FAIL_FAST_STRATEGY: "run",
  },
});

runSpecsTests("When strategy is parallel", {
  skipVariants: true,
  specs: "describe-disabled-test-enabled",
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
    CYPRESS_FAIL_FAST_STRATEGY: "parallel",
  },
});
