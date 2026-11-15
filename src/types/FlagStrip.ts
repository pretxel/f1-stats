export type TrackState =
  | "pending"
  | "green"
  | "sc"
  | "vsc"
  | "red"
  | "chequered";

export type FlagSegment = {
  state: TrackState;
  from: Date;
  to: Date;
  startPct: number;
  endPct: number;
};

export type FlagTick = {
  at: Date;
  pct: number;
  label: string;
};

export type FlagStrip = {
  segments: FlagSegment[];
  ticks: FlagTick[];
  summary: string;
};

export type RaceControlKind =
  | "green"
  | "yellow"
  | "red"
  | "blue"
  | "sc"
  | "chequered"
  | "drs"
  | "info";

export type RaceControlClass = {
  kind: RaceControlKind;
  label: string;
};
