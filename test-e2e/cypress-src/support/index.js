/* global Cypress */

import "cypress-fail-fast";

Cypress.on("test:after:run", (test) => {
  if (test.state === "failed") {
    cy.task("log", "Executing test:after:run event in failed test");
  }
});
