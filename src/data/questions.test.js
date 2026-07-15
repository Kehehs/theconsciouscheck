import { describe, expect, it } from "vitest";
import questions from "./questions.json";

// Canonical Q -> pillar mapping, from Conscious_Check_Questions_EN_Final.md
// (must match CLAUDE.md's data schema section). This file's pillar tags
// and reverse flags have been silently wrong before — this test exists so
// a future content edit can't reintroduce that without a test failure.
const EXPECTED_PILLAR_BY_ID = {
  Q1: "Consciousness",
  Q2: "Action",
  Q3: "Responsibility",
  Q4: "Engagement",
  Q5: "Self-Growth",
  Q6: "Consciousness",
  Q7: "Action",
  Q8: "Responsibility",
  Q9: "Self-Growth",
  Q10: "Responsibility",
  Q11: "Consciousness",
  Q12: "Engagement",
  Q13: "Self-Growth",
  Q14: "Engagement",
  Q15: "Action",
};

const REVERSE_SCORED_IDS = new Set(["Q1", "Q7", "Q13"]);

describe("questions.json pillar mapping", () => {
  it("has exactly 15 questions", () => {
    expect(questions.length).toBe(15);
  });

  it("assigns each question the pillar from the canonical mapping", () => {
    for (const q of questions) {
      expect(q.pillar, `${q.id} pillar`).toBe(EXPECTED_PILLAR_BY_ID[q.id]);
    }
  });

  it("has exactly 3 items per pillar", () => {
    const counts = {};
    for (const q of questions) {
      counts[q.pillar] = (counts[q.pillar] ?? 0) + 1;
    }
    for (const pillar of new Set(Object.values(EXPECTED_PILLAR_BY_ID))) {
      expect(counts[pillar], `count for ${pillar}`).toBe(3);
    }
  });

  it("flags exactly Q1, Q7, and Q13 as reverse-scored", () => {
    const actualReverseIds = questions
      .filter((q) => q.reverse === true)
      .map((q) => q.id)
      .sort();
    expect(actualReverseIds).toEqual([...REVERSE_SCORED_IDS].sort());
  });

  it("has no standalone R1/R2/R3 items", () => {
    const ids = questions.map((q) => q.id);
    expect(ids).not.toContain("R1");
    expect(ids).not.toContain("R2");
    expect(ids).not.toContain("R3");
  });
});
