// 4 tests. The failing test lives in a describe block nested inside a block
// carrying an explicit failFast configuration, so the skip scope must be that
// configured block: the sibling nested describe must also be skipped, while
// the block outside the configured one must run normally:
// 4 tests should be executed, 2 should pass, 1 should fail and 1 should be pending.

describe("Configured block", { failFast: { enabled: true } }, () => {
  beforeEach(() => {
    cy.visit("/");
  });

  describe("Inner block with failure", () => {
    it("should display title", () => {
      cy.get("h1").should("have.text", "Items list");
    });

    it("should display first item", () => {
      cy.get("ul li:eq(0)").should("have.text", "Wrong text");
    });
  });

  describe("Inner sibling block", () => {
    it("should display second item", () => {
      cy.get("ul li:eq(1)").should("have.text", "Second item");
    });
  });
});

describe("Outside block", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should display third item", () => {
    cy.get("ul li:eq(2)").should("have.text", "Third item");
  });
});
