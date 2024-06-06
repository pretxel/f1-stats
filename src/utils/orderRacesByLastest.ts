import { RaceItemType } from "@/types/RaceItemType";

export function orderRacesLastest(
  races: RaceItemType[],
  filter: string = "Race",
  limit: number = 3
) {
  const raceFiltered = races.filter((race) => race.session_type === filter);

  const raceSorted = raceFiltered.sort(
    (a, b) => new Date(b.date_end).getTime() - new Date(a.date_end).getTime()
  );
  return filter && !Number.isNaN(limit)
    ? raceSorted.slice(0, limit)
    : raceSorted;
}
