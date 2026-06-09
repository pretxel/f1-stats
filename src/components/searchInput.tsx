"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("query") ?? "");

  const updateQuery = (next: string) => {
    setValue(next);
    const params = new URLSearchParams(searchParams.toString());
    if (next.trim()) {
      params.set("query", next.trim());
    } else {
      params.delete("query");
    }
    const qs = params.toString();
    router.replace(qs ? `/?${qs}` : "/", { scroll: false });
  };

  return (
    <div className="relative w-full max-w-xl">
      <svg
        className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        placeholder="Search circuit, country, location..."
        className="w-full h-9 bg-carbon-light border border-carbon-border text-chromium font-data text-xs tracking-wide pl-10 pr-4 outline-none placeholder:text-muted focus:border-f1red transition-colors duration-200"
        type="search"
        name="query"
        id="query"
        value={value}
        onChange={(e) => updateQuery(e.target.value)}
        aria-label="Search sessions"
      />
    </div>
  );
}
