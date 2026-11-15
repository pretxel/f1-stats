import Link from "next/link";

type EmptyStateProps = {
  title: string;
  detail: string;
  resetHref?: string;
  resetLabel?: string;
};

export default function EmptyState({ title, detail, resetHref, resetLabel }: EmptyStateProps) {
  return (
    <div className="border-l-4 border-ink bg-slab px-6 py-8">
      <p className="wdth-expanded text-xl font-bold">{title}</p>
      <p className="mt-2 max-w-prose text-ink-soft">{detail}</p>
      {resetHref && (
        <Link
          href={resetHref}
          className="mt-5 inline-block rounded-[3px] border border-ink px-3.5 py-2 font-medium hover:bg-ink hover:text-slab"
        >
          {resetLabel ?? "Clear filters"}
        </Link>
      )}
    </div>
  );
}
