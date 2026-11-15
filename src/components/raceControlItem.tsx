import { TimelineEvent } from "@/utils/adaptRaceControlToTimeline";
import { sentenceCase } from "@/utils/sentenceCase";
import FlagMarker from "./flagMarker";

export default function RaceControlItem({ event }: { event: TimelineEvent }) {
  return (
    <li className="grid grid-cols-[5rem_1fr] gap-x-4 gap-y-1 border-b border-rule py-3 sm:grid-cols-[5.5rem_13rem_1fr]">
      <p className="wdth-condensed pt-px text-ink-soft">
        <time dateTime={new Date(event.datetime).toISOString()}>{event.time}</time>
        {event.lap ? <span className="block text-label">Lap {event.lap}</span> : null}
      </p>
      <span>
        <FlagMarker kind={event.kind} label={event.label} />
      </span>
      <p className="col-start-2 max-w-[65ch] sm:col-start-auto">
        {sentenceCase(event.content)}
      </p>
    </li>
  );
}
