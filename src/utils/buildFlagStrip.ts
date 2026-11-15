import { FlagSegment, FlagStrip, FlagTick, TrackState } from "@/types/FlagStrip";
import { classifyRaceControl } from "./classifyRaceControl";
import { formatTrackTime } from "./trackTime";

type StripEvent = {
  date: Date | string;
  category?: string | null;
  message?: string | null;
  flag?: string | null;
  scope?: string | null;
  sector?: number | null;
};

type Options = {
  /** Present while the session is live: the strip stops here. */
  now?: Date;
  gmtOffset?: string | null;
};

export const TRACK_STATE_LABEL: Record<TrackState, string> = {
  pending: "Not started",
  green: "Green",
  sc: "Safety car",
  vsc: "Virtual safety car",
  red: "Red flag",
  chequered: "Chequered flag",
};

const t = (d: Date | string) => new Date(d).getTime();
const upper = (s?: string | null) => (s ?? "").toUpperCase();

function isFinish(e: StripEvent): boolean {
  return (
    (e.category === "Flag" && e.flag === "CHEQUERED") ||
    (e.category === "SessionStatus" && /FINISHED|ENDED/.test(upper(e.message)))
  );
}

function nextState(state: TrackState, e: StripEvent): TrackState {
  const message = upper(e.message);
  if (e.category === "SessionStatus") {
    if (/STARTED|RESUMED/.test(message)) return "green";
    if (/ABORTED|SUSPENDED/.test(message)) return "red";
    if (/FINISHED|ENDED/.test(message)) return "chequered";
    return state;
  }
  if (e.category === "Flag" && e.scope === "Track") {
    if (e.flag === "RED") return "red";
    if (e.flag === "CHEQUERED") return "chequered";
    if (e.flag === "GREEN" || e.flag === "CLEAR") {
      return state === "pending" || state === "chequered" ? state : "green";
    }
    return state;
  }
  if (e.category === "SafetyCar") {
    if (state === "red") return state;
    if (message.includes("DEPLOYED")) return message.includes("VIRTUAL") ? "vsc" : "sc";
    if ((message.includes("ENDING") || message.includes("IN THIS LAP")) && (state === "sc" || state === "vsc")) {
      return "green";
    }
  }
  return state;
}

/**
 * Turns race control messages into track-status periods across the session.
 * The window runs from the scheduled start to the scheduled end, or to the
 * chequered flag when the session ran late.
 */
export function buildFlagStrip(
  rawEvents: StripEvent[],
  scheduledStart: Date | string,
  scheduledEnd: Date | string,
  options: Options = {}
): FlagStrip & { finishedAt?: Date } {
  const empty = { segments: [], ticks: [], summary: "" };
  if (!rawEvents?.length) return empty;

  const events = rawEvents.toSorted((a, b) => t(a.date) - t(b.date));
  const finishes = events.filter(isFinish);
  const finishedAt = finishes.length ? new Date(finishes.at(-1)!.date) : undefined;

  const start = t(scheduledStart);
  const end = Math.max(t(scheduledEnd), finishedAt?.getTime() ?? 0);
  const cutoff = options.now ? Math.min(end, Math.max(start, options.now.getTime())) : end;
  if (end <= start) return empty;

  const pct = (ms: number) => ((ms - start) / (end - start)) * 100;

  const hasStartSignal = events.some(
    (e) => e.category === "SessionStatus" && /STARTED/.test(upper(e.message))
  );
  let state: TrackState = hasStartSignal ? "pending" : "green";
  let cursor = start;
  const raw: { state: TrackState; from: number; to: number }[] = [];
  const ticks: FlagTick[] = [];

  for (const e of events) {
    const at = t(e.date);
    if (at > cutoff) break;

    if (e.category === "Flag" && e.scope === "Sector" && /YELLOW/.test(upper(e.flag)) && at >= start) {
      ticks.push({ at: new Date(at), pct: pct(at), label: classifyRaceControl(e).label });
    }

    const next = nextState(state, e);
    if (next === state) continue;
    if (at > cursor) {
      raw.push({ state, from: cursor, to: at });
      cursor = at;
    }
    state = next;
  }
  if (cutoff > cursor) raw.push({ state, from: cursor, to: cutoff });

  const merged = raw.reduce<typeof raw>((acc, seg) => {
    const prev = acc.at(-1);
    if (prev && prev.state === seg.state) prev.to = seg.to;
    else acc.push({ ...seg });
    return acc;
  }, []);

  const segments: FlagSegment[] = merged.map((s) => ({
    state: s.state,
    from: new Date(s.from),
    to: new Date(s.to),
    startPct: pct(s.from),
    endPct: pct(s.to),
  }));

  const hhmm = (d: Date) => formatTrackTime(d, options.gmtOffset, "HH:mm");
  const parts = segments.map(
    (s) => `${TRACK_STATE_LABEL[s.state].toLowerCase()} ${hhmm(s.from)}–${hhmm(s.to)}`
  );
  if (finishedAt && finishedAt.getTime() <= cutoff) {
    parts.push(`chequered flag ${hhmm(finishedAt)}`);
  }

  return {
    segments,
    ticks,
    summary: `Track status: ${parts.join(", ")}`,
    finishedAt,
  };
}
