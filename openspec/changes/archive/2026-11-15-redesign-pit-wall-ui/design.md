## Context

F1 Stats is a Next.js 16 App Router app (server components by default, Tailwind 3, deployed to Cloudflare Workers). Data comes from an OpenF1-style API via cached services. Current UI: near-black `carbon` palette, `f1red` accent, Barlow Condensed italic uppercase headings, JetBrains Mono 9–11px uppercase labels, 3-column card grid, `useIsVisible` scroll reveals on every timeline/pit-stop row, grain overlay and red radial glow on `body`.

Subject, audience, job:
- **Subject**: what happened in a Formula 1 session — flags, safety cars, pit stops, who won.
- **Audience**: F1 fans checking a session during or right after a race weekend, often on a phone.
- **Primary job**: find a session within its race weekend and read its story fast.

The API already returns fields we drop on the floor: sessions carry `meeting_key`; race control messages carry `flag` (`GREEN`, `YELLOW`, `DOUBLE YELLOW`, `RED`, `BLUE`, `CLEAR`, `CHEQUERED`), `scope` (`Track`, `Sector`, `Driver`), `sector`, `lap_number`, and `category` (`Flag`, `SafetyCar`, `Drs`, `CarEvent`, `Other`).

## Goals / Non-Goals

**Goals:**
- A distinct visual identity grounded in the pit wall and the marshal flag system.
- Color carries information (flag state), never decoration.
- Home organized the way fans think: by race weekend.
- Session detail tells the session's story at a glance (flag strip) before the detail (timeline, pit stops).
- Accessibility floor: ≥12px text, AA contrast, visible focus, reduced motion, color never the only signal.
- Fewer client components.

**Non-Goals:**
- Dark mode (single daylight theme in this change; tokens are structured so a night theme can be added later).
- New data sources (lap times, telemetry, standings, circuit maps).
- Changing caching, services, feature flags, or routing.
- Tailwind 4 migration.

## Design plan

### Color

| Token | Hex | Role |
|---|---|---|
| `concrete` | `#DADDD8` | Page background — cool pit-lane concrete |
| `slab` | `#EEF0EC` | Raised surfaces (weekend rows, header panel) |
| `ink` | `#12324A` | Text, rules at full strength, primary controls (≈9.6:1 on concrete) |
| `ink-soft` | `#46596A` | Secondary text (≈5.2:1 on concrete) |
| `rule` | `#B9BEB7` | Hairlines between rows |

Flag colors — the only saturated colors, used only for flag/track state:

| Token | Hex | Meaning |
|---|---|---|
| `flag-green` | `#1F8A4C` | Track clear / green flag / live |
| `flag-yellow` | `#F2C40F` | Yellow, double yellow (sector) |
| `flag-red` | `#D7261E` | Red flag, session stopped |
| `flag-blue` | `#1D6FD1` | Blue flag (driver) |
| `flag-sc` | `#E8892B` | Safety car / virtual safety car |
| chequered | ink/white pattern | Session end |

Flag fills always sit next to an ink text label; yellow is never used for text.

### Type

One family: **Archivo** (Google Fonts variable, `wdth` 62–125, `wght` 100–900) via `next/font`, with `axes: ["wdth"]`. The width axis is the personality:
- **Circuit / weekend names**: `wdth 125`, weight 800, sentence/title case as the API gives it (no forced uppercase, no italic). Display sizes: 64px hero, 40px detail header, 25px weekend rows.
- **Body and messages**: `wdth 100`, weight 400, 16px, line-height 1.5, max ~70ch.
- **Data (times, durations, counts)**: `wdth 75`, weight 600, `font-variant-numeric: tabular-nums`. Replaces monospace.
- **Labels**: 13px, weight 500, sentence case, `ink-soft`. No tracked-out caps.

Scale (≈1.25): 12 / 13 / 16 / 20 / 25 / 32 / 40 / 64.

### Layout

Left-aligned throughout, single column, max width 72rem, 16px gutter on mobile, 32px on desktop.

Home:
```
┌──────────────────────────────────────────────────────────┐
│ F1 Stats                         2023  2024  2025 [2026] │  header: wordmark + season
├──────────────────────────────────────────────────────────┤
│ All  Practice  Qualifying  Sprint  Race     [ search   ] │  segmented filters
├──────────────────────────────────────────────────────────┤
│ 7–9 Nov · Brazil                                         │
│ São Paulo                                                │  latest weekend: 64px expanded
│ ─────────────────────────────────────────────────────────│
│ Practice 1     Fri 14:30          Done                   │
│ Sprint         Sat 14:00          Won by L. Norris       │
│ Race           Sun 17:00          ● Live                 │  rows = links to detail
├──────────────────────────────────────────────────────────┤
│ 24–26 Oct · Mexico   Mexico City        5 sessions  ▸    │  earlier weekends: 25px
│ 17–19 Oct · USA      Austin             6 sessions  ▸    │  expandable (<details>)
└──────────────────────────────────────────────────────────┘
```
Earlier weekends use native `<details>/<summary>` so they expand without JavaScript; opening one is the only user-triggered motion on the page.

Session detail:
```
┌──────────────────────────────────────────────────────────┐
│ ‹ São Paulo weekend                                      │
│ Interlagos                                   Race  ● Live│  40px expanded
│ Sun 9 Nov, 17:00–19:00 · Brazil                          │
│ ███████████▒▒▒▒▒████████████████████▓▓▓██████████████▚▚ │  flag strip (signature)
│ green       SC          green          red    green  end │  legend under the strip
├──────────────────────────────────────────────────────────┤
│ [ Race control ]  Pit stops                              │  segmented control
├──────────────────────────────────────────────────────────┤
│ 17:42:10  ▌Safety car   Safety car deployed               │
│ 17:39:55  ▌Yellow · S2  Yellow in track sector 7          │
│ 17:31:02  ▌DRS          DRS enabled                       │
└──────────────────────────────────────────────────────────┘
Pit stops:
│ M. Verstappen   2 stops  ██████████░░░░░░  46.2 s         │
│ L. Norris       2 stops  ███████████░░░░░  48.9 s         │
```

### Principles

1. **Flags are the palette.** If a color is saturated, it is a flag state with a label next to it.
2. **Width, not weight, makes hierarchy.** Expanded for places, condensed for numbers, normal for reading.
3. **The weekend is the unit.** Sessions are always shown in their weekend's context.
4. **One signature.** The flag strip is the memorable element; everything else stays quiet.
5. **Plain words.** Sentence case, no jargon labels, empty states say what to do.

### Review against the brief

Checked the first draft against what a generic "F1 dashboard" would produce:
- *Draft*: keep dark background and swap red for a flag-yellow accent. → That is the near-black-plus-one-bright-accent default. **Changed** to a daylight concrete base, matching the pit wall in daylight and making flag colors read as they do on real flags.
- *Draft*: monospace for times. → Monospace data labels are template chrome. **Changed** to Archivo condensed with tabular figures — same alignment, same family.
- *Draft*: big round number ("R21") beside each weekend. → Pre-season testing and cancelled rounds make round numbers unreliable from this API, and numbered markers would be decoration. **Changed** to the weekend date range, which is real and sequential.
- *Draft*: winner shown on every session card in gold. → Gold had no meaning; winners only exist for Race/Sprint. **Changed** to "Won by …" text on Race/Sprint rows only.
- *Draft*: fade-up on each weekend row. → Generic entrance motion. **Removed**; only the live pulse and `<details>` expand remain.

## Decisions

1. **Archivo variable with `wdth` axis over a display + mono pair.** One family keeps the page coherent; the width axis gives three voices. Alternative: Barlow (no width axis, already associated with the current look), Roboto Flex (heavier font payload, more generic).
2. **Weekend grouping in a pure util (`groupSessionsByWeekend`).** Groups by `meeting_key`, falls back to `location + year` when absent; sorts weekends by first session start descending, sessions ascending. Unit-tested. Alternative: fetch `/meetings` endpoint — extra request and service for data we can derive.
3. **Flag strip computed server-side (`buildFlagStrip`).** Pure function over race control events sorted ascending plus session start/end. Track-wide state machine: starts green; `flag=RED` with `scope=Track` → red; `category=SafetyCar` with "VIRTUAL SAFETY CAR DEPLOYED" → vsc, "SAFETY CAR DEPLOYED" → sc; `flag=GREEN`/`CLEAR` with `scope=Track`, or "SAFETY CAR IN THIS LAP"/"VSC ENDING" → green; `flag=CHEQUERED` → chequered until end. Sector yellows render as tick marks above the strip, not as segments. Output: segments with `{state, startPct, endPct, from, to}`. Rendered as plain `<div>`s with `role="img"` and an `aria-label` summary plus a visible legend. Alternative: SVG chart lib — unnecessary dependency.
4. **`classifyRaceControl(event)` util** maps an event to `{kind, label}` (`green`, `yellow`, `red`, `blue`, `sc`, `chequered`, `drs`, `info`) for timeline markers. Unknown values fall back to `info` (ink, no color).
5. **Server components for rows.** `raceControlItem` and `pitstopItem` lose `"use client"` and `useIsVisible`; `useIsVisible` hook deleted if unused. Remaining client components: tabs (link-based, could become server but kept for `useSearchParams`), filters, search, live badge.
6. **Tabs and filters as link-based segmented controls.** `<nav>` of `<Link>`s with `aria-current`, same on mobile (horizontal scroll if needed, no `<select>`). Filters switch from `router.push` buttons to `<Link>`s — work without JS, prefetchable, proper semantics.
7. **Default season = current year; "All years" removed.** Grouping the whole multi-season history is not a useful view and is the heaviest request. `?year=` still selects past seasons.
8. **Winner lookups only for finished Race/Sprint sessions**, each in its own `<Suspense>` so rows stream in. Cuts API calls vs. one per session.
9. **Tokens in Tailwind `theme.extend.colors` + CSS variables in `globals.css`.** Remove `carbon*`, `f1red*`, `chromium`, `muted*`, `gold`, grain, glow, red scrollbar.

## Decisions made during implementation

10. **Strip window follows what happened.** Brazil 2024 started 20 minutes late and finished 27 minutes past its scheduled end. The strip runs from the scheduled start to the later of the scheduled end and the chequered flag, and shows "Not started" (hatched) until "SESSION STARTED" when the feed has it. The chequered flag lands within a second of the end, so it is drawn as a fixed-width end cap rather than a sliver.
11. **Featured = latest started weekend.** OpenF1 lists the whole calendar, including future sessions, so "newest weekend" would feature the season finale. Upcoming weekends go under "Coming up", soonest first (`splitWeekends`).
12. **Winners only for the featured weekend.** OpenF1 caps clients at 30 requests per minute; a full season of winners costs 40+ requests on a cold cache.
13. **Circuit local time.** The server renders in UTC; sessions carry `gmt_offset`, so times are shown as the circuit's local time (`trackTime` utils) with a note on the page.
14. **Filters, tabs and search filtering are server-rendered links.** The page already receives `searchParams`; this removed the `TabRaces`, `YearSelector`, `Tabs` and `SessionGrid` client components. Only `SearchInput` and `LiveItem` stay client-side.
15. **FIA country codes.** OpenF1 uses `UAE`, `MON`, `NED`, `KSA`, `BRN`; `countryIso3` maps them to ISO alpha-3 for flag lookups.
16. **Session lookup without year.** `getRaces({ sessionKey })` no longer adds the current year to the query, which made past-season session pages 404.
17. **Race control text in sentence case** (`sentenceCase`), keeping abbreviations (DRS, FIA, VSC) and driver codes like (VER).

## Risks / Trade-offs

- [Race control message wording varies by season] → Classifier keys on `flag`/`category` first and only uses message text for SC/VSC; unknown events fall back to neutral `info`; unit tests cover 2023–2026 sample messages.
- [Sessions without `meeting_key` from cache entries written before the type change] → Fallback grouping key `location + year`; cache entries hold full API payloads, so the field is already present.
- [Full season on home increases rendered rows] → Earlier weekends collapsed in `<details>`; winners only for Race/Sprint and streamed.
- [Pit-lane totals include red-flag waits (e.g. 1400 s in Brazil 2024), so bars can be dominated by those drivers] → Out of scope here; a later change could show per-stop times.
- [Light theme surprises users used to dark] → Single deliberate identity per brief; tokens allow adding a night theme later.
- [Yellow flag fill fails contrast as text] → Yellow used only as fill beside ink text; enforced by spec.
- [OpenNext/Cloudflare font loading] → `next/font/google` already used today; same mechanism.

## Migration Plan

UI-only change, shipped in one PR. Rollback = revert the merge commit. No data or cache migration.

## Open Questions

- Should the home hero feature the live weekend when one exists even if a filter excludes its sessions? Proposed: hero always shows the first weekend in the filtered result.
- Driver team colors for pit-stop bars? Out of scope now (requires team data); bars use `ink`.
