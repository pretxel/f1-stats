"use client";
import { useIsVisible } from "@/hooks/useIsVisible";
import { useRef, Ref } from "react";
import Image from "next/image";

export default function PitstopItem({ person }: any) {
  const ref: Ref<HTMLLIElement> = useRef(null);
  const isVisible1 = useIsVisible(ref);
  return (
    <li
      key={person.key}
      ref={ref}
      className={`transition-opacity ease-in duration-700 flex gap-x-4 py-5 ${
        isVisible1 ? "opacity-100" : "opacity-0"
      }`}
    >
      {person.imageUrl && (
        <Image
          className="h-12 w-12 flex-none rounded-full bg-gray-50"
          src={person.imageUrl ?? ""}
          width={48}
          height={48}
          alt={person.name}
        />
      )}

      {!person.imageUrl && (
        <div>
          <span
            className={
              "bg-gray-400 h-12 w-12 rounded-full flex items-center justify-center ring-8 ring-white"
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              className="h-7 w-7 text-white"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
          </span>
        </div>
      )}

      <div>
        <p className="text-sm font-semibold leading-6 text-gray-900">
          {person.name}
        </p>
        <p className="mt-1 truncate text-xs leading-5 text-gray-500">
          Lap number: {person.lap_number}
        </p>
        <p className="mt-1 truncate text-xs leading-5 text-gray-500">
          Duration: {person.pit_duration} Seconds
        </p>
      </div>
    </li>
  );
}
