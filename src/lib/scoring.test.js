import { describe, it, expect } from "vitest";
import questions from "../data/questions.json";
import { scoreQuiz, resolveArchetype } from "./scoring.js";

describe("scoreQuiz answer completeness guard", () => {
  it("throws when given fewer answers than there are questions", () => {
    const partialAnswers = {};
    for (const q of questions.slice(0, questions.length - 1)) {
      partialAnswers[q.id] = 3;
    }

    expect(() => scoreQuiz(partialAnswers)).toThrow();
  });

  it("does not throw when every question has an answer", () => {
    const fullAnswers = {};
    for (const q of questions) fullAnswers[q.id] = 3;

    expect(() => scoreQuiz(fullAnswers)).not.toThrow();
  });
});

describe("resolveArchetype floating-point tie detection", () => {
  it("treats mathematically-equal normalized scores as tied even when the raw floats differ", () => {
    // Both values are exactly two-thirds * 100, reached via different
    // arithmetic paths — they diverge in the last representable digit
    // (66.66666666666666 vs 66.66666666666667), so strict === on the
    // unrounded floats would treat them as different, breaking the tie.
    const a = ((11 - 3) / (15 - 3)) * 100;
    const b = 200 / 3;
    expect(a).not.toBe(b); // confirms the floats really do diverge unrounded

    const pillarScores = {
      Consciousness: { normalized: a },
      Action: { normalized: b },
      Responsibility: { normalized: 20 },
      Engagement: { normalized: 20 },
      "Self-Growth": { normalized: 20 },
    };

    // Consciousness and Action are the (tied) highest; TIEBREAK_ORDER puts
    // Consciousness first, so it should win the tie rather than whichever
    // pillar happened to have the marginally larger unrounded float.
    expect(resolveArchetype(pillarScores)).toBe("seeker");
  });
});
