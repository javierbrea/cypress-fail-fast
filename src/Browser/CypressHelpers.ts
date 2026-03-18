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
  return Cyp.browser && Cyp.browser.isHeaded;
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
