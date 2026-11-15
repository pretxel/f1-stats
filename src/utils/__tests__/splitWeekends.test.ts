import { splitWeekends } from "../splitWeekends";
import { Weekend } from "@/types/Weekend";

const w = (key: string, start: string): Weekend => ({
  key,
  location: key,
  circuit_short_name: key,
  country_name: "",
  country_code: "",
  start: new Date(start),
  end: new Date(start),
  sessions: [],
});

// Newest first, as groupSessionsByWeekend returns them
const season = [w("lusail", "2026-11-27"), w("vegas", "2026-11-20"), w("brazil", "2026-11-06"), w("mexico", "2026-10-30")];

describe("splitWeekends", () => {
  it("features the latest started weekend and lists upcoming ones soonest first", () => {
    const { featured, comingUp, earlier } = splitWeekends(season, new Date("2026-11-15"));
    expect(featured?.key).toBe("brazil");
    expect(comingUp.map((x) => x.key)).toEqual(["vegas", "lusail"]);
    expect(earlier.map((x) => x.key)).toEqual(["mexico"]);
  });

  it("features the next weekend before the season starts", () => {
    const { featured, comingUp, earlier } = splitWeekends(season, new Date("2026-01-01"));
    expect(featured?.key).toBe("mexico");
    expect(comingUp.map((x) => x.key)).toEqual(["brazil", "vegas", "lusail"]);
    expect(earlier).toEqual([]);
  });

  it("handles an empty season", () => {
    expect(splitWeekends([], new Date())).toEqual({ featured: undefined, comingUp: [], earlier: [] });
  });
});
