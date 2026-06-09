# Tasks — Improve UX

## 1. Shared foundations

- [x] 1.1 Extract `SESSION_TYPE_LABELS` from `raceItem.tsx` into `src/utils/sessionTypeLabels.ts`; update `raceItem.tsx` import
- [x] 1.2 Create `src/components/emptyState.tsx` server component (title + detail props, carbon panel, CSS-only checkered glyph)
- [x] 1.3 Add `fade-up` keyframes + stagger utility and 200ms `fade-in` to `globals.css`, both inside `@media (prefers-reduced-motion: no-preference)`

## 2. Session browsing (home)

- [x] 2.1 Add `"Sprint"` to `sessionTypes` array in `src/app/page.tsx`
- [x] 2.2 Create `src/components/sessionGrid.tsx` client component: receives server-rendered card children + race metadata, filters by `query` search param (circuit/country/location, case-insensitive), applies staggered reveal classes
- [x] 2.3 Wire `searchInput.tsx`: controlled input syncing `query` to URL via `router.replace`, keep behind `showSearchInput` flag
- [x] 2.4 Render `EmptyState` in grid when zero sessions match filters or search; include reset-filters link to `/`
- [x] 2.5 Wrap `YearSelector` + `TabRaces` + search in unified filter bar in `page.tsx` (micro-labels, `flex-wrap`, bottom divider)
- [x] 2.6 Update `buttonItem.tsx` to append `from=<encoded current query>` to the session link when listing filters are active

## 3. Session detail

- [x] 3.1 Create `src/components/sessionHeader.tsx`: flag, circuit name, country, session-type badge (shared label map), start/end times, `LiveItem` when live
- [x] 3.2 Render `SessionHeader` in `src/app/session/[id]/page.tsx` above tabs; remove the standalone `LiveItem` block it replaces (Tabs moved from layout into page so header sits above them)
- [x] 3.3 Add back link ("← Sessions") above header reading `from` param, falling back to `/` (also fixed `tabs.tsx` to merge params so `from` survives tab switches)
- [x] 3.4 Add `EmptyState` to `raceControl.tsx` when zero events
- [x] 3.5 Add `EmptyState` to `pitstops.tsx` / `listPitstop.tsx` when zero drivers (fixed leaked-`0` render bug in `listPitstop.tsx`)
- [x] 3.6 Apply `fade-in` class to tab content wrapper in `session/[id]/page.tsx`

## 4. Verification

- [x] 4.1 `pnpm lint` and `pnpm test` pass
- [x] 4.2 `pnpm build` succeeds
- [x] 4.3 Manual check: Sprint filter, search (flag on), empty states (bogus year/filter, query with no matches), back link round-trip with filters, header on live + past session, reduced-motion behavior (verified via static code inspection — 19 scenario checks across 6 areas, all pass)
