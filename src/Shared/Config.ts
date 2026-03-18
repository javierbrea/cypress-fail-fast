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

/**
 * Determines whether a value should be interpreted as truthy in env parsing.
 * @param value Value to evaluate.
 * @returns `true` for accepted truthy values.
 */
export function isTruthy(value: unknown) {
  return truthyValuesSet.has(value as boolean | string | number);
}

/**
 * Determines whether a value should be interpreted as falsy in env parsing.
 * @param value Value to evaluate.
 * @returns `true` for accepted falsy values.
 */
export function isFalsy(value: unknown) {
  return falsyValuesSet.has(value as boolean | string | number);
}

/**
 * Determines whether a value is considered undefined for env parsing.
 * @param value Value to evaluate.
 * @returns `true` for empty string or `undefined`.
 */
export function isUndefined(value: unknown): value is undefined | "" {
  return undefinedValuesSet.has(value as undefined | "");
}

/**
 * Checks if the provided strategy value equals `spec`.
 * @param value Strategy value from Cypress env.
 * @returns `true` when strategy is `spec`.
 */
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

/**
 * Builds the effective fail-fast configuration from Cypress env variables.
 * @param Cyp Cypress global object.
 * @returns Parsed fail-fast global configuration.
 */
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

/**
 * Returns whether the current fail-fast strategy is `spec`.
 * @param Cyp Cypress global object.
 * @returns `true` when strategy is `spec`.
 */
export function currentStrategyIsSpec(Cyp: Cypress.Cypress) {
  return getFailFastEnvironmentConfig(Cyp).strategyIsSpec;
}

/**
 * Returns whether the fail-fast plugin is globally enabled.
 * @param Cyp Cypress global object.
 * @returns `true` when plugin is enabled.
 */
export function pluginIsEnabled(Cyp: Cypress.Cypress) {
  return getFailFastEnvironmentConfig(Cyp).plugin;
}

/**
 * Returns the configured bail threshold.
 * @param Cyp Cypress global object.
 * @returns Number of failures required to start skipping tests.
 */
export function bailConfig(Cyp: Cypress.Cypress) {
  return getFailFastEnvironmentConfig(Cyp).bail;
}
