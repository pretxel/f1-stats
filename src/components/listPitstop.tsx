import PitstopItem from "./pitstopItem";

export default function ListPitstop({ people }: { people: any[] }) {
  return (
    <>
      <ul role="list" className="divide-y divide-gray-100">
        {people?.length &&
          people.map((person) => (
            <PitstopItem key={person.key} person={person} />
          ))}
      </ul>
    </>
  );
}
