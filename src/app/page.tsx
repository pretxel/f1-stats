import RaceItem from "@/components/raceItem";
import { getRaces } from "@/services/races";
import { RaceItemType } from "@/types/RaceItemType";

export const revalidate = 3600;

export default async function Home() {
  const races = await getRaces();

  return (
    <section>
      <div className="z-10 w-full p-10 items-center font-mono text-sm lg:flex">
        <ul
          role="list"
          className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-3 xl:gap-x-8"
        >
          {races?.length &&
            races.map((race: RaceItemType) => (
              <li
                key={race.session_key}
                className="transition-opacity ease-in duration-700 opacity-100 overflow-hidden rounded-xl border border-gray-200"
              >
                <RaceItem
                  key={race.session_key}
                  circuit_short_name={race.circuit_short_name}
                  country_name={race.country_name}
                  date_start={race.date_start}
                  date_end={race.date_end}
                  location={race.location}
                  session_key={race.session_key}
                  session_name={race.session_name}
                  country_code={race.country_code}
                />
              </li>
            ))}
        </ul>
      </div>
    </section>
  );
}
