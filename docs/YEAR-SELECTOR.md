# Year Selector

## Feature Overview

The year selector lets users filter the session listing by F1 competition year. Selecting a year sets a `?year=YYYY` query parameter; the service layer passes it to the external API and caches the result under a year-scoped Redis key. Without a selection, the app defaults to the current calendar year — the same behavior as before this feature was added.

---

## URL Parameter

| Parameter | Example | Default |
|---|---|---|
| `year` | `?year=2024` | Current calendar year |
| `sessionType` | `?sessionType=Race` | All types |

Both parameters coexist on the same URL and are preserved independently:

```
/?year=2024&sessionType=Race
```

- Selecting "ALL" in the year selector removes `year` from the URL (reverts to current year).
- Selecting a session type tab preserves any active `year` param.
- Selecting a year button preserves any active `sessionType` param.

---

## Architecture

Three files are involved.

### `src/services/races.ts`

Owns all data-fetching logic. The `GetRaceType` interface accepts an optional `year`:

```ts
interface GetRaceType {
  sessionKey?: string;
  sessionType?: string;
  year?: number;
}
```

When `year` is omitted, the service falls back to the current year:

```ts
const year = params.year ?? new Date().getFullYear();
```

The resolved year is used in:
- The Redis cache key: `racesResponse_year_${year}`
- The API query string: `?year=${year}`

No other service logic changes — Redis lookup, fetch fallback, error handling, and TTL are all unchanged.

### `src/components/yearSelector.tsx`

Client component (`"use client"`) responsible for rendering the year filter buttons.

| Prop | Type | Description |
|---|---|---|
| `years` | `number[]` | List of years to render as buttons |

Reads the active year from `useSearchParams` and uses `useRouter` to navigate on button click. URL construction uses a `URLSearchParams`-based `buildUrl` helper that preserves or removes the `sessionType` param as appropriate.

Styled to match `tabRaces.tsx`: `font-data text-[10px] tracking-[0.25em] uppercase`, active state uses `bg-f1red border-f1red text-white`, inactive state uses `border-carbon-border text-muted`.

### `src/app/page.tsx`

Server component. Reads `year` from the awaited `searchParams`:

```ts
const year = Number(searchParamsAwaited.year) || undefined;
```

Passes `year` to `getRaces`:

```ts
const races = await getRaces({ sessionType, year });
```

Renders `<YearSelector>` inside a `<Suspense>` boundary (required because the component uses `useSearchParams`), placed above `<TabRaces>`:

```tsx
<Suspense>
  <YearSelector years={[2023, 2024, 2025, 2026]} />
</Suspense>
```

---

## Caching Behavior

Each year gets its own Redis cache entry:

| Year | Cache key |
|---|---|
| 2023 | `racesResponse_year_2023` |
| 2024 | `racesResponse_year_2024` |
| 2025 | `racesResponse_year_2025` |
| 2026 | `racesResponse_year_2026` |

- TTL is **86400 seconds (24 hours)**, defined in `src/services/cache.ts`.
- Live sessions bypass the cache entirely regardless of year. `isSessionLive()` returning `true` triggers a direct API fetch with no Redis read or write.

---

## Adding a New Year

The `years` array is hardcoded in `src/app/page.tsx`. To expose a new season:

1. Open `src/app/page.tsx`.
2. Update the array passed to `<YearSelector>`:

```tsx
<YearSelector years={[2023, 2024, 2025, 2026, 2027]} />
```

That is the only change required. The service layer and component accept any year value automatically.

> Keep years in ascending order — the component renders them in the order provided.
