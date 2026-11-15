"use client"; // Error components must be Client Components

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="border-l-4 border-flag-red bg-slab px-6 py-8">
      <h1 className="wdth-expanded text-2xl font-bold">This page couldn’t load</h1>
      <p className="mt-2 max-w-prose text-ink-soft">
        The session data service didn’t respond or the session doesn’t exist. Try again, or go back
        to the list of sessions.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-[3px] bg-ink px-3.5 py-2 font-medium text-slab hover:bg-ink-soft"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-[3px] border border-ink px-3.5 py-2 font-medium hover:bg-concrete"
        >
          All sessions
        </Link>
      </div>
    </div>
  );
}
