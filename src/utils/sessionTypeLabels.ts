export const SESSION_TYPE_LABELS: Record<string, string> = {
  Race: "RACE",
  Qualifying: "QUALI",
  Practice: "FP",
  Sprint: "SPR",
};

export function sessionTypeLabel(sessionName: string): string {
  return SESSION_TYPE_LABELS[sessionName] ?? sessionName.toUpperCase();
}
