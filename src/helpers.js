const PLUGIN_ENVIRONMENT_VAR = "FAIL_FAST_PLUGIN";
const ENABLED_ENVIRONMENT_VAR = "FAIL_FAST_ENABLED";
const STRATEGY_ENVIRONMENT_VAR = "FAIL_FAST_STRATEGY";
const SHOULD_SKIP_TASK = "failFastShouldSkip";
const RESET_SKIP_TASK = "failFastResetSkip";
const LOG_TASK = "failFastLog";

const STOP_MESSAGE = "Stopping Cypress runner due to a previous failure";
const SKIP_MESSAGE = "Enabling skip mode";

const STRATEGIES = ["spec", "parallel"];

const TRUTHY_VALUES = [true, "true", 1, "1"];
const FALSY_VALUES = [false, "false", 0, "0"];

const ENVIRONMENT_DEFAULT_VALUES = {
  [PLUGIN_ENVIRONMENT_VAR]: true,
  [ENABLED_ENVIRONMENT_VAR]: true,
};

function valueIsOneOf(value, arrayOfValues) {
  return arrayOfValues.includes(value);
}

function strategyIsParallel(value) {
  return value === STRATEGIES[1];
}

function strategyIsSpec(value) {
  return value === STRATEGIES[0];
}

function isTruthy(value) {
  return valueIsOneOf(value, TRUTHY_VALUES);
}

function isFalsy(value) {
  return valueIsOneOf(value, FALSY_VALUES);
}

module.exports = {
  ENVIRONMENT_DEFAULT_VALUES,
  PLUGIN_ENVIRONMENT_VAR,
  ENABLED_ENVIRONMENT_VAR,
  STRATEGY_ENVIRONMENT_VAR,
  SHOULD_SKIP_TASK,
  RESET_SKIP_TASK,
  LOG_TASK,
  STOP_MESSAGE,
  SKIP_MESSAGE,
  isTruthy,
  isFalsy,
  strategyIsParallel,
  strategyIsSpec,
};
