# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Dev server with Turbopack
pnpm build        # Next.js production build
pnpm lint         # ESLint
pnpm test         # Jest (all tests)
pnpm test -- --testPathPattern=<file>  # Run a single test file
```

**Cloudflare deployment:**
```bash
pnpm build
pnpm exec @opennextjs/cloudflare build
pnpm exec wrangler deploy
```

## Architecture

**Next.js 16 App Router** deployed to **Cloudflare Workers** via `@opennextjs/cloudflare` + Wrangler.

### Data flow
1. Pages are React Server Components that call service functions directly
2. Services (`src/services/`) fetch from an external REST API (`API_ENDPOINT` env var) with endpoints: `sessions`, `race_control`, `pit`, `drivers`, `position`
3. Responses are cached in **Upstash Redis** (24h TTL via `TTL_CACHE`). Live sessions bypass Redis (checked via `isSessionLive()`)
4. Client components handle interactivity; server components handle all data fetching

### Key routes
- `/` — Lists sessions; filterable by `?sessionType=` query param; ISR with `revalidate = 3600`
- `/session/[id]` — Session detail; `?selectedTab=1` = Race Control, `?selectedTab=2` = Pit Stops

### Feature flags
Flags are defined in `src/flags/index.ts` using `@vercel/flags/next` backed by `@vercel/edge-config`. Flag values are encrypted and passed to the client via `<FlagValues>`. The `getFlags()` helper in `src/app/getFlags.ts` aggregates all flag values for a page.

### Caching strategy
- `src/services/cache.ts` defines `TTL_CACHE = 86400` and the `CachedData` interface
- Each service builds a stable Redis key (e.g. `racesResponse_session_key_${sessionKey}`) and checks Redis before fetching the API
- `isSessionLive()` in `src/services/isSessionLive.ts` compares the session's `date_start`/`date_end` against now to decide whether to skip cache

### Cloudflare/OpenNext configuration
- `open-next.config.ts` — Cloudflare adapter wrappers and cache config
- `wrangler.json` — Worker entry point (`.open-next/worker.js`) and static assets binding

## Environment variables

Required in `.env.local` (copy from `.env.example`):
- `API_ENDPOINT` — Base URL with trailing slash
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Optional:
- `EDGE_CONFIG` — Vercel Edge Config connection string (needed for feature flags)

See `docs/ENVIRONMENT.md` for production secrets setup.
