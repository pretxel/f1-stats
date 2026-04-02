"use client";
import { Ref, useRef } from "react";
import { useIsVisible } from "@/hooks/useIsVisible";

export default function RaceControlItem({
  event,
  eventIdx,
  timeLineAdapted,
}: any) {
  const ref: Ref<HTMLLIElement> = useRef(null);
  const isVisible = useIsVisible(ref);
  const isLast = eventIdx === timeLineAdapted.length - 1;

  return (
    <li
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      }`}
    >
      <div className="relative pb-6">
        {/* Vertical connector line */}
        {!isLast && (
          <span
            className="absolute left-[9px] top-5 bottom-0 w-px bg-carbon-border"
            aria-hidden="true"
          />
        )}

        <div className="relative flex gap-4">
          {/* Dot indicator */}
          <div className="flex-none mt-1">
            <span className="flex h-[18px] w-[18px] items-center justify-center bg-carbon-mid border border-carbon-border">
              <span className="h-1.5 w-1.5 rounded-full bg-f1red" />
            </span>
          </div>

          {/* Content */}
          <div className="flex min-w-0 flex-1 items-start justify-between gap-4 pt-0.5">
            <p className="font-data text-xs text-chromium leading-relaxed">
              {event.content}
            </p>
            <time
              dateTime={event.datetime?.toString()}
              className="font-data text-[10px] text-muted tracking-wide whitespace-nowrap flex-none"
            >
              {event.date}
            </time>
          </div>
        </div>
      </div>
    </li>
  );
}
