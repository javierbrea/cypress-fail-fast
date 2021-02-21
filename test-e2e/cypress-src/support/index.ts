import addContext from "mochawesome/addContext";
import "./cypress-fail-fast";

Cypress.on("test:after:run", (test, runnable) => {
  if (test.state === "failed") {
    addContext({ test }, "Executed test:after:run event in failed test");
  }
});
