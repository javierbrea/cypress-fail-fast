import type * as Cypress from "cypress";
import chalk from "chalk";

/* eslint-disable no-shadow -- Avoid conflict with Cypress global test symbols */
import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
} from "@jest/globals";
/* eslint-enable no-shadow */

import {
  SHOULD_SKIP_TASK,
  TRIGGER_FAIL_FAST_TASK,
  RESET_SKIP_TASK,
  FAILED_TESTS_TASK,
  RESET_FAILED_TESTS_TASK,
  LOG_TASK,
  LOG_PREFIX,
} from "../Shared/Constants";
import type { FailFastConfig } from "../Shared/Config.types";
import type {
  FailFastFailedTestData,
  FailFastPluginConfigOptions,
  TriggerFailFastTaskPayload,
} from "./Tasks.types";
import { registerFailFastTasks } from "./Tasks";

type TaskHandler = (value?: unknown) => unknown;
type RegisteredTasks = Record<string, TaskHandler>;

function createRegisteredTasks(
  pluginConfig?: FailFastPluginConfigOptions,
  exposedConfig?: FailFastConfig,
): RegisteredTasks {
  const onMock = jest.fn();
  const cypressConfig = {
    expose: exposedConfig,
  } as unknown as Cypress.PluginConfigOptions;

  if (pluginConfig) {
    registerFailFastTasks(
      onMock as unknown as Cypress.PluginEvents,
      cypressConfig,
      pluginConfig,
    );
  } else {
    registerFailFastTasks(
      onMock as unknown as Cypress.PluginEvents,
      cypressConfig,
    );
  }

  const registration = onMock.mock.calls.find((call) => call[0] === "task") as
    | ["task", RegisteredTasks]
    | undefined;

  if (!registration) {
    throw new Error("Task registration was not performed");
  }

  return registration[1];
}

function createEnableSkipTaskPayload(
  failedTestData: FailFastFailedTestData,
): TriggerFailFastTaskPayload {
  return {
    test: failedTestData,
  };
}

describe("registerFailFastTasks", () => {
  let consoleLogSpy: jest.SpiedFunction<typeof console.log>;

  beforeEach(() => {
    consoleLogSpy = jest
      .spyOn(console, "log")
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it("registers all fail-fast task handlers", () => {
    const tasks = createRegisteredTasks();

    expect(tasks).toMatchObject({
      [RESET_SKIP_TASK]: expect.any(Function),
      [SHOULD_SKIP_TASK]: expect.any(Function),
      [TRIGGER_FAIL_FAST_TASK]: expect.any(Function),
      [FAILED_TESTS_TASK]: expect.any(Function),
      [RESET_FAILED_TESTS_TASK]: expect.any(Function),
      [LOG_TASK]: expect.any(Function),
    });
  });

  it("returns false from should-skip task by default", () => {
    const tasks = createRegisteredTasks();

    expect(tasks[SHOULD_SKIP_TASK]()).toBe(false);
  });

  it("enables skip mode when trigger task receives failed test payload", () => {
    const tasks = createRegisteredTasks();
    const failedTest = {
      name: "a test",
      fullTitle: "suite a test",
    };

    expect(
      tasks[TRIGGER_FAIL_FAST_TASK](createEnableSkipTaskPayload(failedTest)),
    ).toBe(true);
    expect(tasks[SHOULD_SKIP_TASK]()).toBe(true);
  });

  it("resets skip mode when reset-skip task is executed", () => {
    const tasks = createRegisteredTasks();

    tasks[TRIGGER_FAIL_FAST_TASK](
      createEnableSkipTaskPayload({
        name: "a test",
        fullTitle: "suite a test",
      }),
    );

    expect(tasks[RESET_SKIP_TASK]()).toBeNull();
    expect(tasks[SHOULD_SKIP_TASK]()).toBe(false);
  });

  it("uses shouldTriggerFailFast hook and caches true result", () => {
    const shouldTriggerFailFast = jest
      .fn<() => boolean>()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);

    const tasks = createRegisteredTasks({
      hooks: {
        shouldTriggerFailFast,
      },
    });

    expect(tasks[SHOULD_SKIP_TASK]()).toBe(true);
    expect(tasks[SHOULD_SKIP_TASK]()).toBe(true);
    expect(shouldTriggerFailFast).toHaveBeenCalledTimes(1);
  });

  it("keeps skip mode disabled when shouldTriggerFailFast returns false", () => {
    const shouldTriggerFailFast = jest
      .fn<() => boolean>()
      .mockReturnValue(false);

    const tasks = createRegisteredTasks({
      hooks: {
        shouldTriggerFailFast,
      },
    });

    expect(tasks[SHOULD_SKIP_TASK]()).toBe(false);
    expect(tasks[SHOULD_SKIP_TASK]()).toBe(false);
    expect(shouldTriggerFailFast).toHaveBeenCalledTimes(2);
  });

  it("calls onFailFastTriggered when enabling skip mode with payload", () => {
    const onFailFastTriggered =
      jest.fn<
        (context: {
          strategy: "run" | "spec";
          test: FailFastFailedTestData;
        }) => void
      >();
    const failedTest = {
      name: "a test",
      fullTitle: "suite a test",
    };

    const tasks = createRegisteredTasks({
      hooks: {
        onFailFastTriggered,
      },
    });

    tasks[TRIGGER_FAIL_FAST_TASK](createEnableSkipTaskPayload(failedTest));

    expect(onFailFastTriggered).toHaveBeenCalledTimes(1);
    expect(onFailFastTriggered).toHaveBeenCalledWith({
      strategy: "run",
      test: failedTest,
    });
  });

  it("passes spec strategy to hooks when configured", () => {
    const onFailFastTriggered =
      jest.fn<
        (context: {
          strategy: "run" | "spec";
          test: FailFastFailedTestData;
        }) => void
      >();
    const failedTest = {
      name: "a test",
      fullTitle: "suite a test",
    };

    const tasks = createRegisteredTasks(
      {
        hooks: {
          onFailFastTriggered,
        },
      },
      {
        failFastStrategy: "spec",
      },
    );

    tasks[TRIGGER_FAIL_FAST_TASK](createEnableSkipTaskPayload(failedTest));

    expect(onFailFastTriggered).toHaveBeenCalledWith({
      strategy: "spec",
      test: failedTest,
    });
  });

  it("passes context to shouldTriggerFailFast and clears test on reset", () => {
    const shouldTriggerFailFast = jest
      .fn<
        (context: {
          strategy: "run" | "spec";
          test?: FailFastFailedTestData;
        }) => boolean
      >()
      .mockReturnValue(false);

    const failedTest = {
      name: "a test",
      fullTitle: "suite a test",
    };

    const tasks = createRegisteredTasks({
      hooks: {
        shouldTriggerFailFast,
      },
    });

    tasks[SHOULD_SKIP_TASK]();
    tasks[TRIGGER_FAIL_FAST_TASK](createEnableSkipTaskPayload(failedTest));
    tasks[RESET_SKIP_TASK]();
    tasks[SHOULD_SKIP_TASK]();

    expect(shouldTriggerFailFast).toHaveBeenNthCalledWith(1, {
      strategy: "run",
      test: undefined,
    });
    expect(shouldTriggerFailFast).toHaveBeenNthCalledWith(2, {
      strategy: "run",
      test: undefined,
    });
  });

  it("increments and resets failed tests counter", () => {
    const tasks = createRegisteredTasks();

    expect(tasks[FAILED_TESTS_TASK](null)).toBe(0);
    expect(tasks[FAILED_TESTS_TASK](true)).toBe(1);
    expect(tasks[FAILED_TESTS_TASK](true)).toBe(2);
    expect(tasks[RESET_FAILED_TESTS_TASK]()).toBeNull();
    expect(tasks[FAILED_TESTS_TASK](null)).toBe(0);
  });

  it("logs message with fail-fast prefix", () => {
    const tasks = createRegisteredTasks();

    expect(tasks[LOG_TASK]("my message")).toBeNull();
    expect(consoleLogSpy).toHaveBeenCalledWith(
      `${chalk.yellow(LOG_PREFIX)} my message`,
    );
  });
});
