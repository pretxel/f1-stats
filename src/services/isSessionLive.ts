import { getRaces } from "./races";
import isLiveSessionNow from "@/utils/isLiveSessionNow";

/**
 * Returns true if the session identified by `sessionKey` is
 * currently running.
 */
export const isSessionLive = async (sessionKey: string): Promise<boolean> => {
  try {
    const races = await getRaces({ sessionKey });
    const race = races?.[0];
    if (!race) return false;
    return isLiveSessionNow(new Date(race.date_start), new Date(race.date_end));
  } catch (error) {
    console.error("Error determining session live status", error);
    return false;
  }
};
