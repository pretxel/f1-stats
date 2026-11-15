import { RaceControlKind, TrackState } from "@/types/FlagStrip";

// Literal class strings so Tailwind keeps them. Flag fills always sit inside an ink outline.
export const KIND_FILL: Record<RaceControlKind, string> = {
  green: "bg-flag-green",
  yellow: "bg-flag-yellow",
  red: "bg-flag-red",
  blue: "bg-flag-blue",
  sc: "bg-flag-sc",
  chequered: "chequered",
  drs: "bg-slab",
  info: "bg-concrete",
};

export const STATE_FILL: Record<TrackState, string> = {
  pending: "hatched bg-slab",
  green: "bg-flag-green",
  sc: "bg-flag-sc",
  vsc: "bg-flag-sc hatched",
  red: "bg-flag-red",
  chequered: "chequered",
};
