## Deployment (Cloudflare Workers)

This project deploys to Cloudflare Workers using OpenNext and Wrangler.

### Prerequisites
- Cloudflare account and `wrangler` auth (`pnpm exec wrangler login`)
- Environment secrets added (see `docs/ENVIRONMENT.md`)

### Build & Deploy
1. Build the Next.js app:
```bash
pnpm build
```
2. Prepare the Worker bundle via OpenNext:
```bash
pnpm exec @opennextjs/cloudflare build
```
This outputs the Worker and assets to `.open-next/`.

3. Deploy to Cloudflare Workers:
```bash
pnpm exec wrangler deploy
```

### Preview Locally
```bash
pnpm exec wrangler dev
```

### Configuration Files
- `wrangler.json`: Points `main` to `.open-next/worker.js`, binds assets, enables Node.js compatibility, and observability
- `open-next.config.ts`: Sets wrappers/converters and caching behavior for Cloudflare

### Troubleshooting
- **Missing env error**: Ensure all required secrets are defined via `wrangler secret put ...`
- **Bad API URL**: `API_ENDPOINT` must end with a trailing slash
- **Images blocked**: Remote images must match `next.config.js` `images.remotePatterns`
- **Cache not updating for live sessions**: Live mode intentionally bypasses Redis writes; verify `isSessionLive()` with your session schedule