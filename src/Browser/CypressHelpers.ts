import type * as Cypress from "cypress";
import type * as Mocha from "mocha";

import {
  getFailFastEnvironmentConfig,
  shouldIgnorePerTestConfig,
} from "../Shared/Config";
import { FailFastGlobalConfig } from "src/Shared/Config.types";

/**
 * Indicates whether the current Cypress browser is running in headed mode.
 * @param Cyp Cypress global object.
 * @returns `true` when the browser is headed.
 */
export function isHeaded(Cyp: Cypress.Cypress) {
  return Cyp.browser?.isHeaded;
}

/**
 * Reads fail-fast overrides configured at test or suite level.
 * @param test Mocha test or suite instance.
 * @returns The configured fail-fast override, if any.
 */
export function getTestConfig(
  test: Mocha.Test | Mocha.Suite,
): Cypress.FailFastTestConfigOptions | undefined {
  // @ts-expect-error - Accessing private property _testConfig is necessary to retrieve the failFast configuration defined at the test level
  return test.ctx?.test?._testConfig?.testConfigList?.at(-1)?.overrides
    ?.failFast;
}

/**
 * Resolves the effective fail-fast config by walking up the suite tree.
 * @param test Current test or suite.
 * @param Cyp Cypress global object.
 * @returns Effective fail-fast global configuration.
 */
function getTestFailFastConfig(
  test: Mocha.Test | Mocha.Suite,
  Cyp: Cypress.Cypress,
): FailFastGlobalConfig {
  if (shouldIgnorePerTestConfig(Cyp)) {
    return getFailFastEnvironmentConfig(Cyp);
  }
  const testConfig = getTestConfig(test);
  if (testConfig) {
    return {
      ...getFailFastEnvironmentConfig(Cyp),
      ...testConfig,
    };
  }
  if (test.parent) {
    return getTestFailFastConfig(test.parent, Cyp);
  }
  return getFailFastEnvironmentConfig(Cyp);
}

/**
 * Checks whether fail-fast is enabled for the current test.
 * @param test Current Mocha test.
 * @param Cyp Cypress global object.
 * @returns `true` when fail-fast is enabled.
 */
export function failFastIsEnabled(
  test: Mocha.Test,
  Cyp: Cypress.Cypress,
): boolean {
  return getTestFailFastConfig(test, Cyp).enabled;
}

/**
 * Reads a fail-fast override configured directly on a suite, if any.
 *
 * Suite-level configuration reaches tests through Cypress's merged
 * `testConfigList` (see {@link getTestConfig}), but that merged list does not
 * tell WHICH suite contributed the override. To attribute configuration to a
 * concrete suite, this reads the raw config object that Cypress stores on the
 * suite itself. The property is private and its shape has changed between
 * Cypress versions, so both known shapes are checked defensively: when none
 * matches, no override is returned.
 * @param suite Mocha suite instance.
 * @returns The fail-fast override configured on that exact suite, if any.
 */
export function getSuiteOwnConfig(
  suite: Mocha.Suite,
): Cypress.FailFastTestConfigOptions | undefined {
  // @ts-expect-error - Accessing private property _testConfig is necessary to retrieve the failFast configuration defined at the suite level
  const suiteConfig = suite._testConfig;
  return suiteConfig?.failFast ?? suiteConfig?.unverifiedTestConfig?.failFast;
}

/**
 * Resolves the describe block acting as skip scope for the `describe` strategy.
 *
 * The scope is always the failed test's immediate parent describe.
 *
 * @param currentTest Test that triggered fail-fast.
 * @returns Title path of the skip scope. An empty array means the test has no
 * parent describe (it is defined at the spec root), in which case every
 * remaining test in the spec is skipped, matching the `spec` strategy.
 */
export function getSkipScopeTitlePath(currentTest: Mocha.Test): string[] {
  const parentSuite = currentTest.parent;
  if (!parentSuite || parentSuite.root) {
    return [];
  }
  return parentSuite.titlePath();
}

/**
 * Determines whether a test has definitively failed after exhausting retries.
 * @param currentTest Current Mocha test.
 * @returns `true` when the test is failed and has no remaining retries.
 */
export function testHasFailed(currentTest: Mocha.Test): boolean {
  return (
    currentTest.state === "failed" &&
    // @ts-expect-error - Accessing private property currentRetry() is necessary to determine if the test has failed after all retries have been exhausted
    currentTest.currentRetry() === currentTest.retries()
  );
}
