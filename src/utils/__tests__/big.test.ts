import { add } from "../big";

describe("add", () => {
  it("adds two integers", () => {
    expect(add(1, 2)).toBe(3);
    expect(add(0, 0)).toBe(0);
    expect(add(100, 200)).toBe(300);
  });

  it("adds two decimal numbers precisely", () => {
    expect(add(2.5, 3.0)).toBe(5.5);
    expect(add(1.1, 2.2)).toBeCloseTo(3.3, 10);
  });

  it("adds a number and a string representation", () => {
    expect(add(2.5, "3")).toBe(5.5);
    expect(add("2.5", "3.0")).toBe(5.5);
    expect(add("0", "0")).toBe(0);
  });

  it("handles pit-stop duration strings (typical use case)", () => {
    expect(add(0, "2.5")).toBe(2.5);
    expect(add(2.5, "3")).toBe(5.5);
    expect(add(5.5, "4")).toBe(9.5);
  });

  it("handles numbers with different decimal lengths", () => {
    expect(add(1.5, 2.25)).toBe(3.75);
    expect(add("1.1", "2.22")).toBeCloseTo(3.32, 10);
  });

  it("handles large integers", () => {
    expect(add(1000000, 2000000)).toBe(3000000);
  });

  it("returns a number type (not a string)", () => {
    const result = add(1, 2);
    expect(typeof result).toBe("number");
  });

  it("handles adding zero to a decimal", () => {
    expect(add(0, "2.5")).toBe(2.5);
    expect(add("2.5", 0)).toBe(2.5);
  });
});
