import type { Metadata } from "next";
import React, { Suspense } from "react";
import Link from "next/link";
import RaceControl from "@/components/raceControl";
import PitStops from "@/components/pitstops";
import SessionHeader from "@/components/sessionHeader";
import Tabs from "@/components/tabs";
import { getRaces } from "@/services/races";
import isLiveSessionNow from "@/utils/isLiveSessionNow";
import { jsonLdSafe } from "@/utils/jsonLdSafe";
import type { RaceItemType } from "@/types/RaceItemType";

interface TabJSXElement {
  [key: number]: React.JSX.Element;
}
const TabContent = (sessionKey: string, liveMode: boolean): TabJSXElement => ({
  1: <RaceControl session_key={sessionKey} liveMode={liveMode} />,
  2: <PitStops session_key={sessionKey} liveMode={liveMode} />,
});

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
        url: `https://f1.edselserrano.com/session/${id}`,
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
  searchParams: Promise<{ selectedTab?: string; from?: string }>;
}) {
  const paramsAwaited = await params;
  const searchParamsAwaited = await searchParams;

  const selectedTab = searchParamsAwaited?.selectedTab
    ? parseInt(searchParamsAwaited?.selectedTab as string)
    : 1;
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
        className="inline-flex items-center gap-2 mb-4 font-data text-[10px] tracking-[0.25em] uppercase text-muted hover:text-f1red transition-colors duration-200"
      >
        ◀ Sessions
      </Link>

      <SessionHeader race={race[0]} />

      <Suspense
        fallback={
          <div className="h-12 bg-carbon-mid border-b border-carbon-border animate-pulse mb-8" />
        }
      >
        <Tabs />
      </Suspense>

      <div key={selectedTab} className="tab-fade-in">
        <Suspense
          fallback={
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 bg-carbon-light border-l-[3px] border-carbon-border animate-pulse"
                />
              ))}
            </div>
          }
        >
          {TabContent(idSession, isLiveMode)[selectedTab]}
        </Suspense>
      </div>
    </section>
  );
}
