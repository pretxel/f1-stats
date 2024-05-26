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

export default async function RaceItem(props: RaceItemType) {
  const urlImage = findFlagUrlByIso3Code(props.country_code);

  const winner = await getWinnerByRace(props.session_key);

  return (
    <>
      <div className="flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 p-6">
        <Image
          src={urlImage !== "" ? urlImage : "/European_version.png"}
          alt={props.circuit_short_name}
          width={50}
          height={32}
          className="h-12 w-12 flex-none rounded-lg bg-white object-cover ring-1 ring-gray-900/10"
        />
        <div className="text-sm font-medium leading-6 text-gray-900">
          {props.circuit_short_name}
        </div>

        <div className="w-full flex justify-end">
          <div className=" text-black p-4">{props.session_name}</div>
        </div>

        {isLiveSessionNow(
          new Date(props.date_start),
          new Date(props.date_end)
        ) && <LiveItem />}
      </div>
      <dl className="-my-3 divide-y divide-gray-100 px-6 py-4 text-sm leading-6">
        <div className="flex justify-between gap-x-4 py-3">
          <dt className="text-gray-500">Start Race</dt>
          <dd className="text-gray-700">
            <time dateTime={props.date_start.toString()}>
              {dayjs(props.date_start).format("LLLL")}
            </time>
          </dd>
        </div>
        <div className="flex justify-between gap-x-4 py-3">
          <dt className="text-gray-500">End Race</dt>
          <dd className="text-gray-700">
            <time dateTime={props.date_end.toString()}>
              {dayjs(props.date_end).format("LLLL")}
            </time>
          </dd>
        </div>
        <div className="flex justify-between gap-x-4 py-3">
          <dt className="text-gray-500">Country</dt>
          <dd className="flex items-start gap-x-2">
            <div className="font-medium text-gray-900">
              {props.country_name}
            </div>
          </dd>
        </div>
        <div className="flex justify-between gap-x-4 py-3">
          <dt className="text-gray-500">Winner</dt>
          <dd className="flex items-start gap-x-2">
            <div className="font-medium text-gray-900">
              {!winner && "No winner yet"}
              {winner.driver && winner.driver.full_name}
            </div>
          </dd>
        </div>
        <div className="flex justify-between gap-x-4 py-3">
          <dd className="flex items-start gap-x-2">
            <div className="font-medium text-gray-900">
              <ButtonRaceItem session_key={props.session_key} />
            </div>
          </dd>
        </div>
      </dl>
    </>
  );
}
