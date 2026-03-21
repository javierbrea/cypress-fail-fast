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
import { RUN_STRATEGY, SPEC_STRATEGY } from "../Shared/Config";
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

  it("returns false from should-skip task by default", async () => {
    const tasks = createRegisteredTasks();

    expect(await tasks[SHOULD_SKIP_TASK]()).toBe(false);
  });

  it("enables skip mode when trigger task receives failed test payload", async () => {
    const tasks = createRegisteredTasks();
    const failedTest = {
      name: "a test",
      fullTitle: "suite a test",
    };

    expect(
      await tasks[TRIGGER_FAIL_FAST_TASK](createEnableSkipTaskPayload(failedTest)),
    ).toBe(true);
    expect(await tasks[SHOULD_SKIP_TASK]()).toBe(true);
  });

  it("resets skip mode when reset-skip task is executed", async () => {
    const tasks = createRegisteredTasks();

    await tasks[TRIGGER_FAIL_FAST_TASK](
      createEnableSkipTaskPayload({
        name: "a test",
        fullTitle: "suite a test",
      }),
    );

    expect(tasks[RESET_SKIP_TASK]()).toBeNull();
    expect(await tasks[SHOULD_SKIP_TASK]()).toBe(false);
  });

  it("uses shouldTriggerFailFast hook and caches true result", async () => {
    const shouldTriggerFailFast = jest
      .fn<() => boolean>()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);

    const tasks = createRegisteredTasks({
      hooks: {
        shouldTriggerFailFast,
      },
    });

    expect(await tasks[SHOULD_SKIP_TASK]()).toBe(true);
    expect(await tasks[SHOULD_SKIP_TASK]()).toBe(true);
    expect(shouldTriggerFailFast).toHaveBeenCalledTimes(1);
  });

  it("keeps skip mode disabled when shouldTriggerFailFast returns false", async () => {
    const shouldTriggerFailFast = jest
      .fn<() => boolean>()
      .mockReturnValue(false);

    const tasks = createRegisteredTasks({
      hooks: {
        shouldTriggerFailFast,
      },
    });

    expect(await tasks[SHOULD_SKIP_TASK]()).toBe(false);
    expect(await tasks[SHOULD_SKIP_TASK]()).toBe(false);
    expect(shouldTriggerFailFast).toHaveBeenCalledTimes(2);
  });

  it("logs error and returns false when shouldTriggerFailFast hook fails", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const shouldTriggerFailFast = jest.fn<() => Promise<boolean>>().mockRejectedValue(new Error("Hook failed"));
    const tasks = createRegisteredTasks({
      hooks: {
        shouldTriggerFailFast,
      },
    });

    expect(await tasks[SHOULD_SKIP_TASK]()).toBe(false);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Ignored error in shouldTriggerFailFast hook: Error: Hook failed")
    );
    warnSpy.mockRestore();
  });

  it("logs error and continues when onFailFastTriggered hook fails", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const onFailFastTriggered = jest.fn<() => Promise<void>>().mockRejectedValue(new Error("Hook failed"));
    const tasks = createRegisteredTasks({
      hooks: {
        onFailFastTriggered,
      },
    });

    expect(await tasks[TRIGGER_FAIL_FAST_TASK](createEnableSkipTaskPayload({
      name: "a test",
      fullTitle: "suite a test",
    }))).toBe(true);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Ignored error in onFailFastTriggered hook: Error: Hook failed")
    );
    warnSpy.mockRestore();
  });

  it("calls onFailFastTriggered when enabling skip mode with payload", async () => {
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

    await tasks[TRIGGER_FAIL_FAST_TASK](createEnableSkipTaskPayload(failedTest));

    expect(onFailFastTriggered).toHaveBeenCalledTimes(1);
    expect(onFailFastTriggered).toHaveBeenCalledWith({
      strategy: RUN_STRATEGY,
      test: failedTest,
    });
  });

  it("passes spec strategy to hooks when configured", async () => {
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

    await tasks[TRIGGER_FAIL_FAST_TASK](createEnableSkipTaskPayload(failedTest));

    expect(onFailFastTriggered).toHaveBeenCalledWith({
      strategy: SPEC_STRATEGY,
      test: failedTest,
    });
  });

  it("calls shouldTriggerFailFast without arguments", async () => {
    const shouldTriggerFailFast = jest
      .fn<() => boolean>()
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

    await tasks[SHOULD_SKIP_TASK]();
    await tasks[TRIGGER_FAIL_FAST_TASK](createEnableSkipTaskPayload(failedTest));
    tasks[RESET_SKIP_TASK]();
    await tasks[SHOULD_SKIP_TASK]();

    expect(shouldTriggerFailFast).toHaveBeenNthCalledWith(1);
    expect(shouldTriggerFailFast).toHaveBeenNthCalledWith(2);
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
