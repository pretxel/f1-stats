import adaptRaceControlToTimeline from "../adaptRaceControlToTimeline";
import { RaceControlTypeItem } from "@/types/RaceControlItem";

const makeItem = (
  message: string,
  date: string,
  category: string = "Flag",
  extra: Partial<RaceControlTypeItem> = {}
): RaceControlTypeItem => ({
  session_key: "9507",
  meeting_key: "1234",
  date: new Date(date),
  category,
  message,
  ...extra,
});

describe("adaptRaceControlToTimeline", () => {
  it("maps an event to time, kind, label and content", () => {
    const [event] = adaptRaceControlToTimeline([
      makeItem("RED FLAG", "2024-11-03T16:37:22Z", "Flag", { flag: "RED", scope: "Track", lap_number: 33 }),
    ]);
    expect(event).toMatchObject({
      id: 0,
      content: "RED FLAG",
      time: "16:37:22",
      kind: "red",
      label: "Red flag",
      lap: 33,
      datetime: new Date("2024-11-03T16:37:22Z"),
    });
  });

  it("formats time in circuit local time when an offset is given", () => {
    const [event] = adaptRaceControlToTimeline(
      [makeItem("SAFETY CAR DEPLOYED", "2024-11-03T16:32:53Z", "SafetyCar")],
      "-03:00:00"
    );
    expect(event.time).toBe("13:32:53");
    expect(event.kind).toBe("sc");
  });

  it("assigns sequential ids starting from 0", () => {
    const result = adaptRaceControlToTimeline([
      makeItem("A", "2024-03-02T14:05:00Z"),
      makeItem("B", "2024-03-02T14:30:00Z"),
      makeItem("C", "2024-03-02T14:45:00Z"),
    ]);
    expect(result.map((r) => r.id)).toEqual([0, 1, 2]);
  });

  it("returns an empty array for an empty input", () => {
    expect(adaptRaceControlToTimeline([])).toEqual([]);
  });
});
