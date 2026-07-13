import { describe, it, expect } from "vitest";
import questions from "../data/questions.json";
import { scoreQuiz } from "./scoring.js";

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
