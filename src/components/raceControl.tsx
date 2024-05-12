import { getRaceControlBySession } from "@/services/raceControl";
import { RaceControlItem } from "@/types/RaceControlItem";
import { UserIcon } from "@heroicons/react/20/solid";
import dayjs from "dayjs";
const localizedFormat = require("dayjs/plugin/localizedFormat");
dayjs.extend(localizedFormat);
import { classNames } from "@/utils/classNames";
const adaptRaceControToTimeline = (raceControl: RaceControlItem[]) => {
  return raceControl.map((race, index) => ({
    id: index,
    content: race.message,
    date: dayjs(race.date).format("LLLL"),
    datetime: race.date,
    icon: UserIcon,
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
          <li key={event.id}>
            <div className="relative pb-8">
              {eventIdx !== timeLineAdapted.length - 1 ? (
                <span
                  className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span
                    className={classNames(
                      event.iconBackground,
                      "h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white"
                    )}
                  >
                    <event.icon
                      className="h-5 w-5 text-white"
                      aria-hidden="true"
                    />
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm text-gray-500">{event.content}</p>
                  </div>
                  <div className="whitespace-nowrap text-right text-sm text-gray-500">
                    <time dateTime={event.datetime.toString()}>
                      {event.date}
                    </time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
