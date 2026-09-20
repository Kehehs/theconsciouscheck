import { describe, it, expect } from "vitest";
import questions from "../data/questions.json";
import { scoreQuiz, resolveArchetype, PILLARS } from "./scoring.js";

function answersWithAll(value) {
  const answers = {};
  for (const q of questions) answers[q.id] = value;
  return answers;
}

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

// Regression guard: Q1, Q7, and Q13 were previously reverse-scored
// (`6 - value`), which silently punished the most conscious answer on
// those three items. These tests fail if that flip is ever reintroduced.
describe("no reverse-scoring on any question", () => {
  it("gives every pillar and the composite their maximum at all answers = 5", () => {
    const result = scoreQuiz(answersWithAll(5));
    for (const pillar of PILLARS) {
      expect(result.pillarScores[pillar].raw).toBe(15);
      expect(result.pillarScores[pillar].normalized).toBe(100);
    }
    expect(result.composite).toBe(100);
  });

  it("gives every pillar and the composite their minimum at all answers = 1", () => {
    const result = scoreQuiz(answersWithAll(1));
    for (const pillar of PILLARS) {
      expect(result.pillarScores[pillar].raw).toBe(3);
      expect(result.pillarScores[pillar].normalized).toBe(0);
    }
    expect(result.composite).toBe(0);
  });

  it("strictly increases a question's pillar score as that question's answer rises from 1 to 5, for all 15 questions", () => {
    for (const q of questions) {
      let previousRaw = -Infinity;
      for (let value = 1; value <= 5; value++) {
        const answers = answersWithAll(3);
        answers[q.id] = value;
        const result = scoreQuiz(answers);
        const raw = result.pillarScores[q.pillar].raw;
        expect(raw, `${q.id}=${value}`).toBeGreaterThan(previousRaw);
        previousRaw = raw;
      }
    }
  });

  it("Q7 case: with Q2=4 and Q15=4, Q7=5 gives a higher Action score than Q7=1", () => {
    const base = answersWithAll(3);
    base.Q2 = 4;
    base.Q15 = 4;

    const withQ7Low = { ...base, Q7: 1 };
    const withQ7High = { ...base, Q7: 5 };

    const lowResult = scoreQuiz(withQ7Low);
    const highResult = scoreQuiz(withQ7High);

    expect(highResult.pillarScores.Action.raw).toBeGreaterThan(
      lowResult.pillarScores.Action.raw
    );
  });
});
