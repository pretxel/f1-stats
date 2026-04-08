import type { Metadata } from "next";
import React, { Suspense } from "react";
import RaceControl from "@/components/raceControl";
import PitStops from "@/components/pitstops";
import { getRaces } from "@/services/races";
import LiveItem from "@/components/liveItem";
import isLiveSessionNow from "@/utils/isLiveSessionNow";

interface TabJSXElement {
  [key: number]: React.JSX.Element;
}
const Tabs = (sessionKey: string, liveMode: boolean): TabJSXElement => ({
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
    const race = await getRaces({ sessionKey: id });
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
      },
    };
  } catch {
    return { title: "Session — F1 Stats" };
  }
}

export default async function Session({ params, searchParams }: any) {
  const paramsAwaited = await params;
  const searchParamsAwaited = await searchParams;

  const selectedTab = searchParamsAwaited?.selectedTab
    ? parseInt(searchParamsAwaited?.selectedTab as string)
    : 1;
  const idSession = paramsAwaited.id;
  const race = await getRaces({ sessionKey: idSession });
  const isLiveMode = isLiveSessionNow(
    new Date(race[0].date_start),
    new Date(race[0].date_end)
  );

  return (
    <section>
      {isLiveMode && (
        <div className="mb-6">
          <LiveItem isLiveFetching={true} />
        </div>
      )}

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
        {Tabs(idSession, isLiveMode)[selectedTab]}
      </Suspense>
    </section>
  );
}
