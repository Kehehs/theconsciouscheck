import questions from "../data/questions.json";

export const PILLARS = [
  "Consciousness",
  "Action",
  "Responsibility",
  "Engagement",
  "Self-Growth",
];

// CARES acronym order, locked. Wins a partial (2, 3, or 4-way) tie for
// highest pillar. Never applies to a full 5-way tie (that's always
// The Confluence, see resolveArchetype below).
export const TIEBREAK_ORDER = [
  "Consciousness",
  "Action",
  "Responsibility",
  "Engagement",
  "Self-Growth",
];

const PILLAR_TO_ARCHETYPE = {
  Consciousness: "seeker",
  Action: "catalyst",
  Responsibility: "anchor",
  Engagement: "builder",
  "Self-Growth": "sage",
};

/**
 * answers: { [questionId]: 1-5 } raw tap-target values, one per item in
 * questions.json (15 scored items, 3 per pillar).
 *
 * scoreQuiz assumes complete answers by design and should never receive
 * partial data if the caller's own flow is working correctly — the guard
 * below throws instead of silently scoring on a partial set, so a bug
 * upstream fails loudly here rather than producing a skewed result.
 */
export function scoreQuiz(answers) {
  const missingIds = questions
    .filter((q) => !(q.id in answers))
    .map((q) => q.id);
  if (missingIds.length > 0) {
    throw new Error(
      `scoreQuiz requires an answer for every question; missing: ${missingIds.join(", ")}`
    );
  }

  const pillarScores = {};

  for (const pillar of PILLARS) {
    const items = questions.filter((q) => q.pillar === pillar);
    const minPossible = items.length * 1;
    const maxPossible = items.length * 5;

    const raw = items.reduce((sum, q) => sum + answers[q.id], 0);

    const normalized =
      ((raw - minPossible) / (maxPossible - minPossible)) * 100;

    pillarScores[pillar] = { raw, minPossible, maxPossible, normalized };
  }

  const composite =
    PILLARS.reduce((sum, p) => sum + pillarScores[p].normalized, 0) /
    PILLARS.length;

  const band = getCompositeBand(composite);
  const archetypeId = resolveArchetype(pillarScores);

  const depth = {
    civilisationalGrounding:
      (answers["Q10"] ?? 0) + (answers["Q11"] ?? 0),
    consciousLivelihood: (answers["Q12"] ?? 0) + (answers["Q13"] ?? 0),
  };

  return {
    pillarScores,
    composite,
    band,
    archetypeId,
    depth,
  };
}

export function getCompositeBand(composite) {
  if (composite >= 80) return "integrated";
  if (composite >= 65) return "practising";
  if (composite >= 45) return "developing";
  return "nascent";
}

// Two mathematically-equal normalized scores can land on different floats
// depending on which arithmetic path produced them (e.g. 66.66666666666666
// vs 66.66666666666667). Round to 2 decimal places — plenty of precision
// for a 0-100 scale — before any tie/threshold comparison so a rounding
// artifact never masks (or fakes) a tie.
function round2(value) {
  return Math.round(value * 100) / 100;
}

/**
 * Pure function: pillarScores -> archetype id.
 * Isolated from scoreQuiz so it's directly unit-testable.
 */
export function resolveArchetype(pillarScores) {
  const values = PILLARS.map((p) => round2(pillarScores[p].normalized));
  const allEqual = values.every((v) => v === values[0]);

  if (allEqual) return "confluence";

  const allAbove65 = values.every((v) => v > 65);
  if (allAbove65) return "confluence";

  const highest = Math.max(...values);
  const winner = TIEBREAK_ORDER.find(
    (pillar) => round2(pillarScores[pillar].normalized) === highest
  );

  return PILLAR_TO_ARCHETYPE[winner];
}

// --- Test cases (Step 6, per build spec) -----------------------------
// 1. Straight-line (all equal) -> must resolve to "confluence", not the
//    tiebreak function.
// 2. Partial tie among 2-3 pillars -> must resolve via TIEBREAK_ORDER.
// Run with: node --experimental-vm-modules or via a real test runner
// once one is added to the project (see CLAUDE.md open TODOs).
export function _runScoringSelfTests() {
  const equalScores = Object.fromEntries(
    PILLARS.map((p) => [p, { normalized: 50 }])
  );
  console.assert(
    resolveArchetype(equalScores) === "confluence",
    "straight-line tie must resolve to Confluence"
  );

  const partialTie = {
    Consciousness: { normalized: 80 },
    Action: { normalized: 80 },
    Responsibility: { normalized: 40 },
    Engagement: { normalized: 30 },
    "Self-Growth": { normalized: 20 },
  };
  console.assert(
    resolveArchetype(partialTie) === "seeker",
    "partial tie must resolve via TIEBREAK_ORDER (Consciousness wins over Action)"
  );
}

// TODO(kanishk): phone-number capture for WhatsApp routing is NOT built
// yet. This is the marked integration point — wire the n8n/AiSensy
// webhook POST here once the UX decision on where the capture lives
// (pre-result vs. on the CTA click) is made.
export async function submitToWhatsAppRouting(answers, archetypeId) {
  // Intentionally unimplemented. See CLAUDE.md "Open TODOs".
  console.warn(
    "submitToWhatsAppRouting() is a stub — no backend wired yet.",
    { archetypeId }
  );
}
