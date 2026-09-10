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
import { getFailFastPluginConfig, titlePathStartsWith } from "../Shared/Config";
import type {
  FailFastPluginConfigOptions,
  ShouldSkipTaskPayload,
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
  /*
    Title path of the describe block where fail-fast was triggered. Only set by
    the `describe` strategy: when present, skip mode affects only the tests
    inside that describe block (or blocks nested in it), instead of every
    remaining test. `null` means skip mode is unscoped (spec/run strategies, or
    skip mode triggered from the `shouldTriggerFailFast` hook, which has no
    failed test to derive a scope from).
  */
  let skipScopeTitlePath: string[] | null = null;
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
   * @param testTitlePath Title path of the test about to run, when known.
   * @returns `true` when skip mode is active for that test.
   */
  const shouldSkip = async (testTitlePath?: string[]) => {
    const skipApplies =
      shouldSkipFlag &&
      (!skipScopeTitlePath ||
        !testTitlePath ||
        titlePathStartsWith(testTitlePath, skipScopeTitlePath));

    if (skipApplies) {
      return true;
    }

    if (await shouldTriggerFailFastFromHook()) {
      /*
        Skip mode triggered from the hook has no failed test attached, so there
        is no describe block to scope it to. Clear any previous scope to keep
        the hook behavior consistent across strategies: it always skips every
        remaining test (within the current spec for spec/describe strategies,
        since those reset the flag at the beginning of each spec file).
      */
      shouldSkipFlag = true;
      skipScopeTitlePath = null;
      return true;
    }
    return false;
  };

  // Expose fail fast tasks
  on("task", {
    [RESET_SKIP_TASK]: function () {
      shouldSkipFlag = false;
      skipScopeTitlePath = null;
      return null;
    },
    [SHOULD_SKIP_TASK]: async function (value?: ShouldSkipTaskPayload) {
      return await shouldSkip(value?.titlePath);
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
      skipScopeTitlePath = value.skipScopeTitlePath?.length
        ? value.skipScopeTitlePath
        : null;

      return shouldSkipFlag;
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
