import "./cypress-fail-fast";

Cypress.on("test:after:run", (test, runnable) => {
  if (test.state === "failed") {
    cy.task("log", "Executing test:after:run event in failed test");
  }
});
