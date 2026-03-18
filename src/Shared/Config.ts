import type * as Cypress from "cypress";

import {
  ENVIRONMENT_DEFAULT_VALUES,
  PLUGIN_ENVIRONMENT_VAR,
  ENABLED_ENVIRONMENT_VAR,
  STRATEGY_ENVIRONMENT_VAR,
  BAIL_ENVIRONMENT_VAR,
} from "./Constants";

import { FailFastGlobalConfig } from "./Config.types";

const SPEC_STRATEGY = "spec";

const truthyValuesSet = new Set([true, "true", 1, "1"]);
const falsyValuesSet = new Set([false, "false", 0, "0"]);
const undefinedValuesSet = new Set(["", undefined]);

export function isTruthy(value: unknown) {
  return truthyValuesSet.has(value as boolean | string | number);
}

export function isFalsy(value: unknown) {
  return falsyValuesSet.has(value as boolean | string | number);
}

export function isUndefined(value: unknown): value is undefined | "" {
  return undefinedValuesSet.has(value as undefined | "");
}

export function strategyIsSpec(value: string) {
  return value === SPEC_STRATEGY;
}

function isDefined(value: unknown) {
  return !isUndefined(value);
}

function booleanVarValue(value: unknown, defaultValue: boolean) {
  const isTruthyValue = isTruthy(value);
  if (!isTruthyValue && !isFalsy(value)) {
    return defaultValue;
  }
  return isTruthyValue;
}

function numericVarValue(value: unknown, defaultValue: number) {
  if (isDefined(value)) {
    return Number(value);
  }
  return defaultValue;
}

export function getFailFastEnvironmentConfig(
  Cyp: Cypress.Cypress,
): FailFastGlobalConfig {
  return {
    plugin: booleanVarValue(
      Cyp.expose(PLUGIN_ENVIRONMENT_VAR),
      ENVIRONMENT_DEFAULT_VALUES[PLUGIN_ENVIRONMENT_VAR],
    ),
    enabled: booleanVarValue(
      Cyp.expose(ENABLED_ENVIRONMENT_VAR),
      ENVIRONMENT_DEFAULT_VALUES[ENABLED_ENVIRONMENT_VAR],
    ),
    strategyIsSpec: strategyIsSpec(Cyp.expose(STRATEGY_ENVIRONMENT_VAR)),
    bail: numericVarValue(
      Cyp.expose(BAIL_ENVIRONMENT_VAR),
      ENVIRONMENT_DEFAULT_VALUES[BAIL_ENVIRONMENT_VAR],
    ),
  };
}

export function currentStrategyIsSpec(Cyp: Cypress.Cypress) {
  return getFailFastEnvironmentConfig(Cyp).strategyIsSpec;
}

export function pluginIsEnabled(Cyp: Cypress.Cypress) {
  return getFailFastEnvironmentConfig(Cyp).plugin;
}

export function bailConfig(Cyp: Cypress.Cypress) {
  return getFailFastEnvironmentConfig(Cyp).bail;
}
