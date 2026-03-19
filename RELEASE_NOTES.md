# Cypress Fail Fast 8.0.0

Cypress Fail Fast 8.0.0 introduces a new configuration model based on `Cypress.expose()`, consolidates the public API, replaces the old parallel strategy with a hook-based mechanism, and drops support for legacy Cypress versions in order to provide a simpler, more stable, and more maintainable plugin.

## Changelog

### Breaking Changes

- **Configuration no longer uses `Cypress.env()` or environment variables.** All plugin options must be provided via `Cypress.expose()` in the Cypress configuration file.
- Environment-based keys have been renamed:
  - `FAIL_FAST_STRATEGY` → `failFastStrategy`
  - `FAIL_FAST_ENABLED` → `failFastEnabled`
  - `FAIL_FAST_BAIL` → `failFastBail`
- Renamed `parallelCallbacks` plugin option to `hooks`, and changed its structure. Now it is an object with two optional properties: `onFailFastTriggered` and `shouldTriggerFailFast`. The first one is a callback that runs when fail-fast mode is triggered, and receives an object with the strategy being applied and the test that triggered it (`name` and `fullTitle`). The second one is a callback that runs before each test execution, and should return `true` to trigger fail-fast mode. It receives an object with the strategy being applied and the failed test that has triggered fail-fast mode.
- Removed support for the `parallel` strategy. The plugin now uses hooks that work regardless of the strategy, so there is no need to specify a different strategy for managing parallel runs. It is now the responsibility of the user to implement the coordination mechanism for parallel runs if they want to use that feature.
- The `FAIL_FAST_PLUGIN` option has been removed. Use the combination of `failFastEnabled` and `failFastIgnorePerTestConfig` instead.
- Fail-fast behavior now uses Mocha `this.skip()`, which causes skipped tests to appear as **pending** in the results instead of **skipped**.
- The plugin now requires **Cypress `>= 15.10.0`** and no longer supports older versions.

### Added

- feat: Support configuration via `Cypress.expose()` and new `failFast*` options.
- feat: Add `failFastIgnorePerTestConfig` option to control whether per-test configuration is honored.
- refactor: Migrate plugin and tests to TypeScript.
- test(e2e): Simplify and speed up E2E tests.

### Changed

- refactor: Use Mocha `this.skip()` internally instead of `Cypress.stop()` to implement fail-fast behavior.
- test(e2e): Migrate E2E test projects to pnpm for dependency management.
- chore(deps): Update devDependencies, removing unused packages and upgrading existing ones.

### Removed

- feat: Remove `parallel` strategy. Hooks now work regardless of the strategy.
- test(e2e): Drop E2E tests for old Cypress versions.
- chore: Remove workarounds and access to private Cypress APIs no longer needed with the new minimum supported version.

## Notes

### Why configuration moved away from `Cypress.env()`

Starting with Cypress 15.10.0, `Cypress.env()` is deprecated and scheduled for removal in a future major version.

### Why options were renamed and `FAIL_FAST_PLUGIN` was removed

Historically, the plugin used environment-style names such as `FAIL_FAST_STRATEGY`, `FAIL_FAST_ENABLED`, and `FAIL_FAST_BAIL`. With the transition to `Cypress.expose()`, it is more natural to use camelCase keys that fit into the rest of the Cypress configuration tree (`failFastStrategy`, `failFastEnabled`, `failFastBail`).

The `FAIL_FAST_PLUGIN` option was also problematic because it completely disabled the plugin logic, including per-test configuration, in a way that was not immediately obvious. In 8.0.0 it is replaced by a more explicit combination:

- `failFastEnabled` controls whether fail-fast is enabled globally.
- `failFastIgnorePerTestConfig` controls whether per-test configuration is taken into account.

By combining these two flags you can reproduce all previous behaviors (including “fully disabled”) while keeping the configuration model much clearer and easier to reason about.

### Why hooks replace the `parallel` strategy

Previous versions provided a dedicated `parallel` strategy together with `parallelCallbacks` to coordinate multiple parallel Cypress runs. That API was both restrictive and tightly coupled to a particular way of thinking about parallel execution. It also made the configuration surface more complex, because users had to understand both strategies and callbacks.

In 8.0.0, this has been replaced by a more flexible hook-based API:

- `hooks.onFailFastTriggered` runs once when fail-fast mode is triggered and receives information about the strategy in use and the test that caused it.
- `hooks.shouldTriggerFailFast` runs before each test and can return `true` to enter fail-fast mode based on external state.

These hooks work independently of the chosen strategy and can be used to implement coordination mechanisms for parallel runs (for example, writing/reading a flag from a shared store, database, or file system). This keeps the core plugin small and generic while giving you full control over how parallel runs communicate.

### Why `this.skip()` is used instead of `Cypress.stop()`

Older versions relied on `Cypress.stop()` to stop execution, but the plugin needs to make skip decisions from a `beforeEach` hook in order to affect not only the current test but also tests in other spec files. When `Cypress.stop()` is called from a hook like `beforeEach`, Cypress treats it as an error and marks the test as failed, which leads to incorrect statistics and surprising results.

Internally, the plugin now uses Mocha's `this.skip()` to mark tests as skipped. This is the mechanism Mocha provides for programmatic skipping, and it integrates cleanly with Cypress. The trade-off is that these tests are reported as **pending** instead of **skipped**, but the behavior is consistent and does not depend on internal Cypress implementation details.

Overall, this change makes the plugin significantly more stable across Cypress releases and avoids edge cases where tests are incorrectly reported as failed just because the fail-fast mechanism was triggered.

### Why support for old Cypress versions was dropped

Over time, supporting a wide range of Cypress versions required multiple workarounds and access to private or internal APIs. These internal APIs tend to change on every major Cypress release, causing the plugin to break or behave inconsistently without any changes in the plugin itself.

By setting Cypress `>= 15.10.0` as the new minimum supported version, Cypress Fail Fast can:

- Remove a large amount of compatibility code and workarounds.
- Avoid relying on private Cypress APIs.
- Provide a smaller, clearer, and more maintainable codebase.
- Offer more predictable behavior and better long-term stability.

If you still need to run against older Cypress versions, you can continue using the 7.x series of `cypress-fail-fast`. However, new features and fixes will only target the current supported Cypress range and the 8.x line.

### Summary

8.0.0 is a major release focused on simplifying the configuration model, aligning the plugin with the latest Cypress APIs, and improving long-term stability. The new hook-based API for fail-fast coordination replaces the old parallel strategy with something more flexible and explicit, especially for parallel runs.

While it includes several breaking changes, the new setup should be easier to configure, more robust across Cypress releases, and simpler to maintain.
