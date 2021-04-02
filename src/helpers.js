const PLUGIN_ENVIRONMENT_VAR = "FAIL_FAST_PLUGIN";
const ENABLED_ENVIRONMENT_VAR = "FAIL_FAST_ENABLED";
const STRATEGY_ENVIRONMENT_VAR = "FAIL_FAST_STRATEGY";
const SHOULD_SKIP_TASK = "failFastShouldSkip";
const RESET_SKIP_TASK = "failFastResetSkip";

const STRATEGY_ALLOWED_VALUES = ["run", "spec", "parallel"];

const TRUTHY_VALUES = [true, "true", 1, "1"];
const FALSY_VALUES = [false, "false", 0, "0"];

const ENVIRONMENT_DEFAULT_VALUES = {
  [PLUGIN_ENVIRONMENT_VAR]: true,
  [ENABLED_ENVIRONMENT_VAR]: true,
  [STRATEGY_ENVIRONMENT_VAR]: STRATEGY_ALLOWED_VALUES[0],
};

function valueIsOneOf(value, arrayOfValues) {
  return arrayOfValues.includes(value);
}

function isValidStrategy(value) {
  return !!value && valueIsOneOf(value, STRATEGY_ALLOWED_VALUES);
}

function currentStrategyOrDefault(value) {
  return isValidStrategy(value) ? value : ENVIRONMENT_DEFAULT_VALUES[STRATEGY_ENVIRONMENT_VAR];
}

function strategyIsParallel(value) {
  return currentStrategyOrDefault(value) === STRATEGY_ALLOWED_VALUES[2];
}

function strategyIsSpec(value) {
  return currentStrategyOrDefault(value) === STRATEGY_ALLOWED_VALUES[1];
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
  isTruthy,
  isFalsy,
  isValidStrategy,
  currentStrategyOrDefault,
  strategyIsParallel,
  strategyIsSpec,
};
