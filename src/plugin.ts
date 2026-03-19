import * as Cypress from "cypress";

import { registerFailFastTasks } from "./Node/Tasks";

import type { FailFastPluginConfigOptions } from "./Node/Tasks.types";

/**
 * Cypress plugin entrypoint that registers fail-fast tasks in Node.
 * @param on Cypress plugin events registry.
 * @param config Resolved Cypress configuration for the run.
 * @param pluginConfig Optional fail-fast plugin options.
 * @returns The unmodified Cypress configuration.
 */
const plugin = (
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions,
  pluginConfig: FailFastPluginConfigOptions = {},
) => {
  registerFailFastTasks(on, config, pluginConfig);
  return config;
};

export default plugin;

// For CommonJS compatibility
module.exports = plugin;
