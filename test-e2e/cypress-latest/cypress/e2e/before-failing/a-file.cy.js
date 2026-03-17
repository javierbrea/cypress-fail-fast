describe("List items", () => {
  before(() => {
    cy.task("log", "Executing before hook").then(() => {
      expect(true).to.be.false;
    });
  });

  describe("List items tests", () => {
    before(() => {
      cy.task("log", "Executing second before hook");
    });

    beforeEach(() => {
      cy.task("log", "Executing beforeEach hook");
    });

    it("should display title", () => {
      cy.visit("/");
      cy.get("h1").should("have.text", "Items list");
    });

    it("should display first item", () => {
      cy.visit("/");
      cy.get("ul li:eq(0)").should("have.text", "First item");
    });

    it("should display second item", () => {
      cy.visit("/");
      cy.get("ul li:eq(1)").should("have.text", "Second item");
    });

    it("should display third item", () => {
      cy.visit("/");
      cy.get("ul li:eq(2)").should("have.text", "Third item");
    });
  });
});
