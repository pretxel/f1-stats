import { sessionStatus } from "../sessionStatus";

const start = new Date("2024-11-03T15:30:00Z");
const end = new Date("2024-11-03T17:30:00Z");

describe("sessionStatus", () => {
  it("is upcoming before start", () => {
    expect(sessionStatus(start, end, new Date("2024-11-03T15:00:00Z"))).toBe("upcoming");
  });
  it("is live between start and end", () => {
    expect(sessionStatus(start, end, new Date("2024-11-03T16:00:00Z"))).toBe("live");
  });
  it("is done after end", () => {
    expect(sessionStatus(start, end, new Date("2024-11-03T18:00:00Z"))).toBe("done");
  });
  it("accepts ISO strings", () => {
    expect(
      sessionStatus("2024-11-03T15:30:00Z", "2024-11-03T17:30:00Z", new Date("2024-11-03T16:00:00Z"))
    ).toBe("live");
  });
});
