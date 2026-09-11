// Two root describe blocks, each one with a failing test followed by a passing
// one. With the "describe" strategy and failFastBail: 2, failures are counted
// per describe block, so neither block reaches the limit on its own and every
// test runs:
// 4 tests should be executed, 2 should pass, 2 should fail and 0 should be pending.

describe("First block", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should display first item", () => {
    cy.get("ul li:eq(0)").should("have.text", "Wrong text");
  });

  it("should display title", () => {
    cy.get("h1").should("have.text", "Items list");
  });
});

describe("Second block", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should display second item", () => {
    cy.get("ul li:eq(1)").should("have.text", "Wrong text");
  });

  it("should display third item", () => {
    cy.get("ul li:eq(2)").should("have.text", "Third item");
  });
});
