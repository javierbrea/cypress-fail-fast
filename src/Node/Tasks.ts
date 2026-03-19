import type * as Cypress from "cypress";
import chalk from "chalk";
import {
  SHOULD_SKIP_TASK,
  TRIGGER_FAIL_FAST_TASK,
  RESET_SKIP_TASK,
  FAILED_TESTS_TASK,
  RESET_FAILED_TESTS_TASK,
  LOG_TASK,
  LOG_PREFIX,
} from "../Shared/Constants";
import type { FailFastConfig } from "../Shared/Config.types";
import type {
  FailFastFailedTestData,
  FailFastPluginConfigOptions,
  FailFastStrategy,
  TriggerFailFastTaskPayload,
} from "./Tasks.types";

/**
 * Registers Node-side Cypress tasks used to coordinate fail-fast state.
 * @param on Cypress plugin events registry.
 * @param config Cypress plugin configuration.
 * @param pluginConfig Optional fail-fast plugin hooks.
 */
export function registerFailFastTasks(
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions,
  pluginConfig: FailFastPluginConfigOptions = {},
) {
  // store skip flag
  let shouldSkipFlag = false;
  let failedTests = 0;
  let failedTestThatTriggeredFailFast: FailFastFailedTestData | undefined;

  const exposedConfig = config as Cypress.PluginConfigOptions & {
    expose?: FailFastConfig;
  };
  const strategy: FailFastStrategy =
    exposedConfig.expose?.failFastStrategy === "spec" ? "spec" : "run";

  const shouldTriggerFailFastCallback =
    pluginConfig.hooks?.shouldTriggerFailFast;
  const onFailFastTriggeredCallback = pluginConfig.hooks?.onFailFastTriggered;

  function shouldTriggerFailFastFromHook() {
    if (!shouldTriggerFailFastCallback) {
      return false;
    }

    return (
      shouldTriggerFailFastCallback({
        strategy,
        test: failedTestThatTriggeredFailFast,
      }) || false
    );
  }

  /**
   * Computes whether remaining tests should be skipped.
   * @returns `true` when skip mode is active.
   */
  const shouldSkip = () => {
    if (shouldSkipFlag) {
      return shouldSkipFlag;
    }

    if (shouldTriggerFailFastFromHook()) {
      shouldSkipFlag = true;
    }

    return shouldSkipFlag;
  };

  // Expose fail fast tasks
  on("task", {
    [RESET_SKIP_TASK]: function () {
      shouldSkipFlag = false;
      failedTestThatTriggeredFailFast = undefined;
      return null;
    },
    [SHOULD_SKIP_TASK]: function () {
      return shouldSkip();
    },
    [TRIGGER_FAIL_FAST_TASK]: function (value: TriggerFailFastTaskPayload) {
      failedTestThatTriggeredFailFast = value.test;

      if (onFailFastTriggeredCallback) {
        onFailFastTriggeredCallback({
          strategy,
          test: failedTestThatTriggeredFailFast,
        });
      }

      shouldSkipFlag = true;

      return shouldSkip();
    },
    [FAILED_TESTS_TASK]: function (value: boolean) {
      if (value === true) {
        failedTests++;
      }
      return failedTests;
    },
    [RESET_FAILED_TESTS_TASK]: function () {
      failedTests = 0;
      return null;
    },
    [LOG_TASK]: function (message: string) {
      // eslint-disable-next-line no-console
      console.log(`${chalk.yellow(LOG_PREFIX)} ${message}`);
      return null;
    },
  });
}
