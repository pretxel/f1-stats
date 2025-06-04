import { getRaceControlBySession } from "@/services/raceControl";
import RaceControlItem from "./raceControlItem";
import { orderRaceControl } from "@/utils/orderRaceControl";
import adaptRaceControlToTimeline from "@/utils/adaptRaceControlToTimeline";

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
  let timeLineAdapted = await timeLineAdaptedRequest(props.session_key);

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
