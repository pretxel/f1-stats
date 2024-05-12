import { getPitstops } from "@/services/pitstops";
import ListPitstop from "./listPitstop";

export type PitStopProps = {
  session_key: string;
};

const adatpPitstops = (pitstops: any[]) => {
  return pitstops.map((pitstop: any) => {
    return {
      key: `${pitstop.driver_number}-${pitstop.lap_number}`,
      name: pitstop.driver.full_name,
      imageUrl: pitstop.driver.headshot_url,
      lap_number: pitstop.lap_number,
      pit_duration: pitstop.pit_duration,
    };
  });
};
export default async function PitStops(props: PitStopProps) {
  const pitstops = await getPitstops(props.session_key);
  const people = adatpPitstops(pitstops);

  return (
    <div className="flow-root pt-10">
      <ListPitstop people={people} />
    </div>
  );
}
