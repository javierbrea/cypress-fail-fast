import { runSpecsTests } from "./support/TestsRunner";

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

runSpecsTests("When disabled by global configuration", {
  cypressVariant: "cypress-latest",
  specsFolder: "no-config",
  config: {
    failFastEnabled: false,
  },
  specsResults: [
    {
      executed: 4,
      passed: 2,
      failed: 2,
      pending: 0,
    },
    {
      executed: 4,
      passed: 4,
      failed: 0,
      pending: 0,
    },
    {
      executed: 3,
      passed: 2,
      failed: 1,
      pending: 0,
    },
  ],
});

runSpecsTests("When spec strategy is set", {
  cypressVariant: "cypress-latest",
  specsFolder: "no-config",
  config: {
    failFastStrategy: "spec",
  },
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
});

runSpecsTests("When bail is 2 and strategy is spec", {
  cypressVariant: "cypress-latest",
  specsFolder: "no-config",
  config: {
    failFastBail: 2,
    failFastStrategy: "spec",
  },
  specsResults: [
    {
      executed: 4,
      passed: 1,
      failed: 2,
      pending: 1,
    },
    {
      executed: 4,
      passed: 4,
      failed: 0,
      pending: 0,
    },
    {
      executed: 3,
      passed: 2,
      failed: 1,
      pending: 0,
    },
  ],
});

runSpecsTests("When bail is 2 and strategy is run", {
  cypressVariant: "cypress-latest",
  specsFolder: "no-config",
  config: {
    failFastBail: 2,
    failFastStrategy: "run",
  },
  specsResults: [
    {
      executed: 4,
      passed: 1,
      failed: 2,
      pending: 1,
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

runSpecsTests("When bail is 3 and strategy is run", {
  cypressVariant: "cypress-latest",
  specsFolder: "no-config",
  config: {
    failFastBail: 3,
    failFastStrategy: "run",
  },
  specsResults: [
    {
      executed: 4,
      passed: 2,
      failed: 2,
      pending: 0,
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
});
