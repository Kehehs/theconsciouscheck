# CLAUDE.md — The Conscious Check (app)

This file documents the data schema for this app so copy edits can be made
by editing JSON, not code, plus the open decisions/TODOs left in this build.

## LOCKED INSTRUMENT — do not change without explicit confirmation

`src/data/questions.json` is **15 items, no more, no less** — the exact
wording, order, pillar tags, and type labels of
`Conscious_Check_Questions_EN_Final.md`. Q1, Q7, and Q13 are
reverse-scored via `"reverse": true` on those three objects; there are
no separate R1/R2/R3 items. Do not change the question count, remove
items, or alter the reverse-scoring logic in `src/lib/scoring.js`
(`q.reverse ? 6 - value : value`, read from each question's own `reverse`
flag — never hardcode by id) without explicit confirmation from Kanishk,
even if a different instruction seems to imply it. This has already gone
wrong twice: commit `4a11bf9` removed the reverse-scored items entirely
on 2026-07-10 ("remove reverse-scored items"), then they were restored as
standalone R1/R2/R3 objects (18 total) instead of a `reverse` flag on
Q1/Q7/Q13 — both were mistakes, fixed on 2026-07-15 by swapping in the
final 15-question set with `reverse: true` set directly on the three
questions it belongs to. Don't repeat either mistake without checking
first.

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

Array of exactly **15 items**, in display order (Q1–Q15, matching
`Conscious_Check_Questions_EN_Final.md`). Each item:

```json
{
  "id": "Q1",
  "pillar": "Consciousness",
  "type": "Situational",
  "reverse": true,
  "stem": "Question text shown to the user.",
  "options": ["option for value 1", "...", "...", "...", "option for value 5"]
}
```

- `options` is always 5 entries. Tapping option index `i` records raw answer
  `i + 1` (1–5). If `reverse: true`, `scoring.js` inverts it (`6 - value`)
  before summing into the pillar total, reading the flag off the question
  object itself — see the LOCKED INSTRUMENT note above.
- `type` is one of `Situational`, `Direct`, `Values-based` — carried over
  from the source doc's question-format labels. Not currently read by any
  UI or scoring code; it's provenance metadata, kept in case question
  format ever needs to vary by type.
- `pillar` is one of `Consciousness`, `Action`, `Responsibility`,
  `Engagement`, `Self-Growth`, exactly 3 items each:
  Consciousness (Q1 reverse, Q6, Q11), Action (Q2, Q7 reverse, Q15),
  Responsibility (Q3, Q8, Q10), Engagement (Q4, Q12, Q14), Self-Growth
  (Q5, Q9, Q13 reverse). `src/lib/scoring.js` computes
  `minPossible`/`maxPossible` per pillar at runtime from however many
  items are tagged to it — **adding or removing a question from any
  pillar is a data change only**, never touch the scoring formula for
  this.
- To add/remove/reorder a question: edit this array — but see the LOCKED
  INSTRUMENT note above before removing or adding anything, this file has
  a history of being "cleaned up" by mistake.

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
  `TIEBREAK_ORDER`). Vitest is now wired in (`npm test`), with
  `src/data/questions.test.js` covering the pillar mapping — but
  `_runScoringSelfTests` itself still hasn't been converted into real
  Vitest cases; that's still open.
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
