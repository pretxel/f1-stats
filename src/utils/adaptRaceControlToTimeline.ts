import { RaceControlTypeItem } from "@/types/RaceControlItem";
import dayjs from "dayjs";
const localizedFormat = require("dayjs/plugin/localizedFormat");
dayjs.extend(localizedFormat);
const adaptRaceControlToTimeline = (raceControl: RaceControlTypeItem[]) => {
  return raceControl.map((race, index) => ({
    id: index,
    content: race.message,
    date: dayjs(race.date).format("LLLL"),
    datetime: race.date,
    href: "#",
    iconBackground: "bg-gray-400",
  }));
};

export default adaptRaceControlToTimeline;
