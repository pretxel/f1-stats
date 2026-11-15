## ADDED Requirements

### Requirement: Daylight pit-wall palette
All pages SHALL use the design tokens `concrete` (#DADDD8) as page background, `slab` (#EEF0EC) for raised surfaces, `ink` (#12324A) for primary text and controls, `ink-soft` (#46596A) for secondary text, and `rule` (#B9BEB7) for dividers. The previous `carbon*`, `f1red*`, `chromium`, `muted*`, and `gold` tokens, the grain overlay, and the red radial glow SHALL be removed.

#### Scenario: Page background
- **WHEN** any page renders
- **THEN** the body background is `concrete` and body text color is `ink`

#### Scenario: Legacy tokens gone
- **WHEN** the codebase is searched for `carbon`, `f1red`, `chromium`, or `text-gold` class usage
- **THEN** no matches remain in `src/`

### Requirement: Flag colors carry meaning only
Saturated colors SHALL be limited to the flag tokens `flag-green`, `flag-yellow`, `flag-red`, `flag-blue`, `flag-sc`, and the chequered pattern, and SHALL be used only to represent a flag or track state. Every flag color SHALL be accompanied by a visible text label naming the state, and flag yellow SHALL NOT be used as a text color.

#### Scenario: Flag marker has label
- **WHEN** a race control event, flag strip segment, or live badge shows a flag color
- **THEN** a text label naming that state (e.g. "Safety car", "Red flag", "Live") is visible next to it or in an adjacent legend

#### Scenario: No decorative accent
- **WHEN** a non-flag element such as a button, tab, link, or heading renders
- **THEN** it uses `ink`, `ink-soft`, `slab`, `concrete`, or `rule` only

### Requirement: Archivo width-axis typography
The app SHALL load Archivo as a variable font with the width axis via `next/font` and use it for all text: expanded width (wdth 125, weight 800) for circuit and weekend names, normal width for body text, and condensed width (wdth 75) with tabular figures for times, durations, and counts. Barlow Condensed and JetBrains Mono SHALL be removed.

#### Scenario: Circuit name style
- **WHEN** a circuit or weekend name renders as a heading
- **THEN** it uses Archivo at width 125, weight 800, without forced uppercase or italic

#### Scenario: Numeric data alignment
- **WHEN** times or pit durations render in a list
- **THEN** they use condensed Archivo with `tabular-nums` so digits align vertically

### Requirement: Readable labels
Visible text SHALL be at least 12px. Labels SHALL use sentence case without letter-spaced uppercase styling.

#### Scenario: Minimum size
- **WHEN** any page is inspected
- **THEN** no visible text has a computed font size below 12px

#### Scenario: Sentence case labels
- **WHEN** labels such as filter names, tab names, and field captions render
- **THEN** they are sentence case (e.g. "Race control", "Pit stops"), not all caps

### Requirement: Accessible contrast and focus
Text SHALL meet WCAG AA contrast (4.5:1 normal, 3:1 large) against its background, and every interactive element SHALL show a visible focus indicator when focused by keyboard.

#### Scenario: Keyboard focus
- **WHEN** the user tabs through filters, weekend rows, session links, tabs, and the back link
- **THEN** each focused element shows a 2px `ink` outline with offset

#### Scenario: Secondary text contrast
- **WHEN** `ink-soft` text renders on `concrete` or `slab`
- **THEN** the contrast ratio is at least 4.5:1

### Requirement: Restrained motion
Non-user-triggered motion SHALL be limited to the live indicator pulse. Scroll-triggered reveals and staggered entrance animations SHALL NOT be used. All animation SHALL be disabled under `prefers-reduced-motion: reduce`.

#### Scenario: No scroll reveal
- **WHEN** the user scrolls a race control timeline or pit stop list
- **THEN** rows are already fully visible with no fade or translate animation

#### Scenario: Reduced motion
- **WHEN** `prefers-reduced-motion: reduce` is set
- **THEN** the live indicator does not pulse and tab content swaps without a fade
