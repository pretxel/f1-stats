import Image from "next/image";
import { UserIcon } from "@heroicons/react/20/solid";
import { getRaceControlBySession } from "@/services/raceControl";
import { RaceControlItem } from "@/types/RaceControlItem";
import dayjs from "dayjs";
const localizedFormat = require("dayjs/plugin/localizedFormat");
dayjs.extend(localizedFormat);
import { classNames } from "@/utils/classNames";

//TODO: optimize this page

const tabs = [
  { name: "Race Control", href: "#", current: true },
  { name: "Pit stops (soon)", href: "#", current: false },
];

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

export default async function Session({ params }: { params: { id: string } }) {
  const raceControl = await getRaceControlBySession(params.id);

  const timeLineAdapted = adaptRaceControToTimeline(raceControl);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4">
      <div>
        <Image src="/f1logo.png" alt="Logo" width={300} height={150} />
      </div>
      <span className="text-black">
        First version of F1 stats, that you can only see the races from 2024.
      </span>

      <div>
        <div className="hidden sm:block">
          <nav
            className="isolate flex divide-x divide-gray-200 rounded-lg shadow"
            aria-label="Tabs"
          >
            {tabs.map((tab, tabIdx) => (
              <a
                key={tab.name}
                href={tab.href}
                className={classNames(
                  tab.current
                    ? "text-gray-900"
                    : "text-gray-500 hover:text-gray-700",
                  tabIdx === 0 ? "rounded-l-lg" : "",
                  tabIdx === tabs.length - 1 ? "rounded-r-lg" : "",
                  "group relative min-w-0 flex-1 overflow-hidden bg-white py-4 px-4 text-center text-sm font-medium hover:bg-gray-50 focus:z-10"
                )}
                aria-current={tab.current ? "page" : undefined}
              >
                <span>{tab.name}</span>
                <span
                  aria-hidden="true"
                  className={classNames(
                    tab.current ? "bg-indigo-500" : "bg-transparent",
                    "absolute inset-x-0 bottom-0 h-0.5"
                  )}
                />
              </a>
            ))}
          </nav>
        </div>
      </div>

      <div className="flow-root">
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

      <footer className="text-black">
        <p>Powered by @pretxelcom v1.0.0</p>
      </footer>
    </main>
  );
}
