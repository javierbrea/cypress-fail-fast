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
import { getFailFastPluginConfig } from "../Shared/Config";
import type {
  FailFastPluginConfigOptions,
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
  const strategy = getFailFastPluginConfig(config).strategy;

  const shouldTriggerFailFastCallback =
    pluginConfig.hooks?.shouldTriggerFailFast;
  const onFailFastTriggeredCallback = pluginConfig.hooks?.onFailFastTriggered;

  async function shouldTriggerFailFastFromHook() {
    if (!shouldTriggerFailFastCallback) {
      return false;
    }

    try {
      const result = await shouldTriggerFailFastCallback();
      return result || false;
    } catch (error) {
      console.warn(
        `${chalk.yellow(LOG_PREFIX)} Ignored error in shouldTriggerFailFast hook: ${error}`,
      );
      return false;
    }
  }

  /**
   * Computes whether remaining tests should be skipped.
   * @returns `true` when skip mode is active.
   */
  const shouldSkip = async () => {
    if (shouldSkipFlag) {
      return shouldSkipFlag;
    }

    if (await shouldTriggerFailFastFromHook()) {
      shouldSkipFlag = true;
    }

    return shouldSkipFlag;
  };

  // Expose fail fast tasks
  on("task", {
    [RESET_SKIP_TASK]: function () {
      shouldSkipFlag = false;
      return null;
    },
    [SHOULD_SKIP_TASK]: async function () {
      return await shouldSkip();
    },
    [TRIGGER_FAIL_FAST_TASK]: async function (
      value: TriggerFailFastTaskPayload,
    ) {
      if (onFailFastTriggeredCallback) {
        try {
          await onFailFastTriggeredCallback({
            strategy,
            test: value.test,
          });
        } catch (error) {
          console.warn(
            `${chalk.yellow(LOG_PREFIX)} Ignored error in onFailFastTriggered hook: ${error}`,
          );
        }
      }

      shouldSkipFlag = true;

      return await shouldSkip();
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
