import { orderRaceControl } from "../orderRaceControl";
import { RaceControlTypeItem } from "@/types/RaceControlItem";

const makeItem = (date: string): RaceControlTypeItem => ({
  session_key: "9507",
  meeting_key: "1234",
  date: new Date(date),
  category: "Flag",
  message: `Event at ${date}`,
});

describe("orderRaceControl", () => {
  it("sorts items in descending date order (newest first)", () => {
    const items = [
      makeItem("2024-03-02T14:00:00"),
      makeItem("2024-03-02T16:00:00"),
      makeItem("2024-03-02T15:00:00"),
    ];

    const result = orderRaceControl(items);

    expect(result[0].date).toEqual(new Date("2024-03-02T16:00:00"));
    expect(result[1].date).toEqual(new Date("2024-03-02T15:00:00"));
    expect(result[2].date).toEqual(new Date("2024-03-02T14:00:00"));
  });

  it("returns an empty array when given an empty array", () => {
    expect(orderRaceControl([])).toEqual([]);
  });

  it("returns the same single item unchanged", () => {
    const items = [makeItem("2024-03-02T14:00:00")];
    const result = orderRaceControl(items);

    expect(result).toHaveLength(1);
    expect(result[0].date).toEqual(new Date("2024-03-02T14:00:00"));
  });

  it("handles items already in descending order", () => {
    const items = [
      makeItem("2024-03-02T16:00:00"),
      makeItem("2024-03-02T15:00:00"),
      makeItem("2024-03-02T14:00:00"),
    ];

    const result = orderRaceControl(items);

    expect(result[0].date).toEqual(new Date("2024-03-02T16:00:00"));
    expect(result[2].date).toEqual(new Date("2024-03-02T14:00:00"));
  });
});
