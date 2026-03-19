// 4 tests should be executed, 1 should pass, 2 should fail and 1 should be pending.

describe(
  "List items fail-fast enabled",
  { failFast: { enabled: true } },
  () => {
    beforeEach(() => {
      cy.visit("/");
    });

    describe("Another describe", () => {
      describe(
        "Another describe disabled",
        { failFast: { enabled: false } },
        () => {
          it("should display title", () => {
            cy.get("h1").should("have.text", "Wrong text");
          });
        },
      );

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
  },
);
