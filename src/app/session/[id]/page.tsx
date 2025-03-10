import { Suspense } from "react";
import RaceControl from "@/components/raceControl";
import PitStops from "@/components/pitstops";
import { getRaces } from "@/services/races";
import LiveItem from "@/components/liveItem";
import isLiveSessionNow from "@/utils/isLiveSessionNow";
import Skeleton from "react-loading-skeleton";

interface TabJSXElement {
  [key: number]: JSX.Element;
}
const Tabs = (sessionKey: string, liveMode: boolean): TabJSXElement => ({
  1: <RaceControl session_key={sessionKey} liveMode={liveMode} />,
  2: <PitStops session_key={sessionKey} liveMode={liveMode} />,
});

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
      <div className="z-10 w-full items-center justify-between font-mono text-sm p-10">
        {isLiveMode && <LiveItem isLiveFetching={true} />}

        <Suspense fallback={<Skeleton count={10} />}>
          {Tabs(idSession, isLiveMode)[selectedTab]}
        </Suspense>
      </div>
    </section>
  );
}
