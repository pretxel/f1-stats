export interface CachedData {
  query: string;
  data: any;
}

/** 24-hour TTL for regular cached responses */
export const TTL_CACHE = 3600 * 24;

/** 30-second TTL for live-session status — short enough to stay current,
 *  long enough to deduplicate repeated checks within the same page render */
export const TTL_LIVE_STATUS = 30;
  