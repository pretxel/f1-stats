import Link from "next/link";
import { Suspense } from "react";
import { RaceItemType } from "@/types/RaceItemType";
import { sessionStatus } from "@/utils/sessionStatus";
import { formatTrackTime } from "@/utils/trackTime";
import LiveItem from "./liveItem";
import WinnerLabel from "./winnerLabel";

const HAS_WINNER = new Set(["Race", "Sprint"]);

type SessionRowProps = {
  session: RaceItemType;
  /** Listing query string, carried so the detail page can link back to this view. */
  fromQuery: string;
  /**
   * Look up the winner for finished Race/Sprint rows. Only the featured weekend
   * does this: OpenF1 allows 30 requests a minute, and each winner costs two.
   */
  withWinner?: boolean;
};

export default function SessionRow({ session, fromQuery, withWinner }: SessionRowProps) {
  const status = sessionStatus(session.date_start, session.date_end);
  const href = `/session/${session.session_key}${fromQuery ? `?from=${encodeURIComponent(fromQuery)}` : ""}`;
  const showWinner = withWinner && status === "done" && HAS_WINNER.has(session.session_name);

  return (
    <li className="border-t border-rule first:border-t-0">
      <Link
        href={href}
        className="group grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 px-1 py-3 hover:bg-slab sm:grid-cols-[minmax(10rem,14rem)_8rem_1fr]"
      >
        <span className="font-semibold group-hover:underline group-hover:decoration-ink group-hover:underline-offset-4">
          {session.session_name}
        </span>
        <time
          dateTime={new Date(session.date_start).toISOString()}
          className="wdth-condensed text-ink-soft sm:order-none"
        >
          {formatTrackTime(session.date_start, session.gmt_offset, "ddd D MMM, HH:mm")}
        </time>
        <span className="col-span-2 sm:col-span-1">
          {status === "live" && <LiveItem />}
          {status === "upcoming" && <span className="text-ink-soft">Upcoming</span>}
          {status === "done" &&
            (showWinner ? (
              <Suspense fallback={<span className="text-ink-soft">Done</span>}>
                <WinnerLabel sessionKey={session.session_key} />
              </Suspense>
            ) : (
              <span className="text-ink-soft">Done</span>
            ))}
        </span>
      </Link>
    </li>
  );
}
