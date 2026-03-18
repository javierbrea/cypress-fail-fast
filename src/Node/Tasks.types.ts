export type FailFastParallelCallbacks = {
  /**
   * onCancel callback.
   * Callback that will be executed on first test failure producing that cypress-fail-fast starts skipping tests.
   */
  onCancel?(): void;

  /**
   * isCancelled callback.
   * If this callback returns true, cypress-fail-fast will start skipping tests.
   * @returns boolean. true if remaining tests should be skipped
   */
  isCancelled?(): boolean;
};

export type FailFastPluginConfigOptions = {
  /**
   * Parallel callbacks.
   * Callbacks to be executed when strategy is "parallel".
   */
  parallelCallbacks?: FailFastParallelCallbacks;
};
