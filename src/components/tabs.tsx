"use client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const tabs = [
  { name: "Race Control", label: "RACE CONTROL" },
  { name: "Pit stops", label: "PIT STOPS" },
];

export default function Tabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedTab = parseInt(searchParams.get("selectedTab") || "1");

  return (
    <div className="mb-8">
      {/* Mobile select */}
      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>
        <select
          id="tabs"
          name="tabs"
          className="block w-full bg-carbon-light border border-carbon-border text-chromium font-data text-xs tracking-widest py-2 px-3 focus:border-f1red focus:outline-none"
          defaultValue={selectedTab}
          onChange={(e) => router.push("?selectedTab=" + e.target.value)}
        >
          {tabs.map((tab, tabIdx) => (
            <option key={tab.name} value={tabIdx + 1}>
              {tab.label}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop tabs */}
      <div className="hidden sm:block border-b border-carbon-border">
        <nav className="flex" aria-label="Tabs">
          {tabs.map((tab, tabIdx) => {
            const isActive = selectedTab === tabIdx + 1;
            return (
              <Link
                key={tab.name}
                href={`?selectedTab=${tabIdx + 1}`}
                className={`relative font-data text-[11px] tracking-[0.25em] uppercase px-6 py-4 transition-colors duration-200 ${
                  isActive
                    ? "text-chromium"
                    : "text-muted hover:text-chromium"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-f1red" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
