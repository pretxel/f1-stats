import { classNames } from "../classNames";

describe("classNames", () => {
  it("joins multiple class strings with spaces", () => {
    expect(classNames("foo", "bar", "baz")).toBe("foo bar baz");
  });

  it("filters out falsy values", () => {
    expect(classNames("foo", false, "bar", null, undefined, 0, "baz")).toBe("foo bar baz");
  });

  it("returns an empty string when all values are falsy", () => {
    expect(classNames(false, null, undefined, 0)).toBe("");
  });

  it("returns a single class with no extra spaces", () => {
    expect(classNames("single")).toBe("single");
  });

  it("handles empty string arguments by filtering them out", () => {
    // empty string is falsy
    expect(classNames("", "foo")).toBe("foo");
  });

  it("returns empty string when called with no arguments", () => {
    expect(classNames()).toBe("");
  });

  it("handles conditional class application pattern", () => {
    const isActive = true;
    const isDisabled = false;

    const result = classNames(
      "base",
      isActive && "active",
      isDisabled && "disabled"
    );

    expect(result).toBe("base active");
  });
});
