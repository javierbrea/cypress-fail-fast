import { runSpecsTests } from "./support/TestsRunner";

runSpecsTests("When disabled in describe but enabled in test", {
  cypressVariant: "cypress-latest",
  specsFolder: "describe-disabled-test-enabled",
  specsResults: [
    {
      executed: 5,
      passed: 1,
      failed: 2,
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

runSpecsTests("When per-config test is disabled", {
  cypressVariant: "cypress-latest",
  specsFolder: "describe-disabled-test-enabled",
  config: {
    failFastIgnorePerTestConfig: true,
  },
  specsResults: [
    {
      executed: 5,
      passed: 0,
      failed: 1,
      pending: 4,
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

runSpecsTests("When enabled in describe but disabled in test", {
  cypressVariant: "cypress-latest",
  specsFolder: "describe-enabled-test-disabled",
  specsResults: [
    {
      executed: 4,
      passed: 3,
      failed: 1,
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
      retries: [
        {
          attempts: 4,
          test: "should display first item",
        },
      ],
    },
  ],
});

runSpecsTests("When configured in grandparent describe", {
  cypressVariant: "cypress-latest",
  specsFolder: "grandparent-describe-enabled",
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
      passed: 0,
      failed: 0,
      pending: 3,
    },
  ],
});

runSpecsTests("When configured in grandparent describe in spec mode", {
  cypressVariant: "cypress-latest",
  specsFolder: "grandparent-describe-enabled",
  config: {
    failFastStrategy: "spec",
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
      passed: 1,
      failed: 1,
      pending: 1,
    },
  ],
});

runSpecsTests(
  "When configured in grandparent describe and per-test config is disabled",
  {
    cypressVariant: "cypress-latest",
    specsFolder: "grandparent-describe-enabled",
    config: {
      failFastIgnorePerTestConfig: true,
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
  },
);

runSpecsTests(
  "When configured in grandparent describe and per-test config is disabled and bail is 3",
  {
    cypressVariant: "cypress-latest",
    specsFolder: "grandparent-describe-enabled",
    config: {
      failFastIgnorePerTestConfig: true,
      failFastBail: 3,
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
        passed: 0,
        failed: 0,
        pending: 3,
      },
    ],
  },
);
