const path = require("path");
const fsExtra = require("fs-extra");

const { runParallelSpecsTests } = require("./support/testsRunner");
const cypressVariants = require("../commands/support/variants");

const removeParallelStorage = () => {
  fsExtra.removeSync(path.resolve(__dirname, "..", "parallel-storage", "parallel-storage.json"));
};

runParallelSpecsTests(
  "When parallel strategy is enabled and first tests run fails",
  [
    {
      cypress: cypressVariants[2],
      pluginFile: "parallel",
      specs: "environment-config-only",
      delay: 3000,
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
    },
    {
      cypress: cypressVariants[4],
      pluginFile: "parallel",
      specs: "all-tests-passing",
      specsResults: [
        {
          logBefore: true,
          executed: 4,
          passed: 4,
          failed: 0,
          skipped: 0,
        },
        {
          logBefore: true,
          executed: 4,
          passed: 0,
          failed: 0,
          skipped: 4,
        },
        {
          logBefore: false,
          executed: 4,
          passed: 0,
          failed: 0,
          skipped: 4,
        },
      ],
      env: {
        CYPRESS_FAIL_FAST_STRATEGY: "parallel",
      },
    },
  ],
  {
    afterAll: removeParallelStorage,
  }
);

runParallelSpecsTests(
  "When parallel strategy is enabled and first tests run fails using Cypress v8",
  [
    {
      cypress: cypressVariants[3],
      pluginFile: "parallel-preprocessor-babel-config",
      specs: "environment-config-only",
      delay: 3000,
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
    },
    {
      cypress: cypressVariants[2],
      pluginFile: "parallel",
      specs: "all-tests-passing",
      specsResults: [
        {
          logBefore: true,
          executed: 4,
          passed: 4,
          failed: 0,
          skipped: 0,
        },
        {
          logBefore: true,
          executed: 4,
          passed: 0,
          failed: 0,
          skipped: 4,
        },
        {
          logBefore: false,
          executed: 4,
          passed: 0,
          failed: 0,
          skipped: 4,
        },
      ],
      env: {
        CYPRESS_FAIL_FAST_STRATEGY: "parallel",
      },
    },
  ],
  {
    afterAll: removeParallelStorage,
  }
);

runParallelSpecsTests(
  "When parallel strategy is disabled and first tests run fails",
  [
    {
      cypress: cypressVariants[2],
      pluginFile: "parallel",
      specs: "environment-config-only",
      delay: 3000,
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
    },
    {
      cypress: cypressVariants[4],
      pluginFile: "parallel",
      specs: "all-tests-passing",
      specsResults: [
        {
          logBefore: true,
          executed: 4,
          passed: 4,
          failed: 0,
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
          executed: 4,
          passed: 4,
          failed: 0,
          skipped: 0,
        },
      ],
      env: {
        CYPRESS_FAIL_FAST_STRATEGY: "run",
      },
    },
  ],
  {
    afterAll: removeParallelStorage,
  }
);
