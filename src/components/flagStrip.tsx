import { getRaceControlBySession } from "@/services/raceControl";
import { buildFlagStrip, TRACK_STATE_LABEL } from "@/utils/buildFlagStrip";
import { formatTrackTime } from "@/utils/trackTime";
import { classNames } from "@/utils/classNames";
import { TrackState } from "@/types/FlagStrip";
import { RaceItemType } from "@/types/RaceItemType";
import { STATE_FILL } from "./flagStyles";

type FlagStripProps = {
  session: RaceItemType;
  live: boolean;
};

const LEGEND_ORDER: TrackState[] = ["pending", "green", "vsc", "sc", "red", "chequered"];

export default async function FlagStrip({ session, live }: FlagStripProps) {
  const events = await getRaceControlBySession(session.session_key);
  const strip = buildFlagStrip(events, session.date_start, session.date_end, {
    gmtOffset: session.gmt_offset,
    now: live ? new Date() : undefined,
  });
  if (strip.segments.length === 0) return null;

  const hhmm = (d: Date | string) => formatTrackTime(d, session.gmt_offset, "HH:mm");
  const finished = Boolean(strip.finishedAt) && !live;
  // Sub-percent slivers (the chequered flag usually lands at the very end) are drawn as the end cap instead.
  const segments = strip.segments.filter((seg) => seg.endPct - seg.startPct >= 0.2);
  const present = LEGEND_ORDER.filter(
    (s) => segments.some((seg) => seg.state === s) || (s === "chequered" && finished)
  );
  const lastTo = strip.segments.at(-1)!.to;

  return (
    <figure className="mt-8">
      <figcaption className="mb-2 text-label text-ink-soft">Track status</figcaption>

      <div className="relative pt-3">
        {/* Sector yellows: local, so marked above the strip rather than colouring it */}
        {strip.ticks.map((tick) => (
          <span
            key={`${tick.at.toISOString()}-${tick.label}`}
            aria-hidden="true"
            title={`${tick.label}, ${hhmm(tick.at)}`}
            className="absolute top-0 h-2.5 w-[3px] -translate-x-1/2 border-x border-ink bg-flag-yellow"
            style={{ left: `${tick.pct}%` }}
          />
        ))}

        <div role="img" aria-label={strip.summary} className="relative h-9 border border-ink bg-concrete">
          {segments.map((seg) => (
            <span
              key={seg.from.toISOString()}
              title={`${TRACK_STATE_LABEL[seg.state]}, ${hhmm(seg.from)}–${hhmm(seg.to)}`}
              className={classNames(
                "absolute inset-y-0 border-r border-ink",
                STATE_FILL[seg.state]
              )}
              style={{ left: `${seg.startPct}%`, width: `${seg.endPct - seg.startPct}%` }}
            />
          ))}
          {finished && (
            <span
              title={`Chequered flag, ${hhmm(strip.finishedAt!)}`}
              className="chequered absolute inset-y-0 right-0 w-2.5 border-l border-ink"
            />
          )}
        </div>
      </div>

      <div className="wdth-condensed mt-1.5 flex justify-between text-label text-ink-soft">
        <span>{hhmm(session.date_start)}</span>
        <span>
          {finished
            ? `Chequered flag ${hhmm(strip.finishedAt!)}`
            : live
              ? `Now ${hhmm(lastTo)}`
              : hhmm(lastTo)}
        </span>
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2" aria-label="Legend">
        {present.map((state) => (
          <li key={state} className="flex items-center gap-2 text-label">
            <span aria-hidden="true" className={classNames("h-3.5 w-5 border border-ink", STATE_FILL[state])} />
            {TRACK_STATE_LABEL[state]}
          </li>
        ))}
        {strip.ticks.length > 0 && (
          <li className="flex items-center gap-2 text-label">
            <span aria-hidden="true" className="h-3.5 w-[3px] border-x border-ink bg-flag-yellow" />
            Yellow flag in a sector ({strip.ticks.length})
          </li>
        )}
      </ul>
    </figure>
  );
}
