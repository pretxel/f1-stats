## 1. Visual foundation

- [x] 1.1 Replace Barlow Condensed + JetBrains Mono in `src/app/layout.tsx` with Archivo variable (`axes: ["wdth"]`) via `next/font/google`, exposed as `--font-archivo`
- [x] 1.2 Rewrite `tailwind.config.ts` tokens: `concrete`, `slab`, `ink`, `ink-soft`, `rule`, `flag-green|yellow|red|blue|sc`; font family `sans` → Archivo; remove old colors, keyframes, and `display`/`data` families
- [x] 1.3 Rewrite `src/app/globals.css`: CSS variables for tokens, body background/text, utility classes for width axis (`.wdth-expanded`, `.wdth-condensed` via `font-variation-settings` / `font-stretch`), chequered pattern, global `:focus-visible` 2px ink outline with offset, live pulse keyframes inside `prefers-reduced-motion: no-preference`; remove grain, glow, red scrollbar, `fade-up`, `stripe-left`
- [x] 1.4 Verify ink-soft/ink contrast on concrete and slab meets AA (document ratios in a comment next to tokens)

## 2. Types and pure utils (TDD)

- [x] 2.1 Add `meeting_key` to `RaceItemType`; add optional `flag`, `scope`, `sector`, `lap_number` to `RaceControlTypeItem`
- [x] 2.2 Write tests then implement `groupSessionsByWeekend(sessions)` in `src/utils/` (meeting_key grouping, location+year fallback, weekend order desc, session order asc, date range)
- [x] 2.3 Write tests then implement `sessionStatus(start, end, now)` returning `live | upcoming | done`
- [x] 2.4 Write tests then implement `classifyRaceControl(event)` → `{ kind, label }` covering green, yellow, double yellow, red, blue, clear, chequered, SC, VSC, DRS, unknown → info, sector suffix
- [x] 2.5 Write tests then implement `buildFlagStrip(events, start, end, now?)` → segments `{ state, startPct, endPct, from, to }`, sector-yellow ticks, and summary string (cover SC, VSC, red flag, chequered, live cut-off, empty input)
- [x] 2.6 Write tests then implement `rankPitstops(adapted)` sorting by total ascending and adding `barPct` relative to max
- [x] 2.7 Update `adaptRaceControlToTimeline` to output `HH:mm:ss` time plus classification; update its tests

## 3. Shared components

- [x] 3.1 `SegmentedLinks` server-friendly component (`<nav>` of `<Link>`s, `aria-current`, horizontal scroll on overflow) used by filters and tabs
- [x] 3.2 Restyle `LiveItem` as green pulsing marker + "Live" label, keep auto-refresh behavior
- [x] 3.3 Restyle `EmptyState` (slab panel, sentence-case title/detail, "Clear filters" link) and remove checkered decoration
- [x] 3.4 `FlagMarker` component: color bar + text label for a classification kind

## 4. Home page

- [x] 4.1 Header in `layout.tsx`: text wordmark "F1 Stats" (expanded Archivo) + season selector slot; remove subheading strip and footer version chrome, keep a plain footer credit
- [x] 4.2 Replace `YearSelector` and `TabRaces` with link-based segmented controls; drop "All" years; default year = current season in `page.tsx`
- [x] 4.3 Restyle `SearchInput` (label "Search circuits", slab field, ink focus) keeping flag behavior
- [x] 4.4 Build `WeekendGroup` (featured variant: expanded heading + rows; collapsed variant: `<details>/<summary>` with date range, country, location, session count)
- [x] 4.5 Build `SessionRow` link (session name, local day/time, status; `from` param preserved) with `WinnerLabel` in its own `<Suspense>` only for finished Race/Sprint
- [x] 4.6 Replace `SessionGrid` with a server-rendered `WeekendList` (search query filtered on the server, hides non-matching weekends, empty state on zero) and update `page.tsx` to group via `groupSessionsByWeekend`; remove `orderRacesLastest` limit-3 default
- [x] 4.7 Delete `raceItem.tsx`, `buttonItem.tsx`, `sessionGrid.tsx`, `switchSessionType.tsx` if unused; update/replace their tests

## 5. Session detail page

- [x] 5.1 Restyle `SessionHeader`: flag, expanded circuit name (40px), location · country, session name, day + start–end time, live indicator
- [x] 5.2 Build `FlagStrip` (segments, sector-yellow ticks, legend of present states, `role="img"` + `aria-label` summary); render in header from race control data inside `<Suspense>`
- [x] 5.3 Replace `Tabs` with `SegmentedLinks` ("Race control", "Pit stops") on all viewports, preserving query params
- [x] 5.4 Convert `RaceControlItem` to a server component: time, `FlagMarker`, message; delete scroll reveal
- [x] 5.5 Convert `PitstopItem` to a server component with rank order, stop count, proportional bar, total "46.2 s"; use `rankPitstops`
- [x] 5.6 Back link copy "Back to sessions" with focus style; restyle loading skeletons in `loading.tsx` and `page.tsx` fallbacks to slab blocks
- [x] 5.7 Delete `useIsVisible` hook if no longer referenced

## 6. Peripheral surfaces

- [x] 6.1 Restyle `src/app/error.tsx` (plain explanation + "Try again" action)
- [x] 6.2 Update `opengraph-image.tsx`, session OG image, and `icon.tsx` to concrete/ink palette
- [x] 6.3 Update `manifest.json` theme/background colors

## 7. Verification

- [x] 7.1 `pnpm test`, `pnpm lint`, `pnpm build` pass
- [x] 7.2 Grep `src/` for `carbon`, `f1red`, `chromium`, `text-gold`, `font-data`, `uppercase`, `tracking-[` — no leftovers
- [x] 7.3 Run the app and screenshot home (desktop 1440px, mobile 375px) and a session detail with SC/red flag (e.g. a 2024 race); critique against design principles and fix
- [x] 7.4 Keyboard pass: tab through filters, weekend summaries, session rows, tabs, back link — focus visible everywhere
- [x] 7.5 Reduced motion check: no live pulse, no tab fade with `prefers-reduced-motion: reduce`
- [x] 7.6 Update `CLAUDE.md` styling section (tokens, Archivo, client component list) and `openspec` specs on archive
