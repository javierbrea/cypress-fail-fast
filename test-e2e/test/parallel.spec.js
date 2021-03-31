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
      cypress: cypressVariants[1],
      pluginFile: "parallel",
      specs: "environment-config-only",
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
    },
    {
      cypress: cypressVariants[2],
      pluginFile: "parallel",
      delay: 3000,
      specs: "all-tests-passing",
      specsResults: [
        {
          logBefore: false,
        },
        {
          logBefore: false,
        },
        {
          logBefore: false,
          executed: 4,
          passed: 0,
          failed: 0,
          skipped: 4,
        },
      ],
    },
  ],
  {
    afterAll: removeParallelStorage,
  }
);
