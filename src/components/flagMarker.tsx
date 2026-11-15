import { RaceControlKind } from "@/types/FlagStrip";
import { classNames } from "@/utils/classNames";
import { KIND_FILL } from "./flagStyles";

export default function FlagMarker({ kind, label }: { kind: RaceControlKind; label: string }) {
  const neutral = kind === "info" || kind === "drs";
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden="true"
        className={classNames(
          "inline-block h-3.5 w-5 flex-none border",
          neutral ? "border-ink-soft" : "border-ink",
          KIND_FILL[kind]
        )}
      />
      <span className={classNames("text-label font-medium", neutral ? "text-ink-soft" : "text-ink")}>
        {label}
      </span>
    </span>
  );
}
