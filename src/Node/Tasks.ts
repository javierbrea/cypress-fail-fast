import type * as Cypress from "cypress";
import chalk from "chalk";
import {
  SHOULD_SKIP_TASK,
  RESET_SKIP_TASK,
  FAILED_TESTS_TASK,
  RESET_FAILED_TESTS_TASK,
  LOG_TASK,
  LOG_PREFIX,
} from "../Shared/Constants";
import type { FailFastPluginConfigOptions } from "./Tasks.types";

/**
 * Registers Node-side Cypress tasks used to coordinate fail-fast state.
 * @param on Cypress plugin events registry.
 * @param __config Cypress plugin configuration (unused).
 * @param pluginConfig Optional plugin callbacks for parallel execution.
 */
export function registerFailFastTasks(
  on: Cypress.PluginEvents,
  __config: Cypress.PluginConfigOptions,
  pluginConfig: FailFastPluginConfigOptions = {},
) {
  // store skip flag
  let shouldSkipFlag = false;
  let failedTests = 0;

  const isCancelledCallback = pluginConfig.parallelCallbacks?.isCancelled;
  const onCancelCallback = pluginConfig.parallelCallbacks?.onCancel;

  /**
   * Computes whether remaining tests should be skipped.
   * @returns `true` when skip mode is active.
   */
  const shouldSkip = () => {
    if (shouldSkipFlag) {
      return shouldSkipFlag;
    }
    if (isCancelledCallback) {
      shouldSkipFlag = isCancelledCallback() || false;
    }
    return shouldSkipFlag;
  };

  // Expose fail fast tasks
  on("task", {
    [RESET_SKIP_TASK]: function () {
      shouldSkipFlag = false;
      return null;
    },
    [SHOULD_SKIP_TASK]: function (value) {
      if (value === true) {
        if (onCancelCallback) {
          onCancelCallback();
        }
        shouldSkipFlag = value;
      }
      return shouldSkip();
    },
    [FAILED_TESTS_TASK]: function (value) {
      if (value === true) {
        failedTests++;
      }
      return failedTests;
    },
    [RESET_FAILED_TESTS_TASK]: function () {
      failedTests = 0;
      return null;
    },
    [LOG_TASK]: function (message) {
      // eslint-disable-next-line no-console
      console.log(`${chalk.yellow(LOG_PREFIX)} ${message}`);
      return null;
    },
  });
}
