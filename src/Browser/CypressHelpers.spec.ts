import type * as Cypress from "cypress";
import type * as Mocha from "mocha";
// eslint-disable-next-line no-shadow -- Avoid conflict with Cypress global `describe`
import { describe, it, expect, jest, beforeEach } from "@jest/globals";

import {
  getFailFastEnvironmentConfig,
  shouldIgnorePerTestConfig,
  RUN_STRATEGY,
} from "../Shared/Config";

import {
  isHeaded,
  getTestConfig,
  failFastIsEnabled,
  testHasFailed,
} from "./CypressHelpers";

jest.mock("../Shared/Config", () => ({
  getFailFastEnvironmentConfig: jest.fn(),
  shouldIgnorePerTestConfig: jest.fn(),
}));

const mockedGetFailFastEnvironmentConfig =
  getFailFastEnvironmentConfig as jest.MockedFunction<
    typeof getFailFastEnvironmentConfig
  >;
const mockedShouldIgnorePerTestConfig =
  shouldIgnorePerTestConfig as jest.MockedFunction<
    typeof shouldIgnorePerTestConfig
  >;

function createTestWithFailFastOverride(
  enabled: boolean,
  parent?: Mocha.Suite,
): Mocha.Test {
  const testLike = {
    parent,
    ctx: {
      test: {
        _testConfig: {
          testConfigList: [{ overrides: { failFast: { enabled } } }],
        },
      },
    },
  };

  return testLike as unknown as Mocha.Test;
}

describe("isHeaded", () => {
  it("should return true when browser is headed", () => {
    const cypressLike = {
      browser: {
        isHeaded: true,
      },
    } as unknown as Cypress.Cypress;

    expect(isHeaded(cypressLike)).toBe(true);
  });

  it("should return false when browser is not headed", () => {
    const cypressLike = {
      browser: {
        isHeaded: false,
      },
    } as unknown as Cypress.Cypress;

    expect(isHeaded(cypressLike)).toBe(false);
  });

  it("should return undefined when browser is not available", () => {
    const cypressLike = {} as Cypress.Cypress;

    expect(isHeaded(cypressLike)).toBeUndefined();
  });
});

describe("getTestConfig", () => {
  it("should return fail-fast override from the latest test config entry", () => {
    const testLike = {
      ctx: {
        test: {
          _testConfig: {
            testConfigList: [
              { overrides: { failFast: { enabled: true } } },
              { overrides: { failFast: { enabled: false } } },
            ],
          },
        },
      },
    } as unknown as Mocha.Test;

    expect(getTestConfig(testLike)).toEqual({ enabled: false });
  });

  it("should return undefined when there is no fail-fast override", () => {
    const testLike = {
      ctx: {
        test: {
          _testConfig: {
            testConfigList: [{ overrides: {} }],
          },
        },
      },
    } as unknown as Mocha.Test;

    expect(getTestConfig(testLike)).toBeUndefined();
  });

  it("should return undefined when test context is not available", () => {
    const testLike = {} as Mocha.Test;

    expect(getTestConfig(testLike)).toBeUndefined();
  });
});

describe("failFastIsEnabled", () => {
  const cypressLike = {} as Cypress.Cypress;

  beforeEach(() => {
    mockedGetFailFastEnvironmentConfig.mockReset();
    mockedShouldIgnorePerTestConfig.mockReset();

    mockedGetFailFastEnvironmentConfig.mockReturnValue({
      strategy: RUN_STRATEGY,
      ignorePerTestConfig: false,
      enabled: true,
      strategyIsSpec: false,
      bail: 1,
    });
  });

  it("should use environment configuration when per-test config must be ignored", () => {
    mockedShouldIgnorePerTestConfig.mockReturnValue(true);

    const testLike = createTestWithFailFastOverride(false);

    expect(failFastIsEnabled(testLike, cypressLike)).toBe(true);
  });

  it("should use test override when available", () => {
    mockedShouldIgnorePerTestConfig.mockReturnValue(false);

    const testLike = createTestWithFailFastOverride(false);

    expect(failFastIsEnabled(testLike, cypressLike)).toBe(false);
  });

  it("should read configuration from parent suite when current test has no override", () => {
    mockedShouldIgnorePerTestConfig.mockReturnValue(false);

    const parentSuite = createTestWithFailFastOverride(
      false,
    ) as unknown as Mocha.Suite;
    const testLike = {
      parent: parentSuite,
      ctx: {
        test: {
          _testConfig: {
            testConfigList: [{ overrides: {} }],
          },
        },
      },
    } as unknown as Mocha.Test;

    expect(failFastIsEnabled(testLike, cypressLike)).toBe(false);
  });

  it("should fallback to environment configuration when no overrides are defined", () => {
    mockedShouldIgnorePerTestConfig.mockReturnValue(false);

    const rootSuite = { parent: undefined, ctx: {} } as unknown as Mocha.Suite;
    const childSuite = { parent: rootSuite, ctx: {} } as unknown as Mocha.Suite;
    const testLike = { parent: childSuite, ctx: {} } as unknown as Mocha.Test;

    expect(failFastIsEnabled(testLike, cypressLike)).toBe(true);
  });
});

describe("testHasFailed", () => {
  it("should return true when test failed and retries are exhausted", () => {
    const testLike = {
      state: "failed",
      currentRetry: () => 1,
      retries: () => 1,
    } as unknown as Mocha.Test;

    expect(testHasFailed(testLike)).toBe(true);
  });

  it("should return false when test failed but has retries left", () => {
    const testLike = {
      state: "failed",
      currentRetry: () => 0,
      retries: () => 1,
    } as unknown as Mocha.Test;

    expect(testHasFailed(testLike)).toBe(false);
  });

  it("should return false when test state is not failed", () => {
    const testLike = {
      state: "passed",
      currentRetry: () => 1,
      retries: () => 1,
    } as unknown as Mocha.Test;

    expect(testHasFailed(testLike)).toBe(false);
  });
});
