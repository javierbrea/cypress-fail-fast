/// <reference types="cypress" />

interface FailFastParallelCallbacks {
    /**
     * onCancel callback.
     * Callback that will be executed on first test failure producing that cypress-fail-fast starts skipping tests.
    */
    onCancel(): void

    /**
     * isCancelled callback.
     * If this callback returns true, cypress-fail-fast will start skipping tests.
     * @returns boolean. true if remaining tests should be skipped
    */
    isCancelled(): boolean
}

interface FailFastPluginConfigOptions {
    /**
     * Parallel callbacks.
     * Callbacks to be executed when strategy is "parallel".
    */
    parallelCallbacks?: FailFastParallelCallbacks
}

/**
 * Installs cypress-fail-fast plugin
 * @example failFastPlugin(on, config, {});
 * @param on Cypress plugin events
 * @param config Cypress plugin config options
 * @param failFastConfig cypress-fail-fast plugin config options
 * @returns Cypress plugin config options
*/
declare function _exports(on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions, failFastConfig?: FailFastPluginConfigOptions): Cypress.PluginConfigOptions
export = _exports;
