describe("List items disabled", { failFast: { enabled: false } }, () => {
  before(() => {
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
      }
    );

    it("should display second item", () => {
      cy.get("ul li:eq(1)").should("have.text", "Second item");
    });

    it("should display third item", () => {
      cy.get("ul li:eq(2)").should("have.text", "Third item");
    });
  });
});
