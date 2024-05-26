import { getPitstops } from "@/services/pitstops";
import ListPitstop from "./listPitstop";
import adaptPitstops from "@/utils/adaptPitstops";
export type PitStopProps = {
  session_key: string;
  liveMode: boolean;
};

export default async function PitStops(props: PitStopProps) {
  const pitstops = await getPitstops(props.session_key);
  const people = adaptPitstops(pitstops);

  return (
    <div className="flow-root pt-10">
      <ListPitstop people={people} />
    </div>
  );
}
