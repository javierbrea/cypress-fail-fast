// 6 tests distributed in two root describe blocks (the first one contains a
// nested describe). With the "describe" strategy, the failure in the first
// block must skip only the remaining tests of that block (including the ones
// in its nested describe), while the second block must run normally:
// 6 tests should be executed, 3 should pass, 1 should fail and 2 should be pending.

describe("First block", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should display title", () => {
    cy.get("h1").should("have.text", "Items list");
  });

  it("should display first item", () => {
    cy.get("ul li:eq(0)").should("have.text", "Wrong text");
  });

  it("should display second item", () => {
    cy.get("ul li:eq(1)").should("have.text", "Second item");
  });

  describe("Nested block", () => {
    it("should display third item", () => {
      cy.get("ul li:eq(2)").should("have.text", "Third item");
    });
  });
});

describe("Second block", () => {
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
