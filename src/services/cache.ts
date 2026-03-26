export interface CachedData {
    query: string;
    data: any;
  }

export const TTL_CACHE = 3600 * 24; // 24 hours for completed sessions
export const TTL_LIVE = 30;         // 30 seconds for live sessions
  