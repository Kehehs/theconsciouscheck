# CLAUDE.md — The Conscious Check (app)

This file documents the data schema for this app so copy edits can be made
by editing JSON, not code, plus the open decisions/TODOs left in this build.

## Architecture rule (do not break)

There is **one** result page component (`src/pages/Result.jsx`). It reads an
`archetype` id from the route (`/result/seeker`, `/result/confluence`, etc.),
looks it up in `src/data/archetypes.json`, and renders the same section
structure with that archetype's content. Never build six separate result
pages — add new archetype content as a new key in `archetypes.json`.

The result page layout follows `Results Page/Conscious_Check_Result_Page_Design_Spec.md`
(v2): no radar chart, enlarged card as the sole hero visual, highlighted
disclaimer box, two-column Light/Shadow and Career/Relationships, and a
standout Growth Edge callout. If that spec is revised again, update
`Result.jsx`'s JSX/Tailwind classes only — content still comes from
`archetypes.json` unchanged.

## Data schema

### `src/data/questions.json`

Array of exactly **15 items**, in display order (the order they appear in
the quiz — this is the canonical Q1–Q15 order from
`The New Conscious Check.md`, including Q14/Q15). Each item:

```json
{
  "id": "Q1",
  "pillar": "Consciousness",
  "stem": "Question text shown to the user.",
  "options": ["option for value 1", "...", "...", "...", "option for value 5"]
}
```

- `options` is always 5 entries. Tapping option index `i` records raw answer
  `i + 1` (1–5).
- `pillar` is one of `Consciousness`, `Action`, `Responsibility`,
  `Engagement`, `Self-Growth`. Each pillar has exactly 3 items:
  Consciousness (Q1, Q2, Q11), Action (Q3, Q4, Q14), Responsibility (Q5,
  Q7, Q10), Engagement (Q6, Q12, Q13), Self-Growth (Q8, Q9, Q15).
  `src/lib/scoring.js` computes `minPossible`/`maxPossible` per pillar at
  runtime from however many items are tagged to it — **adding or removing
  a question from any pillar is a data change only**, never touch the
  scoring formula for this.
- To add/remove/reorder a question: edit this array. The Quiz page's
  progress bar and scoring both derive everything from `questions.json` —
  no other file needs to change for a pure content edit.
- **No reverse-scored items in this build.** An earlier draft mixed in
  three invisible reverse-scored validation items (R1–R3); those were
  removed on 2026-07-10 at Kanishk's request — the instrument is exactly
  the 15 canonical questions now, nothing invisible. If reverse-scored
  validation items are wanted again, they'd be added back as items with a
  `reverse: true` flag — `scoring.js` no longer reads that flag, so it
  would need to be reintroduced there too (see git history before this
  change for the old implementation).

### `src/data/archetypes.json`

Object keyed by archetype id (`seeker`, `catalyst`, `anchor`, `builder`,
`sage`, `confluence`). Each entry has: `pillar`, `name`, `identity`,
`cardImage` (path under `/public/cards/`), `recognition`, `light`,
`shadow`, `growthEdge`, `career`, `relationships`, `closingLine`. All text
extracted verbatim from `Conscious_Check_Result_Page_Content.md` — do not
paraphrase when editing, keep changes intentional and reviewed against that
source doc if it's ever updated.

### `src/data/shared.json`

- `compositeBands`: 4 bands (`nascent`, `developing`, `practising`,
  `integrated`) with `min`/`max` score ranges and shared band text.
- `disclaimer`: full disclaimer text, shown next to the score on every
  result (not in a footer), in the highlighted amber callout box.
- `cta`: the single shared CTA (`buttonLabel`, `supportingLine`).

## Scoring engine (`src/lib/scoring.js`)

Pure, testable, and documented inline. Key exports:

- `scoreQuiz(answers)` — takes `{ [questionId]: 1-5 }`, returns pillar
  scores, composite, band, and archetype id.
- `resolveArchetype(pillarScores)` — pure function, isolated so it's easy
  to unit test. Two required test cases already included as
  `_runScoringSelfTests()`: a straight-line all-equal answer set (must
  resolve to Confluence) and a partial 2/3-pillar tie (must resolve via
  `TIEBREAK_ORDER`). **No test runner is wired into this project yet** —
  add one (Vitest recommended, pairs natively with Vite) before this ships,
  and convert `_runScoringSelfTests` into real test cases.
- `TIEBREAK_ORDER` — locked, CARES acronym order
  (`Consciousness, Action, Responsibility, Engagement, Self-Growth`). Not a
  placeholder, do not change without an explicit decision from Kanishk.

## Result page components (v2 layout)

- `ResultCard.jsx` — renders only the archetype's card image (no radar,
  no watermark panel). This is the exact node `html-to-image` captures for
  the share action.
- `Disclaimer.jsx` — solid light-amber background (`#f3ddc4`) with dark
  text, not a translucent tint — a translucent amber-on-navy tint tested
  too dark for the required dark-on-light contrast, so it's a solid fill.
- `CompositeBand.jsx` — quiet label + short band description, intentionally
  small so it doesn't compete with the recognition paragraph.
- Light/Shadow and Career/Relationships render as two-column grids
  (`sm:grid-cols-2`) directly in `Result.jsx`, matching the design spec.
  No separate component files for these — they're simple enough to inline.

## Known asset issue (not fixed by this build)

**`public/cards/seeker.webp` (source: `Results Page/Archetype cards/The
Seeker.png`) is missing the gold arch frame and "THE SEEKER" caption strip
that all five other archetype cards have.** The other five source PNGs
(Anchor, Catalyst, Builder, Sage, Confluence) each bake the full
mythic-tarot frame and name into the image; the Seeker asset is just the
inner artwork bleeding to the edges, no frame, no caption. This wasn't
something this build's instructions authorized fixing (no image editing
was in scope, and inventing frame art would violate "don't invent content
not in the source docs"). **Needs a corrected Seeker card asset from
whoever illustrated the other five**, then a re-export to webp (same
process as the other five: convert via `sharp`, `.webp({ quality: 88 })`).

## Open TODOs (flagged, not silently resolved)

1. **Tiebreak order is locked, not open.** (Listed here only so it isn't
   mistaken for a pending item — see `TIEBREAK_ORDER` above.)
2. **Pillar item counts may change again.** Currently 3 items per pillar,
   15 total. Both `questions.json` and `scoring.js` are built so
   adding/removing an item from any pillar is a data-only change — verify
   this stays true if the scoring step is ever touched.
3. **WhatsApp/phone-number routing is NOT built.** The "Join your
   archetype's community" CTA on the result page currently calls
   `submitToWhatsAppRouting(answers, archetypeId)`, a stub in
   `src/lib/scoring.js` that only `console.warn`s — no backend, no phone
   capture. This is the marked integration point for the future n8n/AiSensy
   webhook POST. **Pending a UX decision from Kanishk on where the phone
   number gets captured** (pre-result vs. on CTA click) before building
   further.
4. **Icons are placeholder line-art**, per the intro-page spec's own note —
   route final bubble/card icons through whoever illustrates the archetype
   deck before this ships broadly.
5. **OG/social share image not generated.** The intro spec calls for a
   static 1200×630 export of the built hero for Open Graph meta tags — not
   done in this build.
6. **Seeker card asset needs a frame/caption fix** — see "Known asset
   issue" above.

## What NOT to do (carried from the build brief)

- No "IMAL" branding or book mentions anywhere in this app.
- Only one result page component — see Architecture rule above.
- Don't hardcode pillar min/max in `scoring.js` — always derive from
  `questions.json` item counts.
- Don't preview archetypes or scoring on the Intro page.
- Don't frame The Confluence as a "top" or superior result in any copy.
- No radar chart or other data-viz inside/beneath the result card, per the
  v2 design spec — that was a deliberate removal, not an oversight.
