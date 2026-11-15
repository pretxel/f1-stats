import CountryFlag from "./countryFlag";
import { RaceItemType } from "@/types/RaceItemType";
import { formatTrackTime } from "@/utils/trackTime";
import LiveItem from "./liveItem";

type SessionHeaderProps = {
  race: RaceItemType;
  live: boolean;
  children?: React.ReactNode;
};

export default function SessionHeader({ race, live, children }: SessionHeaderProps) {
  const day = formatTrackTime(race.date_start, race.gmt_offset, "dddd D MMMM YYYY");
  const from = formatTrackTime(race.date_start, race.gmt_offset, "HH:mm");
  const to = formatTrackTime(race.date_end, race.gmt_offset, "HH:mm");

  return (
    <header className="mb-10 border-b-2 border-ink pb-8">
      <p className="flex items-center gap-2.5 text-ink-soft">
        <CountryFlag code={race.country_code} />
        {race.location}, {race.country_name}
      </p>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <h1 className="wdth-expanded break-words text-[2.25rem] font-extrabold leading-none tracking-tight sm:text-[2.5rem]">
          {race.circuit_short_name}
          <span className="block text-xl font-semibold tracking-normal text-ink-soft sm:text-[1.5625rem]">
            {race.session_name}
          </span>
        </h1>
        {live && <LiveItem isLiveFetching />}
      </div>

      <p className="mt-3">
        <time dateTime={new Date(race.date_start).toISOString()}>{day}</time>
        <span className="wdth-condensed text-ink-soft">
          , {from}–{to} local time
        </span>
      </p>

      {children}
    </header>
  );
}
