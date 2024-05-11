"use client";
import { classNames } from "@/utils/classNames";
import { useRouter } from "next/navigation";
const tabs = [
  { name: "Race Control", href: "#" },
  { name: "Pit stops", href: "#" },
];
export default function Tabs({ selectedTab }: { selectedTab: number }) {
  const router = useRouter();
  return (
    <div>
      <div className="hidden sm:block">
        <nav
          className="isolate flex divide-x divide-gray-200 rounded-lg shadow"
          aria-label="Tabs"
        >
          {tabs.map((tab, tabIdx) => (
            <a
              key={tab.name}
              href={tab.href}
              className={classNames(
                selectedTab === tabIdx + 1
                  ? "text-gray-900"
                  : "text-gray-500 hover:text-gray-700",
                tabIdx === 0 ? "rounded-l-lg" : "",
                tabIdx === tabs.length - 1 ? "rounded-r-lg" : "",
                "group relative min-w-0 flex-1 overflow-hidden bg-white py-4 px-4 text-center text-sm font-medium hover:bg-gray-50 focus:z-10"
              )}
              aria-current={selectedTab === tabIdx + 1 ? "page" : undefined}
              onClick={() => router.push("?selectedTab=" + (tabIdx + 1))}
            >
              <span>{tab.name}</span>
              <span
                aria-hidden="true"
                className={classNames(
                  selectedTab === tabIdx + 1
                    ? "bg-indigo-500"
                    : "bg-transparent",
                  "absolute inset-x-0 bottom-0 h-0.5"
                )}
              />
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}
