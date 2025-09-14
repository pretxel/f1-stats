import RaceItem from "@/components/raceItem";
import { getRaces } from "@/services/races";
import { RaceItemType } from "@/types/RaceItemType";
import SwitchSessionType from "@/components/switchSessionType";
import SearchInput from "@/components/searchInput";
import { showSummerSale } from "@/flags";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Suspense } from "react";
import { encrypt } from "@vercel/flags";
import { FlagValues } from "@vercel/flags/react";
import { getFlags } from "./getFlags";
import { orderRacesLastest } from "@/utils/orderRacesByLastest";
import TabRaces from "@/components/tabRaces";
import YearSelect from "@/components/yearSelect";
export const revalidate = 3600;

async function ConfidentialFlagValues({ values }: { readonly values: any }) {
  const encryptedFlagValues = await encrypt(values);

  return <FlagValues values={encryptedFlagValues} />;
}

const Home = async ({ searchParams }: any) => {
  const searchParamsAwaited = await searchParams;
  const sessionType = searchParamsAwaited?.sessionType
    ? (searchParamsAwaited?.sessionType as string)
    : undefined;
  const year = searchParamsAwaited?.year
    ? parseInt(searchParamsAwaited?.year as string)
    : undefined;
  const races = await getRaces({ sessionType, year });
  const racesOrdered = orderRacesLastest(
    races,
    sessionType,
    sessionType ? NaN : 3
  );

  const sale = await showSummerSale();

  const values = await getFlags();

  return (
    <section>
      <div className="z-10 w-full p-10 items-center font-mono text-sm flex-col gap-y-10">
        {sale && <SwitchSessionType />}
        <Suspense fallback={null}>
          <ConfidentialFlagValues values={values} />
        </Suspense>

        {values.showSearchInput && <SearchInput />}

        <YearSelect />

        <TabRaces sessionTypes={["Practice", "Qualifying", "Race"]} />

        <Suspense fallback={<Skeleton count={5} />}>
          <ul
            role="list"
            className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-3 xl:gap-x-8"
          >
            {racesOrdered?.length &&
              racesOrdered.map((race: RaceItemType) => (
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
                    session_type={race.session_type}
                  />
                </li>
              ))}
          </ul>
        </Suspense>
      </div>
    </section>
  );
};

export default Home;
