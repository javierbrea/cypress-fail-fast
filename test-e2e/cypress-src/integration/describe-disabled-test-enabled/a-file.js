describe("List items", { failFast: { enabled: false } }, () => {
  before(() => {
    cy.task("log", "Executing before hook");
  });

  beforeEach(() => {
    cy.visit("/");
  });

  it("should display title", () => {
    cy.get("h1").should("have.text", "Items list");
  });

  it(
    "should display first item",
    { retries: { runMode: 0, openMode: 3 }, failFast: { enabled: true } },
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
