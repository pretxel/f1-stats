"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface TabRacesProps {
  sessionTypes: string[];
}

export default function TabRaces(props: TabRacesProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeSessionType = searchParams.get("sessionType");

  return (
    <div className="flex items-center gap-1 mb-8">
      <button
        className={`font-data text-[10px] tracking-[0.25em] uppercase px-4 py-2 transition-all duration-200 border ${
          !activeSessionType
            ? "bg-f1red border-f1red text-white"
            : "border-carbon-border text-muted hover:border-muted hover:text-chromium bg-transparent"
        }`}
        onClick={() => router.push("/")}
      >
        ALL
      </button>
      {props.sessionTypes.map((sessionType, index) => (
        <button
          key={index}
          className={`font-data text-[10px] tracking-[0.25em] uppercase px-4 py-2 transition-all duration-200 border ${
            activeSessionType === sessionType
              ? "bg-f1red border-f1red text-white"
              : "border-carbon-border text-muted hover:border-muted hover:text-chromium bg-transparent"
          }`}
          onClick={() => router.push("?sessionType=" + sessionType)}
        >
          {sessionType}
        </button>
      ))}
    </div>
  );
}
