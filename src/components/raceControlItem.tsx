"use client";
import { Ref, useRef } from "react";
import { classNames } from "@/utils/classNames";
import { useIsVisible } from "@/hooks/useIsVisible";

export default function RaceControlItem({
  event,
  eventIdx,
  timeLineAdapted,
}: any) {
  const ref: Ref<HTMLLIElement> = useRef(null);
  const isVisible1 = useIsVisible(ref);
  return (
    <li
      ref={ref}
      key={event.id}
      className={`transition-opacity ease-in duration-700 ${
        isVisible1 ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="relative pb-8">
        {eventIdx !== timeLineAdapted.length - 1 ? (
          <span
            className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
            aria-hidden="true"
          />
        ) : null}
        <div className="relative flex space-x-3">
          <div>
            <span
              className={classNames(
                event.iconBackground,
                "h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white"
              )}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="h-5 w-5 text-white"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                />
              </svg>
            </span>
          </div>
          <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
            <div>
              <p className="text-sm text-gray-500">{event.content}</p>
            </div>
            <div className="whitespace-nowrap text-right text-sm text-gray-500">
              <time dateTime={event.datetime.toString()}>{event.date}</time>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}
