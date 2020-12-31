import cypressFailFast = require("../support/cypress-fail-fast/plugin");

export default (on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions): Cypress.ResolvedConfigOptions => {
  cypressFailFast(on, config);
  return config;
};
