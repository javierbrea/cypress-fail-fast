import "./cypress-fail-fast";

Cypress.on("test:after:run", (test, runnable) => {
  if (test.state === "failed") {
    cy.task("log", "Log after failed test");
  }
});
