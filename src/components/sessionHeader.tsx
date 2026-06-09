import Image from "next/image";
import dayjs from "dayjs";
import { findFlagUrlByIso3Code } from "country-flags-svg";
const localizedFormat = require("dayjs/plugin/localizedFormat");
dayjs.extend(localizedFormat);
import { RaceItemType } from "@/types/RaceItemType";
import { sessionTypeLabel } from "@/utils/sessionTypeLabels";
import LiveItem from "./liveItem";
import isLiveSessionNow from "@/utils/isLiveSessionNow";

export default function SessionHeader({ race }: { race: RaceItemType }) {
  const urlImage = findFlagUrlByIso3Code(race.country_code);
  const isLive = isLiveSessionNow(
    new Date(race.date_start),
    new Date(race.date_end)
  );

  return (
    <header className="mb-8 bg-carbon-light stripe-left overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-4 p-6 pb-5">
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex-none">
            <Image
              src={urlImage !== "" ? urlImage : "/European_version.png"}
              alt={race.country_name}
              width={56}
              height={37}
              className="object-cover w-[56px] h-[37px]"
              style={{ imageRendering: "crisp-edges" }}
            />
          </div>
          <div className="min-w-0">
            <h1 className="font-display font-extrabold text-3xl italic uppercase tracking-wide text-chromium leading-tight truncate">
              {race.circuit_short_name}
            </h1>
            <p className="font-data text-[10px] text-muted tracking-widest uppercase mt-1">
              {race.location ?? race.country_name} · {race.country_name}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 flex-none">
          <span className="font-data text-[10px] font-bold tracking-[0.2em] text-carbon bg-f1red px-2 py-0.5 uppercase">
            {sessionTypeLabel(race.session_name)}
          </span>
          {isLive && <LiveItem isLiveFetching={true} />}
        </div>
      </div>

      <div className="border-t border-carbon-border px-6 py-3 flex flex-wrap gap-x-10 gap-y-2">
        <div className="flex items-center gap-3">
          <span className="font-data text-[10px] tracking-[0.25em] uppercase text-muted">
            Start
          </span>
          <span className="font-data text-xs text-chromium">
            {dayjs(race.date_start).format("D MMM · HH:mm")}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-data text-[10px] tracking-[0.25em] uppercase text-muted">
            End
          </span>
          <span className="font-data text-xs text-chromium">
            {dayjs(race.date_end).format("D MMM · HH:mm")}
          </span>
        </div>
      </div>
    </header>
  );
}
