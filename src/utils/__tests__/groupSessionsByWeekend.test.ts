import { groupSessionsByWeekend } from "../groupSessionsByWeekend";
import { RaceItemType } from "@/types/RaceItemType";

const s = (
  key: string,
  meeting: string | undefined,
  start: string,
  end: string,
  name = "Race",
  location = "São Paulo"
): RaceItemType => ({
  session_key: key,
  meeting_key: meeting,
  date_start: new Date(start),
  date_end: new Date(end),
  gmt_offset: "-03:00:00",
  location,
  country_name: "Brazil",
  country_code: "BRA",
  circuit_short_name: "Interlagos",
  session_name: name,
  session_type: name,
  year: 2024,
});

describe("groupSessionsByWeekend", () => {
  it("groups sessions sharing a meeting_key, ordered by start ascending", () => {
    const result = groupSessionsByWeekend([
      s("3", "1249", "2024-11-03T15:30:00Z", "2024-11-03T17:30:00Z", "Race"),
      s("1", "1249", "2024-11-01T14:30:00Z", "2024-11-01T15:30:00Z", "Practice 1"),
      s("2", "1249", "2024-11-02T14:00:00Z", "2024-11-02T15:00:00Z", "Qualifying"),
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].sessions.map((x) => x.session_key)).toEqual(["1", "2", "3"]);
    expect(result[0].start).toEqual(new Date("2024-11-01T14:30:00Z"));
    expect(result[0].end).toEqual(new Date("2024-11-03T17:30:00Z"));
    expect(result[0].location).toBe("São Paulo");
  });

  it("orders weekends newest first", () => {
    const result = groupSessionsByWeekend([
      s("a", "1", "2024-10-20T19:00:00Z", "2024-10-20T21:00:00Z", "Race", "Austin"),
      s("b", "2", "2024-11-03T15:30:00Z", "2024-11-03T17:30:00Z", "Race", "São Paulo"),
    ]);
    expect(result.map((w) => w.location)).toEqual(["São Paulo", "Austin"]);
  });

  it("falls back to location and year when meeting_key is missing", () => {
    const result = groupSessionsByWeekend([
      s("1", undefined, "2024-11-01T14:30:00Z", "2024-11-01T15:30:00Z", "Practice 1"),
      s("2", undefined, "2024-11-03T15:30:00Z", "2024-11-03T17:30:00Z", "Race"),
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].key).toBe("São Paulo-2024");
  });

  it("returns an empty array for empty or missing input", () => {
    expect(groupSessionsByWeekend([])).toEqual([]);
    expect(groupSessionsByWeekend(undefined as unknown as RaceItemType[])).toEqual([]);
  });
});
