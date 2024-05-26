import { getRaceControlBySession } from "@/services/raceControl";
import RaceControlItem from "./raceControlItem";
import { orderRaceControl } from "@/utils/orderRaceControl";
import adaptRaceControToTimeline from "@/utils/adaptRaceControToTimeline";
import { time } from "console";

export type RaceControlProp = {
  session_key: string;
  liveMode: boolean;
};
const FETCH_INTERVAL = 20000;

const timeLineAdaptedRequest = async (sessionKey: string) => {
  const raceControlRequested = await getRaceControlBySession(sessionKey);
  const raceControlSorted = orderRaceControl(raceControlRequested);
  const timeLineAdapted = adaptRaceControToTimeline(raceControlSorted);
  return timeLineAdapted;
};

export default async function RaceControl(props: RaceControlProp) {
  let timeLineAdapted = await timeLineAdaptedRequest(props.session_key);
  let interval: any = null;
  if (props.liveMode) {
    interval = setInterval(async () => {
      console.log(`FETCH LIVE DATA -- ${new Date().getTime()}`);
      timeLineAdapted = await timeLineAdaptedRequest(props.session_key);
    }, FETCH_INTERVAL);
  } else {
    if (interval) interval.clearInterval();
  }

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
