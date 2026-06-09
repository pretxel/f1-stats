# Improve UX

## Why

The app has a strong carbon/F1-red visual identity, but key UX flows are incomplete: the session detail page gives no context about which session you're viewing (no circuit name, dates, or flag — just two tabs), there's no way back to the listing except the browser button, empty data sets render blank screens, the search input is a dead control, and the Sprint session type can't be filtered. These gaps make the site feel unfinished despite the polished card design.

## What Changes

- **Session detail header**: add a hero header on `/session/[id]` showing circuit name, country flag, session type badge, start/end times, and live indicator — the session identity is currently invisible on its own page.
- **Back navigation**: add a "back to sessions" link on the session detail page that preserves the listing's filter state (year/session type).
- **Empty states**: design proper empty states for (a) home grid with no sessions for a filter/year combo, (b) race control with no events, (c) pit stops with no data — currently all render blank.
- **Sprint filter**: add `Sprint` to the session type filter tabs (data model already supports it).
- **Wire search input**: make the flag-gated search input actually filter sessions by circuit/country/location name (client-side over the loaded list), or hide it until wired — no dead controls.
- **Motion polish**: staggered card reveal on the home grid load and tab-content transitions on the detail page, consistent with the existing scroll animations in `raceControlItem`/`pitstopItem`. Respect `prefers-reduced-motion`.
- **Unified filter bar**: group year selector + session type tabs into one cohesive control bar with consistent spacing and mobile wrapping.

## Capabilities

### New Capabilities

- `session-browsing`: home page session listing — filtering by year and session type (incl. Sprint), search, empty states, and load motion.
- `session-detail`: session detail page — identity header, back navigation, tab switching between race control and pit stops, and per-tab empty states.

### Modified Capabilities

<!-- none — no existing specs in openspec/specs/ -->

## Impact

- **Components**: `raceItem.tsx`, `tabRaces.tsx`, `yearSelector.tsx`, `searchInput.tsx`, `tabs.tsx`, `raceControl.tsx`, `pitstops.tsx`; new `sessionHeader.tsx`, `emptyState.tsx`.
- **Pages**: `src/app/page.tsx`, `src/app/session/[id]/page.tsx`, `src/app/session/[id]/layout.tsx`.
- **No service/API changes** — all data needed (session metadata via `getRaces({ sessionKey })`) already fetched.
- **No new dependencies** — Tailwind animations + existing hooks; React Compiler already enabled.
