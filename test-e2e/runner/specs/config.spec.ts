import { runSpecsTests } from "./support/TestsRunner";

runSpecsTests("When all tests are passing", {
  cypressVariant: "cypress-latest",
  specsFolder: "all-tests-passing",
  specsResults: [
    {
      executed: 4,
      passed: 4,
      failed: 0,
      pending: 0,
    },
    {
      executed: 4,
      passed: 4,
      failed: 0,
      pending: 0,
    },
    {
      executed: 4,
      passed: 4,
      failed: 0,
      pending: 0,
    },
  ],
});

runSpecsTests("When it has default configuration", {
  cypressVariant: "cypress-latest",
  specsFolder: "no-config",
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
