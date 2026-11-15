import { parseGmtOffset, formatTrackTime, formatDateRange } from "../trackTime";

describe("parseGmtOffset", () => {
  it("parses negative offsets to minutes", () => {
    expect(parseGmtOffset("-03:00:00")).toBe(-180);
  });
  it("parses positive offsets with minutes", () => {
    expect(parseGmtOffset("05:30:00")).toBe(330);
  });
  it("defaults to 0 when missing or malformed", () => {
    expect(parseGmtOffset(undefined)).toBe(0);
    expect(parseGmtOffset("nope")).toBe(0);
  });
});

describe("formatTrackTime", () => {
  it("formats a UTC instant in circuit local time", () => {
    expect(
      formatTrackTime("2024-11-03T15:30:00+00:00", "-03:00:00", "ddd HH:mm")
    ).toBe("Sun 12:30");
  });
  it("uses UTC when no offset is given", () => {
    expect(formatTrackTime("2024-11-03T15:30:05+00:00", undefined, "HH:mm:ss")).toBe(
      "15:30:05"
    );
  });
});

describe("formatDateRange", () => {
  it("collapses the month when start and end share it", () => {
    expect(
      formatDateRange("2024-11-01T14:30:00Z", "2024-11-03T17:30:00Z", "-03:00:00")
    ).toBe("1–3 Nov");
  });
  it("shows both months when they differ", () => {
    expect(
      formatDateRange("2024-10-31T14:30:00Z", "2024-11-02T17:30:00Z", "00:00:00")
    ).toBe("31 Oct – 2 Nov");
  });
  it("shows a single day when start and end match", () => {
    expect(
      formatDateRange("2024-11-03T14:30:00Z", "2024-11-03T17:30:00Z", "00:00:00")
    ).toBe("3 Nov");
  });
});
