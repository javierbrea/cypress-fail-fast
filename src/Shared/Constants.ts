import type { FailFastConfig } from "./Config.types";

/** Global config key to ignore per-test fail-fast configuration and use only global config. */
export const IGNORE_PER_TEST_CONFIG = "failFastIgnorePerTestConfig" as const;
/** Global config that enables or disables fail-fast behavior. */
export const ENABLED_GLOBAL_CONFIG = "failFastEnabled" as const;
/** Global config that selects fail-fast strategy. */
export const STRATEGY_GLOBAL_CONFIG = "failFastStrategy" as const;
/** Global config that defines the failure threshold. */
export const BAIL_GLOBAL_CONFIG = "failFastBail" as const;

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

/** Message emitted when skip mode becomes active. */
export const SKIP_MESSAGE = "Enabling skip mode";
/** Prefix used for failed tests progress logs. */
export const FAILED_TEST_MESSAGE = "Failed tests";
/** Prefix used in console log lines emitted by this plugin. */
export const LOG_PREFIX = "[fail-fast]";

/** Default values used when related fail-fast global config variables are not provided. */
export const GLOBAL_CONFIG_DEFAULT_VALUES = {
  [IGNORE_PER_TEST_CONFIG]: false,
  [ENABLED_GLOBAL_CONFIG]: true,
  [BAIL_GLOBAL_CONFIG]: 1,
  [STRATEGY_GLOBAL_CONFIG]: "run",
} satisfies FailFastConfig;
