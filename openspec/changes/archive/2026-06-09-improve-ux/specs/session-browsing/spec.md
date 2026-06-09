# session-browsing

## ADDED Requirements

### Requirement: Session type filtering includes Sprint
The home page SHALL offer filter buttons for All, Practice, Qualifying, Race, and Sprint session types, and selecting one SHALL show only sessions of that type.

#### Scenario: Filter by Sprint
- **WHEN** the user clicks the SPRINT filter button
- **THEN** the URL contains `sessionType=Sprint` and only Sprint sessions render in the grid

#### Scenario: Filter state combines with year
- **WHEN** a year is selected and a session type filter is clicked
- **THEN** both `year` and `sessionType` params are preserved in the URL and the grid reflects both filters

### Requirement: Empty state for no matching sessions
The home page SHALL display a designed empty state instead of a blank grid when no sessions match the active filter combination.

#### Scenario: No sessions for filter/year combo
- **WHEN** the selected year and session type return zero sessions
- **THEN** an empty state panel renders with a message naming the active filters and a link to reset filters to `/`

### Requirement: Search filters sessions by name
When the search feature flag is enabled, the search input SHALL filter the rendered session list case-insensitively against circuit name, country name, and location as the user types.

#### Scenario: Matching query
- **WHEN** the user types "monza" into the search input
- **THEN** only sessions whose circuit, country, or location matches "monza" (case-insensitive) remain visible

#### Scenario: Non-matching query
- **WHEN** the query matches no sessions
- **THEN** the empty state panel renders with a message indicating no results for the query

#### Scenario: Flag disabled
- **WHEN** the `showSearchInput` flag is off
- **THEN** no search input renders and the grid is unfiltered

### Requirement: Unified filter bar
The year selector, session type filters, and (when flagged) search input SHALL be grouped in a single labeled control bar that wraps gracefully on narrow viewports.

#### Scenario: Mobile layout
- **WHEN** the viewport is narrower than the combined control width
- **THEN** the controls wrap onto multiple rows without horizontal overflow

### Requirement: Staggered grid reveal
The session grid SHALL animate items in with a staggered fade-up on load, and SHALL skip the animation when the user prefers reduced motion.

#### Scenario: Default motion
- **WHEN** the home page loads with motion preferences unset
- **THEN** cards fade and translate up sequentially with per-item delay, total stagger not exceeding ~540ms

#### Scenario: Reduced motion
- **WHEN** `prefers-reduced-motion: reduce` is set
- **THEN** cards render immediately with no animation

### Requirement: Detail navigation preserves filter state
Navigating to a session detail page from a filtered listing SHALL carry the listing's filter state so the user can return to the same view.

#### Scenario: Details link carries filters
- **WHEN** the user clicks "Details" on a card while `year=2025&sessionType=Race` is active
- **THEN** the session URL includes a `from` parameter encoding that query string
