"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import EmptyState from "./emptyState";

export type SessionGridMeta = {
  session_key: string;
  circuit_short_name: string;
  country_name: string;
  location: string;
};

type SessionGridProps = {
  sessions: SessionGridMeta[];
  children: React.ReactNode;
};

function matchesQuery(session: SessionGridMeta, query: string): boolean {
  return [
    session.circuit_short_name,
    session.country_name,
    session.location,
  ].some((field) => field?.toLowerCase().includes(query));
}

export default function SessionGrid({ sessions, children }: SessionGridProps) {
  const searchParams = useSearchParams();
  const query = (searchParams.get("query") ?? "").trim().toLowerCase();
  const year = searchParams.get("year");
  const sessionType = searchParams.get("sessionType");

  const cards = React.Children.toArray(children);
  const visible = cards.filter(
    (_, i) => !query || matchesQuery(sessions[i], query)
  );

  if (visible.length === 0) {
    const detail = query
      ? `No sessions match “${query}”.`
      : `No ${sessionType ?? ""} sessions found${year ? ` for ${year}` : ""}.`
          .replace(/\s+/g, " ")
          .trim();
    return (
      <EmptyState
        title="No sessions"
        detail={detail}
        resetHref="/"
        resetLabel="Reset filters"
      />
    );
  }

  let visibleIdx = 0;
  return (
    <ul role="list" className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {cards.map((card, i) => {
        if (query && !matchesQuery(sessions[i], query)) return null;
        return (
          <li
            key={sessions[i].session_key}
            className="fade-up"
            style={{ "--stagger-i": visibleIdx++ } as React.CSSProperties}
          >
            {card}
          </li>
        );
      })}
    </ul>
  );
}
