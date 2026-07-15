import { create } from "zustand";

export const useQuizStore = create((set) => ({
  // { [questionId]: 1-5 }
  answers: {},
  currentIndex: 0,
  // Display-only. Never read by scoring — answer values are recorded by
  // option index regardless of which language they were shown in, so
  // switching language mid-quiz can't affect already-recorded answers.
  language: "en",

  answerQuestion: (questionId, value) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: value },
      currentIndex: state.currentIndex + 1,
    })),

  goBack: () =>
    set((state) => ({
      currentIndex: Math.max(0, state.currentIndex - 1),
    })),

  setLanguage: (language) => set({ language }),

  // Language is intentionally NOT reset here — the Result page's toggle
  // should keep reflecting the language the user was on when they
  // finished, and reset() runs right before navigating to /result.
  reset: () => set((state) => ({ answers: {}, currentIndex: 0, language: state.language })),
}));
