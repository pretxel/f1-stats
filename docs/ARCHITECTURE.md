## Architecture

### Overview
- **Next.js App Router** with server components for data fetching and rendering
- **Services layer** wraps external API calls and Redis caching
- **Feature flags** with Vercel Flags + Edge Config for progressive rollout
- **Cloudflare Workers** runtime via OpenNext and Wrangler

### Modules
- `src/app/`: Root layout, error boundary, route pages
  - `layout.tsx`: Global layout, OG tags, toolbar in dev
  - `error.tsx`: Client error boundary
  - `page.tsx`: Home listing sessions, flags injection, tabs
  - `session/[id]/page.tsx`: Session details (Race Control, Pit Stops)
- `src/components/`: UI components used by pages
- `src/services/`: Data-fetching and caching
  - `races.ts`: Sessions list and filtering
  - `raceControl.ts`: Race Control feed
  - `pitstops.ts`: Pit stops (enriched with driver data)
  - `driver.ts`: Driver lookup
  - `winnerByRace.ts`: Winner computation
  - `cache.ts`: Cache interfaces and TTL
  - `isSessionLive.ts`: Determines live state to decide caching
- `src/utils/`: Helpers (ordering, live detection, skeletons)
- `src/flags/`: Vercel Flags integration
- `src/types/`: Shared TS types

### Data Flow
- Pages call service functions on the server
- Services build URLs from `API_ENDPOINT` and fetch JSON
- Responses are cached in Upstash Redis using stable keys; live sessions bypass cache
- UI components render data; client components handle interactivity

### Rendering & Revalidation
- `export const revalidate = 3600` on home page (static regeneration)
- Some fetches include `next: { revalidate: 3600, tags: ["winners"] }`
- Live sessions use on-demand fetch without Redis persistence

### Error Handling
- Global error boundary in `src/app/error.tsx`
- Service-level `try/catch` with `console.error` and sensible fallbacks

### Configuration
- `next.config.js`: image remote patterns, React compiler, toolbar plugin
- `open-next.config.ts`: Cloudflare wrappers and cache configuration
- `wrangler.json`: Worker entry (`.open-next/worker.js`) and assets binding

### Caching Keys
- `racesResponse_year_${year}`
- `racesResponse_session_key_${sessionKey}`
- `racesResponse_session_type_${sessionType}`
- `race_control_session_key_${sessionKey}`
- `pit_session_key_${sessionKey}`
- `drivers_driver_number_${driverNumber}`
- `position_session_key_${sessionKey}_position_1`

### Styling
- Tailwind CSS with `globals.css` and utility classes throughout