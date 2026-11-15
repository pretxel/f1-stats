import { getRaceControlBySession } from "@/services/raceControl";
import { orderRaceControl } from "@/utils/orderRaceControl";
import adaptRaceControlToTimeline from "@/utils/adaptRaceControlToTimeline";
import RaceControlItem from "./raceControlItem";
import EmptyState from "./emptyState";

export type RaceControlProp = {
  session_key: string;
  gmt_offset?: string;
  liveMode: boolean;
};

export default async function RaceControl({ session_key, gmt_offset }: RaceControlProp) {
  const events = orderRaceControl(await getRaceControlBySession(session_key));
  const timeline = adaptRaceControlToTimeline(events, gmt_offset);

  if (timeline.length === 0) {
    return (
      <EmptyState
        title="No messages yet"
        detail="Race control hasn’t published anything for this session. Messages appear here as soon as they are issued."
      />
    );
  }

  return (
    <section aria-labelledby="race-control-heading">
      <h2 id="race-control-heading" className="mb-3 text-label text-ink-soft">
        {timeline.length} messages, newest first
      </h2>
      <ol className="border-t border-ink">
        {timeline.map((event) => (
          <RaceControlItem key={event.id} event={event} />
        ))}
      </ol>
    </section>
  );
}
