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
      className="group/btn font-data text-[10px] tracking-[0.25em] uppercase font-bold px-4 py-2.5 bg-transparent border border-carbon-border text-muted hover:border-f1red hover:text-f1red transition-all duration-200 flex items-center gap-2"
      onClick={() => goSession()}
    >
      View Session
      <span className="transition-transform duration-200 group-hover/btn:translate-x-1">
        ▶
      </span>
    </button>
  );
}
