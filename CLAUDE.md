# CLAUDE.md — The Conscious Check (app)

This file documents the data schema for this app so copy edits can be made
by editing JSON, not code, plus the open decisions/TODOs left in this build.

## Architecture rule (do not break)

There is **one** result page component (`src/pages/Result.jsx`). It reads an
`archetype` id from the route (`/result/seeker`, `/result/confluence`, etc.),
looks it up in `src/data/archetypes.json`, and renders the same section
structure with that archetype's content. Never build six separate result
pages — add new archetype content as a new key in `archetypes.json`.

## Data schema

### `src/data/questions.json`

Array of 18 items, in display order (the order they appear in the quiz).
Each item:

```json
{
  "id": "Q1",
  "pillar": "Consciousness",
  "reverse": false,
  "stem": "Question text shown to the user.",
  "options": ["option for value 1", "...", "...", "...", "option for value 5"]
}
```

- `options` is always 5 entries. Tapping option index `i` records raw answer
  `i + 1` (1–5).
- `pillar` is one of `Consciousness`, `Action`, `Responsibility`,
  `Engagement`, `Self-Growth`. Each pillar currently has 3 forward-scored
  items; Consciousness, Action, and Self-Growth additionally each have one
  reverse-scored item (R1, R2, R3), so those three pillars sum 4 items and
  Responsibility/Engagement sum 3. `src/lib/scoring.js` computes
  `minPossible`/`maxPossible` per pillar at runtime from however many items
  are tagged to it — **adding or removing a question from any pillar is a
  data change only**, never touch the scoring formula for this.
- `reverse: true` items (R1–R3) are invisible validation items mixed into
  the sequence — same rendering, same tap-target format as every other
  question, no visual tell. Their raw answer is inverted
  (`6 − raw`) before entering their pillar's sum.
- To add/remove/reorder a question: edit this array. The Quiz page's
  progress bar and scoring both derive everything from `questions.json` —
  no other file needs to change for a pure content edit.

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
  result (not in a footer).
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

## Open TODOs (flagged, not silently resolved)

1. **Tiebreak order is locked, not open.** (Listed here only so it isn't
   mistaken for a pending item — see `TIEBREAK_ORDER` above.)
2. **Pillar item counts may change again.** Currently 3 forward + a subset
   with 1 reverse each. Both `questions.json` and `scoring.js` are built so
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
4. **Quiz progress-count framing decided, needs Kanishk's confirmation.**
   The user answers 18 items total (15 scored + 3 invisible reverse items)
   but never learns which are which. This build shows the honest total —
   "Question N of 18" on the quiz progress bar, and "18 questions" in the
   intro page's trust markers/subhead. The original intro-page spec's copy
   said "13 questions" (written before Q14/Q15 and the R1–R3 reverse items
   were added to the instrument) — that number is now stale and has been
   updated to 18 throughout. Confirm this is the framing you want; if you'd
   rather round down to "15" (the scored-only count) for marketing copy
   while keeping the quiz's own progress bar honest at 18, that's a copy
   change in `src/pages/Intro.jsx` and `src/pages/Quiz.jsx` only.
5. **Icons are placeholder line-art**, per the intro-page spec's own note —
   route final bubble/card icons through whoever illustrates the archetype
   deck before this ships broadly.
6. **OG/social share image not generated.** The intro spec calls for a
   static 1200×630 export of the built hero for Open Graph meta tags — not
   done in this build.

## What NOT to do (carried from the build brief)

- No "IMAL" branding or book mentions anywhere in this app.
- Only one result page component — see Architecture rule above.
- Don't hardcode pillar min/max in `scoring.js` — always derive from
  `questions.json` item counts.
- Don't preview archetypes or scoring on the Intro page.
- Don't frame The Confluence as a "top" or superior result in any copy.
