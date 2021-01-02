describe("List items fail-fast enabled", { failFast: { enabled: true } }, () => {
  before(() => {
    cy.visit("/");
  });

  describe("Another describe", () => {
    describe("Another describe disabled", { failFast: { enabled: false } }, () => {
      it("should display title", () => {
        cy.get("h1").should("have.text", "Wrong text");
      });
    });

    describe("Another describe", () => {
      it("should display first item", () => {
        cy.get("ul li:eq(0)").should("have.text", "First item");
      });

      it("should display second item", () => {
        cy.get("ul li:eq(1)").should("have.text", "Wrong text");
      });

      it("should display third item", () => {
        cy.get("ul li:eq(2)").should("have.text", "Third item");
      });
    });
  });
});
