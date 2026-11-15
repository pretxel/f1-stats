import { getPitstops } from "@/services/pitstops";
import adaptPitstops from "@/utils/adaptPitstops";
import { rankPitstops } from "@/utils/rankPitstops";
import PitstopItem from "./pitstopItem";
import EmptyState from "./emptyState";

export type PitStopProps = {
  session_key: string;
  liveMode: boolean;
};

export default async function PitStops(props: PitStopProps) {
  const ranked = rankPitstops(adaptPitstops(await getPitstops(props.session_key)));

  if (ranked.length === 0) {
    return (
      <EmptyState
        title="No pit stops"
        detail="No driver has pitted in this session. Practice and qualifying sessions usually have none recorded."
      />
    );
  }

  return (
    <section aria-labelledby="pitstops-heading">
      <h2 id="pitstops-heading" className="mb-3 text-label text-ink-soft">
        Total time in the pit lane, shortest first
      </h2>
      <ol className="border-t border-ink">
        {ranked.map((person) => (
          <PitstopItem key={person.key} person={person} />
        ))}
      </ol>
    </section>
  );
}
