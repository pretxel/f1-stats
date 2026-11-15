import { buildFlagStrip } from "../buildFlagStrip";

type E = {
  date: string;
  category: string;
  message: string;
  flag?: string | null;
  scope?: string | null;
  sector?: number | null;
};
const e = (date: string, category: string, message: string, flag: string | null = null, scope: string | null = null, sector: number | null = null): E => ({
  date, category, message, flag, scope, sector,
});

// Brazil 2024 race (session_key 9636), scheduled 15:30–17:30 UTC, finished 17:56:52
const brazil: E[] = [
  e("2024-11-03T14:50:01Z", "Flag", "GREEN LIGHT - PIT EXIT OPEN", "GREEN", "Track"),
  e("2024-11-03T15:49:57Z", "SessionStatus", "SESSION STARTED"),
  e("2024-11-03T15:49:58Z", "Flag", "GREEN LIGHT - PIT EXIT OPEN", "GREEN", "Track"),
  e("2024-11-03T15:31:01Z", "Flag", "YELLOW IN TRACK SECTOR 5", "YELLOW", "Sector", 5),
  e("2024-11-03T16:28:21Z", "SafetyCar", "VIRTUAL SAFETY CAR DEPLOYED"),
  e("2024-11-03T16:29:50Z", "SafetyCar", "VIRTUAL SAFETY CAR ENDING"),
  e("2024-11-03T16:30:04Z", "Flag", "TRACK CLEAR", "CLEAR", "Track"),
  e("2024-11-03T16:32:53Z", "SafetyCar", "SAFETY CAR DEPLOYED"),
  e("2024-11-03T16:37:21Z", "SessionStatus", "SESSION ABORTED"),
  e("2024-11-03T16:37:22Z", "Flag", "RED FLAG", "RED", "Track"),
  e("2024-11-03T17:01:15Z", "Flag", "TRACK CLEAR", "CLEAR", "Track"),
  e("2024-11-03T17:02:00Z", "SessionStatus", "SESSION STARTED"),
  e("2024-11-03T17:13:14Z", "SafetyCar", "SAFETY CAR DEPLOYED"),
  e("2024-11-03T17:18:04Z", "SafetyCar", "SAFETY CAR IN THIS LAP"),
  e("2024-11-03T17:19:29Z", "Flag", "TRACK CLEAR", "CLEAR", "Track"),
  e("2024-11-03T17:56:52Z", "Flag", "CHEQUERED FLAG", "CHEQUERED", "Track"),
  e("2024-11-03T17:56:52Z", "SessionStatus", "SESSION FINISHED"),
];

describe("buildFlagStrip", () => {
  it("returns nothing for a session without events", () => {
    const strip = buildFlagStrip([], "2024-11-03T15:30:00Z", "2024-11-03T17:30:00Z");
    expect(strip.segments).toEqual([]);
    expect(strip.ticks).toEqual([]);
  });

  it("derives track state periods from a real race (Brazil 2024)", () => {
    const strip = buildFlagStrip(brazil, "2024-11-03T15:30:00Z", "2024-11-03T17:30:00Z");
    expect(strip.segments.map((s) => s.state)).toEqual([
      "pending", "green", "vsc", "green", "sc", "red", "green", "sc", "green",
    ]);
    // Domain stretches past the scheduled end to the chequered flag
    const last = strip.segments.at(-1)!;
    expect(last.to).toEqual(new Date("2024-11-03T17:56:52Z"));
    expect(last.endPct).toBeCloseTo(100);
    expect(strip.finishedAt).toEqual(new Date("2024-11-03T17:56:52Z"));
    // Red flag runs from the abort to track clear
    const red = strip.segments.find((s) => s.state === "red")!;
    expect(red.from).toEqual(new Date("2024-11-03T16:37:21Z"));
    expect(red.to).toEqual(new Date("2024-11-03T17:01:15Z"));
  });

  it("places sector yellows as ticks, not segments", () => {
    const strip = buildFlagStrip(brazil, "2024-11-03T15:30:00Z", "2024-11-03T17:30:00Z");
    expect(strip.ticks).toHaveLength(1);
    expect(strip.ticks[0].label).toBe("Yellow flag · Sector 5");
  });

  it("computes percentages within the session window", () => {
    const events = [
      e("2024-11-03T17:42:00Z", "SafetyCar", "SAFETY CAR DEPLOYED"),
      e("2024-11-03T17:51:00Z", "SafetyCar", "SAFETY CAR IN THIS LAP"),
    ];
    const strip = buildFlagStrip(events, "2024-11-03T17:00:00Z", "2024-11-03T19:00:00Z");
    expect(strip.segments.map((s) => s.state)).toEqual(["green", "sc", "green"]);
    expect(strip.segments[1].startPct).toBeCloseTo(35);
    expect(strip.segments[1].endPct).toBeCloseTo(42.5);
    expect(strip.summary).toBe(
      "Track status: green 17:00–17:42, safety car 17:42–17:51, green 17:51–19:00"
    );
  });

  it("stops at the current time during a live session", () => {
    const events = [e("2024-11-03T17:10:00Z", "SafetyCar", "SAFETY CAR DEPLOYED")];
    const strip = buildFlagStrip(
      events,
      "2024-11-03T17:00:00Z",
      "2024-11-03T19:00:00Z",
      { now: new Date("2024-11-03T17:20:00Z") }
    );
    const last = strip.segments.at(-1)!;
    expect(last.state).toBe("sc");
    expect(last.to).toEqual(new Date("2024-11-03T17:20:00Z"));
    expect(last.endPct).toBeCloseTo(100 / 6);
  });

  it("formats the summary in circuit local time", () => {
    const events = [e("2024-11-03T17:42:00Z", "Flag", "RED FLAG", "RED", "Track")];
    const strip = buildFlagStrip(events, "2024-11-03T17:00:00Z", "2024-11-03T19:00:00Z", {
      gmtOffset: "-03:00:00",
    });
    expect(strip.summary).toBe("Track status: green 14:00–14:42, red flag 14:42–16:00");
  });
});
