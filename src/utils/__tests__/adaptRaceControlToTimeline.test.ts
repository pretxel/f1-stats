import adaptRaceControlToTimeline from "../adaptRaceControlToTimeline";
import { RaceControlTypeItem } from "@/types/RaceControlItem";

const makeItem = (
  message: string,
  date: string,
  category: string = "Flag"
): RaceControlTypeItem => ({
  session_key: "9507",
  meeting_key: "1234",
  date: new Date(date),
  category,
  message,
});

describe("adaptRaceControlToTimeline", () => {
  it("maps race control items to timeline format", () => {
    const items = [makeItem("GREEN FLAG", "2024-03-02T14:05:00")];

    const result = adaptRaceControlToTimeline(items);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 0,
      content: "GREEN FLAG",
      datetime: new Date("2024-03-02T14:05:00"),
      href: "#",
      iconBackground: "bg-gray-400",
    });
    // date should be a formatted string
    expect(typeof result[0].date).toBe("string");
    expect(result[0].date.length).toBeGreaterThan(0);
  });

  it("assigns sequential ids starting from 0", () => {
    const items = [
      makeItem("GREEN FLAG", "2024-03-02T14:05:00"),
      makeItem("SAFETY CAR", "2024-03-02T14:30:00"),
      makeItem("SC IN", "2024-03-02T14:45:00"),
    ];

    const result = adaptRaceControlToTimeline(items);

    expect(result[0].id).toBe(0);
    expect(result[1].id).toBe(1);
    expect(result[2].id).toBe(2);
  });

  it("preserves the message as content", () => {
    const items = [
      makeItem("SAFETY CAR DEPLOYED", "2024-03-02T14:30:00", "SafetyCar"),
    ];

    const result = adaptRaceControlToTimeline(items);

    expect(result[0].content).toBe("SAFETY CAR DEPLOYED");
  });

  it("returns an empty array for an empty input", () => {
    expect(adaptRaceControlToTimeline([])).toEqual([]);
  });

  it("preserves the original date object as datetime", () => {
    const date = "2024-03-02T14:05:00";
    const items = [makeItem("GREEN FLAG", date)];

    const result = adaptRaceControlToTimeline(items);

    expect(result[0].datetime).toEqual(new Date(date));
  });
});
