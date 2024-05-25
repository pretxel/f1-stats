import { getRaceControlBySession } from "@/services/raceControl";
import RaceControlItem from "./raceControlItem";
import { orderRaceControl } from "@/utils/orderRaceControl";
import adaptRaceControToTimeline from "@/utils/adaptRaceControToTimeline";

export type RaceControlProp = {
  session_key: string;
};

export default async function RaceControl(props: RaceControlProp) {
  const raceControlRequested = await getRaceControlBySession(props.session_key);
  const raceControlSorted = orderRaceControl(raceControlRequested);
  const timeLineAdapted = adaptRaceControToTimeline(raceControlSorted);

  return (
    <div className="flow-root pt-10">
      <ul role="list" className="-mb-8">
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
