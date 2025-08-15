## F1 Stats

A Next.js app that surfaces Formula 1 2024 session data including races, race control events, and pit stops. It uses server components, caching with Upstash Redis, feature flags via Vercel Flags + Edge Config, and deploys to Cloudflare Workers through OpenNext.

### Features
- **Browse sessions**: Filter by session type (Practice, Qualifying, Race)
- **Session details**: Race Control timeline and Pit Stops per session
- **Live-aware caching**: Bypass cache when a session is live
- **Edge-ready**: Cloudflare Workers deployment with OpenNext
- **Feature flags**: Toggle UI features using Vercel Flags + Edge Config

### Tech Stack
- **Framework**: Next.js 15 (App Router), React 19
- **Styling**: Tailwind CSS
- **Caching**: Upstash Redis (REST API)
- **Flags/Config**: @vercel/flags, @vercel/edge-config
- **Deployment**: Cloudflare Workers + Wrangler + OpenNext

## Quickstart

### Prerequisites
- Node.js 18+ (recommended LTS)
- pnpm installed (`npm i -g pnpm`)

### Setup
1. Install dependencies:
```bash
pnpm install
```
2. Create a local env file and fill in values:
```bash
cp .env.example .env.local
```
3. Start the dev server:
```bash
pnpm dev
```
Open `http://localhost:3000`.

### Scripts
- `pnpm dev`: Run development server
- `pnpm build`: Build Next.js
- `pnpm start`: Start production server (Node target)
- `pnpm lint`: Lint
- `pnpm test`: Run tests (Jest + SWC)

## Environment Variables
Create `.env.local` (local) and use Cloudflare secrets in production. See `docs/ENVIRONMENT.md` for details.

Required:
- `API_ENDPOINT` (string) — Base URL of the data API. Must include a trailing slash. Example: `https://api.example.com/`
- `UPSTASH_REDIS_REST_URL` (string) — Upstash Redis REST URL
- `UPSTASH_REDIS_REST_TOKEN` (string) — Upstash Redis REST token

Optional (for feature flags via Edge Config):
- `EDGE_CONFIG` (string) — Edge Config ID or connection string; defaults to Vercel env when running on Vercel

## Project Structure
```
src/
  app/                # App Router (pages, layouts, error boundary)
  components/         # UI components
  services/           # Data fetching + Redis caching
  utils/              # Helpers, sorting, live-session detection
  flags/              # Vercel Flags integration
  types/              # Shared TypeScript types
public/               # Static assets
```

Key routes:
- `/` — Lists sessions (filterable by `sessionType`), shows optional search via flags
- `/session/[id]` — Session detail. `?selectedTab=1|2` to switch between Race Control (1) and Pit Stops (2)

## Data and Caching
- Data source determined by `API_ENDPOINT` and the following services:
  - `sessions?year=YYYY`, `sessions?session_type=...`, `sessions?session_key=...`
  - `race_control?session_key=...`
  - `pit?session_key=...`
  - `drivers?driver_number=...`
  - `position?session_key=...&position<=1` (winner by race)
- Caching: Upstash Redis with 24h TTL (`TTL_CACHE = 86400`). Live sessions bypass cache using `isSessionLive()`.

## Deployment
This app is configured for Cloudflare Workers via OpenNext.

High-level steps:
1. Build Next.js:
```bash
pnpm build
```
2. Prepare the Worker bundle (OpenNext):
```bash
pnpm exec @opennextjs/cloudflare build
```
3. Deploy with Wrangler:
```bash
pnpm exec wrangler deploy
```

Details and troubleshooting in `docs/DEPLOYMENT.md`.

## Documentation
- Architecture: `docs/ARCHITECTURE.md`
- Environment/Secrets: `docs/ENVIRONMENT.md`
- Deployment (Cloudflare): `docs/DEPLOYMENT.md`

## Testing
Run the unit tests:
```bash
pnpm test
```

## License
MIT (or your choice).
