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
