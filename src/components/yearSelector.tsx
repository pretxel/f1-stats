"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface YearSelectorProps {
  years: number[];
}

export default function YearSelector(props: YearSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeYear = searchParams.get("year");
  const sessionType = searchParams.get("sessionType");

  const buildUrl = (year?: number) => {
    const params = new URLSearchParams();
    if (sessionType) params.set("sessionType", sessionType);
    if (year !== undefined) params.set("year", String(year));
    const query = params.toString();
    return query ? `/?${query}` : "/";
  };

  return (
    <div className="flex items-center gap-1 mb-4">
      <button
        className={`font-data text-[10px] tracking-[0.25em] uppercase px-4 py-2 transition-all duration-200 border ${
          !activeYear
            ? "bg-f1red border-f1red text-white"
            : "border-carbon-border text-muted hover:border-muted hover:text-chromium bg-transparent"
        }`}
        onClick={() => router.push(buildUrl())}
      >
        ALL
      </button>
      {props.years.map((year) => (
        <button
          key={year}
          className={`font-data text-[10px] tracking-[0.25em] uppercase px-4 py-2 transition-all duration-200 border ${
            activeYear === String(year)
              ? "bg-f1red border-f1red text-white"
              : "border-carbon-border text-muted hover:border-muted hover:text-chromium bg-transparent"
          }`}
          onClick={() => router.push(buildUrl(year))}
        >
          {year}
        </button>
      ))}
    </div>
  );
}
