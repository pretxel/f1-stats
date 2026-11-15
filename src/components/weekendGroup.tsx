import CountryFlag from "./countryFlag";
import { Weekend } from "@/types/Weekend";
import { formatDateRange } from "@/utils/trackTime";
import SessionRow from "./sessionRow";

type WeekendGroupProps = {
  weekend: Weekend;
  fromQuery: string;
  featured?: boolean;
};

export default function WeekendGroup({ weekend, fromQuery, featured }: WeekendGroupProps) {
  const dates = formatDateRange(weekend.start, weekend.end, weekend.gmt_offset);
  const count = weekend.sessions.length;
  const rows = (
    <ul role="list">
      {weekend.sessions.map((s) => (
        <SessionRow key={s.session_key} session={s} fromQuery={fromQuery} withWinner={featured} />
      ))}
    </ul>
  );

  if (featured) {
    const headingId = `weekend-${weekend.key}`;
    return (
      <section aria-labelledby={headingId} className="mb-12">
        <p className="flex items-center gap-2.5 text-ink-soft">
          <CountryFlag code={weekend.country_code} size="md" />
          {weekend.country_name}, {dates}
        </p>
        <h2
          id={headingId}
          className="wdth-expanded mt-3 break-words text-[2.75rem] font-extrabold leading-[0.95] tracking-tight sm:text-[4rem]"
        >
          {weekend.location}
        </h2>
        <p className="mt-2 text-ink-soft">{weekend.circuit_short_name}</p>
        <div className="mt-6 border-t-2 border-ink">{rows}</div>
      </section>
    );
  }

  return (
    <details className="group/weekend border-t border-ink">
      <summary className="grid cursor-pointer grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 px-1 py-4 hover:bg-slab sm:grid-cols-[8rem_1fr_auto]">
        <span className="wdth-condensed order-3 text-ink-soft sm:order-none">{dates}</span>
        <span className="flex min-w-0 items-center gap-3">
          <CountryFlag code={weekend.country_code} size="sm" />
          <span className="wdth-expanded truncate text-[1.5625rem] font-bold leading-tight">
            {weekend.location}
          </span>
        </span>
        <span className="order-2 flex items-center gap-3 text-ink-soft sm:order-none">
          {count} {count === 1 ? "session" : "sessions"}
          <svg
            aria-hidden="true"
            viewBox="0 0 12 12"
            className="h-3 w-3 transition-transform group-open/weekend:rotate-90 motion-reduce:transition-none"
          >
            <path d="M4 2l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.75" />
          </svg>
        </span>
      </summary>
      <div className="pb-4 pl-0 sm:pl-[calc(8rem+1.5rem)]">{rows}</div>
    </details>
  );
}
