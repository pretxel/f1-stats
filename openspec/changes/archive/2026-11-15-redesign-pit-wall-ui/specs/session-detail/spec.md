## ADDED Requirements

### Requirement: Session flag strip
The session detail header SHALL show a horizontal flag strip running from the scheduled start to the scheduled end, or to the chequered flag when the session ran late, divided into segments colored by track-wide status derived from race control events: not started (before "SESSION STARTED", when the feed has one), green, safety car, virtual safety car, red flag, and chequered. A finished session SHALL end with a chequered cap. Sector yellow flags SHALL appear as tick marks at their time position. The strip SHALL have a visible legend naming each state present and an accessible text summary.

#### Scenario: Safety car period
- **WHEN** race control contains "SAFETY CAR DEPLOYED" at 17:42 and "SAFETY CAR IN THIS LAP" at 17:51 in a 17:00–19:00 session
- **THEN** the strip shows a `flag-sc` segment from 35% to 42.5% of its width, and the legend includes "Safety car"

#### Scenario: Red flag
- **WHEN** race control contains an event with `flag=RED` and `scope=Track`
- **THEN** the strip shows a `flag-red` segment from that time until the next track-wide green or clear event

#### Scenario: Delayed start and late finish
- **WHEN** a race scheduled 15:30–17:30 has "SESSION STARTED" at 15:49:57 and the chequered flag at 17:56:52 (Brazil 2024)
- **THEN** the strip starts with a "Not started" segment until 15:49:57 and runs to 17:56:52, ending in a chequered cap

#### Scenario: No race control data
- **WHEN** the session has no race control events
- **THEN** the strip is not rendered

#### Scenario: Screen reader summary
- **WHEN** a screen reader reaches the strip
- **THEN** it announces a summary such as "Track status: green, safety car 17:42–17:51, green, chequered flag 18:36"

### Requirement: Race control events show flag category
Each race control event SHALL show its local time (HH:mm:ss), a marker and label for its kind (Green flag, Yellow flag, Red flag, Blue flag, Safety car, Chequered flag, DRS, or Info), the sector when `scope=Sector`, and the message text. Events with an unknown flag or category SHALL use the neutral Info kind.

#### Scenario: Yellow in sector
- **WHEN** an event has `flag=YELLOW`, `scope=Sector`, `sector=7`
- **THEN** the row shows a `flag-yellow` marker, the label "Yellow flag · Sector 7", and the message

#### Scenario: Unknown category
- **WHEN** an event has `category=CarEvent` and no flag
- **THEN** the row shows the neutral Info marker in `ink-soft` with no flag color

### Requirement: Pit stops ranked by total time
The pit stops tab SHALL list drivers sorted by total pit time ascending, each with stop count, total time in seconds with one decimal, and a horizontal bar whose length is proportional to that driver's total relative to the longest total.

#### Scenario: Ranking
- **WHEN** driver A has 46.2 s total and driver B has 48.9 s
- **THEN** A renders above B and B's bar is the longest if 48.9 s is the maximum

#### Scenario: Bar is not the only signal
- **WHEN** a pit stop row renders
- **THEN** the numeric total is visible as text alongside the bar

### Requirement: Tabs as segmented control
The Race control / Pit stops switch SHALL render as a link-based segmented control on all viewport sizes, with `aria-current="page"` on the active tab, and SHALL preserve existing query params (including `from`) when switching.

#### Scenario: Mobile tabs
- **WHEN** the viewport is 375px wide
- **THEN** both tabs render as links (no `<select>`) and are fully visible

#### Scenario: Switch keeps from
- **WHEN** the URL contains `from=year%3D2025` and the user selects Pit stops
- **THEN** the new URL contains both `selectedTab=2` and the unchanged `from` parameter

## MODIFIED Requirements

### Requirement: Session identity header
The session detail page SHALL display a header above the tabs containing the country flag, the circuit name in expanded-width display type, country and location, the session name, the formatted local day and start–end time, the session flag strip, and a live indicator when the session is live.

#### Scenario: Past session
- **WHEN** the user opens `/session/[id]` for a completed session
- **THEN** the header shows flag, circuit name, country and location, session name, day with start–end time, and the flag strip, with no live indicator

#### Scenario: Live session
- **WHEN** the session's time window contains the current time
- **THEN** the header additionally shows the "Live" indicator with auto-refresh behavior, and the flag strip ends at the current time
