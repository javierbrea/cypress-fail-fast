// The first describe block accumulates two failures on its own, reaching
// failFastBail: 2, so its remaining test is skipped. The second block never
// fails and runs normally:
// 4 tests should be executed, 1 should pass, 2 should fail and 1 should be pending.

describe("First block", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should display first item", () => {
    cy.get("ul li:eq(0)").should("have.text", "Wrong text");
  });

  it("should display second item", () => {
    cy.get("ul li:eq(1)").should("have.text", "Wrong text");
  });

  it("should skip the remaining test", () => {
    cy.get("h1").should("have.text", "Items list");
  });
});

describe("Second block", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should display third item", () => {
    cy.get("ul li:eq(2)").should("have.text", "Third item");
  });
});
