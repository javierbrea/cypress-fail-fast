import { runSpecsTests } from "./support/TestsRunner";

runSpecsTests("When describe strategy is set", {
  cypressVariant: "cypress-latest",
  specsFolder: "describe-strategy",
  config: {
    failFastStrategy: "describe",
  },
  specsResults: [
    // First spec: the failure in the first describe block skips only the
    // remaining tests of that block (including its nested describe), and the
    // second describe block runs normally.
    {
      executed: 6,
      passed: 3,
      failed: 1,
      pending: 2,
    },
    // Second spec: fully passing, proving the skip scope from the previous
    // spec file does not leak into the next one.
    {
      executed: 2,
      passed: 2,
      failed: 0,
      pending: 0,
    },
    // Third spec: the failure happens in a describe nested inside a block
    // carrying explicit failFast configuration, so the whole configured block
    // is skipped (including a sibling nested describe), while the describe
    // outside it runs normally.
    {
      executed: 4,
      passed: 2,
      failed: 1,
      pending: 1,
    },
  ],
});

runSpecsTests(
  "When describe strategy is set and specs contain a single describe",
  {
    cypressVariant: "cypress-latest",
    specsFolder: "no-config",
    config: {
      failFastStrategy: "describe",
    },
    // With a single root describe per spec file, the describe strategy behaves
    // exactly like the spec strategy: the failing describe is the whole spec.
    specsResults: [
      {
        executed: 4,
        passed: 1,
        failed: 1,
        pending: 2,
      },
      {
        executed: 4,
        passed: 4,
        failed: 0,
        pending: 0,
      },
      {
        executed: 3,
        passed: 1,
        failed: 1,
        pending: 1,
      },
    ],
  },
);
