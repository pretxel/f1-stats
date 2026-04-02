import Image from "next/image";
import { RaceItemType } from "@/types/RaceItemType";
import dayjs from "dayjs";
import { findFlagUrlByIso3Code } from "country-flags-svg";
const localizedFormat = require("dayjs/plugin/localizedFormat");
dayjs.extend(localizedFormat);
import { getWinnerByRace } from "@/services/winnerByRace";
import LiveItem from "./liveItem";
import ButtonRaceItem from "./buttonItem";
import isLiveSessionNow from "@/utils/isLiveSessionNow";

const SESSION_TYPE_LABELS: Record<string, string> = {
  Race: "RACE",
  Qualifying: "QUALI",
  Practice: "FP",
  Sprint: "SPR",
};

export default async function RaceItem(props: RaceItemType) {
  const urlImage = findFlagUrlByIso3Code(props.country_code);
  const winner = await getWinnerByRace(props.session_key);
  const isLive = isLiveSessionNow(
    new Date(props.date_start),
    new Date(props.date_end)
  );

  const sessionLabel =
    SESSION_TYPE_LABELS[props.session_name] ?? props.session_name.toUpperCase();

  return (
    <article className="group relative bg-carbon-light stripe-left hover:border-l-f1red-dark transition-all duration-300 overflow-hidden">
      {/* Top header row */}
      <div className="flex items-start justify-between gap-3 p-5 pb-4 border-b border-carbon-border">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-none">
            <Image
              src={urlImage !== "" ? urlImage : "/European_version.png"}
              alt={props.country_name}
              width={44}
              height={29}
              className="object-cover w-[44px] h-[29px]"
              style={{ imageRendering: "crisp-edges" }}
            />
          </div>
          <div className="min-w-0">
            <h3 className="font-display font-extrabold text-xl italic uppercase tracking-wide text-chromium leading-tight truncate group-hover:text-white transition-colors">
              {props.circuit_short_name}
            </h3>
            <p className="font-data text-[10px] text-muted tracking-widest uppercase mt-0.5">
              {props.country_name}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 flex-none">
          <span className="font-data text-[10px] font-bold tracking-[0.2em] text-carbon bg-f1red px-2 py-0.5 uppercase">
            {sessionLabel}
          </span>
          {isLive && <LiveItem />}
        </div>
      </div>

      {/* Data grid */}
      <div className="px-5 py-4 space-y-0 divide-y divide-carbon-border">
        <DataRow
          label="START"
          value={dayjs(props.date_start).format("D MMM · HH:mm")}
          mono
        />
        <DataRow
          label="END"
          value={dayjs(props.date_end).format("D MMM · HH:mm")}
          mono
        />
        <DataRow
          label="LOCATION"
          value={props.location ?? props.country_name}
        />
        <div className="flex items-center justify-between py-3">
          <span className="font-data text-[10px] tracking-[0.25em] uppercase text-muted">
            WINNER
          </span>
          {winner?.driver ? (
            <span className="font-display font-bold italic text-base uppercase text-gold tracking-wide">
              {winner.driver.full_name}
            </span>
          ) : (
            <span className="font-data text-xs text-muted-dark">—</span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 pb-5 flex justify-end">
        <ButtonRaceItem session_key={props.session_key} />
      </div>

      {/* Hover shimmer */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/[0.02] to-transparent" />
    </article>
  );
}

function DataRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 gap-4">
      <span className="font-data text-[10px] tracking-[0.25em] uppercase text-muted flex-none">
        {label}
      </span>
      <span
        className={`text-xs text-chromium text-right ${
          mono ? "font-data" : "font-display font-semibold uppercase tracking-wide"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
