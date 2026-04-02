"use client";
import { useIsVisible } from "@/hooks/useIsVisible";
import { useRef, Ref } from "react";
import Image from "next/image";

export default function PitstopItem({ person }: any) {
  const ref: Ref<HTMLLIElement> = useRef(null);
  const isVisible = useIsVisible(ref);

  return (
    <li
      key={person.key}
      ref={ref}
      className={`transition-all duration-700 ease-out flex items-center gap-5 py-4 border-b border-carbon-border last:border-b-0 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      }`}
    >
      {/* Driver avatar */}
      <div className="flex-none">
        {person.imageUrl ? (
          <Image
            className="h-10 w-10 object-cover bg-carbon-mid"
            src={person.imageUrl}
            width={40}
            height={40}
            alt={person.name}
          />
        ) : (
          <div className="h-10 w-10 bg-carbon-mid border border-carbon-border flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-5 w-5 text-muted"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Name + pitstop count */}
      <div className="flex-1 min-w-0">
        <p className="font-display font-bold italic text-base uppercase tracking-wide text-chromium truncate">
          {person.name}
        </p>
        <p className="font-data text-[10px] text-muted tracking-widest uppercase mt-0.5">
          {person.pitstops} {person.pitstops === 1 ? "stop" : "stops"}
        </p>
      </div>

      {/* Total time */}
      <div className="flex-none text-right">
        <p className="font-data text-lg font-bold text-chromium tabular-nums">
          {person.total_duration}
        </p>
        <p className="font-data text-[10px] text-muted tracking-widest uppercase">
          sec total
        </p>
      </div>
    </li>
  );
}
