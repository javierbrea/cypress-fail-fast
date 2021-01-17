const PLUGIN_ENVIRONMENT_VAR = "FAIL_FAST_PLUGIN";
const ENABLED_ENVIRONMENT_VAR = "FAIL_FAST_ENABLED";
const SHOULD_SKIP_TASK = "failFastShouldSkip";
const RESET_SKIP_TASK = "failFastResetSkip";

const ENVIRONMENT_DEFAULT_VALUES = {
  [PLUGIN_ENVIRONMENT_VAR]: true,
  [ENABLED_ENVIRONMENT_VAR]: true,
};

const TRUTHY_VALUES = [true, "true", 1, "1"];
const FALSY_VALUES = [false, "false", 0, "0"];

function valueIsOneOf(value, arrayOfValues) {
  return arrayOfValues.includes(value);
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
  SHOULD_SKIP_TASK,
  RESET_SKIP_TASK,
  isTruthy,
  isFalsy,
};
