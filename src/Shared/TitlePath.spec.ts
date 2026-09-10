// eslint-disable-next-line no-shadow -- Avoid conflict with Cypress global `describe`
import { describe, it, expect } from "@jest/globals";

import { titlePathStartsWith } from "./TitlePath";

describe("titlePathStartsWith", () => {
  it("returns true when scope is a prefix of the title path", () => {
    expect(
      titlePathStartsWith(["parent", "child", "test title"], ["parent"]),
    ).toBe(true);
    expect(
      titlePathStartsWith(
        ["parent", "child", "test title"],
        ["parent", "child"],
      ),
    ).toBe(true);
  });

  it("returns true when scope equals the title path", () => {
    expect(titlePathStartsWith(["parent", "child"], ["parent", "child"])).toBe(
      true,
    );
  });

  it("returns true when scope is empty", () => {
    expect(titlePathStartsWith(["parent", "test title"], [])).toBe(true);
  });

  it("returns false when scope diverges from the title path", () => {
    expect(
      titlePathStartsWith(["parent", "child", "test title"], ["other parent"]),
    ).toBe(false);
    expect(
      titlePathStartsWith(
        ["parent", "child", "test title"],
        ["parent", "other child"],
      ),
    ).toBe(false);
  });

  it("returns false when scope is longer than the title path", () => {
    expect(
      titlePathStartsWith(["parent"], ["parent", "child", "grandchild"]),
    ).toBe(false);
  });
});
