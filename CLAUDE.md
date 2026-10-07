# CLAUDE.md - The MyndCheck (app)

This file documents the data schema for this app so copy edits can be made
by editing JSON, not code, plus the open decisions/TODOs left in this build.

## LOCKED INSTRUMENT — do not change without explicit confirmation

`src/data/questions.json` is **15 items, no more, no less** — the exact
wording, order, pillar tags, and type labels of
`Conscious_Check_Questions_EN_Final.md`. No question is reverse-scored;
all 15 score as picked (option 1 = 1 point, option 5 = 5 points), and
there are no separate R1/R2/R3 items. Do not change the question count or
remove items without explicit confirmation from Kanishk, even if a
different instruction seems to imply it. This has already gone wrong
before: commit `4a11bf9` removed the (then-existing) reverse-scored items
entirely on 2026-07-10 ("remove reverse-scored items"), then they were
restored as standalone R1/R2/R3 objects (18 total) instead of a `reverse`
flag on Q1/Q7/Q13, fixed on 2026-07-15 by swapping in the 15-question set
with `reverse: true` set on those three. That flag was itself removed on
2026-09-20: Q1/Q7/Q13's options run the same least-to-most-conscious
order as every other question, so `6 - value` was silently scoring the
most conscious answer on those three items as the least conscious one.
All 15 questions now score identically. Don't repeat any of these
mistakes without checking first.

## Architecture rule (do not break)

There is **one** result page component (`src/pages/Result.jsx`). It reads an
`archetype` id from the route (`/result/seeker`, `/result/confluence`, etc.),
looks it up in `src/data/archetypes.json`, and renders the same section
structure with that archetype's content. Never build six separate result
pages — add new archetype content as a new key in `archetypes.json`.

The result page is deliberately short (simplified from the v2 design spec):
the EN / हिंदी toggle (top right of the content column, above the card),
card with Save/Share, archetype name and identity line, composite band and
score, the highlighted disclaimer box, the recognition paragraph, then the
single "Discover MyndVerse" CTA and the quiet "Retake the check" link.
The Light, Shadow, Growth Trajectory, Career and Relationships blocks and
the closing line were removed from the page and from the data on purpose, so
don't re-add them without checking first. Update `Result.jsx`'s JSX/Tailwind
classes for layout changes; content comes from `archetypes.json` and
`shared.json`.

## Data schema

### `src/data/questions.json`

Array of exactly **15 items**, in display order (Q1–Q15, matching
`Conscious_Check_Questions_EN_Final.md`). Each item:

```json
{
  "id": "Q1",
  "pillar": "Consciousness",
  "type": "Situational",
  "stem": "Question text shown to the user.",
  "options": ["option for value 1", "...", "...", "...", "option for value 5"]
}
```

- `options` is always 5 entries. Tapping option index `i` records raw answer
  `i + 1` (1–5), summed as-is into the pillar total — no question is
  reverse-scored (see the LOCKED INSTRUMENT note above).
- `type` is one of `Situational`, `Direct`, `Values-based` — carried over
  from the source doc's question-format labels. Not currently read by any
  UI or scoring code; it's provenance metadata, kept in case question
  format ever needs to vary by type.
- `pillar` is one of `Consciousness`, `Action`, `Responsibility`,
  `Engagement`, `Self-Growth`, exactly 3 items each:
  Consciousness (Q1, Q6, Q11), Action (Q2, Q7, Q15),
  Responsibility (Q3, Q8, Q10), Engagement (Q4, Q12, Q14), Self-Growth
  (Q5, Q9, Q13). `src/lib/scoring.js` computes
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
`cardImage` (path under `/public/cards/`) and `recognition`. All text
extracted verbatim from `Conscious_Check_Result_Page_Content.md` — do not
paraphrase when editing, keep changes intentional and reviewed against that
source doc if it's ever updated.

### `src/data/shared.json`

- `compositeBands`: 4 bands (`nascent`, `developing`, `practising`,
  `integrated`) with `min`/`max` score ranges and shared band text.
- `disclaimer`: full disclaimer text, shown next to the score on every
  result (not in a footer), in the highlighted amber callout box.
- `cta`: the single shared result-page CTA (`supportingLine`, `buttonLabel`, `href`). It is an external link to https://myndverse.in/ that opens in a new tab. The Hindi lines are a draft pending human review.

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
- `CTAButton.jsx` renders an anchor (new tab, `rel="noopener noreferrer"`)
  when given an `href`, otherwise a button, with the same look either way.
- `LanguageToggle.jsx` is fixed top-right by default; `inline` lets a page
  place it (the result page puts it at the top right, above the card).
- `FeedbackModal.jsx` (+ `lib/feedback.js`, `feedbackQuestions.json`,
  `google-apps-script/feedback-submit.gs`, `VITE_FEEDBACK_SCRIPT_URL`) is no
  longer rendered by the result page. Kept in the repo, unreferenced, until
  Kanishk decides whether to retire it.

## Known asset issue — fixed 2026-08-16

`public/cards/seeker.webp` was missing the gold arch frame and "THE
SEEKER" caption strip that the other five archetype cards have. Fixed by
re-exporting all six cards from `Results Page/Shareable Archetype
Cards/*.png` (the finalized, framed set, including a corrected Seeker)
via `sharp`, `.webp({ quality: 88 })` — same process as before, just a
new source folder. `public/cards/*.webp` are the current, correct
assets; no outstanding frame/caption issue.

## Open TODOs (flagged, not silently resolved)

1. **Tiebreak order is locked, not open.** (Listed here only so it isn't
   mistaken for a pending item — see `TIEBREAK_ORDER` above.)
2. **Pillar item counts may change again.** Currently 3 items per pillar,
   15 total. Both `questions.json` and `scoring.js` are built so
   adding/removing an item from any pillar is a data-only change — verify
   this stays true if the scoring step is ever touched.
3. **WhatsApp/phone-number routing is NOT built.** The result page no
   longer has a community CTA (it links to MyndVerse instead).
   `submitToWhatsAppRouting(answers, archetypeId)`, a stub in
   `src/lib/scoring.js` that only `console.warn`s, is now unreferenced — no
   backend, no phone capture. This is the marked integration point for the future n8n/AiSensy
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
