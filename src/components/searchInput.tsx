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
    <div className="w-full max-w-sm">
      <label htmlFor="query" className="mb-2 block text-label text-ink-soft">
        Search circuits
      </label>
      <input
        id="query"
        name="query"
        type="search"
        value={value}
        onChange={(e) => updateQuery(e.target.value)}
        placeholder="Monza, Japan, Las Vegas…"
        className="h-[2.375rem] w-full rounded-[3px] border border-ink bg-slab px-3 text-ink placeholder:text-ink-soft"
      />
    </div>
  );
}
