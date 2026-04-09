# Oulm Handoff Notes

## Design Tokens

The web prototype is organized so the same language can later be recreated in Svelte or SwiftUI.

Primary token groups in `assets/css/tokens.css`:

- `--color-paper`, `--color-paper-elevated`, `--color-paper-soft`
- `--color-ink`, `--color-ink-strong`, `--color-ink-muted`
- `--color-bronze`, `--color-gold`, `--color-coral`
- `--font-display`, `--font-body`, `--font-mono`
- `--space-*`
- `--radius-*`
- `--shadow-*`
- `--ease-*`, `--dur-*`

## Shared UI Primitives

Core reusable layout and component primitives:

- `site-shell`
- `site-header`
- `site-nav`
- `page-hero`
- `page-section`
- `stack`
- `cluster`
- `card`
- `metric-card`
- `tag`
- `filter-pill`
- `choice-chip`
- `modal`
- `stepper`
- `form-panel`

## Shared Data Modules

The site relies on a few small JS modules rather than page-embedded data:

- `assets/js/data/events.js`
- `assets/js/data/venues.js`
- `assets/js/data/partners.js`

These files are the easiest place to mirror into a future CMS, JSON feed, or app model layer.

## Local State Keys

State is intentionally explicit and exportable:

- `oulm_rsvp`
- `oulm_profile_seed`
- `oulm_booking_draft`
- `oulm_progress`
- `oulm_external_signals`

These are managed in `assets/js/storage.js`.

## Page Roles

- `homebase.html`: emotional and brand anchor
- `events.html`: discovery
- `event-detail.html`: conversion detail page
- `rsvp.html`: commitment before account creation
- `onboarding.html`: interest and cohort shaping
- `map.html`: county and venue locality layer
- `host.html`: hosting rationale
- `booking.html`: intentional-friction host wizard
- `progress.html`: portfolio and proof scaffold
- `partners.html`: local ecosystem and pathways
- `about.html`: brand rationale and trust framing

## Porting Guidance

### Svelte

- map tokens to CSS variables or a theme store
- convert each page into a route
- keep data modules as plain JS/TS objects first
- replace localStorage helpers with a small store wrapper

### SwiftUI

- map colors and typography into a shared theme enum/struct
- treat each page as a top-level screen in a tab + stack navigation model
- convert cards, chips, and metric panels into reusable views
- use the same local state keys or schema names where possible for parity
