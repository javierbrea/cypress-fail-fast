import type * as Cypress from "cypress";
import type * as Mocha from "mocha";

import { getFailFastEnvironmentConfig } from "../Shared/Config";
import { FailFastGlobalConfig } from "src/Shared/Config.types";

export function isHeaded(Cyp: Cypress.Cypress) {
  return Cyp.browser && Cyp.browser.isHeaded;
}

export function getTestConfig(
  test: Mocha.Test | Mocha.Suite,
): Cypress.FailFastTestConfigOptions | undefined {
  // @ts-expect-error - Accessing private property _testConfig is necessary to retrieve the failFast configuration defined at the test level
  return test.ctx?.test?._testConfig?.testConfigList?.at(-1)?.overrides
    ?.failFast;
}

function getTestFailFastConfig(
  test: Mocha.Test | Mocha.Suite,
  Cyp: Cypress.Cypress,
): FailFastGlobalConfig {
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

export function failFastIsEnabled(
  test: Mocha.Test,
  Cyp: Cypress.Cypress,
): boolean {
  return getTestFailFastConfig(test, Cyp).enabled;
}

export function testHasFailed(currentTest: Mocha.Test): boolean {
  return (
    currentTest.state === "failed" &&
    // @ts-expect-error - Accessing private property currentRetry() is necessary to determine if the test has failed after all retries have been exhausted
    currentTest.currentRetry() === currentTest.retries()
  );
}
