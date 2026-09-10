// A configured ancestor does not expand the scope: only the failing inner
// describe is skipped, while its sibling and the outside block keep running.
// 5 tests: 3 passing, 1 failing, 1 pending.

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

    it("should skip the remaining inner test", () => {
      cy.get("h1").should("have.text", "Items list");
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
