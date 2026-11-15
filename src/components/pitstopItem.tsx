import Image from "next/image";
import { RankedPitstop } from "@/utils/rankPitstops";
import { displayName } from "./winnerLabel";

export default function PitstopItem({ person }: { person: RankedPitstop }) {
  return (
    <li className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-x-4 gap-y-2 border-b border-rule py-3 sm:grid-cols-[2.5rem_12rem_1fr_5rem]">
      {person.imageUrl ? (
        <Image
          src={person.imageUrl}
          width={40}
          height={40}
          alt=""
          className="h-10 w-10 bg-slab object-cover object-top ring-1 ring-rule"
        />
      ) : (
        <span aria-hidden="true" className="h-10 w-10 bg-slab ring-1 ring-rule" />
      )}
      <p className="min-w-0">
        <span className="block truncate font-semibold">{displayName(person.name)}</span>
        <span className="text-label text-ink-soft">
          {person.pitstops} {person.pitstops === 1 ? "stop" : "stops"}
        </span>
      </p>
      <span aria-hidden="true" className="col-span-3 row-start-2 h-3 bg-slab ring-1 ring-rule sm:col-span-1 sm:row-start-auto">
        <span className="block h-full bg-ink" style={{ width: `${person.barPct}%` }} />
      </span>
      <span className="wdth-condensed col-start-3 row-start-1 text-right text-lg font-semibold sm:col-start-auto sm:row-start-auto">
        {person.totalLabel}
      </span>
    </li>
  );
}
