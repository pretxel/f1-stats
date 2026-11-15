import { getWinnerByRace } from "@/services/winnerByRace";

/** "Lando NORRIS" → "Lando Norris" */
export function displayName(fullName: string): string {
  return fullName
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(" ");
}

export default async function WinnerLabel({ sessionKey }: { sessionKey: string }) {
  const winner = await getWinnerByRace(sessionKey);
  const name = winner?.driver?.full_name;
  if (!name) return <span className="text-ink-soft">Done</span>;
  return (
    <span>
      <span className="text-ink-soft">Won by </span>
      <span className="font-semibold">{displayName(name)}</span>
    </span>
  );
}
