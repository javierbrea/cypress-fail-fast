const { isTruthy, isFalsy } = require("../src/helpers/config");

describe("config", () => {
  describe("isTruthy", () => {
    it("should return true when value is true as boolean", () => {
      expect(isTruthy(true)).toEqual(true);
    });

    it("should return true when value is true as string", () => {
      expect(isTruthy("true")).toEqual(true);
    });

    it("should return true when value is 1", () => {
      expect(isTruthy(1)).toEqual(true);
    });

    it("should return true when value is 1 as string", () => {
      expect(isTruthy("1")).toEqual(true);
    });

    it("should return false when value is false as boolean", () => {
      expect(isTruthy(false)).toEqual(false);
    });

    it("should return false when value is false as string", () => {
      expect(isTruthy("false")).toEqual(false);
    });

    it("should return false when value is 0", () => {
      expect(isTruthy(0)).toEqual(false);
    });

    it("should return false when value is 0 as string", () => {
      expect(isTruthy("0")).toEqual(false);
    });

    it("should return false when value is undefined", () => {
      expect(isTruthy()).toEqual(false);
    });

    it("should return false when value is any other value", () => {
      expect(isTruthy("foo")).toEqual(false);
    });
  });

  describe("isFalsy", () => {
    it("should return true when value is false as boolean", () => {
      expect(isFalsy(false)).toEqual(true);
    });

    it("should return true when value is false as string", () => {
      expect(isFalsy("false")).toEqual(true);
    });

    it("should return true when value is 0", () => {
      expect(isFalsy(0)).toEqual(true);
    });

    it("should return true when value is 0 as string", () => {
      expect(isFalsy("0")).toEqual(true);
    });

    it("should return false when value is true as boolean", () => {
      expect(isFalsy(true)).toEqual(false);
    });

    it("should return false when value is true as string", () => {
      expect(isFalsy("true")).toEqual(false);
    });

    it("should return false when value is 1", () => {
      expect(isFalsy(1)).toEqual(false);
    });

    it("should return false when value is 1 as string", () => {
      expect(isFalsy("1")).toEqual(false);
    });

    it("should return false when value is undefined", () => {
      expect(isFalsy()).toEqual(false);
    });

    it("should return false when value is any other value", () => {
      expect(isFalsy("foo")).toEqual(false);
    });
  });
});
