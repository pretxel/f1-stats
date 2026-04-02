import RaceItem from "@/components/raceItem";
import { getRaces } from "@/services/races";
import { RaceItemType } from "@/types/RaceItemType";
import SearchInput from "@/components/searchInput";
import { showSummerSale } from "@/flags";
import { Suspense } from "react";
import { encrypt } from "@vercel/flags";
import { FlagValues } from "@vercel/flags/react";
import { getFlags } from "./getFlags";
import { orderRacesLastest } from "@/utils/orderRacesByLastest";
import TabRaces from "@/components/tabRaces";
import YearSelector from "@/components/yearSelector";

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
  const parsedYear = Number(searchParamsAwaited?.year);
  const year = Number.isInteger(parsedYear) && parsedYear > 0 ? parsedYear : undefined;
  const races = await getRaces({ sessionType, year });
  const racesOrdered = orderRacesLastest(
    races,
    sessionType,
    sessionType ? NaN : 3
  );

  const sale = await showSummerSale();
  const values = await getFlags();

  return (
    <>
      <Suspense fallback={null}>
        <ConfidentialFlagValues values={values} />
      </Suspense>

      {values.showSearchInput && <SearchInput />}

      <Suspense
        fallback={
          <div className="flex gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-8 w-16 bg-carbon-mid animate-pulse"
              />
            ))}
          </div>
        }
      >
        <YearSelector years={[2023, 2024, 2025, 2026]} />
      </Suspense>

      <Suspense
        fallback={
          <div className="flex gap-1 mb-8">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-8 w-24 bg-carbon-mid animate-pulse"
              />
            ))}
          </div>
        }
      >
        <TabRaces sessionTypes={["Practice", "Qualifying", "Race"]} />
      </Suspense>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-64 bg-carbon-light border-l-[3px] border-f1red animate-pulse"
              />
            ))}
          </div>
        }
      >
        <ul
          role="list"
          className="grid grid-cols-1 gap-4 lg:grid-cols-3"
        >
          {racesOrdered?.length > 0 &&
            racesOrdered.map((race: RaceItemType) => (
              <li key={race.session_key}>
                <RaceItem
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
    </>
  );
};

export default Home;
