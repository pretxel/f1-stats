import { RaceItemType } from "@/types/RaceItemType";

export function orderRacesLastest(
  races: RaceItemType[],
  filter: string = "Race",
  limit: number = 3
) {
  const raceFiltered = races.filter((race) => race.session_type === filter);

  const raceSorted = raceFiltered.toSorted(
    (a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime()
  );
  return filter && !Number.isNaN(limit)
    ? raceSorted.slice(0, limit)
    : raceSorted;
}
