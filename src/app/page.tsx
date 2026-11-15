import { Suspense } from "react";
import { encrypt } from "@vercel/flags";
import { FlagValues } from "@vercel/flags/react";
import { getRaces } from "@/services/races";
import { RaceItemType } from "@/types/RaceItemType";
import { Weekend } from "@/types/Weekend";
import { getFlags } from "./getFlags";
import { currentYear } from "@/utils/constants";
import { groupSessionsByWeekend } from "@/utils/groupSessionsByWeekend";
import { splitWeekends } from "@/utils/splitWeekends";
import SegmentedLinks from "@/components/segmentedLinks";
import SearchInput from "@/components/searchInput";
import WeekendGroup from "@/components/weekendGroup";
import EmptyState from "@/components/emptyState";

export const revalidate = 3600;

const FIRST_SEASON = 2023;
const SESSION_TYPES = ["Practice", "Qualifying", "Sprint", "Race"];

type SearchParams = { year?: string; sessionType?: string; query?: string };

async function ConfidentialFlagValues({ values }: { readonly values: Record<string, unknown> }) {
  const encryptedFlagValues = await encrypt(values);
  return <FlagValues values={encryptedFlagValues} />;
}

function listingHref(params: { year?: number; sessionType?: string; query?: string }) {
  const qs = new URLSearchParams();
  if (params.year && params.year !== currentYear) qs.set("year", String(params.year));
  if (params.sessionType) qs.set("sessionType", params.sessionType);
  if (params.query) qs.set("query", params.query);
  const s = qs.toString();
  return s ? `/?${s}` : "/";
}

function matchesQuery(session: RaceItemType, query: string): boolean {
  return [session.circuit_short_name, session.country_name, session.location].some((field) =>
    field?.toLowerCase().includes(query)
  );
}

function WeekendList({
  id,
  title,
  weekends,
  fromQuery,
}: {
  id: string;
  title: string;
  weekends: Weekend[];
  fromQuery: string;
}) {
  return (
    <section aria-labelledby={id} className="mb-10">
      <h2 id={id} className="mb-3 text-label text-ink-soft">
        {title}
      </h2>
      <div className="border-b border-ink">
        {weekends.map((w) => (
          <WeekendGroup key={w.key} weekend={w} fromQuery={fromQuery} />
        ))}
      </div>
    </section>
  );
}

export default async function Home({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const parsedYear = Number(params?.year);
  const year =
    Number.isInteger(parsedYear) && parsedYear >= FIRST_SEASON && parsedYear <= currentYear
      ? parsedYear
      : currentYear;
  const sessionType = SESSION_TYPES.includes(params?.sessionType ?? "")
    ? params.sessionType
    : undefined;
  const rawQuery = (params?.query ?? "").trim();
  const query = rawQuery.toLowerCase();

  const values = await getFlags();
  const searchEnabled = Boolean(values.showSearchInput);

  const races: RaceItemType[] = (await getRaces({ sessionType, year })) ?? [];
  const visible = searchEnabled && query ? races.filter((r) => matchesQuery(r, query)) : races;
  const weekends = groupSessionsByWeekend(visible);
  const { featured, comingUp, earlier } = splitWeekends(weekends);

  const fromQuery = listingHref({ year, sessionType, query: searchEnabled ? rawQuery : undefined })
    .replace(/^\/\??/, "");

  const seasons = Array.from(
    { length: currentYear - FIRST_SEASON + 1 },
    (_, i) => currentYear - i
  );

  const emptyDetail = query
    ? `No circuits match “${rawQuery}” in ${year}.`
    : `No ${sessionType ? `${sessionType} ` : ""}sessions in ${year} yet.`;

  return (
    <>
      <Suspense fallback={null}>
        <ConfidentialFlagValues values={values} />
      </Suspense>

      <h1 className="sr-only">Formula 1 sessions, {year} season</h1>

      <div className="mb-10 flex flex-wrap items-end gap-x-8 gap-y-5">
        <SegmentedLinks
          label="Season"
          items={seasons.map((y) => ({
            label: String(y),
            href: listingHref({ year: y, sessionType }),
            active: y === year,
          }))}
        />
        <SegmentedLinks
          label="Sessions"
          items={[undefined, ...SESSION_TYPES].map((type) => ({
            label: type ?? "All",
            href: listingHref({ year, sessionType: type }),
            active: type === sessionType,
          }))}
        />
        {searchEnabled && (
          <Suspense fallback={null}>
            <SearchInput />
          </Suspense>
        )}
      </div>

      {!featured ? (
        <EmptyState
          title="Nothing to show"
          detail={emptyDetail}
          resetHref="/"
          resetLabel="Clear filters"
        />
      ) : (
        <>
          <WeekendGroup weekend={featured} fromQuery={fromQuery} featured />
          {comingUp.length > 0 && (
            <WeekendList id="coming-up" title="Coming up" weekends={comingUp} fromQuery={fromQuery} />
          )}
          {earlier.length > 0 && (
            <WeekendList
              id="earlier-weekends"
              title={`Earlier in ${year}`}
              weekends={earlier}
              fromQuery={fromQuery}
            />
          )}
          <p className="text-label text-ink-soft">Times are local to each circuit.</p>
        </>
      )}
    </>
  );
}
