[![Build status][build-image]][build-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Quality Gate][quality-gate-image]][quality-gate-url] [![Mutation testing badge](https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2Fjavierbrea%2Fcypress-fail-fast%2Fmain)](https://dashboard.stryker-mutator.io/reports/github.com/javierbrea/cypress-fail-fast/main)

[![Renovate](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com) [![Last commit][last-commit-image]][last-commit-url] [![Last release][release-image]][release-url]

[![NPM downloads][npm-downloads-image]][npm-downloads-url] [![License][license-image]][license-url]

# Cypress Fail Fast

Skip the rest of your Cypress tests after the first failure.

With Cypress Fail Fast, you can:

- Skip all remaining tests in the current spec file, or in the entire run, depending on the configured strategy.
- Control fail-fast behavior at a per-test or per-suite level, so you can choose which failures should trigger fail-fast mode and which should not.
- Set hooks to:
  - Run when fail-fast mode is triggered, so you can perform custom actions.
  - Trigger fail-fast mode at any moment based on custom logic.
  - Example use case: Coordinate multiple parallel runs so that when fail-fast mode is triggered in one run, the others start skipping tests as well.

## Table of Contents

- [Installation](#installation)
- [How it works](#how-it-works)
- [Configuration](#configuration)
  - [Plugin options](#plugin-options)
  - [Per-test configuration](#per-test-configuration)
  - [Examples](#examples)
  - [Hooks](#hooks)
- [Limitations](#limitations)
- [Usage with TypeScript](#usage-with-typescript)
- [Compatibility](#compatibility)
- [Contributing](#contributing)
- [License](#license)

## Installation

Add the plugin to your `devDependencies`:

```bash
npm install --save-dev cypress-fail-fast
```

Then register the plugin in your Cypress configuration (`cypress.config.ts` or `cypress.config.js`):

```ts
// cypress.config.ts
import { defineConfig } from "cypress";
import cypressFailFast from "cypress-fail-fast/plugin";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      cypressFailFast(on, config);
      return config;
    },
  },
});
```

At the top of your support file (for example `cypress/support/e2e.ts` or `cypress/support/e2e.js`):

```ts
import "cypress-fail-fast";
```

From now on, once a test fails (after its last retry), the plugin will enter "fail-fast" mode and start skipping the remaining tests according to the configured strategy. By default, the strategy is to skip all remaining tests in the entire run, but you can customize this behavior as explained in the [Configuration](#configuration) section.

## How it works

Cypress Fail Fast tracks when a test failure should trigger "fail-fast" mode and then uses Mocha's `this.skip()` to skip subsequent tests and hooks. Skipped tests will appear as **pending** in the Cypress results, which is the expected behavior when tests are skipped programmatically through Mocha.

The plugin uses a `beforeEach` hook to decide whether the current test should run or be skipped. This allows it to stop execution not only within the current spec file but also across the rest of the spec files in the run when the chosen strategy requires it.

## Configuration

All plugin configuration is provided through the Cypress configuration file using the `expose` option.

### Plugin options

The following properties are supported:

- `failFastStrategy`: `"spec" | "run"` (default: `"run"`)
  - `"spec"`: Skip remaining tests only in the current spec file.  
  - `"run"` (default): Skip remaining tests in all spec files for the current run.  

- `failFastEnabled`: `boolean` (default: `true`)  
  Enable or disable the fail-fast behavior globally. When set to `false`, fail-fast can still be enabled for specific tests or suites using per-test configuration.

- `failFastBail`: `number` (default: `1`)  
  Number of failing test suites required before entering fail-fast mode. For example, `failFastBail: 2` will start skipping tests after failures in two different suites or spec files, depending on the strategy. When strategy is `"spec"`, failures are reset at the beginning of each spec file, so fail-fast mode will be triggered after the configured number of failures within the same spec. When strategy is `"run"`, failures are tracked across the entire run, so fail-fast mode will be triggered after the configured number of failures regardless of which spec files they occur in.

- `failFastIgnorePerTestConfig`: `boolean` (default: `false`)  
  When `true`, the plugin ignores any per-test or per-suite `failFast` configuration and only uses the global options exposed through `expose`. This is useful when you want to control fail-fast exclusively at a global level (for example, disabling it completely or enabling it for the entire run) and avoid any accidental overrides in tests or suites.

To configure the plugin options, use the `expose` property in your Cypress configuration:

```ts
// cypress.config.ts
import { defineConfig } from "cypress";
import cypressFailFast from "cypress-fail-fast/plugin";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      cypressFailFast(on, config);
      return config;
    },
    expose: {
      failFastStrategy: "run",
      failFastEnabled: true,
      failFastBail: 1,
      failFastIgnorePerTestConfig: false,
    },
  },
});
```

### Per-test configuration

You can configure fail-fast behavior at the test or suite level using the `failFast` property in Cypress test configuration. The plugin supports:

- `failFast.enabled`: `boolean`  
  Controls whether a failure in the current test (or in any of its children when applied to a suite) should trigger fail-fast mode. Per-test configuration takes precedence over the global `failFastEnabled` option, unless `failFastIgnorePerTestConfig` is set to `true`.

Example:

```ts
describe(
  "All tests",
  {
    failFast: {
      enabled: false, // Children tests and suites will inherit this configuration
    },
  },
  () => {
    it(
      "sanity test",
      {
        failFast: {
          enabled: true, // Overrides configuration defined in parents
        },
      },
      () => {
        // If this test fails, remaining tests (and specs) will be skipped
        expect(true).to.be.true;
      },
    );

    it("second test", () => {
      // If this test fails, fail-fast will not be applied
      expect(true).to.be.true;
    });
  },
);
```

### Examples

#### Disable fail-fast by default and enable it only for specific specs

```ts
// cypress.config.ts
export default defineConfig({
  e2e: {
    expose: {
      failFastStrategy: "run",
      failFastEnabled: false,
    },
  },
});
```

Then enable fail-fast in specific suites:

```ts
describe(
  "Critical tests",
  {
    failFast: { enabled: true },
  },
  () => {
    // If any test in this suite fails, remaining tests and specs will be skipped
  },
);
```

#### Disable fail-fast completely and ignore per-test configuration

```ts
// cypress.config.ts
export default defineConfig({
  e2e: {
    expose: {
      failFastEnabled: false,
      failFastIgnorePerTestConfig: true,
    },
  },
});
```

With this configuration, fail-fast is disabled regardless of any `failFast` configuration defined in tests or suites.

### Hooks

Hooks allow you to run custom logic when fail-fast mode is triggered or to trigger fail-fast mode based on custom conditions. This can be useful for various purposes, such as coordinating multiple parallel runs with the mechanism that best fits your environment (for example, using a shared file, a database, or an API) as long as it can be accessed by all parallel runs.

Supported hooks:

- `onFailFastTriggered`: Run custom logic when fail-fast mode is triggered. For example, you can use this hook to log additional information or to notify an external system. The hook receives an object with the following properties:
  - `strategy`: The fail-fast strategy that is being applied (`"spec"` or `"run"`).
  - `test`: The failed test that triggered fail-fast mode, with the following properties:
    - `name`: The title of the test that failed.
    - `fullTitle`: The full title of the test that failed, including the titles of its parent suites.
- `shouldTriggerFailFast`: Trigger fail-fast mode at any moment based on custom logic. For example, you can use this hook to trigger fail-fast mode when a certain threshold of failures is reached across parallel runs. The hook should return `true` to trigger fail-fast mode or `false` to continue without triggering it. This hook is called before each test execution, so be careful with the performance of the logic implemented here.

Here you have an example of how to use these hooks to coordinate multiple parallel runs using a shared file as a flag:

```ts
// cypress.config.ts
import { defineConfig } from "cypress";
import fs from "node:fs";
import path from "node:path";
import cypressFailFast from "cypress-fail-fast/plugin";

const testsSkippedFlagFile = path.resolve(__dirname, ".tests_skipped");

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      cypressFailFast(on, config, {
        hooks: {
          onFailFastTriggered: ({ strategy, test }) => {
            // Create flag file when the plugin starts skipping tests
            // You can also use the spec and test information to implement more complex coordination logic if needed
            fs.writeFileSync(testsSkippedFlagFile, "");
          },
          shouldTriggerFailFast: () => {
            // If any other run has created the file, start skipping tests
            return fs.existsSync(testsSkippedFlagFile);
          },
        },
      });

      return config;
    },
    expose: {
      failFastStrategy: "run",
    },
  },
});
```

## Limitations

- All spec files are still loaded even after entering fail-fast mode, but their tests will be skipped.
- Skipped tests are reported as **pending** in the Cypress UI and in the results, because Mocha's `this.skip()` is used internally instead of `Cypress.stop()`. This is intentional, because using `Cypress.stop()` would mark the first test of each spec file as failed instead of pending, which is not the expected behavior for the plugin.

## Compatibility

Cypress Fail Fast stopped using `Cypress.env()` for configuration in version 8.0.0, so, from this version onwards, the plugin is only compatible with Cypress `>= 15.10.0`, which introduced the `expose` configuration option. If you are using an older version of Cypress, you can use the last compatible plugin version according to next compatibility table:

| Cypress version | Compatible plugin version |
|-----------------|---------------------------|
| >=15.10.0       | 8.x                       |
| 9.x to 14.x     | 7.x                       |
| 7.x             | 6.x                       |
| 6.x             | 5.x                       |
| 5.x or lower    | <= 4.x                    |

## Contributing

Contributions are welcome. Please read the contributing guidelines and code of conduct before opening an issue or pull request.

- [Contributing guidelines](.github/CONTRIBUTING.md)
- [Code of conduct](.github/CODE_OF_CONDUCT.md)

## License

MIT, see [LICENSE](./LICENSE) for details.

[coveralls-image]: https://coveralls.io/repos/github/javierbrea/cypress-fail-fast/badge.svg
[coveralls-url]: https://coveralls.io/github/javierbrea/cypress-fail-fast
[build-image]: https://github.com/javierbrea/cypress-fail-fast/workflows/build/badge.svg?branch=main
[build-url]: https://github.com/javierbrea/cypress-fail-fast/actions?query=workflow%3Abuild+branch%3Amain
[last-commit-image]: https://img.shields.io/github/last-commit/javierbrea/cypress-fail-fast.svg
[last-commit-url]: https://github.com/javierbrea/cypress-fail-fast/commits
[license-image]: https://img.shields.io/npm/l/cypress-fail-fast.svg
[license-url]: https://github.com/javierbrea/cypress-fail-fast/blob/main/LICENSE
[npm-downloads-image]: https://img.shields.io/npm/dm/cypress-fail-fast.svg
[npm-downloads-url]: https://www.npmjs.com/package/cypress-fail-fast
[quality-gate-image]: https://sonarcloud.io/api/project_badges/measure?project=javierbrea_cypress-fail-fast&metric=alert_status
[quality-gate-url]: https://sonarcloud.io/dashboard?id=javierbrea_cypress-fail-fast
[release-image]: https://img.shields.io/github/release-date/javierbrea/cypress-fail-fast.svg
[release-url]: https://github.com/javierbrea/cypress-fail-fast/releases

[cypress-typescript]: https://docs.cypress.io/guides/tooling/typescript-support.html
