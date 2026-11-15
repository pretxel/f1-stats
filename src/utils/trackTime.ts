import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

type DateInput = Date | string;

/** "-03:00:00" → -180. Missing or malformed offsets count as UTC. */
export function parseGmtOffset(offset?: string | null): number {
  const match = /^([+-])?(\d{1,2}):(\d{2})/.exec(offset ?? "");
  if (!match) return 0;
  const sign = match[1] === "-" ? -1 : 1;
  return sign * (Number(match[2]) * 60 + Number(match[3]));
}

/** Formats an instant in the circuit's local time. */
export function formatTrackTime(
  date: DateInput,
  gmtOffset: string | null | undefined,
  format: string
): string {
  return dayjs.utc(date).utcOffset(parseGmtOffset(gmtOffset)).format(format);
}

/** "1–3 Nov", "31 Oct – 2 Nov" or "3 Nov", in circuit local time. */
export function formatDateRange(
  start: DateInput,
  end: DateInput,
  gmtOffset?: string | null
): string {
  const offset = parseGmtOffset(gmtOffset);
  const a = dayjs.utc(start).utcOffset(offset);
  const b = dayjs.utc(end).utcOffset(offset);
  if (a.format("YYYY-MM-DD") === b.format("YYYY-MM-DD")) return a.format("D MMM");
  if (a.format("YYYY-MM") === b.format("YYYY-MM")) {
    return `${a.format("D")}–${b.format("D MMM")}`;
  }
  return `${a.format("D MMM")} – ${b.format("D MMM")}`;
}
