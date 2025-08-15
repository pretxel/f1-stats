## Environment & Secrets

### Required Variables
- `API_ENDPOINT` — Base URL of the data API. Must include a trailing slash, e.g. `https://api.example.com/`.
- `UPSTASH_REDIS_REST_URL` — Upstash Redis REST URL.
- `UPSTASH_REDIS_REST_TOKEN` — Upstash Redis REST token.

### Optional Variables
- `EDGE_CONFIG` — Edge Config ID/connection string used by `@vercel/edge-config`. On Vercel, this is provided automatically. Locally you can omit it; the `showSummerSale` flag will fall back to `false`.

### Local Development
1. Copy the example file:
```bash
cp .env.example .env.local
```
2. Fill in values. Next.js will load `.env.local` automatically.

### Cloudflare (Production/Preview)
Use Wrangler secrets for sensitive values:
```bash
pnpm exec wrangler secret put API_ENDPOINT
pnpm exec wrangler secret put UPSTASH_REDIS_REST_URL
pnpm exec wrangler secret put UPSTASH_REDIS_REST_TOKEN
# Optional
pnpm exec wrangler secret put EDGE_CONFIG
```

For local Worker dev, you can create a `.dev.vars` file alongside `wrangler.json` with the same keys for convenience.

### Notes
- Ensure `API_ENDPOINT` ends with `/`. The services concatenate paths like `API_ENDPOINT + SERVICE + QUERIES`.
- Upstash Redis is required for caching. Without it, responses will not be cached but the app can still function if the API is reachable.