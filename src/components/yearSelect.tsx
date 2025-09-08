"use client";
import { currentYear } from "@/utils/constants";
import { useRouter, useSearchParams } from "next/navigation";

export default function YearSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedYear = searchParams.get("year") || String(currentYear);
  const years = Array.from({ length: 5 }, (_, i) => String(currentYear - i));

  const handleChange = (year: string) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("year", year);
    router.push("?" + params.toString());
  };

  return (
    <div className="relative mx-auto w-full max-w-xl mb-4">
      <select
        className="w-full rounded-lg border border-stroke p-2 text-sm"
        value={selectedYear}
        onChange={(e) => handleChange(e.target.value)}
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
}
