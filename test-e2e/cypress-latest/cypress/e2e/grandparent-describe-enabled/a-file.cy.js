// 4 tests should be executed, 3 should pass, 1 should fail and 0 should be pending.

describe("List items disabled", { failFast: { enabled: false } }, () => {
  beforeEach(() => {
    cy.visit("/");
  });

  describe("Another describe enabled", { failFast: { enabled: true } }, () => {
    it("should display title", () => {
      cy.get("h1").should("have.text", "Items list");
    });

    it(
      "should display first item with fail-fast disabled",
      { failFast: { enabled: false } },
      () => {
        cy.get("ul li:eq(0)").should("have.text", "Wrong text");
      },
    );

    it("should display second item", () => {
      cy.get("ul li:eq(1)").should("have.text", "Second item");
    });

    it("should display third item", () => {
      cy.get("ul li:eq(2)").should("have.text", "Third item");
    });
  });
});
