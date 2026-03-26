import { Redis } from '@upstash/redis';
import { getRaces } from "./races";
import isLiveSessionNow from "@/utils/isLiveSessionNow";
import { TTL_LIVE_STATUS } from './cache';

/**
 * Returns true if the session identified by `sessionKey` is currently running.
 *
 * The result is cached in Redis for TTL_LIVE_STATUS seconds (30 s) so that
 * multiple services checking live status within the same render (pitstops,
 * raceControl, winnerByRace) share a single API call instead of each
 * triggering their own getRaces fetch.
 */
export const isSessionLive = async (sessionKey: string): Promise<boolean> => {
  const redis = Redis.fromEnv();
  const cacheKey = `live_status_${sessionKey}`;

  try {
    const cached = await redis.get<number>(cacheKey);
    if (cached !== null) {
      return cached === 1;
    }

    const races = await getRaces({ sessionKey });
    const race = races?.[0];

    const live = race
      ? isLiveSessionNow(new Date(race.date_start), new Date(race.date_end))
      : false;

    await redis.set(cacheKey, live ? 1 : 0, { ex: TTL_LIVE_STATUS });
    return live;
  } catch (error) {
    console.error("Error determining session live status", error);
    return false;
  }
};
