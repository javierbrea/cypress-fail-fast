import type * as Cypress from "cypress";
// eslint-disable-next-line no-shadow -- Avoid conflict with Cypress global `describe`
import { describe, it, expect, jest } from "@jest/globals";

import {
  IGNORE_PER_TEST_CONFIG,
  ENABLED_GLOBAL_CONFIG,
  STRATEGY_GLOBAL_CONFIG,
  BAIL_GLOBAL_CONFIG,
  GLOBAL_CONFIG_DEFAULT_VALUES,
} from "./Constants";

import {
  isTruthy,
  isFalsy,
  isUndefined,
  strategyIsSpec,
  getFailFastEnvironmentConfig,
  currentStrategyIsSpec,
  shouldIgnorePerTestConfig,
  bailConfig,
} from "./Config";

function createCypressLike(
  exposedValues: Record<string, unknown>,
): Cypress.Cypress {
  return {
    expose: jest.fn((name: string) => exposedValues[name]),
  } as unknown as Cypress.Cypress;
}

describe("isTruthy", () => {
  it("returns true for accepted truthy values", () => {
    expect(isTruthy(true)).toBe(true);
    expect(isTruthy("true")).toBe(true);
    expect(isTruthy(1)).toBe(true);
    expect(isTruthy("1")).toBe(true);
  });

  it("returns false for non-truthy values", () => {
    expect(isTruthy(false)).toBe(false);
    expect(isTruthy("false")).toBe(false);
    expect(isTruthy("yes")).toBe(false);
    expect(isTruthy(undefined)).toBe(false);
  });
});

describe("isFalsy", () => {
  it("returns true for accepted falsy values", () => {
    expect(isFalsy(false)).toBe(true);
    expect(isFalsy("false")).toBe(true);
    expect(isFalsy(0)).toBe(true);
    expect(isFalsy("0")).toBe(true);
  });

  it("returns false for non-falsy values", () => {
    expect(isFalsy(true)).toBe(false);
    expect(isFalsy("true")).toBe(false);
    expect(isFalsy("no")).toBe(false);
    expect(isFalsy(undefined)).toBe(false);
  });
});

describe("isUndefined", () => {
  it("returns true for undefined and empty string", () => {
    expect(isUndefined(undefined)).toBe(true);
    expect(isUndefined("")).toBe(true);
  });

  it("returns false for any defined non-empty value", () => {
    expect(isUndefined(false)).toBe(false);
    expect(isUndefined(0)).toBe(false);
    expect(isUndefined("0")).toBe(false);
  });
});

describe("strategyIsSpec", () => {
  it("returns true only when strategy is spec", () => {
    expect(strategyIsSpec("spec")).toBe(true);
    expect(strategyIsSpec("run")).toBe(false);
  });
});

describe("getFailFastEnvironmentConfig", () => {
  it("uses default values when env values are undefined", () => {
    const cypressLike = createCypressLike({
      [IGNORE_PER_TEST_CONFIG]: undefined,
      [ENABLED_GLOBAL_CONFIG]: undefined,
      [STRATEGY_GLOBAL_CONFIG]: undefined,
      [BAIL_GLOBAL_CONFIG]: undefined,
    });

    expect(getFailFastEnvironmentConfig(cypressLike)).toEqual({
      ignorePerTestConfig: GLOBAL_CONFIG_DEFAULT_VALUES[IGNORE_PER_TEST_CONFIG],
      enabled: GLOBAL_CONFIG_DEFAULT_VALUES[ENABLED_GLOBAL_CONFIG],
      strategyIsSpec: false,
      bail: GLOBAL_CONFIG_DEFAULT_VALUES[BAIL_GLOBAL_CONFIG],
    });
  });

  it("uses default values when boolean env values are invalid", () => {
    const cypressLike = createCypressLike({
      [IGNORE_PER_TEST_CONFIG]: "invalid",
      [ENABLED_GLOBAL_CONFIG]: "invalid",
      [STRATEGY_GLOBAL_CONFIG]: "run",
      [BAIL_GLOBAL_CONFIG]: "3",
    });

    expect(getFailFastEnvironmentConfig(cypressLike)).toEqual({
      ignorePerTestConfig: GLOBAL_CONFIG_DEFAULT_VALUES[IGNORE_PER_TEST_CONFIG],
      enabled: GLOBAL_CONFIG_DEFAULT_VALUES[ENABLED_GLOBAL_CONFIG],
      strategyIsSpec: false,
      bail: 3,
    });
  });

  it("parses booleans, strategy and bail from env values", () => {
    const cypressLike = createCypressLike({
      [IGNORE_PER_TEST_CONFIG]: "true",
      [ENABLED_GLOBAL_CONFIG]: 0,
      [STRATEGY_GLOBAL_CONFIG]: "spec",
      [BAIL_GLOBAL_CONFIG]: "2",
    });

    expect(getFailFastEnvironmentConfig(cypressLike)).toEqual({
      ignorePerTestConfig: true,
      enabled: false,
      strategyIsSpec: true,
      bail: 2,
    });
  });

  it("uses default bail when env value is empty string", () => {
    const cypressLike = createCypressLike({
      [IGNORE_PER_TEST_CONFIG]: false,
      [ENABLED_GLOBAL_CONFIG]: true,
      [STRATEGY_GLOBAL_CONFIG]: "run",
      [BAIL_GLOBAL_CONFIG]: "",
    });

    expect(getFailFastEnvironmentConfig(cypressLike).bail).toBe(
      GLOBAL_CONFIG_DEFAULT_VALUES[BAIL_GLOBAL_CONFIG],
    );
  });
});

describe("helper config accessors", () => {
  it("returns strategyIsSpec from currentStrategyIsSpec", () => {
    const cypressLike = createCypressLike({
      [IGNORE_PER_TEST_CONFIG]: false,
      [ENABLED_GLOBAL_CONFIG]: true,
      [STRATEGY_GLOBAL_CONFIG]: "spec",
      [BAIL_GLOBAL_CONFIG]: 1,
    });

    expect(currentStrategyIsSpec(cypressLike)).toBe(true);
  });

  it("returns ignorePerTestConfig from shouldIgnorePerTestConfig", () => {
    const cypressLike = createCypressLike({
      [IGNORE_PER_TEST_CONFIG]: "1",
      [ENABLED_GLOBAL_CONFIG]: true,
      [STRATEGY_GLOBAL_CONFIG]: "run",
      [BAIL_GLOBAL_CONFIG]: 1,
    });

    expect(shouldIgnorePerTestConfig(cypressLike)).toBe(true);
  });

  it("returns bail from bailConfig", () => {
    const cypressLike = createCypressLike({
      [IGNORE_PER_TEST_CONFIG]: false,
      [ENABLED_GLOBAL_CONFIG]: true,
      [STRATEGY_GLOBAL_CONFIG]: "run",
      [BAIL_GLOBAL_CONFIG]: "7",
    });

    expect(bailConfig(cypressLike)).toBe(7);
  });
});
