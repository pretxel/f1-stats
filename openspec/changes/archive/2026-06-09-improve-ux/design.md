# Design — Improve UX

## Context

The app already has a committed aesthetic: carbon-dark telemetry theme, F1-red accents, Barlow Condensed display type + JetBrains Mono data type, left-stripe cards, scroll-reveal items. This change does not redesign — it completes the experience by filling UX gaps (missing session identity on detail pages, dead controls, blank empty states, absent load motion) while executing the existing design language with more precision.

Current state:
- `/session/[id]` renders `Tabs` + tab content only. Session metadata (`getRaces({ sessionKey })`) is already fetched in `page.tsx` but never displayed.
- `tabRaces.tsx` hardcodes `["Practice", "Qualifying", "Race"]` via props from `page.tsx`; `Sprint` exists in the type union and `SESSION_TYPE_LABELS`.
- `searchInput.tsx` is markup only — no state, no handler, gated behind `showSearchInput` flag.
- Empty data → blank `<ul>` on home, `0` count + nothing on race control / pit stops.
- Cards pop in with no orchestration; only `raceControlItem`/`pitstopItem` have scroll animation.

Constraints: Tailwind only, server components by default, React Compiler enabled (no manual memo), no new dependencies, pnpm.

## Goals / Non-Goals

**Goals:**
- Session detail page communicates session identity at a glance (circuit, country, type, schedule, live status).
- Every navigation is reversible in-app with filter state preserved.
- No screen ever renders blank — every empty data set gets a designed empty state.
- No dead controls — search works or is hidden.
- One well-orchestrated home-grid load reveal; reduced-motion respected.

**Non-Goals:**
- No visual rebrand, no new fonts/colors/tokens beyond the existing Tailwind theme.
- No new data fetching or service changes; no API/cache changes.
- No server-side search (client-side filter over already-loaded sessions only).
- No changes to live-session behavior or feature flag plumbing.

## Decisions

### D1: Session header as server component fed by existing fetch
`page.tsx` already calls `getRaces({ sessionKey })` — pass `race[0]` to a new `sessionHeader.tsx` server component rendered above the tabs. Header reuses the card vocabulary: country flag (via `country-flags-svg`), italic uppercase circuit name in `font-display`, session-type badge (reuse `SESSION_TYPE_LABELS` map — extract to `src/utils/sessionTypeLabels.ts` so card and header share it), `font-data` start/end times, `LiveItem` when live.

*Alternative considered*: putting the header in `session/[id]/layout.tsx`. Rejected — layout has no access to params data without a duplicate fetch; page already has the data. The `LiveItem` block currently in `page.tsx` moves into the header.

### D2: Back link preserves filters via `from` search param
`ButtonRaceItem` (the "Details" link) appends the current listing query string as `?from=<encoded qs>`; the session page's back link (`← Sessions`, top-left above header) targets `/?<decoded qs>`. Falls back to `/` when absent.

*Alternative considered*: `document.referrer` / `router.back()`. Rejected — breaks on direct links and hard refreshes; a search param is shareable and server-renderable.

### D3: One `EmptyState` component, three usages
Single server component `emptyState.tsx` with `title` + `detail` props, styled as a full-width carbon panel with a muted checkered-flag glyph (CSS-only 4×4 checker via `bg-[length]` gradient — matches the telemetry aesthetic, no image asset). Used by:
- Home grid: "NO SESSIONS" / "No {type} sessions found for {year}." with a reset-filters link to `/`.
- Race control: "NO EVENTS" / "Race control has no messages for this session."
- Pit stops: "NO PIT DATA" / "No pit stops recorded for this session."

### D4: Search filters client-side over rendered list
Convert the home session list rendering into a small client component (`sessionGrid.tsx`) receiving the ordered races array; `searchInput.tsx` becomes a controlled input writing to a `query` search param via `router.replace` (no scroll reset), and the grid filters on `circuit_short_name | country_name | location` case-insensitively. Stays behind the `showSearchInput` flag; when flag off, nothing renders (unchanged).

*Alternative considered*: keep grid server-rendered and filter via server roundtrip on `?query=`. Rejected — full server roundtrip per keystroke is poor UX for an in-memory list of ≤ a few dozen items; client filter is instant. Race cards themselves stay server-rendered children passed into the client grid (children-as-props pattern), so winner fetches stay on the server.

### D5: Sprint filter is data-only
Add `"Sprint"` to the `sessionTypes` array passed in `page.tsx`. `tabRaces.tsx` needs no change.

### D6: Motion — CSS-only staggered reveal
Home grid items get a `fade-up` keyframe animation with `animation-delay: index * 60ms` (cap at ~540ms), defined in `globals.css` under `@media (prefers-reduced-motion: no-preference)`. Tab content on detail pages gets a single 200ms fade-in on mount, same media guard. No JS animation library.

*Alternative considered*: Motion/Framer. Rejected — new dependency for an effect CSS does natively; CLAUDE.md favors minimal client JS.

### D7: Unified filter bar
Wrap `YearSelector` + `TabRaces` (+ search when flagged) in one flex container in `page.tsx` with a thin `border-b border-carbon-border` divider and consistent gap, label them with `font-data` micro-labels ("SEASON" / "SESSION"), wrap on mobile via `flex-wrap`. Both child components keep their own Suspense boundaries.

## Risks / Trade-offs

- [Client grid wraps server-rendered cards] → Children-as-props keeps winner fetches server-side, but the full card HTML for all sessions ships in the initial payload even when filtered out. Acceptable: list is small (3 per type, or one season's sessions).
- [`from` param adds URL noise] → Only appended when listing has active filters; plain `/session/123` stays clean.
- [Stagger animation on slow connections can delay perceived content] → Cap total delay at ~540ms and animate opacity/transform only; content is in DOM immediately.
- [Shared label map extraction touches `raceItem.tsx`] → Pure refactor, covered by visual check; no logic change.

## Open Questions

None blocking — all decisions resolvable within existing patterns.
