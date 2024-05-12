"use client";

import { useAnimate, useInView } from "framer-motion";
import { useEffect } from "react";
import { UserIcon } from "@heroicons/react/20/solid";
import Image from "next/image";

export default function ListPitstop({ people }: { people: any[] }) {
  const [scope, animate] = useAnimate();
  const isInView = useInView(scope);

  useEffect(() => {
    if (isInView) {
      animate("li", { opacity: 1 }, { ease: "linear", duration: 0.5 });
    }
    // This "li" selector will only select children
    // of the element that receives `scope`.
  }, [animate, isInView]);

  return (
    <>
      <ul role="list" className="divide-y divide-gray-100" ref={scope}>
        {people?.length &&
          people.map((person) => (
            <li key={person.key} className="flex gap-x-4 py-5">
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
                    <UserIcon className="h-7 w-7 text-white" />
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
          ))}
      </ul>
    </>
  );
}
