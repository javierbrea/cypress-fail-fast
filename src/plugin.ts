import * as Cypress from "cypress";

import { registerFailFastTasks } from "./Node/Tasks";

import type { FailFastPluginConfigOptions } from "./Node/Tasks.types";

const plugin = (
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions,
  pluginConfig: FailFastPluginConfigOptions,
) => {
  registerFailFastTasks(on, config, pluginConfig);
  return config;
};

export default plugin;
