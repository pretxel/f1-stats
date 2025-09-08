"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface TabRacesProps {
  sessionTypes: string[];
}

export default function TabRaces(props: TabRacesProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  return (
    <div className="relative  mx-auto gap-1 rounded-lg border border-stroke bg-white p-1 dark:border-dark-stroke dark:bg-white/[.02] mb-4 text-center w-full max-w-xl">
      {props.sessionTypes.map((sessionType, index) => (
        <button
          key={index}
          className="inline-flex h-8 items-center justify-center rounded-md px-3 text-sm font-medium duration-200 text-dark-5 hover:bg-black hover:text-white dark:text-black "
          onClick={() => {
            const params = new URLSearchParams(
              Array.from(searchParams.entries())
            );
            params.set("sessionType", sessionType);
            router.push("?" + params.toString());
          }}
        >
          {sessionType}
        </button>
      ))}
    </div>
  );
}
