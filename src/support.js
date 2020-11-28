const { PLUGIN_ENVIRONMENT_VAR } = require("./helpers");

function support(Cypress, cy, beforeEach, afterEach, before) {
  function isHeaded() {
    return Cypress.browser && Cypress.browser.isHeaded;
  }

  function shouldFailFast() {
    return (
      Cypress.env(PLUGIN_ENVIRONMENT_VAR) === true ||
      Cypress.env(PLUGIN_ENVIRONMENT_VAR) === "true"
    );
  }

  function testState(test) {
    return (
      test.currentTest &&
      test.currentTest.state === "failed" &&
      test.currentTest.currentRetry() === test.currentTest.retries()
    );
  }

  beforeEach(function () {
    if (shouldFailFast()) {
      cy.task("shouldSkipDueToFailFast").then((value) => {
        if (value === true) {
          Cypress.runner.stop();
        }
      });
    }
  });

  afterEach(function () {
    // Mark skip flag as true if test failed
    if (shouldFailFast() && testState(this)) {
      cy.task("shouldSkipDueToFailFast", true);
      Cypress.runner.stop();
    }
  });

  before(function () {
    if (isHeaded() && shouldFailFast()) {
      // Reset the shouldSkip flag at the start of a run, so that it
      //  doesn't carry over into subsequent runs.
      // Do this only for headed runs because in headless runs,
      //  the `before` hook is executed for each spec file.
      cy.task("resetShouldSkipDueToFailFast");
    }
  });
}

module.exports = support;
