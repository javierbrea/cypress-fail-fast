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

runSpecsTests("When shouldTriggerFailFast is enabled", {
  cypressVariant: "cypress-latest",
  specsFolder: "grandparent-describe-enabled",
  config: {
    failFastStrategy: "spec",
    failFastIgnorePerTestConfig: true,
    failFastBail: 4,
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
      failed: 1,
      pending: 2,
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
    enableSkipModeAfterTests: 6,
  },
});

runSpecsTests("When onFailFastTriggered is async", {
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
    asyncHooks: true,
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

runSpecsTests("When shouldTriggerFailFast is async", {
  cypressVariant: "cypress-latest",
  specsFolder: "grandparent-describe-enabled",
  config: {
    failFastStrategy: "spec",
    failFastIgnorePerTestConfig: true,
    failFastBail: 4,
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
      failed: 1,
      pending: 2,
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
    enableSkipModeAfterTests: 6,
    asyncHooks: true,
  },
});

runSpecsTests(
  "When shouldTriggerFailFast is enabled and strategy is describe",
  {
    cypressVariant: "cypress-latest",
    specsFolder: "describe-strategy",
    config: {
      failFastStrategy: "describe",
    },
    specsResults: [
      // First spec: the failure in the first describe block scopes skip mode to
      // that block, so the hook keeps being consulted for the tests of the second
      // block. When it triggers, skip mode is widened to the whole spec, because
      // a failure-less trigger has no describe block to scope itself to.
      {
        executed: 6,
        passed: 1,
        failed: 1,
        pending: 4,
      },
      // Second and third specs: skip mode is reset per spec file, but the hook
      // keeps returning true, so it triggers again on their first test.
      {
        executed: 2,
        passed: 0,
        failed: 0,
        pending: 2,
      },
      {
        executed: 5,
        passed: 0,
        failed: 0,
        pending: 5,
      },
    ],
    hooks: {
      enableShouldTriggerFailFast: true,
      enableSkipModeAfterTests: 2,
    },
  },
);
