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
  getSkipScopeTitlePath,
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
      strategyIsDescribe: false,
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

describe("getSkipScopeTitlePath", () => {
  const cypressLike = {} as Cypress.Cypress;

  beforeEach(() => {
    mockedShouldIgnorePerTestConfig.mockReset();
    mockedShouldIgnorePerTestConfig.mockReturnValue(false);
  });

  function createSuite({
    title,
    titlePath,
    parent,
    root = false,
    failFast,
  }: {
    title: string;
    titlePath?: string[];
    parent?: Mocha.Suite;
    root?: boolean;
    failFast?: { enabled: boolean };
  }): Mocha.Suite {
    const suiteLike = {
      title,
      root,
      parent,
      titlePath: () => titlePath || [title],
      _testConfig: failFast ? { failFast } : undefined,
    };
    return suiteLike as unknown as Mocha.Suite;
  }

  function createTestInSuite(parent: Mocha.Suite): Mocha.Test {
    return { parent } as unknown as Mocha.Test;
  }

  it("returns the immediate parent describe when no suite has own fail-fast config", () => {
    const rootSuite = createSuite({ title: "", root: true });
    const parentSuite = createSuite({
      title: "child suite",
      titlePath: ["parent suite", "child suite"],
      parent: rootSuite,
    });
    const currentTest = createTestInSuite(parentSuite);

    expect(getSkipScopeTitlePath(currentTest, cypressLike)).toEqual([
      "parent suite",
      "child suite",
    ]);
  });

  it("returns the nearest ancestor suite carrying own fail-fast config", () => {
    const rootSuite = createSuite({ title: "", root: true });
    const configuredSuite = createSuite({
      title: "configured suite",
      titlePath: ["configured suite"],
      parent: rootSuite,
      failFast: { enabled: true },
    });
    const innerSuite = createSuite({
      title: "inner suite",
      titlePath: ["configured suite", "inner suite"],
      parent: configuredSuite,
    });
    const currentTest = createTestInSuite(innerSuite);

    expect(getSkipScopeTitlePath(currentTest, cypressLike)).toEqual([
      "configured suite",
    ]);
  });

  it("reads suite config from unverifiedTestConfig shape", () => {
    const rootSuite = createSuite({ title: "", root: true });
    const configuredSuite = createSuite({
      title: "configured suite",
      titlePath: ["configured suite"],
      parent: rootSuite,
    });
    // @ts-expect-error Mocked partially - reproducing the alternative private shape used by some Cypress versions
    configuredSuite._testConfig = {
      unverifiedTestConfig: { failFast: { enabled: true } },
    };
    const innerSuite = createSuite({
      title: "inner suite",
      titlePath: ["configured suite", "inner suite"],
      parent: configuredSuite,
    });
    const currentTest = createTestInSuite(innerSuite);

    expect(getSkipScopeTitlePath(currentTest, cypressLike)).toEqual([
      "configured suite",
    ]);
  });

  it("ignores suite own config when per-test config is ignored", () => {
    mockedShouldIgnorePerTestConfig.mockReturnValue(true);

    const rootSuite = createSuite({ title: "", root: true });
    const configuredSuite = createSuite({
      title: "configured suite",
      titlePath: ["configured suite"],
      parent: rootSuite,
      failFast: { enabled: true },
    });
    const innerSuite = createSuite({
      title: "inner suite",
      titlePath: ["configured suite", "inner suite"],
      parent: configuredSuite,
    });
    const currentTest = createTestInSuite(innerSuite);

    expect(getSkipScopeTitlePath(currentTest, cypressLike)).toEqual([
      "configured suite",
      "inner suite",
    ]);
  });

  it("returns an empty title path for tests defined at the spec root", () => {
    const rootSuite = createSuite({ title: "", root: true });
    const currentTest = createTestInSuite(rootSuite);

    expect(getSkipScopeTitlePath(currentTest, cypressLike)).toEqual([]);
  });
});
