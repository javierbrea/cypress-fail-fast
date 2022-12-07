const path = require("path");
const fsExtra = require("fs-extra");

const { runParallelSpecsTests } = require("./support/testsRunner");

const removeParallelStorage = () => {
  const parallelStorageFolder = path.resolve(__dirname, "..", "parallel-storage");
  fsExtra.removeSync(path.resolve(parallelStorageFolder, "run-a-is-cancelled.json"));
  fsExtra.removeSync(path.resolve(parallelStorageFolder, "run-b-is-waiting.json"));
};

runParallelSpecsTests(
  "When parallel strategy is enabled and first tests run fails",
  [
    {
      cypressVersion: "latest",
      configFile: "parallel-preprocessor-babel-config.config.js",
      specs: "parallel-failing",
      delay: 5000,
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
      cypressVersion: "ts",
      configFile: "parallel-ts.config.js",
      configFileDest: "cypress.config.js",
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
      cypressVersion: "8",
      pluginFile: "parallel-preprocessor-babel-config",
      specs: "parallel-failing",
      delay: 5000,
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
      cypressVersion: "7",
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
/* 

runParallelSpecsTests(
  "When parallel strategy is disabled and first tests run fails",
  [
    {
      cypressVersion: "latest",
      configFile: "parallel-preprocessor-babel-config.config.js",
      specs: "parallel-failing",
      delay: 5000,
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
      cypressVersion: "8",
      pluginFile: "parallel-preprocessor-babel-config",
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
); */
