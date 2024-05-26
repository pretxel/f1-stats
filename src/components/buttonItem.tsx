"use client";
import { useRouter } from "next/navigation";

export default function ButtonRaceItem(props: { session_key: string }) {
  const router = useRouter();

  const goSession = () => {
    window.scrollTo(0, 0);
    router.push("/session/" + props.session_key);
  };

  return (
    <button
      className="transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 hover:bg-indigo-500 duration-300 flex-none rounded-md bg-indigo-400 px-3.5 py-2.5 text-sm font-semibold  shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 text-black"
      onClick={() => goSession()}
    >
      Details
    </button>
  );
}
