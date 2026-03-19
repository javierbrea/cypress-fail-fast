import type * as Cypress from "cypress";

import {
  GLOBAL_CONFIG_DEFAULT_VALUES,
  IGNORE_PER_TEST_CONFIG,
  ENABLED_GLOBAL_CONFIG,
  STRATEGY_GLOBAL_CONFIG,
  BAIL_GLOBAL_CONFIG,
} from "./Constants";

import { FailFastGlobalConfig } from "./Config.types";

export const SPEC_STRATEGY = "spec" as const;
export const RUN_STRATEGY = "run" as const;

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

/**
 * Normalizes a strategy value to one of the supported strategy constants.
 * @param value Strategy value to normalize.
 * @returns Normalized strategy value.
 */
export function strategyValue(
  value: unknown,
): FailFastGlobalConfig["strategy"] {
  return strategyIsSpec(value as string) ? SPEC_STRATEGY : RUN_STRATEGY;
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
  const strategy = strategyValue(Cyp.expose(STRATEGY_GLOBAL_CONFIG));

  return {
    strategy,
    ignorePerTestConfig: booleanVarValue(
      Cyp.expose(IGNORE_PER_TEST_CONFIG),
      GLOBAL_CONFIG_DEFAULT_VALUES[IGNORE_PER_TEST_CONFIG],
    ),
    enabled: booleanVarValue(
      Cyp.expose(ENABLED_GLOBAL_CONFIG),
      GLOBAL_CONFIG_DEFAULT_VALUES[ENABLED_GLOBAL_CONFIG],
    ),
    strategyIsSpec: strategy === SPEC_STRATEGY,
    bail: numericVarValue(
      Cyp.expose(BAIL_GLOBAL_CONFIG),
      GLOBAL_CONFIG_DEFAULT_VALUES[BAIL_GLOBAL_CONFIG],
    ),
  };
}

/**
 * Builds the effective fail-fast configuration from resolved plugin config values.
 * @param config Cypress plugin configuration.
 * @returns Parsed fail-fast global configuration.
 */
export function getFailFastPluginConfig(
  config: Pick<Cypress.PluginConfigOptions, "expose">,
): FailFastGlobalConfig {
  const strategy = strategyValue(config.expose?.[STRATEGY_GLOBAL_CONFIG]);

  return {
    strategy,
    ignorePerTestConfig: booleanVarValue(
      config.expose?.[IGNORE_PER_TEST_CONFIG],
      GLOBAL_CONFIG_DEFAULT_VALUES[IGNORE_PER_TEST_CONFIG],
    ),
    enabled: booleanVarValue(
      config.expose?.[ENABLED_GLOBAL_CONFIG],
      GLOBAL_CONFIG_DEFAULT_VALUES[ENABLED_GLOBAL_CONFIG],
    ),
    strategyIsSpec: strategy === SPEC_STRATEGY,
    bail: numericVarValue(
      config.expose?.[BAIL_GLOBAL_CONFIG],
      GLOBAL_CONFIG_DEFAULT_VALUES[BAIL_GLOBAL_CONFIG],
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
 * Returns whether the configuration per-test overrides should be ignored in favor of global configuration.
 * @param Cyp Cypress global object.
 * @returns `true` when per-test configuration should be ignored.
 */
export function shouldIgnorePerTestConfig(Cyp: Cypress.Cypress) {
  return getFailFastEnvironmentConfig(Cyp).ignorePerTestConfig;
}

/**
 * Returns the configured bail threshold.
 * @param Cyp Cypress global object.
 * @returns Number of failures required to start skipping tests.
 */
export function bailConfig(Cyp: Cypress.Cypress) {
  return getFailFastEnvironmentConfig(Cyp).bail;
}
