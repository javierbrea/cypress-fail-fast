// 4 tests. 2 passing, 2 failing

describe("List items", () => {
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
    cy.get("ul li:eq(1)").should("have.text", "Wrong");
  });

  it("should display third item", () => {
    cy.get("ul li:eq(2)").should("have.text", "Third item");
  });
});
