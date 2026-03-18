export const PLUGIN_ENVIRONMENT_VAR = "FAIL_FAST_PLUGIN";
export const ENABLED_ENVIRONMENT_VAR = "FAIL_FAST_ENABLED";
export const STRATEGY_ENVIRONMENT_VAR = "FAIL_FAST_STRATEGY";
export const BAIL_ENVIRONMENT_VAR = "FAIL_FAST_BAIL";

export const SHOULD_SKIP_TASK = "failFastShouldSkip";
export const RESET_SKIP_TASK = "failFastResetSkip";
export const LOG_TASK = "failFastLog";
export const FAILED_TESTS_TASK = "failFastFailedTests";
export const RESET_FAILED_TESTS_TASK = "failFastResetFailedTests";

export const STOP_MESSAGE = "Stopping Cypress runner due to a previous failure";
export const SKIP_MESSAGE = "Enabling skip mode";
export const FAILED_TEST_MESSAGE = "Failed tests";
export const LOG_PREFIX = "[fail-fast]";

export const ENVIRONMENT_DEFAULT_VALUES = {
  [PLUGIN_ENVIRONMENT_VAR]: true,
  [ENABLED_ENVIRONMENT_VAR]: true,
  [BAIL_ENVIRONMENT_VAR]: 1,
};
