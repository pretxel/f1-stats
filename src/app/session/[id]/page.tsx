import type { Metadata } from "next";
import React, { Suspense } from "react";
import Link from "next/link";
import RaceControl from "@/components/raceControl";
import PitStops from "@/components/pitstops";
import SessionHeader from "@/components/sessionHeader";
import FlagStrip from "@/components/flagStrip";
import SegmentedLinks from "@/components/segmentedLinks";
import { getRaces } from "@/services/races";
import isLiveSessionNow from "@/utils/isLiveSessionNow";
import { jsonLdSafe } from "@/utils/jsonLdSafe";
import type { RaceItemType } from "@/types/RaceItemType";
import { SITE_URL } from "@/utils/constants";

interface TabJSXElement {
  [key: number]: React.JSX.Element;
}
const TabContent = (race: RaceItemType, liveMode: boolean): TabJSXElement => ({
  1: <RaceControl session_key={race.session_key} gmt_offset={race.gmt_offset} liveMode={liveMode} />,
  2: <PitStops session_key={race.session_key} liveMode={liveMode} />,
});

const TABS = ["Race control", "Pit stops"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const race = await getRaces({ sessionKey: id }) as RaceItemType[];
    if (!race || race.length === 0) {
      return { title: "Session — F1 Stats" };
    }
    const s = race[0];
    const title = `${s.circuit_short_name} ${s.session_type} — F1 Stats`;
    const description = `${s.session_type} at ${s.circuit_short_name}, ${s.country_name}. Session data including race control events and pit stop analysis.`;
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
        url: `${SITE_URL}/session/${id}`,
      },
    };
  } catch {
    return { title: "Session — F1 Stats" };
  }
}

export default async function Session({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const paramsAwaited = await params;
  const searchParamsAwaited = await searchParams;

  const parsedTab = parseInt(searchParamsAwaited?.selectedTab ?? "1");
  const selectedTab = parsedTab === 2 ? 2 : 1;
  const idSession = paramsAwaited.id;
  const race = await getRaces({ sessionKey: idSession }) as RaceItemType[];
  if (!race || race.length === 0) {
    throw new Error(`Session not found: ${idSession}`);
  }
  const isLiveMode = isLiveSessionNow(
    new Date(race[0].date_start),
    new Date(race[0].date_end)
  );

  // Rebuild the listing URL from the `from` param; URLSearchParams re-encodes
  // whatever arrives so the href stays a same-origin listing link.
  let backHref = "/";
  if (typeof searchParamsAwaited?.from === "string" && searchParamsAwaited.from) {
    const fromParams = new URLSearchParams(searchParamsAwaited.from);
    const qs = fromParams.toString();
    if (qs) backHref = `/?${qs}`;
  }

  // Tab links keep every other param (notably `from`) so the back link survives switching.
  const tabHref = (tab: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParamsAwaited ?? {})) {
      if (typeof v === "string") params.set(k, v);
    }
    params.set("selectedTab", String(tab));
    return `?${params.toString()}`;
  };

  return (
    <section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdSafe({
            "@context": "https://schema.org",
            "@type": "SportsEvent",
            name: `${race[0].circuit_short_name} ${race[0].session_type}`,
            sport: "Formula One",
            startDate: new Date(race[0].date_start).toISOString(),
            endDate: new Date(race[0].date_end).toISOString(),
            location: {
              "@type": "Place",
              name: race[0].circuit_short_name,
              address: {
                "@type": "PostalAddress",
                addressCountry: race[0].country_code,
                addressLocality: race[0].location,
              },
            },
            eventStatus: "https://schema.org/EventScheduled",
          }),
        }}
      />
      <Link
        href={backHref}
        className="mb-6 inline-flex items-center gap-2 text-ink-soft hover:text-ink"
      >
        <svg aria-hidden="true" viewBox="0 0 12 12" className="h-3 w-3">
          <path d="M8 2L4 6l4 4" fill="none" stroke="currentColor" strokeWidth="1.75" />
        </svg>
        All sessions
      </Link>

      <SessionHeader race={race[0]} live={isLiveMode}>
        <Suspense fallback={<div className="mt-8 h-[5.5rem] animate-pulse bg-slab motion-reduce:animate-none" />}>
          <FlagStrip session={race[0]} live={isLiveMode} />
        </Suspense>
      </SessionHeader>

      <div className="mb-6">
        <SegmentedLinks
          label="Session data"
          showLabel={false}
          items={TABS.map((label, i) => ({
            label,
            href: tabHref(i + 1),
            active: selectedTab === i + 1,
          }))}
        />
      </div>

      <div key={selectedTab} className="tab-fade-in">
        <Suspense
          fallback={
            <div className="space-y-2" role="status">
              <span className="sr-only">Loading</span>
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-11 animate-pulse bg-slab motion-reduce:animate-none" />
              ))}
            </div>
          }
        >
          {TabContent(race[0], isLiveMode)[selectedTab]}
        </Suspense>
      </div>
    </section>
  );
}
