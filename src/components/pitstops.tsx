import { getPitstops } from "@/services/pitstops";
import ListPitstop from "./listPitstop";
import adaptPitstops from "@/utils/adaptPitstops";
export type PitStopProps = {
  session_key: string;
  liveMode: boolean;
};

const FETCH_INTERVAL = 20000;
export default async function PitStops(props: PitStopProps) {
  const pitstops = await getPitstops(props.session_key);
  const people = adaptPitstops(pitstops);
  let interval: any = null;

  if (props.liveMode) {
    interval = setInterval(async () => {
      console.log(`FETCH LIVE DATA -- ${new Date().getTime()}`);
    }, FETCH_INTERVAL);
  } else {
    if (interval) interval.clearInterval();
  }

  return (
    <div className="flow-root pt-10">
      <ListPitstop people={people} />
    </div>
  );
}
