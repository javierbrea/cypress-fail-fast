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
  RESET_SKIP_TASK,
  FAILED_TESTS_TASK,
  RESET_FAILED_TESTS_TASK,
  LOG_TASK,
  LOG_PREFIX,
} from "../Shared/Constants";
import type { FailFastPluginConfigOptions } from "./Tasks.types";
import { registerFailFastTasks } from "./Tasks";

type TaskHandler = (value?: unknown) => unknown;
type RegisteredTasks = Record<string, TaskHandler>;

function createRegisteredTasks(
  pluginConfig?: FailFastPluginConfigOptions,
): RegisteredTasks {
  const onMock = jest.fn();

  if (pluginConfig) {
    registerFailFastTasks(
      onMock as unknown as Cypress.PluginEvents,
      {} as Cypress.PluginConfigOptions,
      pluginConfig,
    );
  } else {
    registerFailFastTasks(
      onMock as unknown as Cypress.PluginEvents,
      {} as Cypress.PluginConfigOptions,
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
      [FAILED_TESTS_TASK]: expect.any(Function),
      [RESET_FAILED_TESTS_TASK]: expect.any(Function),
      [LOG_TASK]: expect.any(Function),
    });
  });

  it("returns false from should-skip task by default", () => {
    const tasks = createRegisteredTasks();

    expect(tasks[SHOULD_SKIP_TASK](null)).toBe(false);
  });

  it("enables skip mode when should-skip task receives true", () => {
    const tasks = createRegisteredTasks();

    expect(tasks[SHOULD_SKIP_TASK](true)).toBe(true);
    expect(tasks[SHOULD_SKIP_TASK](null)).toBe(true);
  });

  it("resets skip mode when reset-skip task is executed", () => {
    const tasks = createRegisteredTasks();

    tasks[SHOULD_SKIP_TASK](true);

    expect(tasks[RESET_SKIP_TASK]()).toBeNull();
    expect(tasks[SHOULD_SKIP_TASK](null)).toBe(false);
  });

  it("uses parallel isCancelled callback and caches true result", () => {
    const isCancelled = jest
      .fn<() => boolean>()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);

    const tasks = createRegisteredTasks({
      parallelCallbacks: {
        isCancelled,
      },
    });

    expect(tasks[SHOULD_SKIP_TASK](null)).toBe(true);
    expect(tasks[SHOULD_SKIP_TASK](null)).toBe(true);
    expect(isCancelled).toHaveBeenCalledTimes(1);
  });

  it("keeps skip mode disabled when isCancelled callback returns false", () => {
    const isCancelled = jest.fn<() => boolean>().mockReturnValue(false);

    const tasks = createRegisteredTasks({
      parallelCallbacks: {
        isCancelled,
      },
    });

    expect(tasks[SHOULD_SKIP_TASK](null)).toBe(false);
    expect(tasks[SHOULD_SKIP_TASK](null)).toBe(false);
    expect(isCancelled).toHaveBeenCalledTimes(2);
  });

  it("calls parallel onCancel callback when enabling skip mode", () => {
    const onCancel = jest.fn<() => void>();
    const tasks = createRegisteredTasks({
      parallelCallbacks: {
        onCancel,
      },
    });

    tasks[SHOULD_SKIP_TASK](true);

    expect(onCancel).toHaveBeenCalledTimes(1);
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
