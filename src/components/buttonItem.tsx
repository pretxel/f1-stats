"use client";
import { useRouter } from "next/navigation";

export default function ButtonRaceItem(props: { session_key: string }) {
  const router = useRouter();

  return (
    <button
      className="flex-none rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
      onClick={() => router.push("/session/" + props.session_key)}
    >
      Details
    </button>
  );
}
