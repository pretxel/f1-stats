# session-detail

## ADDED Requirements

### Requirement: Session identity header
The session detail page SHALL display a header above the tabs containing the country flag, circuit short name, country name, session type badge, formatted start and end times, and a live indicator when the session is live.

#### Scenario: Past session
- **WHEN** the user opens `/session/[id]` for a completed session
- **THEN** the header shows flag, circuit name, country, session type badge, and start/end times, with no live indicator

#### Scenario: Live session
- **WHEN** the session's time window contains the current time
- **THEN** the header additionally shows the live indicator with auto-refresh behavior

### Requirement: Back navigation to listing
The session detail page SHALL display a back link to the session listing that restores the filters active when the user navigated in.

#### Scenario: Return with filters
- **WHEN** the page URL contains `from=year%3D2025%26sessionType%3DRace` and the user clicks the back link
- **THEN** the browser navigates to `/?year=2025&sessionType=Race`

#### Scenario: Direct visit without filters
- **WHEN** the page URL has no `from` parameter
- **THEN** the back link targets `/`

### Requirement: Race control empty state
The race control tab SHALL display a designed empty state when the session has no race control events.

#### Scenario: No events
- **WHEN** the race control service returns zero events for the session
- **THEN** an empty state panel renders stating no race control messages exist, instead of an empty list

### Requirement: Pit stops empty state
The pit stops tab SHALL display a designed empty state when the session has no pit stop data.

#### Scenario: No pit stops
- **WHEN** the pit stop service returns zero entries for the session
- **THEN** an empty state panel renders stating no pit stops were recorded, instead of an empty table

### Requirement: Tab content transition
Switching between Race Control and Pit Stops tabs SHALL fade the incoming content in, and SHALL skip the animation when the user prefers reduced motion.

#### Scenario: Tab switch
- **WHEN** the user switches tabs with motion preferences unset
- **THEN** the new tab content fades in over roughly 200ms

#### Scenario: Reduced motion
- **WHEN** `prefers-reduced-motion: reduce` is set
- **THEN** tab content appears immediately with no animation
