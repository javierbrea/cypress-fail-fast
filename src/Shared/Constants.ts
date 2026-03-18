/** Environment variable name that enables or disables plugin registration. */
export const PLUGIN_ENVIRONMENT_VAR = "FAIL_FAST_PLUGIN";
/** Environment variable name that enables or disables fail-fast behavior. */
export const ENABLED_ENVIRONMENT_VAR = "FAIL_FAST_ENABLED";
/** Environment variable name that selects fail-fast strategy. */
export const STRATEGY_ENVIRONMENT_VAR = "FAIL_FAST_STRATEGY";
/** Environment variable name that defines the failure threshold. */
export const BAIL_ENVIRONMENT_VAR = "FAIL_FAST_BAIL";

/** Task name to read or update skip state. */
export const SHOULD_SKIP_TASK = "failFastShouldSkip";
/** Task name to reset skip state. */
export const RESET_SKIP_TASK = "failFastResetSkip";
/** Task name to write plugin logs in Node process. */
export const LOG_TASK = "failFastLog";
/** Task name to increment/read failed tests counter. */
export const FAILED_TESTS_TASK = "failFastFailedTests";
/** Task name to reset failed tests counter. */
export const RESET_FAILED_TESTS_TASK = "failFastResetFailedTests";

/** Message emitted when Cypress runner is stopped because of a previous failure. */
export const STOP_MESSAGE = "Stopping Cypress runner due to a previous failure";
/** Message emitted when skip mode becomes active. */
export const SKIP_MESSAGE = "Enabling skip mode";
/** Prefix used for failed tests progress logs. */
export const FAILED_TEST_MESSAGE = "Failed tests";
/** Prefix used in console log lines emitted by this plugin. */
export const LOG_PREFIX = "[fail-fast]";

/** Default values used when related fail-fast env variables are not provided. */
export const ENVIRONMENT_DEFAULT_VALUES = {
  [PLUGIN_ENVIRONMENT_VAR]: true,
  [ENABLED_ENVIRONMENT_VAR]: true,
  [BAIL_ENVIRONMENT_VAR]: 1,
};
