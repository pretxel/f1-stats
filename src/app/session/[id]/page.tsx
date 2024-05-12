import Tabs from "@/components/tabs";
import RaceControl from "@/components/raceControl";
import PitStops from "@/components/pitstops";

export default async function Session({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const selectedTab = searchParams?.selectedTab
    ? parseInt(searchParams?.selectedTab as string)
    : 1;
  return (
    <section>
      <div className="z-10 w-full items-center justify-between font-mono text-sm p-10">
        <Tabs selectedTab={selectedTab} />

        {selectedTab === 1 && <RaceControl session_key={params.id} />}
        {selectedTab === 2 && <PitStops session_key={params.id} />}
      </div>
    </section>
  );
}
