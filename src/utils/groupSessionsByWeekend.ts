import { RaceItemType } from "@/types/RaceItemType";
import { Weekend } from "@/types/Weekend";

const time = (d: Date | string) => new Date(d).getTime();

function weekendKey(session: RaceItemType): string {
  if (session.meeting_key !== undefined && session.meeting_key !== null) {
    return String(session.meeting_key);
  }
  const year = session.year ?? new Date(session.date_start).getUTCFullYear();
  return `${session.location}-${year}`;
}

/** Groups sessions into race weekends, newest weekend first, sessions in running order. */
export function groupSessionsByWeekend(sessions: RaceItemType[]): Weekend[] {
  const groups = new Map<string, RaceItemType[]>();
  for (const session of sessions ?? []) {
    const key = weekendKey(session);
    groups.set(key, [...(groups.get(key) ?? []), session]);
  }

  const weekends: Weekend[] = [];
  for (const [key, list] of groups) {
    const ordered = list.toSorted((a, b) => time(a.date_start) - time(b.date_start));
    const first = ordered[0];
    const lastEnd = Math.max(...ordered.map((s) => time(s.date_end)));
    weekends.push({
      key,
      location: first.location,
      circuit_short_name: first.circuit_short_name,
      country_name: first.country_name,
      country_code: first.country_code,
      gmt_offset: first.gmt_offset,
      start: new Date(first.date_start),
      end: new Date(lastEnd),
      sessions: ordered,
    });
  }

  return weekends.toSorted((a, b) => b.start.getTime() - a.start.getTime());
}
