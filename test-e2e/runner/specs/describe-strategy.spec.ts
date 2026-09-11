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
    // Third spec: the configured ancestor does not expand the scope.
    // The sibling nested describe and outside describe both run normally.
    {
      executed: 5,
      passed: 3,
      failed: 1,
      pending: 1,
    },
  ],
});

runSpecsTests("When describe strategy is set and bail is greater than one", {
  cypressVariant: "cypress-latest",
  specsFolder: "describe-strategy-bail",
  config: {
    failFastStrategy: "describe",
    failFastBail: 2,
  },
  specsResults: [
    // First spec: one failure in each describe block. Failures are counted per
    // block, so neither reaches the bail limit and nothing is skipped. With a
    // counter shared by the whole spec this would be 1 passed and 1 pending.
    {
      executed: 4,
      passed: 2,
      failed: 2,
      pending: 0,
    },
    // Second spec: the first block accumulates both failures itself, reaching
    // the bail limit, so only its remaining test is skipped.
    {
      executed: 4,
      passed: 1,
      failed: 2,
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
