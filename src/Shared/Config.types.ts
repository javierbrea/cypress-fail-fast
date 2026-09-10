/**
 * Effective global fail-fast configuration used during a Cypress run.
 */
export type FailFastGlobalConfig = {
  /** Normalized global fail-fast strategy. */
  strategy: NonNullable<FailFastConfig["failFastStrategy"]>;
  /** When `true`, per-test fail-fast configuration will be ignored in favor of global configuration. */
  ignorePerTestConfig: boolean;
  /** When `true`, fail-fast behavior is enabled. */
  enabled: boolean;
  /** When `true`, the strategy that skips only the current spec after the first failure will be used. Otherwise, the strategy that skips all specs will be used. */
  strategyIsSpec: boolean;
  /** When `true`, the strategy that skips only the remaining tests in the describe block where the failure happened will be used. */
  strategyIsDescribe: boolean;
  /** Number of failures required to start skipping tests. */
  bail: number;
};

export type FailFastConfig = {
  /** When `true`, per-test fail-fast configuration will be ignored in favor of global configuration. */
  failFastIgnorePerTestConfig?: boolean;
  /** When `false`, fail-fast behavior is disabled. */
  failFastEnabled?: boolean;
  /** When set to `"spec"`, the strategy that skips only the current spec after the first failure will be used. When set to `"run"`, the strategy that skips all specs will be used. When set to `"describe"`, only the remaining tests in the describe block where the failure happened will be skipped. */
  failFastStrategy?: "spec" | "run" | "describe";
  /** Number of failures required to start skipping tests. */
  failFastBail?: number;
};
