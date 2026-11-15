# session-browsing

## Purpose

Home page session listing: filtering by year and session type (including Sprint), search, empty states, and load motion.
## Requirements
### Requirement: Session type filtering includes Sprint
The home page SHALL offer session type filter links for All, Practice, Qualifying, Sprint, and Race, and selecting one SHALL show only sessions of that type, still grouped by weekend; weekends with no matching sessions SHALL be omitted.

#### Scenario: Filter by Sprint
- **WHEN** the user selects the Sprint filter
- **THEN** the URL contains `sessionType=Sprint` and only weekends with a Sprint render, each showing only its Sprint session rows

#### Scenario: Filter state combines with year
- **WHEN** a year is selected and a session type filter is selected
- **THEN** both `year` and `sessionType` params are preserved in the URL and the listing reflects both filters

### Requirement: Empty state for no matching sessions
The home page SHALL display a designed empty state instead of an empty listing when no sessions match the active filter combination. The message SHALL name the active filters and offer a link that clears them.

#### Scenario: No sessions for filter/year combo
- **WHEN** the selected year and session type return zero sessions
- **THEN** an empty state renders with a message such as "No Sprint sessions in 2023." and a "Clear filters" link to `/`

### Requirement: Search filters sessions by name
When the search feature flag is enabled, the search input SHALL filter the listing case-insensitively against circuit name, country name, and location as the user types, hiding weekends with no matching sessions.

#### Scenario: Matching query
- **WHEN** the user types "monza" into the search input
- **THEN** only weekends whose circuit, country, or location matches "monza" (case-insensitive) remain visible

#### Scenario: Non-matching query
- **WHEN** the query matches no sessions
- **THEN** the empty state renders with a message naming the query and a way to clear it

#### Scenario: Flag disabled
- **WHEN** the `showSearchInput` flag is off
- **THEN** no search input renders and the listing is unfiltered

### Requirement: Unified filter bar
The season selector, session type filters, and (when flagged) search input SHALL be grouped in a single control bar of segmented link controls with visible sentence-case labels, wrapping gracefully on narrow viewports.

#### Scenario: Mobile layout
- **WHEN** the viewport is narrower than the combined control width
- **THEN** the controls wrap onto multiple rows (or the segmented control scrolls horizontally within its own row) without horizontal page overflow

#### Scenario: Works without JavaScript
- **WHEN** JavaScript has not loaded and the user activates a filter
- **THEN** the browser navigates to the filtered URL because each filter is a link

### Requirement: Detail navigation preserves filter state
Navigating to a session detail page from a filtered listing SHALL carry the listing's filter state so the user can return to the same view.

#### Scenario: Session row link carries filters
- **WHEN** the user activates a session row while `year=2025&sessionType=Race` is active
- **THEN** the session URL includes a `from` parameter encoding that query string

### Requirement: Sessions grouped by race weekend
The home page SHALL render sessions of the selected season grouped by race weekend (`meeting_key`, falling back to location and year when absent). Weekends SHALL be ordered newest first by their first session start, and sessions within a weekend SHALL be ordered by start time ascending. Each weekend SHALL show its date range, country, and location name.

#### Scenario: Weekend grouping
- **WHEN** the season contains Practice 1, Qualifying, and Race sessions sharing one `meeting_key`
- **THEN** they render as three rows under a single weekend heading, in chronological order

#### Scenario: Weekend ordering
- **WHEN** the season contains weekends in Austin (October) and São Paulo (November)
- **THEN** São Paulo renders above Austin

### Requirement: Latest weekend featured
The most recent weekend that has already started (or, before the season starts, the next weekend) SHALL render expanded with a large expanded-width location heading and all its session rows visible. Upcoming weekends SHALL render under "Coming up" ordered soonest first, and earlier weekends under "Earlier in <year>" ordered newest first. Both lists SHALL render collapsed with a summary (date range, country, location, session count) and SHALL expand on activation without requiring JavaScript.

#### Scenario: Featured weekend
- **WHEN** the home page loads on 15 Nov 2026 and the season has São Paulo (6–8 Nov) and Las Vegas (20–22 Nov)
- **THEN** São Paulo is featured with its session rows visible, and Las Vegas is listed under "Coming up"

#### Scenario: Before the season
- **WHEN** no weekend of the selected season has started
- **THEN** the first weekend of the season is featured

#### Scenario: Expand earlier weekend
- **WHEN** the user activates a collapsed weekend summary by click or keyboard
- **THEN** its session rows become visible

### Requirement: Session row status
Each session row SHALL show the session name, local start day and time, and a status: "Live" with a pulsing `flag-green` marker when the session is in progress, "Upcoming" before start, and "Done" after end. Finished Race and Sprint rows of the featured weekend SHALL show "Won by <driver>" instead of "Done" when a winner is available. Winner data SHALL NOT be requested for Practice or Qualifying sessions, nor for weekends other than the featured one (OpenF1 allows 30 requests per minute and each winner costs two). Session times SHALL be shown in the circuit's local time, with a note saying so.

#### Scenario: Live session row
- **WHEN** the current time is within a session's start and end
- **THEN** the row shows a green marker and the text "Live"

#### Scenario: Finished race
- **WHEN** a Race session of the featured weekend has ended and the winner service returns a driver
- **THEN** the row shows "Won by" followed by the driver's name

#### Scenario: Race in an earlier weekend
- **WHEN** a Race session in a collapsed earlier weekend has ended
- **THEN** the row shows "Done" and no winner request is made for it

#### Scenario: Practice row
- **WHEN** a Practice session has ended
- **THEN** the row shows "Done" and no winner request is made for it

### Requirement: Current season by default
The home page SHALL default to the current season when no `year` parameter is present, and the season selector SHALL offer individual years only (no "All" option).

#### Scenario: No year param
- **WHEN** the user opens `/`
- **THEN** sessions of the current year render and the current year is marked active in the season selector

