const {
  ENVIRONMENT_DEFAULT_VALUES,
  PLUGIN_ENVIRONMENT_VAR,
  ENABLED_ENVIRONMENT_VAR,
  STRATEGY_ENVIRONMENT_VAR,
  BAIL_ENVIRONMENT_VAR,
} = require("./constants");

const { getTestConfig } = require("./cypress");

const STRATEGIES = ["spec", "parallel"];

const TRUTHY_VALUES = [true, "true", 1, "1"];
const FALSY_VALUES = [false, "false", 0, "0"];
const UNDEFINED_VALUES = ["", undefined];

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

function isDefined(value) {
  return !valueIsOneOf(value, UNDEFINED_VALUES);
}

function booleanVarValue(value, defaultValue) {
  const isTruthyValue = isTruthy(value);
  if (!isTruthyValue && !isFalsy(value)) {
    return defaultValue;
  }
  return isTruthyValue;
}

function numericVarValue(value, defaultValue) {
  if (isDefined(value)) {
    return Number(value);
  }
  return defaultValue;
}

function getFailFastEnvironmentConfig(Cypress) {
  return {
    plugin: booleanVarValue(
      Cypress.env(PLUGIN_ENVIRONMENT_VAR),
      ENVIRONMENT_DEFAULT_VALUES[PLUGIN_ENVIRONMENT_VAR],
    ),
    enabled: booleanVarValue(
      Cypress.env(ENABLED_ENVIRONMENT_VAR),
      ENVIRONMENT_DEFAULT_VALUES[ENABLED_ENVIRONMENT_VAR],
    ),
    strategyIsSpec: strategyIsSpec(Cypress.env(STRATEGY_ENVIRONMENT_VAR)),
    bail: numericVarValue(
      Cypress.env(BAIL_ENVIRONMENT_VAR),
      ENVIRONMENT_DEFAULT_VALUES[BAIL_ENVIRONMENT_VAR],
    ),
  };
}

function getTestFailFastConfig(currentTest, Cypress) {
  const testConfig = getTestConfig(currentTest);
  if (testConfig.failFast) {
    return {
      ...getFailFastEnvironmentConfig(Cypress),
      ...testConfig.failFast,
    };
  }
  if (currentTest.parent) {
    return getTestFailFastConfig(currentTest.parent, Cypress);
  }
  return getFailFastEnvironmentConfig(Cypress);
}

function currentStrategyIsSpec(Cypress) {
  return getFailFastEnvironmentConfig(Cypress).strategyIsSpec;
}

function pluginIsEnabled(Cypress) {
  return getFailFastEnvironmentConfig(Cypress).plugin;
}

function bailConfig(Cypress) {
  return getFailFastEnvironmentConfig(Cypress).bail;
}

function failFastIsEnabled(currentTest, Cypress) {
  return getTestFailFastConfig(currentTest, Cypress).enabled;
}

module.exports = {
  isTruthy,
  isFalsy,
  strategyIsParallel,
  bailConfig,
  pluginIsEnabled,
  failFastIsEnabled,
  currentStrategyIsSpec,
};
