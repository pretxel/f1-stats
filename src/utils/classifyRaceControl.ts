import { RaceControlClass, RaceControlKind } from "@/types/FlagStrip";

type ClassifiableEvent = {
  category?: string | null;
  message?: string | null;
  flag?: string | null;
  scope?: string | null;
  sector?: number | null;
};

const FLAGS: Record<string, { kind: RaceControlKind; label: string; sectorLabel?: string }> = {
  GREEN: { kind: "green", label: "Green flag" },
  CLEAR: { kind: "green", label: "Track clear", sectorLabel: "Clear" },
  YELLOW: { kind: "yellow", label: "Yellow flag" },
  "DOUBLE YELLOW": { kind: "yellow", label: "Double yellow" },
  RED: { kind: "red", label: "Red flag" },
  BLUE: { kind: "blue", label: "Blue flag" },
  CHEQUERED: { kind: "chequered", label: "Chequered flag" },
  "BLACK AND WHITE": { kind: "info", label: "Black and white flag" },
};

/** Maps a race control message to a marker kind and a plain-language label. */
export function classifyRaceControl(event: ClassifiableEvent): RaceControlClass {
  const category = event.category ?? "";
  const message = (event.message ?? "").toUpperCase();

  if (category === "Flag" && event.flag && FLAGS[event.flag]) {
    const flag = FLAGS[event.flag];
    if (event.scope === "Sector" && event.sector) {
      return { kind: flag.kind, label: `${flag.sectorLabel ?? flag.label} · Sector ${event.sector}` };
    }
    return { kind: flag.kind, label: flag.label };
  }
  if (category === "SafetyCar") {
    return {
      kind: "sc",
      label: message.includes("VIRTUAL") ? "Virtual safety car" : "Safety car",
    };
  }
  if (category === "Drs") return { kind: "drs", label: "DRS" };
  if (category === "SessionStatus") return { kind: "info", label: "Session" };
  return { kind: "info", label: "Info" };
}
