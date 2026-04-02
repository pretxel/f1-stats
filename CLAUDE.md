# CLAUDE.md — F1 Stats Codebase Guide

This file provides context for AI assistants working on this codebase.

---

## Project Overview

A Next.js 15 application displaying Formula 1 session statistics (races, qualifying, practice, sprint). Data is fetched from an external F1 API, cached in Upstash Redis, and deployed to Cloudflare Workers via the OpenNext adapter.

**Live site features:**
- Session listing with filtering by type (Race, Qualifying, Sprint, Practice)
- Session detail with Race Control timeline and Pit Stop summaries
- Live session detection with auto-refresh
- Feature flags via Vercel Edge Config

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Runtime | React 19, TypeScript 5 (strict) |
| Styling | Tailwind CSS 3 |
| Caching | Upstash Redis (REST) |
| Feature Flags | @vercel/flags + @vercel/edge-config |
| Testing | Jest 29 + @swc/jest |
| Deployment | Cloudflare Workers via @opennextjs/cloudflare |
| Package Manager | **pnpm** (do not use npm or yarn) |

---

## Directory Structure

```
src/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout, OG metadata, Vercel toolbar
│   ├── page.tsx                # Home: session listing
│   ├── error.tsx               # Error boundary
│   ├── getFlags.ts             # Server-side feature flag resolution
│   ├── opengraph-image.tsx     # OG image generation
│   ├── icon.tsx                # Favicon
│   ├── session/[id]/
│   │   ├── page.tsx            # Session detail (race control + pit stops)
│   │   ├── layout.tsx          # Session layout with tab metadata
│   │   └── loading.tsx         # Loading skeleton
│   └── .well-known/vercel/flags/  # Vercel flags API endpoint
├── components/                 # UI components (see Server vs Client below)
├── services/                   # Data fetching + Redis caching
├── utils/                      # Pure helper functions
├── types/                      # TypeScript type definitions
├── hooks/                      # Custom React hooks
└── flags/                      # Feature flag definitions
docs/                           # Additional documentation
├── ARCHITECTURE.md
├── ENVIRONMENT.md
└── DEPLOYMENT.md
```

---

## Development Commands

```bash
pnpm install          # Install dependencies
cp .env.example .env.local  # Create local env file
pnpm dev              # Start dev server (Turbopack)
pnpm build            # Production build
pnpm test             # Run Jest tests
pnpm lint             # ESLint
```

---

## Environment Variables

Required (copy from `.env.example`):

| Variable | Purpose |
|---|---|
| `API_ENDPOINT` | Base URL for external F1 data API (no trailing slash) |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis auth token |
| `EDGE_CONFIG` | (Optional) Vercel Edge Config connection string for feature flags |

See `docs/ENVIRONMENT.md` for full setup instructions.

---

## Architecture & Data Flow

```
Page (Server Component)
  └─ Service function (e.g. getRaces, getPitstops)
       └─ Upstash Redis cache check
            ├─ Cache HIT  → return cached data
            └─ Cache MISS → fetch from API_ENDPOINT → store in Redis → return data
```

- Cache TTL: **86400 seconds (24 hours)**
- **Live sessions bypass the cache** entirely so data is always real-time
- Cache keys include the full query URL for per-variant caching

---

## Server vs Client Components

### Server Components (default in App Router)
Fetch data, render HTML on server. Located in `src/app/` and most of `src/components/`.

Key server components:
- `raceItem.tsx` — race card, async winner data fetch
- `raceControl.tsx` — fetches + renders race control timeline
- `pitstops.tsx` — fetches + renders pit stop table

### Client Components (`"use client"`)
Only used for interactivity. Marked with `"use client"` at the top.

| File | Purpose |
|---|---|
| `components/tabs.tsx` | Tab switcher (Race Control / Pit Stops) |
| `components/tabRaces.tsx` | Session type filter buttons |
| `components/raceControlItem.tsx` | Race control event with scroll animation |
| `components/pitstopItem.tsx` | Pit stop row with scroll animation |
| `components/liveItem.tsx` | Live badge + auto-refresh timer |
| `components/buttonItem.tsx` | "Details" nav button |
| `components/searchInput.tsx` | Search input (UI only, not wired) |

**Rule:** Keep client components minimal. Prefer server rendering. Only add `"use client"` when you need browser APIs, event handlers, or state.

---

## Services Layer (`src/services/`)

All data access goes through service functions. Each service:
1. Builds the API URL from `API_ENDPOINT`
2. Checks Upstash Redis cache
3. Falls back to `fetch()` on cache miss
4. Stores result in Redis with TTL

| Service | Function | Description |
|---|---|---|
| `races.ts` | `getRaces(filter?)` | Fetch sessions, optional type filter |
| `raceControl.ts` | `getRaceControlBySession(key)` | Race control events for a session |
| `pitstops.ts` | `getPitstops(key)` | Pit stops enriched with driver info |
| `driver.ts` | `getDriver(number)` | Single driver details |
| `winnerByRace.ts` | `getWinnerByRace(key)` | Race winner + driver details |
| `isSessionLive.ts` | `isSessionLive(key)` | Whether session is currently live |
| `cache.ts` | `getCache/setCache` | Redis cache helpers, TTL constant |

---

## Data Models

**Session / Race** (`src/types/RaceItemType.ts`):
```typescript
{
  session_key: string;
  date_start: Date;
  date_end: Date;
  location: string;
  country_name: string;
  country_code: string;
  circuit_short_name: string;
  session_name: string;
  session_type: "Practice" | "Qualifying" | "Sprint" | "Race";
}
```

**Race Control Event** (`src/types/RaceControlItem.ts`):
```typescript
{
  session_key: string;
  meeting_key: string;
  date: Date;
  category: string;
  message: string;
}
```

---

## Utility Functions (`src/utils/`)

| Function | File | Description |
|---|---|---|
| `orderRacesLastest()` | `orderRacesByLastest.ts` | Sort sessions by date, filter, limit |
| `orderRaceControl()` | `orderRaceControl.ts` | Sort race control events descending |
| `adaptRaceControlToTimeline()` | `adaptRaceControlToTimeline.ts` | Transform events for timeline UI |
| `adaptPitstops()` | `adaptPitstops.ts` | Group pit stops by driver, sum durations |
| `isLiveSessionNow()` | `isLiveSessionNow.ts` | Check if `now` is within session window |
| `classNames()` | `classNames.ts` | Combine CSS class strings (drops falsy) |
| `add()` | `big.ts` | BigInt-based float addition for precision |

The `add()` helper in `big.ts` uses BigInt arithmetic to avoid floating-point errors when summing pit stop durations. Use it for any duration/time summation.

---

## Feature Flags

Flags are defined in `src/flags/index.ts` using `@vercel/flags`.

- Flag overrides are stored in the `vercel-flag-overrides` cookie (encrypted)
- Served via `src/app/.well-known/vercel/flags/route.ts`
- Read server-side via `getFlags()` in `src/app/getFlags.ts`

To add a new flag:
1. Define it in `src/flags/index.ts`
2. Call `getFlags()` in the relevant server component
3. Pass the flag value as a prop

---

## Testing

```bash
pnpm test
```

Tests use Jest + `@swc/jest` (fast TypeScript compilation, no Babel).

Test files live alongside source files with `.test.ts` suffix:
- `src/services/pitstop.test.ts` — integration test, mocks Redis and fetch
- `src/utils/adaptPitstops.test.ts` — unit test for pitstop grouping

**Conventions:**
- Mock `@upstash/redis` with stub `get`/`set` when testing services
- Mock `getDriver()` when testing services that call it
- Use `jest.spyOn(global, "fetch")` to mock HTTP calls
- Keep tests focused — prefer unit tests for utils, integration tests for services

---

## TypeScript Conventions

- Strict mode is enabled (`tsconfig.json`)
- Path alias `@/*` maps to `./src/*` — always use this for imports
- Type definitions live in `src/types/`; add new types there, not inline
- Avoid `any`; use proper types or `unknown` with type guards

---

## Styling Conventions

- **Tailwind CSS** exclusively — no CSS modules, no styled-components
- Combine classes with the `classNames()` utility from `src/utils/classNames.ts`
- Tailwind content paths cover `src/pages/`, `src/components/`, `src/app/`
- No custom theme extensions — use default Tailwind tokens

---

## Deployment

The app deploys to **Cloudflare Workers** using `@opennextjs/cloudflare`.

```bash
pnpm build                                    # Next.js build
pnpm exec @opennextjs/cloudflare build        # OpenNext bundle → .open-next/
pnpm exec wrangler deploy                     # Deploy to Cloudflare
pnpm exec wrangler dev                        # Local preview
```

Secrets must be set in Wrangler before deploying:
```bash
pnpm exec wrangler secret put API_ENDPOINT
pnpm exec wrangler secret put UPSTASH_REDIS_REST_URL
pnpm exec wrangler secret put UPSTASH_REDIS_REST_TOKEN
```

See `docs/DEPLOYMENT.md` for full instructions and troubleshooting.

---

## Key Conventions & Gotchas

1. **pnpm only** — lockfile is `pnpm-lock.yaml`. Never use npm/yarn.
2. **Server components by default** — only add `"use client"` when strictly needed.
3. **All data fetching in services** — never call the external API directly from components.
4. **Cache bypass for live sessions** — `isSessionLive()` returns `true` → skip Redis.
5. **Float arithmetic** — use `add()` from `src/utils/big.ts` for summing durations.
6. **Image domains** — remote images from `wikimedia.org`, `thebestf1.es`, and `formula1.com` are whitelisted in `next.config.js`. Add new domains there if needed.
7. **React Compiler** — experimental `babel-plugin-react-compiler` is enabled. Avoid manual `useMemo`/`useCallback` unless profiling shows it's needed.
8. **Wrangler config** — `wrangler.json` (not `.toml`) is the Cloudflare config file.
