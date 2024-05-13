import { getRaceControlBySession } from "@/services/raceControl";
import { RaceControlTypeItem } from "@/types/RaceControlItem";
import dayjs from "dayjs";
const localizedFormat = require("dayjs/plugin/localizedFormat");
dayjs.extend(localizedFormat);
import RaceControlItem from "./raceControlItem";

const adaptRaceControToTimeline = (raceControl: RaceControlTypeItem[]) => {
  return raceControl.map((race, index) => ({
    id: index,
    content: race.message,
    date: dayjs(race.date).format("LLLL"),
    datetime: race.date,
    href: "#",
    iconBackground: "bg-gray-400",
  }));
};

export type RaceControlProp = {
  session_key: string;
};

export default async function RaceControl(props: RaceControlProp) {
  const raceControl = await getRaceControlBySession(props.session_key);

  const timeLineAdapted = adaptRaceControToTimeline(raceControl);

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
