import { RaceControlTypeItem } from "@/types/RaceControlItem";

export function orderRaceControl(raceControl: RaceControlTypeItem[]) {
  return raceControl.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}
