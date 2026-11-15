import { Weekend } from "@/types/Weekend";

/**
 * Splits newest-first weekends into the one to feature (in progress or just
 * finished; before the season starts, the next one), upcoming weekends soonest
 * first, and earlier weekends newest first.
 */
export function splitWeekends(weekends: Weekend[], now: Date = new Date()) {
  const t = now.getTime();
  const started = weekends.filter((w) => w.start.getTime() <= t);
  const upcoming = weekends.filter((w) => w.start.getTime() > t).toReversed();
  const featured = started[0] ?? upcoming[0];
  return {
    featured,
    comingUp: upcoming.filter((w) => w !== featured),
    earlier: started.filter((w) => w !== featured),
  };
}
