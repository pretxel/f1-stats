import { getPitstops } from "@/services/pitstops";

export type PitStopProps = {
  session_key: string;
};

// const people = [
//   {
//     name: "Leslie Alexander",
//     email: "leslie.alexander@example.com",
//     imageUrl:
//       "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
//   },
//   {
//     name: "Michael Foster",
//     email: "michael.foster@example.com",
//     imageUrl:
//       "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
//   },
//   {
//     name: "Dries Vincent",
//     email: "dries.vincent@example.com",
//     imageUrl:
//       "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
//   },
//   {
//     name: "Lindsay Walton",
//     email: "lindsay.walton@example.com",
//     imageUrl:
//       "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
//   },
//   {
//     name: "Courtney Henry",
//     email: "courtney.henry@example.com",
//     imageUrl:
//       "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
//   },
//   {
//     name: "Tom Cook",
//     email: "tom.cook@example.com",
//     imageUrl:
//       "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
//   },
// ];

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
    <div className="flow-root">
      <ul role="list" className="divide-y divide-gray-100">
        {people?.length &&
          people.map((person) => (
            <li key={person.key} className="flex gap-x-4 py-5">
              <img
                className="h-12 w-12 flex-none rounded-full bg-gray-50"
                src={person.imageUrl}
                alt=""
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-6 text-gray-900">
                  {person.name}
                </p>
                <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                  Lap number: {person.lap_number}
                </p>
                <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                  Duration: {person.pit_duration} Seconds
                </p>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
}
