# Oulm Static MVP

Oulm is a static multi-page community MVP for One YMCA, designed around the idea that the real barrier to participation is the anxiety of showing up, not account creation.

This repository contains:
- a touch-first static web prototype built with plain HTML, CSS, and JavaScript
- ambient Three.js moments used selectively as visual framing
- a Leaflet map page for county and venue discovery
- a parallel Xcode project that teammates can later use to recreate the experience natively

## Web Structure

The website is organized around a small shared design system:

- `homebase.html`
- `events.html`
- `event-detail.html`
- `rsvp.html`
- `onboarding.html`
- `map.html`
- `host.html`
- `booking.html`
- `progress.html`
- `partners.html`
- `about.html`

Shared assets live in:

- `assets/css/`
- `assets/js/`
- `assets/media/`
- `docs/`

## Design System Layers

- `assets/css/tokens.css`: color, typography, spacing, radii, shadows, motion
- `assets/css/base.css`: resets, body styles, typography foundations
- `assets/css/layout.css`: shell, grid, header, footer, section primitives
- `assets/css/components.css`: cards, buttons, chips, modals, stepper, form patterns
- `assets/css/pages/`: page-specific styling only where necessary

## Interaction Model

The prototype uses localStorage to persist faux app state:

- `oulm_rsvp`
- `oulm_profile_seed`
- `oulm_booking_draft`
- `oulm_progress`
- `oulm_external_signals`

Every major page includes an `Export JSON` action so the local state can be downloaded as a single artifact.

## Running Locally

Because the site uses ES modules, open it through a local web server instead of double-clicking the HTML files.

Using Python:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Deployment

The site is intended for GitHub Pages or any static host.

1. Push the repository.
2. Point your host at the repo root.
3. Use `index.html` as the entry file.

## Tech Stack

- Web: HTML5, CSS3, JavaScript modules
- Motion / ambience: [Three.js](https://threejs.org/)
- Map: [Leaflet](https://leafletjs.com/)
- Native scaffold: Swift / Xcode

## License

[MIT License](LICENSE)
