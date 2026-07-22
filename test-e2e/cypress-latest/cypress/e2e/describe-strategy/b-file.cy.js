// 2 tests, both passing. The skip scope triggered in the previous spec file
// must not leak into this one:
// 2 tests should be executed, 2 should pass, 0 should fail and 0 should be pending.

describe("Independent block", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should display title", () => {
    cy.get("h1").should("have.text", "Items list");
  });

  it("should display first item", () => {
    cy.get("ul li:eq(0)").should("have.text", "First item");
  });
});
