import isLiveSessionNow from "../isLiveSessionNow";

describe("isLiveSessionNow", () => {
  const fixedNow = new Date("2024-03-02T15:00:00.000Z");

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(fixedNow);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns true when current time is between session start and end on the same day", () => {
    const start = new Date("2024-03-02T14:00:00.000Z");
    const end = new Date("2024-03-02T16:00:00.000Z");

    expect(isLiveSessionNow(start, end)).toBe(true);
  });

  it("returns false when current time is before session start", () => {
    const start = new Date("2024-03-02T16:00:00.000Z");
    const end = new Date("2024-03-02T18:00:00.000Z");

    expect(isLiveSessionNow(start, end)).toBe(false);
  });

  it("returns false when current time is after session end", () => {
    const start = new Date("2024-03-02T12:00:00.000Z");
    const end = new Date("2024-03-02T14:00:00.000Z");

    expect(isLiveSessionNow(start, end)).toBe(false);
  });

  it("returns false when session is on a different day (yesterday)", () => {
    const start = new Date("2024-03-01T14:00:00.000Z");
    const end = new Date("2024-03-01T16:00:00.000Z");

    expect(isLiveSessionNow(start, end)).toBe(false);
  });

  it("returns false when session is on a different day (tomorrow)", () => {
    const start = new Date("2024-03-03T14:00:00.000Z");
    const end = new Date("2024-03-03T16:00:00.000Z");

    expect(isLiveSessionNow(start, end)).toBe(false);
  });

  it("returns false when session is in a different month", () => {
    const start = new Date("2024-04-02T14:00:00.000Z");
    const end = new Date("2024-04-02T16:00:00.000Z");

    expect(isLiveSessionNow(start, end)).toBe(false);
  });

  it("returns false when session is in a different year", () => {
    const start = new Date("2023-03-02T14:00:00.000Z");
    const end = new Date("2023-03-02T16:00:00.000Z");

    expect(isLiveSessionNow(start, end)).toBe(false);
  });
});
