## Why

The current UI is a generic dark template: near-black background with F1 red as the only accent, 9–10px monospace ALL-CAPS labels on every value, identical cards, and scroll-triggered animations on every list item. It is hard to read, the red carries no information, and the home page shows sessions as isolated cards even though fans think in race weekends. The redesign gives F1 Stats its own identity — a daylight pit-wall look where color comes from the marshal flag system and encodes what happened in a session.

## What Changes

- **New visual system ("pit wall by day")**: light concrete background, petrol-blue ink, Archivo variable font using its width axis (expanded for circuit names, condensed for data, tabular figures). Replaces Barlow Condensed + JetBrains Mono, the F1-red accent, grain overlay, and red glow.
- **Flag color semantics**: green, yellow, red, blue, safety-car amber and chequered are the only saturated colors, used only where the data is a flag state. Always paired with a text label, never color alone.
- **Home grouped by race weekend**: sessions of the selected year render grouped by meeting (newest weekend first), each weekend showing its sessions as rows with status (done / live / upcoming) and the winner for Race and Sprint. Replaces the 3-column card grid and the "last 3 sessions" default. **BREAKING** (UI): default view shows the whole selected season instead of 3 cards.
- **Filters reworked**: year and session type become segmented controls with sentence-case labels; default year is the current season instead of "All".
- **Session detail**:
  - Header restyled with expanded circuit name and a session flag strip: a horizontal bar from session start to end, colored by track status derived from race control flag messages. This is the page's signature element.
  - Race control timeline: each event marked with its flag/category (label + color), readable time (HH:mm:ss), sentence-case message.
  - Pit stops: drivers sorted by total pit time with proportional horizontal bars.
  - Tabs become a segmented control on all viewports (no mobile `<select>`).
- **Motion**: remove per-item scroll reveal and staggered grid entrance. Keep one deliberate motion: the live indicator pulse. Tab content swap stays a short fade. All motion respects `prefers-reduced-motion`.
- **Accessibility floor**: minimum 12px text, WCAG AA contrast, visible keyboard focus on every control, flag meaning never conveyed by color alone.
- **Cleanup**: delete unused `switchSessionType.tsx`; `raceControlItem` and `pitstopItem` stop being client components (no `useIsVisible`).
- **Copy**: sentence case, plain labels ("Started", "Pit time"), empty states say what to do next.

## Capabilities

### New Capabilities
- `visual-system`: design tokens (palette, flag colors, typography, spacing), accessibility floor, and motion policy that every page follows.

### Modified Capabilities
- `session-browsing`: listing grouped by race weekend instead of a card grid; default season is the current year; staggered grid reveal removed; empty state copy updated.
- `session-detail`: header gains the session flag strip; race control events show flag/category; pit stops shown as sorted proportional bars; tabs as segmented control on all viewports.

## Impact

- **Code**: `src/app/layout.tsx`, `src/app/globals.css`, `tailwind.config.ts`, `src/app/page.tsx`, `src/app/session/[id]/page.tsx`, `src/app/error.tsx`, `src/app/opengraph-image.tsx`, `src/app/icon.tsx`, most of `src/components/`; new utils for weekend grouping, flag classification, and flag-strip segments (with unit tests).
- **Types**: `RaceItemType` gains `meeting_key`; `RaceControlTypeItem` gains optional `flag`, `scope`, `lap_number` (already returned by the API, currently untyped).
- **Data/services**: no new endpoints. Home fetches the whole season (already does via `getRaces({ year })`); winner lookups only for Race/Sprint sessions, reducing API calls.
- **Dependencies**: none added; Barlow Condensed and JetBrains Mono `next/font` imports replaced by Archivo.
- **Feature flags**: `showSearchInput` behavior unchanged; search input restyled.
