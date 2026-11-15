import { RaceControlTypeItem } from "@/types/RaceControlItem";
import { RaceControlClass } from "@/types/FlagStrip";
import { classifyRaceControl } from "./classifyRaceControl";
import { formatTrackTime } from "./trackTime";

export type TimelineEvent = RaceControlClass & {
  id: number;
  content: string;
  time: string;
  datetime: Date;
  lap?: number | null;
};

/** Shapes race control messages for the timeline: track-local time, marker kind and label. */
const adaptRaceControlToTimeline = (
  raceControl: RaceControlTypeItem[],
  gmtOffset?: string | null
): TimelineEvent[] =>
  raceControl.map((event, index) => ({
    id: index,
    content: event.message,
    time: formatTrackTime(event.date, gmtOffset, "HH:mm:ss"),
    datetime: event.date,
    lap: event.lap_number,
    ...classifyRaceControl(event),
  }));

export default adaptRaceControlToTimeline;
