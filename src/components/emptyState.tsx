import Link from "next/link";

type EmptyStateProps = {
  title: string;
  detail: string;
  resetHref?: string;
  resetLabel?: string;
};

export default function EmptyState({
  title,
  detail,
  resetHref,
  resetLabel,
}: EmptyStateProps) {
  return (
    <div className="w-full bg-carbon-light stripe-left px-8 py-12 flex flex-col items-center text-center gap-4">
      <div
        aria-hidden="true"
        className="h-8 w-14 opacity-40 bg-[repeating-conic-gradient(#8b8b9a_0%_25%,transparent_0%_50%)] bg-[length:14px_14px]"
      />
      <div>
        <p className="font-display font-extrabold text-xl italic uppercase tracking-wide text-chromium">
          {title}
        </p>
        <p className="font-data text-xs text-muted tracking-wide mt-2">
          {detail}
        </p>
      </div>
      {resetHref && (
        <Link
          href={resetHref}
          className="font-data text-[10px] font-bold tracking-[0.25em] uppercase px-4 py-2.5 border border-carbon-border text-muted hover:border-f1red hover:text-f1red transition-all duration-200"
        >
          {resetLabel ?? "Reset filters"}
        </Link>
      )}
    </div>
  );
}
