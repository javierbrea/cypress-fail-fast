const PLUGIN_ENVIRONMENT_VAR = "FAIL_FAST";

function shouldFailFast() {
  return (
    Cypress.env(PLUGIN_ENVIRONMENT_VAR) === true || Cypress.env(PLUGIN_ENVIRONMENT_VAR) === "true"
  );
}

module.exports = {
  PLUGIN_ENVIRONMENT_VAR,
  shouldFailFast,
};
