import { getPitstops } from "@/services/pitstops";
import ListPitstop from "./listPitstop";
import adaptPitstops from "@/utils/adaptPitstops";
import EmptyState from "./emptyState";

export type PitStopProps = {
  session_key: string;
  liveMode: boolean;
};

export default async function PitStops(props: PitStopProps) {
  const pitstops = await getPitstops(props.session_key);
  const people = adaptPitstops(pitstops);

  if (people.length === 0) {
    return (
      <div className="max-w-2xl">
        <EmptyState
          title="No pit data"
          detail="No pit stops recorded for this session."
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <span className="font-data text-[10px] tracking-[0.3em] uppercase text-muted">
          Drivers
        </span>
        <span className="font-data text-[10px] text-muted-dark">
          {people.length}
        </span>
      </div>
      <ListPitstop people={people} />
    </div>
  );
}
