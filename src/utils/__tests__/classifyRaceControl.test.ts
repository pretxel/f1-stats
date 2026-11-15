import { classifyRaceControl } from "../classifyRaceControl";

const ev = (over: Record<string, unknown>) => ({
  category: "Other",
  message: "",
  flag: null,
  scope: null,
  sector: null,
  ...over,
});

describe("classifyRaceControl", () => {
  it.each([
    [{ category: "Flag", flag: "GREEN", scope: "Track" }, "green", "Green flag"],
    [{ category: "Flag", flag: "CLEAR", scope: "Track" }, "green", "Track clear"],
    [{ category: "Flag", flag: "RED", scope: "Track" }, "red", "Red flag"],
    [{ category: "Flag", flag: "BLUE", scope: "Driver" }, "blue", "Blue flag"],
    [{ category: "Flag", flag: "CHEQUERED", scope: "Track" }, "chequered", "Chequered flag"],
    [{ category: "Drs", message: "DRS ENABLED" }, "drs", "DRS"],
    [{ category: "SafetyCar", message: "SAFETY CAR DEPLOYED" }, "sc", "Safety car"],
    [{ category: "SafetyCar", message: "VIRTUAL SAFETY CAR DEPLOYED" }, "sc", "Virtual safety car"],
    [{ category: "SessionStatus", message: "SESSION STARTED" }, "info", "Session"],
    [{ category: "CarEvent", message: "CAR 1 SPUN" }, "info", "Info"],
    [{ category: "Flag", flag: "BLACK AND WHITE", scope: "Driver" }, "info", "Black and white flag"],
  ])("classifies %o", (over, kind, label) => {
    expect(classifyRaceControl(ev(over))).toEqual({ kind, label });
  });

  it("adds the sector to sector-scoped flags", () => {
    expect(
      classifyRaceControl(ev({ category: "Flag", flag: "YELLOW", scope: "Sector", sector: 7 }))
    ).toEqual({ kind: "yellow", label: "Yellow flag · Sector 7" });
    expect(
      classifyRaceControl(ev({ category: "Flag", flag: "DOUBLE YELLOW", scope: "Sector", sector: 3 }))
    ).toEqual({ kind: "yellow", label: "Double yellow · Sector 3" });
    expect(
      classifyRaceControl(ev({ category: "Flag", flag: "CLEAR", scope: "Sector", sector: 3 }))
    ).toEqual({ kind: "green", label: "Clear · Sector 3" });
  });

  it("falls back to info when fields are missing", () => {
    expect(classifyRaceControl({ category: "", message: "" })).toEqual({
      kind: "info",
      label: "Info",
    });
  });
});
