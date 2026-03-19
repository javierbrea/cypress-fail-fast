describe("List items", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should display title", () => {
    cy.get("h1").should("have.text", "Items list");
  });

  it("should display first item", { retries: 3 }, () => {
    cy.get("ul li:eq(0)").should("have.text", "Foo text");
  });

  it("should display second item", () => {
    cy.get("ul li:eq(1)").should("have.text", "Second item");
  });
});
