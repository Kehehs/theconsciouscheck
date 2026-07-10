# The Conscious Check

A three-page self-assessment web app: **Intro → Quiz → Result**. Standalone
sub-brand product for `imalcares.org` — deliberately not dressed in IMAL's
main visual system (see `CLAUDE.md` and the theme doc it was built from for
why).

The user answers 18 short scenario-based questions and lands on one of six
archetypes (Seeker, Catalyst, Anchor, Builder, Sage, or the rare Confluence),
with a shareable result card, a five-pillar radar chart, and archetype-specific
copy.

## Run locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. Routes: `/` (Intro), `/quiz`, `/result/:archetype`.

```bash
npm run build     # production build to dist/
npm run preview   # serve the production build locally
```

## Editable content

All quiz and result copy lives in data files, not component code:

- **`src/data/questions.json`** — the 18-item answer sequence (15 scored +
  3 invisible reverse-scored validation items).
- **`src/data/archetypes.json`** — full result-page copy for all six
  archetypes.
- **`src/data/shared.json`** — composite-band text, the disclaimer, and CTA
  copy shared across every result.

See `CLAUDE.md` for the exact schema and the rules for editing these safely.

## Stack

Vite + React (JS), Tailwind CSS v4, react-router-dom, framer-motion,
recharts, html-to-image, zustand. Fonts: Fredoka 600 + Nunito 400–700 via
Google Fonts (`font-display: swap`).

## Deployment

Deployed via Vercel. See `CLAUDE.md` for the current preview URL and
deployment notes.
