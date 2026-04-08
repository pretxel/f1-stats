# IMPROVEMENTS.md — F1 Stats

Analysis based on actual code review of the full codebase.
Framework: Next.js 16 / React 19 / TypeScript (strict) / Tailwind CSS / Cloudflare Workers.

---

## 1. UX / UI

### 1.1 Pitstop list not sorted — `src/utils/adaptPitstops.ts`

`adaptPitstops()` returns drivers in raw API response order — whatever the API happens to return. The pit stop tab has no meaningful ordering.

**Fix:** Sort the final `DriverPitstops[]` array by `total_duration` ascending (fastest team strategy first). One line change at the end of `adaptPitstops.ts`:

```ts
return result.sort((a, b) => Number(a.total_duration) - Number(b.total_duration));
```

Since `total_duration` is already a decimal string produced by `big.ts`, this conversion is safe.

---

### 1.2 Fastest stop callout card is missing — `src/components/pitstops.tsx`

There is no summary card above the driver list. A "Fastest pit stop" badge (driver name + duration) would answer the most common question about pit stop data at a glance.

**Fix:** After `adaptPitstops()`, scan the raw pitstop array (already in memory) for `Math.min(...pitstops.map(p => p.pit_duration))`, then render a highlighted callout `<div>` at the top of `pitstops.tsx` before `<ListPitstop>`. No new API call needed — data is already fetched.

---

### 1.3 Race Control category field is silently dropped — `src/utils/adaptRaceControlToTimeline.ts`

`adaptRaceControlToTimeline()` maps `RaceControlTypeItem[]` to `TimelineItem[]` but never carries the `category` field through. The `iconBackground` field is hardcoded to `"bg-gray-400"` for every event type:

```ts
// line ~18 in adaptRaceControlToTimeline.ts
iconBackground: "bg-gray-400",
```

The raw API returns useful categories: `SafetyCar`, `Flag`, `DRS`, `Other`.

**Fix (two steps):**
1. Add `category` to `TimelineItem` type and carry it through the adapter.
2. In `raceControlItem.tsx`, map category → color:
   - `SafetyCar` → `bg-yellow-500`
   - `Flag` → `bg-red-500` / `bg-green-500` depending on message content
   - `DRS` → `bg-blue-500`
   - default → `bg-gray-400`

---

### 1.4 `searchInput.tsx` is completely non-functional

`src/components/searchInput.tsx` renders a styled `<input>` with no `onChange` handler and no logic. It is gated behind the `showSearchInput` feature flag but does nothing when typed into.

**Fix:** Implement as a controlled client component that writes to a `?q=` URL param via `useSearchParams` + `useRouter`. In `src/app/page.tsx`, filter the races array before rendering based on `searchParams.get('q')`, matching against `circuit_short_name`, `country_name`, or `location` fields — all of which are available on `RaceItemType`.

---

### 1.5 Session OG image is a blank white card — `src/app/session/[id]/opengraph-image.tsx`

The session-level OG image renders a plain white background with plain black text "F1 Stats". It does not reflect the actual session. When sharing a session link on messaging apps, the preview card is meaningless.

**Fix:** Update `opengraph-image.tsx` to:
- Accept the `[id]` route segment and call `getRaces({ sessionKey: id })`
- Apply the carbon dark theme (inline hex values — `#0C0C0E` bg, `#E10600` accent, `#F0F0F0` text) because OG rendering runs in a sandboxed edge context without CSS
- Show circuit name, country, session type label, and date range

---

### 1.6 Session page `<title>` is always "Session F1" — `src/app/session/[id]/layout.tsx`

The session layout hardcodes the page title:

```ts
// src/app/session/[id]/layout.tsx
export const metadata = { title: "Session F1" };
```

Every session tab shows the same browser tab title regardless of the actual circuit.

**Fix:** Move `generateMetadata` into `src/app/session/[id]/page.tsx` (which already fetches session data via `getRaces()`) and build a dynamic title:

```ts
export async function generateMetadata({ params }) {
  const sessions = await getRaces({ sessionKey: params.id });
  const s = sessions[0];
  return { title: `${s.circuit_short_name} ${s.session_type} — F1 Stats` };
}
```

---

### 1.7 Error boundary is a generic "Try again" screen — `src/app/error.tsx`

`error.tsx` logs to console and shows a single "Try again" button with no context about what failed. In a real session detail, the user does not know if it is the Race Control, the Pit Stops, or the session metadata that errored.

**Fix:** Add per-component `error.tsx` boundaries for the two parallel data paths (`raceControl.tsx` + `pitstops.tsx`). Each can display a message specific to its data type (e.g., "Race control data unavailable"). The root `error.tsx` can remain as a global fallback.

---

### 1.8 `switchSessionType.tsx` component is unused dead code — `src/components/switchSessionType.tsx`

This file exists, is never imported anywhere in the project, and duplicates the functionality of `tabRaces.tsx`.

**Fix:** Delete the file. It adds noise and could cause confusion about which component to extend if session type filtering needs updating.

---

## 2. Performance

### 2.1 `raceItem.tsx` fires N parallel requests but there is no deduplication at the render level

`src/components/raceItem.tsx` is an async server component called once per race card in `app/page.tsx`. Each instance independently calls:
- `getWinnerByRace(session_key)` — which in turn calls `getDriver(driver_number)`
- `isSessionLive(session_key)` (via `isLiveSessionNow`)

When the home page renders 3 race cards (default limit), 3 parallel `getWinnerByRace` calls go out. With a large `year=ALL` query showing many more sessions, this becomes a problem.

**Fix:** Because `getWinnerByRace` and `getDriver` already store results in Redis with a 24h TTL, subsequent renders are fast. But the real fix is to deduplicate via React's built-in `cache()` wrapper (available in Next.js 14+):

```ts
// src/services/winnerByRace.ts
import { cache } from 'react';
export const getWinnerByRace = cache(async (sessionKey: string) => { ... });
```

Same pattern for `getDriver()` and `isSessionLive()`.

---

### 2.2 Driver headshots use unspecified `width`/`height` — `src/components/pitstopItem.tsx`

```tsx
// pitstopItem.tsx
<Image src={person.imageUrl} alt={person.name} ... />
```

The `<Image>` in `pitstopItem.tsx` is missing explicit `width` and `height` props. Next.js Image requires these for server-side rendering to reserve layout space and avoid Cumulative Layout Shift (CLS). Without them, the image causes a runtime warning in development and potential CLS in production.

**Fix:** Add `width={48} height={48}` (matching the `w-12 h-12` Tailwind classes already on the element). Also ensure the image domain for driver headshots (`www.formula1.com`) remains in `next.config.js` `remotePatterns`.

---

### 2.3 React Compiler is enabled experimentally but `useMemo`/`useCallback` are still manually used in places

`next.config.js` enables `babel-plugin-react-compiler: 1.0.0`. The React Compiler auto-memoizes components, making manual `useMemo`/`useCallback` redundant. A quick scan shows no direct violations in the current codebase, but `@million/lint` is also listed as a dependency (version `1.0.14`) for performance linting and is not currently configured with rules in `.eslintrc.json`.

**Fix:** Add `@million/lint` to the ESLint config so it actively catches un-memoized renders during development:

```json
// .eslintrc.json
{
  "plugins": ["million"],
  "rules": { "million/compiler-rule": "warn" }
}
```

---

### 2.4 Live refresh interval is hardcoded to 5s without any termination logic — `src/components/liveItem.tsx`

```ts
// liveItem.tsx
const FETCH_INTERVAL = 5000;
useEffect(() => {
  const interval = setInterval(() => router.refresh(), FETCH_INTERVAL);
  return () => clearInterval(interval);
}, []);
```

The interval is always 5s regardless of session context. There is no logic to stop refreshing when `isLiveFetching` becomes false (i.e., when the session ends). The `clearInterval` in the cleanup runs only when the component unmounts, not when the live status changes.

**Fix:** Add `isLiveFetching` to the `useEffect` dependency array and wrap the interval creation in a condition:

```ts
useEffect(() => {
  if (!isLiveFetching) return;
  const interval = setInterval(() => router.refresh(), FETCH_INTERVAL);
  return () => clearInterval(interval);
}, [isLiveFetching, router]);
```

---

### 2.5 Country flag library fetches all flag data on every session card render — `src/components/raceItem.tsx`

```ts
// raceItem.tsx
import { getCountryFlagSvg } from 'country-flags-svg';
```

`country-flags-svg` is a 2.0.0-beta.1 package that bundles all country SVG paths. The import is a server component, so it does not bloat the client bundle — but it executes on every server render of every `raceItem`. The `public/European_version.png` fallback suggests this has had reliability issues.

**Fix:** Precompute and store the flag SVG at build time (or in a constant lookup map) rather than calling the library on each render. Alternatively, replace with a CDN-based country flag (e.g., `https://flagcdn.com/w40/${country_code.toLowerCase()}.png`) and add `flagcdn.com` to `next.config.js` `remotePatterns`. This eliminates the package dependency entirely.

---

### 2.6 `next.config.js` image minimum cache TTL is set to 60 seconds

```js
// next.config.js
images: { minimumCacheTTL: 60 }
```

Driver headshots and circuit images do not change during a season. A 60-second cache TTL causes unnecessary revalidations.

**Fix:** Increase `minimumCacheTTL` to at least `86400` (24h) to match the Redis data cache, or to `31536000` (1 year) for truly static assets like driver headshots.

---

## 3. New Functionality

### 3.1 Expand individual pit stop timeline per driver

`adaptPitstops.ts` groups all stops into a single `total_duration` per driver and discards the per-lap detail. The raw data from `getPitstops()` includes `lap_number`, `pit_duration`, and `stop_number` for every individual stop — this is never surfaced in the UI.

**Fix:** The `getPitstops()` service already returns the full detail. `adaptPitstops.ts` should retain individual stop records in a nested array. Add a `PitstopDetailItem` client component using the `<Disclosure>` from `@headlessui/react` (already installed) to show/hide per-stop breakdown on tap.

---

### 3.2 Race Control category filter bar

As noted in section 1.3, the `category` field is dropped. Beyond the color coding fix, a filter bar above the RC timeline would let users see only `SafetyCar` events, `Flag` events, etc. — valuable during long Grands Prix with 50+ messages.

**Implementation:** Same pattern as `tabRaces.tsx` — a client component reading `useSearchParams`, writing `?rcCategory=X` to the URL, and filtering in the server component on the next navigation.

---

### 3.3 Session comparison view (same circuit, different years)

The `getRaces({ sessionType, year })` service can already be called with multiple parameters. A "Compare to previous year" link on any session card would load the same circuit session from `year - 1` and display both sessions side by side (winner, fastest pit stop, key RC events).

**Implementation:** Add a `/compare/[sessionA]/[sessionB]` route. Both `getRaces` calls reuse the existing Redis cache, so no new API plumbing is needed.

---

### 3.4 Driver standings tab

The `position` endpoint (`position?session_key=X`) is already called for the race winner (`getWinnerByRace`). Fetching all positions and showing a finishing order table would be a natural addition to the session detail view as a third tab.

**Implementation:** Add `src/services/positions.ts` following the same cache pattern as `pitstops.ts`. Add a tab option 3 in `tabs.tsx`. No new infrastructure required.

---

### 3.5 Meeting-level aggregation (all sessions in one Grand Prix)

The OpenF1 API returns `meeting_key` on every session. Currently the home page lists individual sessions (Practice 1, Practice 2, Qualifying, Race) as separate cards. Grouping them under their `meeting_key` (e.g., "Monaco Grand Prix 2025") with nested expansion would reduce clutter.

**Implementation:** After `getRaces()`, group results by `meeting_key`. Each group becomes a collapsible card (`<Disclosure>` from Headless UI) listing all sessions. `meeting_key` is already present on `RaceItemType`.

---

## 4. Code & Architecture

### 4.1 `orderRacesByLastest.ts` — typo in filename and function name

The file is named `orderRacesByLastest.ts` (missing an 'e') and the function is `orderRacesLastest` — a typo that also appears in `CLAUDE.md` and `app/page.tsx`. This is a minor but real naming inconsistency that would confuse contributors searching for "latest".

**Fix:** Rename to `orderRacesByLatest.ts` / `orderRacesLatest`. Update all import paths: `app/page.tsx` and `src/utils/__tests__/orderRacesByLatest.test.ts`.

---

### 4.2 Duplicate button/filter styling across three components

`tabRaces.tsx`, `yearSelector.tsx`, and `tabs.tsx` all contain nearly identical active/inactive button Tailwind class logic:

```tsx
// Repeated pattern across all three
classNames(
  isActive ? "bg-f1red text-white border-f1red" : "bg-carbon-mid text-muted border-carbon-border",
  "px-3 py-1 text-sm font-bold rounded border transition-colors cursor-pointer"
)
```

**Fix:** Extract a `FilterButton` compound component in `src/components/filterButton.tsx` that accepts `isActive: boolean` and `label: string`. All three filter components can delegate rendering to it. This is a small, safe refactor with no behavior change.

---

### 4.3 `getFlags.ts` returns a hardcoded `showSearchInput` that is not backed by any flag definition

`src/app/getFlags.ts` resolves `showSearchInput` from the decrypted cookie:

```ts
return { showSearchInput: overrides?.showSearchInput ?? false };
```

But `src/flags/index.ts` only defines `showSummerSale`. There is no `showSearchInput` flag definition, meaning there is no way to toggle it from the Vercel flags UI. The cookie value can only be set manually.

**Fix:** Add a proper `showSearchInput` flag definition in `src/flags/index.ts`:

```ts
export const showSearchInput = flag({
  key: "show-search-input",
  decide: async () => (await get("show-search-input")) ?? false,
});
```

Then update `getFlags.ts` to use `showSearchInput.decide()` instead of reading the cookie directly.

---

### 4.4 `big.ts` — `add()` function does not handle edge cases

```ts
// src/utils/big.ts
export function add(a: number | string, b: number | string): number
```

The function uses BigInt arithmetic to avoid floating-point drift. However, it does not guard against:
- `NaN` inputs (e.g., if `pit_duration` is missing from the API response)
- Empty string inputs (which `BigInt("")` would throw on)
- Negative values (valid in theory but untested)

**Fix:** Add input validation at the top of `add()`:

```ts
if (isNaN(Number(a)) || isNaN(Number(b))) return 0;
```

And add test cases to `src/utils/__tests__/big.test.ts` covering these inputs.

---

### 4.5 `cache.ts` — TTL constants are not typed

```ts
// src/services/cache.ts
export const TTL_CACHE = 86400;
export const TTL_LIVE_STATUS = 30;
```

These are plain numbers with no units annotation. A developer new to the codebase cannot tell if `86400` is seconds, milliseconds, or minutes without reading the Upstash Redis documentation.

**Fix:** Add inline comments or rename to `TTL_CACHE_SECONDS` / `TTL_LIVE_STATUS_SECONDS`. Also consider a typed constant object:

```ts
export const TTL = {
  SESSION_DATA_S: 86_400,   // 24 hours
  LIVE_STATUS_S: 30,        // 30 seconds — shared dedup window
} as const;
```

---

### 4.6 `src/utils/skeletons.tsx` and `skeleton2.tsx` — parallel skeleton files with no naming convention

Two separate skeleton files exist:
- `skeletons.tsx` → `LoadingSkeleton`
- `skeleton2.tsx` → `LoadingSkeletonMain`

The naming "skeleton2" is opaque. It is unclear which to use where without reading both.

**Fix:** Rename `skeleton2.tsx` to `skeletonCard.tsx` and export `LoadingSkeletonCard`. Co-locate both in a `src/components/skeletons/` directory or merge into a single `src/utils/skeletons.tsx` with named exports.

---

### 4.7 `rateLimiter.ts` — Redis singleton may leak connections on Cloudflare Workers

```ts
// src/services/rateLimiter.ts
let redisClient: Redis | null = null;
function getRedisClient() {
  if (!redisClient) redisClient = new Redis({ ... });
  return redisClient;
}
```

This module-level singleton works correctly in long-lived Node.js processes but can behave unexpectedly on Cloudflare Workers, where isolates are periodically recycled and the singleton may reference a stale connection. `@upstash/redis` uses the REST API (stateless HTTP), so this is low risk today — but the pattern is architecturally fragile.

**Fix:** Since `@upstash/redis` REST clients are stateless, the singleton provides no real benefit (there is no persistent TCP connection). Simplify to instantiate the client per request or at module level without the lazy singleton wrapper.

---

## 5. Testing

### 5.1 Zero component tests — all 13 tests cover services and utils only

The test suite (`pnpm test`) covers:
- All 6 service functions (`races`, `pitstops`, `raceControl`, `driver`, `winnerByRace`, `isSessionLive`)
- All 6 utility functions

There are no tests for any component in `src/components/`. Client components with interactivity (`tabs.tsx`, `tabRaces.tsx`, `yearSelector.tsx`, `liveItem.tsx`) have zero test coverage.

**Fix (priority order):**
1. `liveItem.tsx` — test that `router.refresh()` is called every 5s when `isLiveFetching=true`, and not called when `false`. Use `jest.useFakeTimers()`.
2. `tabs.tsx` — test that navigating to `?selectedTab=2` renders the Pit Stops label as active.
3. `tabRaces.tsx` — test that `?sessionType=Race` activates the Race button.

Tools already available: Jest 29, `@swc/jest`. Add `@testing-library/react` and `@testing-library/user-event` as dev dependencies.

---

### 5.2 No E2E or smoke tests for the Cloudflare Workers deployment

The app deploys to Cloudflare Workers via OpenNext. There are no E2E tests that verify the deployed build renders correctly. If the `open-next.config.ts` wrapping breaks (e.g., after a Next.js or OpenNext upgrade), no automated check would catch it before users see a blank page.

**Fix:** Add a minimal Playwright or Puppeteer smoke test that:
1. Hits the production URL (or `wrangler dev` local URL)
2. Asserts the session list is rendered
3. Navigates to one session detail and asserts Race Control or Pit Stops are present

Run this test in CI after `wrangler deploy`.

---

### 5.3 `adaptRaceControlToTimeline.test.ts` does not test the `category` field

The existing test for `adaptRaceControlToTimeline` validates date formatting and message content but does not assert on `iconBackground` or `category`. After fixing section 1.3 (adding category to the adapter), there is no test to prevent a regression.

**Fix:** Add a test case asserting that input `category: "SafetyCar"` produces `iconBackground: "bg-yellow-500"` in the output.

---

## 6. SEO

### 6.1 Home page `<title>` and `<description>` are generic — `src/app/layout.tsx`

```ts
// src/app/layout.tsx
export const metadata = {
  title: "F1 Stats",
  description: "F1 Stats"
};
```

Both title and description are identical single-word strings. This is the metadata search engines index.

**Fix:**
```ts
export const metadata = {
  title: "F1 Stats — Formula 1 Session Data",
  description: "Race control timelines, pit stop durations, and live session tracking for every Formula 1 session.",
  openGraph: {
    type: "website",
    siteName: "F1 Stats",
  }
};
```

---

### 6.2 Session pages have no structured data (JSON-LD)

Session pages contain structured event data (circuit name, country, start/end date, session type) that could be marked up with `schema.org/SportsEvent` or `schema.org/Event` JSON-LD. This would allow Google to surface rich results (event cards) for F1 race searches.

**Fix:** In `src/app/session/[id]/page.tsx`, inject a `<script type="application/ld+json">` block after fetching session data:

```json
{
  "@context": "https://schema.org",
  "@type": "SportsEvent",
  "name": "Monaco Grand Prix — Race",
  "startDate": "2025-05-25T13:00:00Z",
  "endDate": "2025-05-25T15:30:00Z",
  "location": { "@type": "Place", "name": "Circuit de Monaco" }
}
```

---

### 6.3 No `robots.txt` or `sitemap.xml`

The `public/` directory contains `f1logo.png`, `European_version.png`, and `favicon.ico` — but no `robots.txt` or `sitemap.xml`. Without a sitemap, search engines must discover session URLs by crawling, which is inefficient for a paginated/filtered site.

**Fix:** Add `src/app/sitemap.ts` (Next.js App Router static sitemap handler) that calls `getRaces()` and returns all session URLs. Add `src/app/robots.ts` returning a permissive policy for the main routes and blocking `/.well-known/vercel/flags`.

---

### 6.4 OG image for default route is not customized — `src/app/opengraph-image.tsx`

The home-level OG image (`src/app/opengraph-image.tsx`) renders plain text on a white background with no F1 branding, identical to the session-level OG image issue in 1.5.

**Fix:** Apply the carbon dark theme, include the F1 logo (already in `public/f1logo.png`), and add a tagline. This image appears when the root URL is shared on social media.

---

## 7. Accessibility

### 7.1 Live badge has no `aria-live` region — `src/components/liveItem.tsx`

The live badge with the animated ping dot updates via `router.refresh()` every 5 seconds. Screen readers are not notified of these updates because there is no `aria-live` region.

**Fix:** Wrap the live status container in a `<div aria-live="polite" aria-atomic="true">`. Use `"polite"` (not `"assertive"`) to avoid interrupting the user mid-sentence.

---

### 7.2 Tab navigation uses `<select>` on mobile without a label — `src/components/tabs.tsx`

```tsx
// tabs.tsx
<select onChange={...} value={selectedTab}>
  <option value="1">Race Control</option>
  <option value="2">Pit Stops</option>
</select>
```

The mobile `<select>` element has no `<label>` associated with it (no `id` + `htmlFor` pairing, no `aria-label`). Screen readers will announce it as an unlabeled control.

**Fix:** Add `aria-label="Select session view"` to the `<select>` element.

---

### 7.3 `yearSelector.tsx` buttons have no `aria-pressed` state

The year filter buttons visually indicate the active year with a red background, but do not communicate state programmatically.

**Fix:** Add `aria-pressed={isActive}` to each year button element.

---

## 8. Developer Experience

### 8.1 `.env.example` does not document `FLAGS_SECRET`

`src/app/getFlags.ts` calls `decrypt(cookie, process.env.FLAGS_SECRET)` to read flag overrides. `FLAGS_SECRET` is not listed in `.env.example` or in `docs/ENVIRONMENT.md`.

**Fix:** Add `FLAGS_SECRET=your-32-char-secret-here` to `.env.example` with a comment explaining it is used for Vercel feature flag override cookies and can be any random 32-character string in local development.

---

### 8.2 Year selector is hardcoded — `src/components/yearSelector.tsx`

```tsx
// yearSelector.tsx
const YEARS = [2023, 2024, 2025, 2026];
```

This list is hardcoded. When the 2027 season begins, a developer must remember to update this file manually.

**Fix:** Drive the year list from `src/utils/constants.ts`:

```ts
export const AVAILABLE_YEARS = Array.from(
  { length: currentYear - 2022 },
  (_, i) => 2023 + i
);
```

`constants.ts` already exports `currentYear = new Date().getFullYear()`, so the list will automatically extend on January 1st each year.

---

### 8.3 `wrangler.json` `compatibility_date` is `2024-11-01` but will become stale

Cloudflare Workers `compatibility_date` pins the runtime behavior. As of the current codebase it is set to `2024-11-01`. This is not automatically updated.

**Fix:** Document in `docs/DEPLOYMENT.md` that `compatibility_date` should be updated quarterly and add a comment in `wrangler.json` referencing the Cloudflare compatibility flags changelog URL.

---

### 8.4 No pre-commit hook or CI lint/test step

The repo has no `.husky/` configuration, no `lint-staged`, and no GitHub Actions workflow. ESLint and Jest run manually (`pnpm lint`, `pnpm test`). A broken import or type error can be committed and only noticed at build time.

**Fix:** Add a minimal GitHub Actions workflow (`.github/workflows/ci.yml`) that runs `pnpm lint && pnpm test` on every push to `main` and on every pull request. Alternatively, add a `pre-commit` hook via Husky + lint-staged to at least run ESLint on staged files.

---

*Last updated: 2026-04-04. Based on codebase at commit `fdf7629`.*
