# Improvements & New Features

This document captures concrete, actionable improvement ideas grounded in the current codebase architecture. All ideas reference actual files, services, and data fields available today.

---

## High Priority (Quick Wins)

These use existing data and infrastructure with minimal net-new work.

### 1. Individual Pit Stop Timeline per Driver

**Description:** The current `pitstops.tsx` + `adaptPitstops.ts` aggregates all stops into a single total duration per driver. Expand the pit stop view to show each individual stop for a driver — lap number, stop number, and duration — in a drill-down panel or expandable row.

**User Value:** Users can see exactly when and how long each stop was, enabling strategic analysis (e.g., undercut windows, slow stops).

**Technical Approach:**
- The raw `pit` API already returns individual stop records with `lap`, `pit_duration`, and `driver_number`. The `adaptPitstops.ts` util currently discards per-lap detail.
- Add a `PitstopDetailItem` client component with an expand/collapse toggle (Headless UI `Disclosure` is already installed via `@headlessui/react`).
- No new API calls needed — data is already fetched in `getPitstops()`.

**Estimated Complexity:** Low (1–2 days)

---

### 2. Race Control Event Categorization & Filtering

**Description:** The `race_control` API returns a `category` field on every event (see `RaceControlItem.ts`), but `adaptRaceControlToTimeline.ts` drops it entirely. Surface this field and let users filter the timeline by category (e.g., SafetyCar, Flag, DRS).

**User Value:** During a long race, users can zero in on safety car periods or flag events without scrolling through hundreds of messages.

**Technical Approach:**
- Update `adaptRaceControlToTimeline.ts` to carry the `category` field through to the adapted shape.
- Add a `CategoryFilter` client component (similar to `TabRaces`) above the timeline in `raceControl.tsx`. Use `useSearchParams` to persist the active filter.
- Color-code the dot indicator in `RaceControlItem.tsx` by category — already has an `iconBackground` stub that's set to a hardcoded `bg-gray-400`.

**Estimated Complexity:** Low (1 day)

---

### 3. Dynamic Session Metadata & Styled OG Images

**Description:** The session layout uses a static title `"Session F1"` (`src/app/session/[id]/layout.tsx`) and the OG image (`opengraph-image.tsx`) renders a plain white background with plain text. Both should reflect the actual circuit name, country, and session type.

**User Value:** Sharing a session link on social media shows meaningful, on-brand preview cards rather than a blank placeholder.

**Technical Approach:**
- Move `generateMetadata` into the session page and fetch session data (already done in `page.tsx` via `getRaces`) to populate `title` and `description` dynamically.
- Update `opengraph-image.tsx` to apply the carbon dark theme (using inline styles with `var(--carbon)` equivalent hex values since OG renders in a sandboxed edge environment) and include circuit name, country flag, and session type label.

**Estimated Complexity:** Low (half a day)

---

### 4. Fastest Pit Stop Highlight

**Description:** In the pit stops tab, visually highlight the single fastest individual stop across the session, surfacing it as a stat above the driver list.

**User Value:** Instantly answers the "who had the fastest stop?" question — a key talking point for any race.

**Technical Approach:**
- In `getPitstops()` the raw records include `pit_duration` per stop. After enrichment, find the min.
- Add a `FastestStop` server component rendered above `<ListPitstop>` in `pitstops.tsx`, displaying driver name, stop number, lap, and duration in the gold (`--gold: #ffd700`) accent colour already defined in `globals.css`.

**Estimated Complexity:** Low (half a day)

---

### 5. Functional Search / Filter on Sessions List

**Description:** `SearchInput` exists as a component (`src/components/searchInput.tsx`) and is gated behind the `showSearchInput` feature flag in `getFlags.ts`, but the input has no `onChange` handler — it renders a non-functional UI shell.

**User Value:** Lets users quickly find a circuit or country without scrolling the grid.

**Technical Approach:**
- Make `SearchInput` a proper controlled client component using `useSearchParams` + `useRouter`, filtering the sessions grid by `circuit_short_name` or `country_name` client-side (data is already loaded).
- Alternatively, pass a `?q=` query param to the server page for server-side filtering.
- Enable the flag in Edge Config to roll it out.

**Estimated Complexity:** Low (1 day)

---

### 6. Sorted Pit Stops (Fastest to Slowest Total)

**Description:** The driver list in the pit stop tab (`listPitstop.tsx`) currently reflects the order drivers appear in the API response. Sort drivers by total pit time ascending so the most efficient team is at the top, like a leaderboard.

**User Value:** Turns the pit stop list from a data dump into an immediately readable ranking.

**Technical Approach:**
- Add a `.sort((a, b) => a.total_duration - b.total_duration)` step at the end of `adaptPitstops.ts`.
- Optionally add a rank number badge to `PitstopItem.tsx`, styled with the existing `font-data` monospace class.

**Estimated Complexity:** Very Low (< 1 hour)

---

### 7. Session Year Selector

**Description:** The app hardcodes `currentYear` from `src/utils/constants.ts` (`new Date().getFullYear()`). There is no way to browse historical seasons.

**User Value:** Fans want to compare 2024 vs 2025 data, review past championship-deciding races, etc.

**Technical Approach:**
- Add a `?year=` search param to the home page alongside `?sessionType=`.
- Pass `year` through to `getRaces()` in `races.ts` (the `QUERIES` string already builds `?year=${currentYear}` — swap the constant for the param).
- Add a year picker component beside `TabRaces` in `page.tsx`.
- Cache keys in all services are keyed by year already (e.g., `racesResponse_year_${currentYear}`), so cache isolation is automatic.

**Estimated Complexity:** Low–Medium (1–2 days)

---

## Medium Priority (New Capabilities)

Features that require new service functions or moderate front-end work.

### 8. Full Session Standings / Position Tab

**Description:** The `position` API endpoint already exists and is used in `winnerByRace.ts` (querying `position<=1`). Expand it to fetch all positions for a session and display a full finishing order table.

**User Value:** The #1 most requested view for any race — the race result.

**Technical Approach:**
- Add a new `getPositionsBySession(sessionKey)` service in `src/services/positions.ts`, fetching `position?session_key=${sessionKey}` and grouping by `driver_number`, taking the last recorded position for each driver.
- Add a third tab "Results" to the `tabs` array in `tabs.tsx`.
- Create a `Results` server component and a `DriverPositionItem` client component with position badge, driver number, name, and team colour if available.
- Cache with the same Redis + live-bypass pattern used in `raceControl.ts`.

**Estimated Complexity:** Medium (2–3 days)

---

### 9. Driver Profile Page

**Description:** Driver data is fetched frequently (`getDriver` is called per driver in `pitstops.ts` and `winnerByRace.ts`) but only used inline. Build a `/driver/[number]` route that shows a driver's profile: name, team, country, headshot, and their pit stop history across the current season.

**User Value:** Adds depth — users can explore their favourite driver's performance across all sessions.

**Technical Approach:**
- The `drivers` API supports `?driver_number=` already, returning `full_name`, `headshot_url`, `team_name`, `team_colour`, `country_code`, `name_acronym`.
- Create `src/app/driver/[number]/page.tsx` as a Server Component. Fetch the driver from `getDriver(number)` and all sessions from `getRaces({})`, then cross-reference pit stop data to show recent sessions participated in.
- Link to driver profiles from `PitstopItem.tsx` and the winner row in `RaceItem.tsx`.

**Estimated Complexity:** Medium (2–3 days)

---

### 10. Race-to-Race Pit Stop Comparison Chart

**Description:** A bar or line chart comparing total pit stop time across all races in the season, for all drivers or a selected driver.

**User Value:** Shows how pit strategy performance evolved over the season — a compelling data viz for fans and analysts.

**Technical Approach:**
- No new API endpoints needed. Call `getPitstops()` for each session key from `getRaces()`.
- Add a charting library (e.g., `recharts` or `chart.js`) — currently none installed.
- Render a client component at `/driver/[number]?chart=pitstops` or as a new `/season/stats` page.
- Be mindful of rate limiter (3 req/s, 30 req/min) in `rateLimiter.ts` when batch-fetching across many sessions — use `Promise.all` with concurrency control.

**Estimated Complexity:** Medium–High (3–4 days)

---

### 11. "Next Race" Countdown Widget

**Description:** Display a countdown timer to the next scheduled session on the home page, derived from upcoming sessions already returned by the `sessions` API.

**User Value:** Keeps fans engaged between races — the home page becomes a regular destination, not just a post-race data dump.

**Technical Approach:**
- `getRaces()` returns `date_start` for all sessions. Filter for sessions in the future and sort ascending to find the next one.
- Create a `NextRace` client component that calculates remaining time client-side using `useEffect` and `dayjs` (already installed).
- Render it in `page.tsx` above the tab filters as a persistent banner.

**Estimated Complexity:** Low–Medium (1–2 days)

---

### 12. Live Session Position Tracker (Real-Time Leaderboard)

**Description:** For live sessions, show a live timing tower with current positions updating every 5 seconds. This is the motorsport equivalent of a live scoreboard.

**User Value:** The killer feature for live race viewing — turning this into a companion app during race weekends.

**Technical Approach:**
- The `position` API can be polled for live data (the live bypass is already implemented in `isSessionLive.ts`).
- The existing `LiveItem` component already polls via `router.refresh()` every `FETCH_INTERVAL = 5000ms`. Extend this pattern with a new `LiveLeaderboard` client component.
- Add a "Leaderboard" tab (tab index 3) in `tabs.tsx`, only rendered when `isLiveMode` is true in `page.tsx`.
- Position changes (up/down vs previous poll) can be tracked in local component state.

**Estimated Complexity:** Medium (2–3 days)

---

### 13. Team-Grouped Pit Stops View

**Description:** The driver API returns `team_name` and `team_colour` fields. Group pit stop results by constructor and show total stops and cumulative time per team.

**User Value:** Answers "which team had the best pit wall performance?" — a key strategic dimension.

**Technical Approach:**
- Update `adaptPitstops.ts` (or add a sibling `adaptPitstopsByTeam.ts`) to group by `team_name` from the enriched driver data.
- Add a toggle in `pitstops.tsx` (Drivers / Teams) using a `useSearchParams` approach, matching the existing `TabRaces` pattern.

**Estimated Complexity:** Medium (1–2 days)

---

## Low Priority / Future Vision

Ambitious ideas requiring new data sources or significant engineering.

### 14. Multi-Year Historical Comparison Page

**Description:** A dedicated `/compare` route where users can overlay the same circuit across different years — pit stops, race control events, race results.

**User Value:** Deep statistical analysis for fans and motorsport journalists.

**Technical Approach:**
- Requires fetching `sessions?year=X&circuit=Y` for multiple years. The API supports `year=` already; add `circuit_short_name` filtering or filter client-side.
- Build a comparison layout with two data columns, one per year, using the existing card/timeline components.
- Complexity grows with the number of years supported.

**Estimated Complexity:** High (1–2 weeks)

---

### 15. Push Notifications for Live Sessions

**Description:** Allow users to subscribe to push notifications when a tracked session goes live.

**User Value:** Race fans don't have to remember to check — they get notified at session start.

**Technical Approach:**
- Requires a Web Push implementation (service worker, VAPID keys) and a Vercel Cron Job to check `isSessionLive()` periodically and dispatch notifications.
- Vercel KV (or Upstash Redis already in use) can store subscription endpoints.
- This is a significant infrastructure addition outside the current scope.

**Estimated Complexity:** Very High (1–2 weeks)

---

### 16. Telemetry Visualisation (Speed / Throttle / Brake)

**Description:** If the data API exposes car data (speed, throttle, brake, gear), build a lap telemetry chart for a selected driver.

**User Value:** The gold standard of F1 data apps — used by every serious fan and pundit.

**Technical Approach:**
- OpenF1 exposes a `car_data` endpoint with `speed`, `throttle`, `brake`, `drs`, and `n_gear` fields per driver per sample.
- Add a `getCarData(sessionKey, driverNumber, lap)` service following the same Redis cache + rate-limiter pattern.
- Render using a line chart (recharts or similar). The data volume is large so sampling or lazy-loading per lap is necessary.

**Estimated Complexity:** Very High (2–3 weeks)

---

### 17. Weather During Session

**Description:** Overlay session weather data (air/track temperature, humidity, rainfall flag) alongside race control events on the timeline.

**User Value:** Context for interpreting strategy decisions — a rain flag event hits differently when you can see the conditions that caused it.

**Technical Approach:**
- OpenF1 exposes a `weather` endpoint per `session_key`.
- Add a `getWeatherBySession(sessionKey)` service and merge weather snapshots into the race control timeline using matching timestamps.
- Render weather badges in `RaceControlItem.tsx` at matching time intervals.

**Estimated Complexity:** Medium–High (3–5 days)

---

### 18. Embedded Social / Commentary Feed

**Description:** A curated real-time commentary panel (e.g., via a public feed or user-submitted reactions) alongside the race control timeline.

**User Value:** Community watch-along experience — F1 fans are intensely social during races.

**Technical Approach:**
- Would require an external service (e.g., Supabase Realtime, Pusher, or a new API route with Server-Sent Events) and authentication.
- Far outside the current stateless RSC + Redis architecture; significant scope increase.

**Estimated Complexity:** Very High (3–4 weeks)

---

## Performance & Technical Improvements

### 19. Per-Item Redis Key Strategy for Race Control

**Description:** `getRaceControlBySession` caches the entire race control array under one Redis key. A session with hundreds of events stores and retrieves a large blob. For live sessions, this is re-fetched every 5 seconds from the API with zero caching.

**File:** `src/services/raceControl.ts`

**Fix:** For live sessions, implement an append-only cache strategy — store event count and only fetch events newer than the latest cached timestamp using a `date>` query param if the API supports it. For non-live sessions, the current approach is fine.

---

### 20. Sequential Driver Fetches in getPitstops

**Description:** `getPitstops` in `src/services/pitstops.ts` fetches each unique driver with a `for...of` loop (sequential `await`). With 20 drivers, this can add hundreds of milliseconds of serial latency.

**Fix:** Replace with `Promise.all(uniqueDriverNumbers.map(n => getDriver(n)))` to fetch all drivers in parallel. The rate limiter in `rateLimiter.ts` already handles burst limiting so this is safe to do.

---

### 21. Type-Safe API Response Shapes

**Description:** Service functions return `any` throughout — `pitstops.ts` uses `PitstopData` with `[key: string]: any`, `driver.ts` returns untyped data, and `adaptPitstops.ts` accepts `any[]`. The `RaceControlItem.ts` type is minimal (missing `driver_number`, `flag`, `scope`, `lap_number` fields the API likely returns).

**Fix:** Add typed interfaces for all API response shapes in `src/types/`. Use these in service functions as return types to get compile-time safety and better IDE completion. This also enables catching the `adaptRaceControlToTimeline` dropping of `category` at the type level.

---

### 22. In-Memory Rate Limiter is Not Cloudflare-Safe

**Description:** `src/services/rateLimiter.ts` stores `timestamps` in a module-level array. Cloudflare Workers are isolated per-request (no shared memory between requests), so this rate limiter has no effect in production on Cloudflare Workers and only works locally.

**Fix:** Move rate limiting state to Redis (e.g., an Upstash sliding window counter) or use Upstash's `@upstash/ratelimit` package, which is purpose-built for this pattern and works in edge/serverless environments.

---

### 23. Cache Key Collision Risk

**Description:** In `races.ts`, when `sessionType` is provided, the Redis key is `racesResponse_session_type_${sessionType}`. This key holds all sessions of that type for the current year, but the key does not include the year. If the year rolls over during a 24h cache window, stale data from the prior year is served.

**Fix:** Include `currentYear` in all cache keys: `racesResponse_year_${currentYear}_session_type_${sessionType}`.

---

### 24. Error Boundaries for Individual Cards

**Description:** If `getWinnerByRace()` throws (e.g., the position API is temporarily unavailable), the entire home page server render fails because the error propagates through the RSC tree in `raceItem.tsx`. Currently there is only one top-level `error.tsx`.

**Fix:** Wrap each `RaceItem` in a per-card Suspense + error boundary so a single failing card degrades gracefully while the rest of the grid renders.

---

## UX & Design Improvements

### 25. Team Colour Accent per Driver

**Description:** The drivers API returns `team_colour` as a hex string. Use it as the left-border stripe colour on `PitstopItem.tsx` instead of the uniform carbon border, and as the avatar background. This mirrors how real F1 timing towers are colour-coded.

**File:** `src/components/pitstopItem.tsx`

---

### 26. Animated Live Ticker for Race Control Events

**Description:** For live sessions, new race control messages currently appear only after `router.refresh()`. They pop in abruptly. Add a slide-in entrance animation (currently items use `opacity + translate-y` via `useIsVisible` — extend this to new-event detection) so fresh messages visually announce themselves.

**File:** `src/components/raceControlItem.tsx`, `src/components/liveItem.tsx`

---

### 27. Mobile-First Card Layout Improvements

**Description:** The home page grid is `grid-cols-1 lg:grid-cols-3`. On medium screens (tablets), it stays single-column which wastes horizontal space. Session detail tabs collapse to a `<select>` on mobile but the tab bar has no visual state indicator on desktop beyond an underline.

**Fix:** Add `md:grid-cols-2` to the sessions grid. Enhance the tab active state with a subtle background fill, not just the red underline, for better affordance.

---

### 28. Skeleton Loader Polish

**Description:** `src/utils/skeletons.tsx` and `skeleton2.tsx` exist but appear unused — the actual loading skeletons are inlined in `page.tsx` and `session/[id]/layout.tsx`. The inline skeletons are generic rectangles.

**Fix:** Create purpose-built skeleton components matching the actual card layout (two-column data rows, image placeholder for flag, winner row), reducing visual layout shift when data loads.

---

### 29. Improved Empty State

**Description:** When `racesOrdered?.length > 0` is false on the home page, nothing renders — no message, no illustration. A user filtering by "Sprint" with no sprint sessions in the current year sees a blank page.

**File:** `src/app/page.tsx` line 74

**Fix:** Add an `EmptyState` component with a contextual message: "No Sprint sessions found for {currentYear}" along with a button to reset the filter.

---

### 30. Keyboard Shortcuts for Tab Navigation

**Description:** Power users and accessibility tools benefit from keyboard navigation. The tab switch in `tabs.tsx` uses `<Link>` which is accessible, but the session-type filter in `TabRaces.tsx` uses `<button>` with `router.push` — arrow key navigation between options is not implemented.

**Fix:** Add `role="tablist"` / `role="tab"` ARIA semantics and `onKeyDown` handlers for left/right arrow keys on `TabRaces`, following the WAI-ARIA tab pattern. Headless UI (`@headlessui/react`, already installed) has a `Tab` component that handles this automatically.
