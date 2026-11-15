import { rankPitstops } from "../rankPitstops";

const p = (key: string, total: number, stops = 1) => ({
  key,
  name: `Driver ${key}`,
  imageUrl: null,
  pitstops: stops,
  total_duration: total,
});

describe("rankPitstops", () => {
  it("sorts by total pit time ascending", () => {
    const result = rankPitstops([p("b", 48.9), p("a", 46.2), p("c", 60)]);
    expect(result.map((r) => r.key)).toEqual(["a", "b", "c"]);
  });

  it("scales bars relative to the longest total", () => {
    const result = rankPitstops([p("a", 30), p("b", 60)]);
    expect(result[0].barPct).toBeCloseTo(50);
    expect(result[1].barPct).toBeCloseTo(100);
  });

  it("formats totals with one decimal", () => {
    expect(rankPitstops([p("a", 46.234)])[0].totalLabel).toBe("46.2 s");
  });

  it("handles empty input", () => {
    expect(rankPitstops([])).toEqual([]);
  });
});
