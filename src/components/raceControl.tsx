import { getRaceControlBySession } from "@/services/raceControl";
import RaceControlItem from "./raceControlItem";
import { orderRaceControl } from "@/utils/orderRaceControl";
import adaptRaceControlToTimeline from "@/utils/adaptRaceControlToTimeline";
import EmptyState from "./emptyState";

export type RaceControlProp = {
  session_key: string;
  liveMode: boolean;
};

const timeLineAdaptedRequest = async (sessionKey: string) => {
  const raceControlRequested = await getRaceControlBySession(sessionKey);
  const raceControlSorted = orderRaceControl(raceControlRequested);
  const timeLineAdapted = adaptRaceControlToTimeline(raceControlSorted);
  return timeLineAdapted;
};

export default async function RaceControl(props: RaceControlProp) {
  const timeLineAdapted = await timeLineAdaptedRequest(props.session_key);

  if (timeLineAdapted.length === 0) {
    return (
      <div className="max-w-2xl">
        <EmptyState
          title="No events"
          detail="Race control has no messages for this session."
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <span className="font-data text-[10px] tracking-[0.3em] uppercase text-muted">
          Events
        </span>
        <span className="font-data text-[10px] text-muted-dark">
          {timeLineAdapted.length}
        </span>
      </div>
      <ul role="list">
        {timeLineAdapted.map((event, eventIdx) => (
          <RaceControlItem
            key={event.id}
            event={event}
            eventIdx={eventIdx}
            timeLineAdapted={timeLineAdapted}
          />
        ))}
      </ul>
    </div>
  );
}
