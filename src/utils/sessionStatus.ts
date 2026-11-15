export type SessionStatus = "upcoming" | "live" | "done";

export function sessionStatus(
  start: Date | string,
  end: Date | string,
  now: Date = new Date()
): SessionStatus {
  const t = now.getTime();
  if (t < new Date(start).getTime()) return "upcoming";
  if (t <= new Date(end).getTime()) return "live";
  return "done";
}
