import RaceItem from "@/components/raceItem";
import { getRaces } from "@/services/races";
import { RaceItemType } from "@/types/RaceItemType";
import Image from "next/image";

export default async function Home() {
  const races = await getRaces();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4">
      <div>
        <Image
          src="https://www.thebestf1.es/wp-content/uploads/2017/11/F1-Logo-2018-Presentacion-750x354.jpg"
          alt="Logo"
          width={300}
          height={150}
        />
      </div>
      <span>
        First version of F1 stats, that you can only see the races from 2024.
      </span>
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <ul
          role="list"
          className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-3 xl:gap-x-8"
        >
          {races?.length &&
            races.map((race: RaceItemType) => (
              <li
                key={race.session_key}
                className="overflow-hidden rounded-xl border border-gray-200"
              >
                <RaceItem
                  key={race.session_key}
                  circuit_short_name={race.circuit_short_name}
                  country_name={race.country_name}
                  date_start={race.date_start}
                  date_end={race.date_end}
                  location={race.location}
                  session_key={race.session_key}
                  country_code={race.country_code}
                />
              </li>
            ))}
        </ul>
      </div>
      <footer>
        <p>Powered by @pretxelcom v1.0.0</p>
      </footer>
    </main>
  );
}
