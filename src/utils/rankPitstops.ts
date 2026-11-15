export type PitstopSummary = {
  key: string;
  name: string;
  imageUrl: string | null;
  pitstops: number;
  total_duration: number;
};

export type RankedPitstop = PitstopSummary & {
  barPct: number;
  totalLabel: string;
};

/** Orders drivers by total pit time, fastest first, with bar length relative to the slowest. */
export function rankPitstops(people: PitstopSummary[]): RankedPitstop[] {
  if (!people?.length) return [];
  const max = Math.max(...people.map((p) => Number(p.total_duration) || 0));
  return people
    .toSorted((a, b) => Number(a.total_duration) - Number(b.total_duration))
    .map((p) => ({
      ...p,
      barPct: max > 0 ? (Number(p.total_duration) / max) * 100 : 0,
      totalLabel: `${Number(p.total_duration).toFixed(1)} s`,
    }));
}
