import Image from "next/image";

import Tabs from "@/components/tabs";
import RaceControl from "@/components/raceControl";
import PitStops from "@/components/pitstops";

//TODO: optimize this page

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
    <main className="flex min-h-screen flex-col items-center justify-between p-4">
      <div>
        <Image src="/f1logo.png" alt="Logo" width={300} height={150} />
      </div>
      <span className="text-black">
        First version of F1 stats, that you can only see the races from 2024.
      </span>

      <Tabs selectedTab={selectedTab} />

      {selectedTab === 1 && <RaceControl session_key={params.id} />}
      {selectedTab === 2 && <PitStops session_key={params.id} />}

      <footer className="text-black">
        <p>Powered by @pretxelcom v1.0.0</p>
      </footer>
    </main>
  );
}
