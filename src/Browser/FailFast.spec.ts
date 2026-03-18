import type * as Cypress from "cypress";
import type * as Mocha from "mocha";
// eslint-disable-next-line no-shadow -- Avoid conflict with Cypress global `describe`
import { describe, it, expect, jest, beforeEach } from "@jest/globals";

import {
  SHOULD_SKIP_TASK,
  FAILED_TESTS_TASK,
  RESET_SKIP_TASK,
  RESET_FAILED_TESTS_TASK,
  LOG_TASK,
  SKIP_MESSAGE,
  FAILED_TEST_MESSAGE,
} from "../Shared/Constants";

import { bailConfig, currentStrategyIsSpec } from "../Shared/Config";
import { failFastIsEnabled, testHasFailed, isHeaded } from "./CypressHelpers";
import { registerFailFast } from "./FailFast";

jest.mock("../Shared/Config", () => ({
  bailConfig: jest.fn(),
  currentStrategyIsSpec: jest.fn(),
}));

jest.mock("./CypressHelpers", () => ({
  failFastIsEnabled: jest.fn(),
  testHasFailed: jest.fn(),
  isHeaded: jest.fn(),
}));

const mockedBailConfig = bailConfig as jest.MockedFunction<typeof bailConfig>;
const mockedCurrentStrategyIsSpec =
  currentStrategyIsSpec as jest.MockedFunction<typeof currentStrategyIsSpec>;
const mockedFailFastIsEnabled = failFastIsEnabled as jest.MockedFunction<
  typeof failFastIsEnabled
>;
const mockedTestHasFailed = testHasFailed as jest.MockedFunction<
  typeof testHasFailed
>;
const mockedIsHeaded = isHeaded as jest.MockedFunction<typeof isHeaded>;

type HookCallback = (this: Mocha.Context) => void;

function createHookRegisterer() {
  let callback: HookCallback | undefined;

  const register = jest.fn((hook: HookCallback) => {
    callback = hook;
  }) as unknown as Mocha.HookFunction;

  return {
    register,
    getCallback: () => callback,
  };
}

function createCyLike(initialShouldSkip = false, initialFailedTests = 0) {
  let shouldSkip = initialShouldSkip;
  let failedTests = initialFailedTests;

  const task = jest.fn((taskName: string, value: unknown): unknown => {
    if (taskName === SHOULD_SKIP_TASK && value === null) {
      return {
        then: (callback: (currentValue: boolean) => void) => {
          callback(shouldSkip);
        },
      };
    }

    if (taskName === SHOULD_SKIP_TASK && value === true) {
      shouldSkip = true;
      return null;
    }

    if (taskName === RESET_SKIP_TASK) {
      shouldSkip = false;
      return null;
    }

    if (taskName === FAILED_TESTS_TASK && value === true) {
      failedTests++;
      return {
        then: (callback: (currentValue: number) => void) => {
          callback(failedTests);
        },
      };
    }

    if (taskName === RESET_FAILED_TESTS_TASK) {
      failedTests = 0;
      return null;
    }

    return null;
  });

  return {
    task,
  } as unknown as Cypress.cy;
}

function createCurrentTest(fullTitle = "a suite a test") {
  return {
    fullTitle: () => fullTitle,
  } as unknown as Mocha.Test;
}

describe("registerFailFast", () => {
  const cypressLike = {} as Cypress.Cypress;

  beforeEach(() => {
    mockedBailConfig.mockReset();
    mockedCurrentStrategyIsSpec.mockReset();
    mockedFailFastIsEnabled.mockReset();
    mockedTestHasFailed.mockReset();
    mockedIsHeaded.mockReset();

    mockedBailConfig.mockReturnValue(2);
    mockedCurrentStrategyIsSpec.mockReturnValue(false);
    mockedFailFastIsEnabled.mockReturnValue(true);
    mockedTestHasFailed.mockReturnValue(false);
    mockedIsHeaded.mockReturnValue(false);
  });

  it("resets shared state in before hook when run is headed", () => {
    const cyLike = createCyLike();
    const beforeHook = createHookRegisterer();
    const beforeEachHook = createHookRegisterer();
    const afterEachHook = createHookRegisterer();
    const context = { skip: jest.fn() } as unknown as Mocha.Context;

    mockedIsHeaded.mockReturnValue(true);

    registerFailFast(
      cypressLike,
      cyLike,
      beforeHook.register,
      beforeEachHook.register,
      afterEachHook.register,
    );

    beforeHook.getCallback()?.call(context);

    expect(cyLike.task).toHaveBeenCalledWith(RESET_SKIP_TASK, null, {
      log: false,
    });
    expect(cyLike.task).toHaveBeenCalledWith(RESET_FAILED_TESTS_TASK, null, {
      log: false,
    });
    expect(context.skip).not.toHaveBeenCalled();
  });

  it("resets shared state in before hook when strategy is spec", () => {
    const cyLike = createCyLike();
    const beforeHook = createHookRegisterer();
    const beforeEachHook = createHookRegisterer();
    const afterEachHook = createHookRegisterer();

    mockedCurrentStrategyIsSpec.mockReturnValue(true);

    registerFailFast(
      cypressLike,
      cyLike,
      beforeHook.register,
      beforeEachHook.register,
      afterEachHook.register,
    );

    beforeHook
      .getCallback()
      ?.call({ skip: jest.fn() } as unknown as Mocha.Context);

    expect(cyLike.task).toHaveBeenCalledWith(RESET_SKIP_TASK, null, {
      log: false,
    });
    expect(cyLike.task).toHaveBeenCalledWith(RESET_FAILED_TESTS_TASK, null, {
      log: false,
    });
  });

  it("skips current suite in before hook when skip mode is enabled", () => {
    const cyLike = createCyLike(true);
    const beforeHook = createHookRegisterer();
    const beforeEachHook = createHookRegisterer();
    const afterEachHook = createHookRegisterer();
    const context = { skip: jest.fn() } as unknown as Mocha.Context;

    registerFailFast(
      cypressLike,
      cyLike,
      beforeHook.register,
      beforeEachHook.register,
      afterEachHook.register,
    );

    beforeHook.getCallback()?.call(context);

    expect(cyLike.task).toHaveBeenCalledWith(SHOULD_SKIP_TASK, null, {
      log: false,
    });
    expect(context.skip).toHaveBeenCalledTimes(1);
  });

  it("does not skip current suite in before hook when skip mode is disabled", () => {
    const cyLike = createCyLike(false);
    const beforeHook = createHookRegisterer();
    const beforeEachHook = createHookRegisterer();
    const afterEachHook = createHookRegisterer();
    const context = { skip: jest.fn() } as unknown as Mocha.Context;

    registerFailFast(
      cypressLike,
      cyLike,
      beforeHook.register,
      beforeEachHook.register,
      afterEachHook.register,
    );

    beforeHook.getCallback()?.call(context);

    expect(context.skip).not.toHaveBeenCalled();
  });

  it("skips current test in beforeEach hook when skip mode is enabled", () => {
    const cyLike = createCyLike(true);
    const beforeHook = createHookRegisterer();
    const beforeEachHook = createHookRegisterer();
    const afterEachHook = createHookRegisterer();
    const context = { skip: jest.fn() } as unknown as Mocha.Context;

    registerFailFast(
      cypressLike,
      cyLike,
      beforeHook.register,
      beforeEachHook.register,
      afterEachHook.register,
    );

    beforeEachHook.getCallback()?.call(context);

    expect(cyLike.task).toHaveBeenCalledWith(SHOULD_SKIP_TASK, null, {
      log: false,
    });
    expect(context.skip).toHaveBeenCalledTimes(1);
  });

  it("does not register failure when there is no current test", () => {
    const cyLike = createCyLike();
    const beforeHook = createHookRegisterer();
    const beforeEachHook = createHookRegisterer();
    const afterEachHook = createHookRegisterer();
    const context = {
      currentTest: undefined,
    } as unknown as Mocha.Context;

    registerFailFast(
      cypressLike,
      cyLike,
      beforeHook.register,
      beforeEachHook.register,
      afterEachHook.register,
    );

    afterEachHook.getCallback()?.call(context);

    expect(mockedTestHasFailed).not.toHaveBeenCalled();
    expect(mockedFailFastIsEnabled).not.toHaveBeenCalled();
    expect(cyLike.task).not.toHaveBeenCalledWith(FAILED_TESTS_TASK, true, {
      log: false,
    });
  });

  it("does not register failure when test has not failed", () => {
    const cyLike = createCyLike();
    const beforeHook = createHookRegisterer();
    const beforeEachHook = createHookRegisterer();
    const afterEachHook = createHookRegisterer();
    const currentTest = createCurrentTest();
    const context = {
      currentTest,
    } as unknown as Mocha.Context;

    mockedTestHasFailed.mockReturnValue(false);

    registerFailFast(
      cypressLike,
      cyLike,
      beforeHook.register,
      beforeEachHook.register,
      afterEachHook.register,
    );

    afterEachHook.getCallback()?.call(context);

    expect(mockedTestHasFailed).toHaveBeenCalledWith(currentTest);
    expect(mockedFailFastIsEnabled).not.toHaveBeenCalled();
    expect(cyLike.task).not.toHaveBeenCalledWith(LOG_TASK, expect.any(String));
  });

  it("does not register failure when fail-fast is disabled", () => {
    const cyLike = createCyLike();
    const beforeHook = createHookRegisterer();
    const beforeEachHook = createHookRegisterer();
    const afterEachHook = createHookRegisterer();
    const currentTest = createCurrentTest();
    const context = {
      currentTest,
    } as unknown as Mocha.Context;

    mockedTestHasFailed.mockReturnValue(true);
    mockedFailFastIsEnabled.mockReturnValue(false);

    registerFailFast(
      cypressLike,
      cyLike,
      beforeHook.register,
      beforeEachHook.register,
      afterEachHook.register,
    );

    afterEachHook.getCallback()?.call(context);

    expect(mockedTestHasFailed).toHaveBeenCalledWith(currentTest);
    expect(mockedFailFastIsEnabled).toHaveBeenCalledTimes(1);
    expect(mockedFailFastIsEnabled.mock.calls[0]?.[0]).toBe(currentTest);
    expect(mockedFailFastIsEnabled.mock.calls[0]?.[1]).toBe(cypressLike);
    expect(cyLike.task).not.toHaveBeenCalledWith(FAILED_TESTS_TASK, true, {
      log: false,
    });
  });

  it("logs failure count and does not enable skip mode when bail is not reached", () => {
    const cyLike = createCyLike(false, 0);
    const beforeHook = createHookRegisterer();
    const beforeEachHook = createHookRegisterer();
    const afterEachHook = createHookRegisterer();
    const currentTest = createCurrentTest("suite should continue");
    const context = {
      currentTest,
    } as unknown as Mocha.Context;

    mockedTestHasFailed.mockReturnValue(true);
    mockedFailFastIsEnabled.mockReturnValue(true);
    mockedBailConfig.mockReturnValue(2);

    registerFailFast(
      cypressLike,
      cyLike,
      beforeHook.register,
      beforeEachHook.register,
      afterEachHook.register,
    );

    afterEachHook.getCallback()?.call(context);

    expect(cyLike.task).toHaveBeenCalledWith(
      LOG_TASK,
      'Test "suite should continue" has failed',
    );
    expect(cyLike.task).toHaveBeenCalledWith(FAILED_TESTS_TASK, true, {
      log: false,
    });
    expect(cyLike.task).toHaveBeenCalledWith(
      LOG_TASK,
      `${FAILED_TEST_MESSAGE}: 1/2`,
    );
    expect(cyLike.task).not.toHaveBeenCalledWith(LOG_TASK, SKIP_MESSAGE);
    expect(cyLike.task).not.toHaveBeenCalledWith(SHOULD_SKIP_TASK, true);
  });

  it("enables skip mode when bail limit is reached", () => {
    const cyLike = createCyLike(false, 0);
    const beforeHook = createHookRegisterer();
    const beforeEachHook = createHookRegisterer();
    const afterEachHook = createHookRegisterer();
    const currentTest = createCurrentTest("suite should stop");
    const context = {
      currentTest,
    } as unknown as Mocha.Context;

    mockedTestHasFailed.mockReturnValue(true);
    mockedFailFastIsEnabled.mockReturnValue(true);
    mockedBailConfig.mockReturnValue(1);

    registerFailFast(
      cypressLike,
      cyLike,
      beforeHook.register,
      beforeEachHook.register,
      afterEachHook.register,
    );

    afterEachHook.getCallback()?.call(context);

    expect(cyLike.task).toHaveBeenCalledWith(
      LOG_TASK,
      `${FAILED_TEST_MESSAGE}: 1/1`,
    );
    expect(cyLike.task).toHaveBeenCalledWith(LOG_TASK, SKIP_MESSAGE);
    expect(cyLike.task).toHaveBeenCalledWith(SHOULD_SKIP_TASK, true);
  });
});
