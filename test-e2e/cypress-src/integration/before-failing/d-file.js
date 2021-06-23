describe("List items", () => {
  before(() => {
    cy.task("log", "Executing before hook");
    cy.visit("/");
  });

  describe("these tests pass", () => {
    it("should display title", () => {
      cy.get("h1").should("have.text", "Items list");
    });
  });

  describe("beforeEach failing", () => {
    beforeEach(() => {
      cy.task("log", "Executing before hook");
      expect(true).to.be.false;
    });

    it("should display first item", () => {
      cy.get("ul li:eq(0)").should("have.text", "First item");
    });

    it("should display second item", () => {
      cy.get("ul li:eq(1)").should("have.text", "Second item");
    });
  });

  describe("these tests pass", () => {
    it("should display third item", () => {
      cy.get("ul li:eq(2)").should("have.text", "Third item");
    });
  });
});
