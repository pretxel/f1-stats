import { orderRacesLastest } from "../orderRacesByLastest";
import { RaceItemType } from "@/types/RaceItemType";

const makeRace = (
  sessionType: string,
  dateStart: string,
  sessionKey: string = "1"
): RaceItemType => ({
  session_key: sessionKey,
  date_start: new Date(dateStart),
  date_end: new Date(dateStart),
  location: "Test Circuit",
  country_name: "Testland",
  country_code: "TST",
  circuit_short_name: "TST",
  session_name: sessionType,
  session_type: sessionType,
});

const races: RaceItemType[] = [
  makeRace("Race", "2024-03-02T14:00:00", "1"),
  makeRace("Qualifying", "2024-03-01T14:00:00", "2"),
  makeRace("Race", "2024-04-07T14:00:00", "3"),
  makeRace("Sprint", "2024-04-06T14:00:00", "4"),
  makeRace("Race", "2024-05-05T14:00:00", "5"),
];

describe("orderRacesLastest", () => {
  it("filters races by session type (default 'Race') and returns up to 3 sorted ascending", () => {
    const result = orderRacesLastest(races);

    expect(result).toHaveLength(3);
    result.forEach((r) => expect(r.session_type).toBe("Race"));
    // ascending by date
    expect(result[0].session_key).toBe("1");
    expect(result[1].session_key).toBe("3");
    expect(result[2].session_key).toBe("5");
  });

  it("uses a custom filter type", () => {
    const result = orderRacesLastest(races, "Qualifying");

    expect(result).toHaveLength(1);
    expect(result[0].session_key).toBe("2");
  });

  it("uses a custom limit", () => {
    const result = orderRacesLastest(races, "Race", 2);

    expect(result).toHaveLength(2);
  });

  it("returns all matching items when limit exceeds available items", () => {
    const result = orderRacesLastest(races, "Race", 100);

    // only 3 Race sessions exist
    expect(result).toHaveLength(3);
  });

  it("returns an empty array when no sessions match the filter", () => {
    const result = orderRacesLastest(races, "Practice");

    expect(result).toEqual([]);
  });

  it("returns an empty array for an empty input", () => {
    const result = orderRacesLastest([]);

    expect(result).toEqual([]);
  });

  it("sorts ascending by date_start", () => {
    const result = orderRacesLastest(races, "Race", 3);

    const dates = result.map((r) => new Date(r.date_start).getTime());
    expect(dates[0]).toBeLessThan(dates[1]);
    expect(dates[1]).toBeLessThan(dates[2]);
  });
});
