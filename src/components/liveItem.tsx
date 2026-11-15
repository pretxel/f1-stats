"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface LiveItemProps {
  isLiveFetching?: boolean;
}

const FETCH_INTERVAL = 5000;

export default function LiveItem({ isLiveFetching }: LiveItemProps) {
  const router = useRouter();

  useEffect(() => {
    if (!isLiveFetching) return;
    const id = setInterval(() => router.refresh(), FETCH_INTERVAL);
    return () => clearInterval(id);
  }, [router, isLiveFetching]);

  return (
    <span role="status" className="inline-flex items-center gap-2">
      <span
        aria-hidden="true"
        className="live-pulse inline-block h-2.5 w-2.5 flex-none rounded-full bg-flag-green ring-1 ring-ink"
      />
      <span className="text-label font-semibold text-ink">Live</span>
      {isLiveFetching && <span className="sr-only">, updates every few seconds</span>}
    </span>
  );
}
