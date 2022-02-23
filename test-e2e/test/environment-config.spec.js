const { runSpecsTests } = require("./support/testsRunner");

runSpecsTests("When it has default configuration", {
  specs: "environment-config-only",
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

runSpecsTests("When it has BAIL configured and strategy is run", {
  specs: "many-failing-tests",
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
      executed: 5,
      passed: 1,
      failed: 2,
      skipped: 2,
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
    CYPRESS_FAIL_FAST_BAIL: 3,
  },
});

runSpecsTests("When it has BAIL configured and strategy is spec", {
  specs: "many-failing-tests",
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
      executed: 5,
      passed: 1,
      failed: 2,
      skipped: 2,
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
    CYPRESS_FAIL_FAST_BAIL: 2,
    CYPRESS_FAIL_FAST_STRATEGY: "spec",
  },
});

runSpecsTests("When it is disabled using plugin environment variable", {
  specs: "environment-config-only",
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
      passed: 2,
      failed: 1,
      skipped: 0,
    },
  ],
  env: {
    CYPRESS_FAIL_FAST_PLUGIN: false,
    CYPRESS_FAIL_FAST_ENABLED: true,
  },
});

runSpecsTests("When it is disabled using enabled environment variable", {
  skipVariants: true,
  specs: "environment-config-only",
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
    CYPRESS_FAIL_FAST_ENABLED: false,
  },
});
