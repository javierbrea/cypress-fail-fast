// 3 tests should be executed, 1 should pass, 1 should fail and 1 should be pending.

describe("List items", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should display title", () => {
    cy.get("h1").should("have.text", "Items list");
  });

  it("should display first item", () => {
    cy.get("ul li:eq(0)").should("have.text", "Foo text");
  });

  it("should display second item", () => {
    cy.get("ul li:eq(1)").should("have.text", "Second item");
  });
});
