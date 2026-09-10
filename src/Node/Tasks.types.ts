import type { FailFastConfig } from "../Shared/Config.types";

export type FailFastStrategy = NonNullable<FailFastConfig["failFastStrategy"]>;

/**
 * Lightweight failed test data shared with Node-side hooks.
 */
export type FailFastFailedTestData = {
  /** Test title without parent suites. */
  name: string;
  /** Full test title including parent suites. */
  fullTitle: string;
};

/**
 * Context provided when fail-fast is triggered from a failed test in the run.
 */
export type OnFailFastTriggeredHookContext = {
  /** Active global strategy. */
  strategy: FailFastStrategy;
  /** Failed test that triggered fail-fast. */
  test: FailFastFailedTestData;
};

/**
 * Callback hooks used to coordinate fail-fast state across runs.
 */
export type FailFastHooks = {
  /**
   * Runs when fail-fast mode is triggered from a failed test.
   */
  onFailFastTriggered?(
    context: OnFailFastTriggeredHookContext,
  ): void | Promise<void>;

  /**
   * Runs before each test execution to decide if fail-fast should be triggered.
   * Returning true enables skip mode.
   */
  shouldTriggerFailFast?(): boolean | Promise<boolean>;
};

/**
 * Payload accepted by the trigger-fail-fast task.
 */
export type TriggerFailFastTaskPayload = {
  test: FailFastFailedTestData;
  /**
   * Title path of the describe block where remaining tests must be skipped.
   * Only provided when the `describe` strategy is active. When present, the
   * skip mode only affects tests whose title path starts with this one.
   */
  skipScopeTitlePath?: string[];
};

/**
 * Payload accepted by the should-skip task.
 */
export type ShouldSkipTaskPayload = {
  /**
   * Title path of the test about to run. Used by the `describe` strategy to
   * decide whether the test belongs to the describe block where fail-fast was
   * triggered. Other strategies ignore it.
   */
  titlePath?: string[];
};

/**
 * Node-side plugin options for cypress-fail-fast.
 */
export type FailFastPluginConfigOptions = {
  /**
   * Optional hooks to coordinate fail-fast across runs.
   */
  hooks?: FailFastHooks;
};
