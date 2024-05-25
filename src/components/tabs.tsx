"use client";
import { classNames } from "@/utils/classNames";
import { useRouter } from "next/navigation";
import Link from "next/link";

const tabs = [
  { name: "Race Control", href: "#" },
  { name: "Pit stops", href: "#" },
];

export default function Tabs({ selectedTab }: { selectedTab: number }) {
  const router = useRouter();
  return (
    <div>
      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>

        <select
          id="tabs"
          name="tabs"
          className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
          defaultValue={tabs[selectedTab - 1].name}
          test-id={selectedTab}
          onChange={(e) => router.push("?selectedTab=" + e.target.value)}
        >
          {tabs.map((tab, tabIdx) => (
            <option key={tab.name} value={tabIdx + 1}>
              {tab.name}
            </option>
          ))}
        </select>
      </div>
      <div className="hidden sm:block">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex" aria-label="Tabs">
            {tabs.map((tab, tabIdx) => (
              <Link
                key={tab.name}
                href={`?selectedTab=${tabIdx + 1}`}
                className={classNames(
                  selectedTab === tabIdx + 1
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                  "w-1/4 border-b-2 py-4 px-1 text-center text-sm font-medium"
                )}
                aria-current={selectedTab === tabIdx + 1 ? "page" : undefined}
              >
                {tab.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
