import { runSpecsTests } from "./support/TestsRunner";

runSpecsTests("When onFailFastTriggered is enabled", {
  cypressVariant: "cypress-latest",
  specsFolder: "grandparent-describe-enabled",
  config: {
    failFastStrategy: "spec",
    failFastIgnorePerTestConfig: true,
    failFastBail: 2,
  },
  specsResults: [
    {
      executed: 4,
      passed: 3,
      failed: 1,
      pending: 0,
    },
    {
      executed: 4,
      passed: 1,
      failed: 2,
      pending: 1,
    },
    {
      executed: 3,
      passed: 2,
      failed: 1,
      pending: 0,
    },
  ],
  hooks: {
    enableOnFailFastTriggered: true,
    expectFailFastTriggeredLog: {
      strategy: "spec",
      test: {
        name: "should display second item",
        fullTitle:
          "List items fail-fast enabled Another describe Another describe should display second item",
      },
    },
  },
});

runSpecsTests("When onFailFastTriggered is enabled", {
  cypressVariant: "cypress-latest",
  specsFolder: "grandparent-describe-enabled",
  config: {
    failFastStrategy: "spec",
    failFastIgnorePerTestConfig: true,
    failFastBail: 2,
  },
  specsResults: [
    {
      executed: 4,
      passed: 3,
      failed: 1,
      pending: 0,
    },
    {
      executed: 4,
      passed: 0,
      failed: 1,
      pending: 3,
    },
    {
      executed: 3,
      passed: 0,
      failed: 0,
      pending: 3,
    },
  ],
  hooks: {
    enableShouldTriggerFailFast: true,
    enableSkipModeAfterTests: 5,
  },
});
