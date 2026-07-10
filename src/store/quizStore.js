import { create } from "zustand";

export const useQuizStore = create((set) => ({
  // { [questionId]: 1-5 }
  answers: {},
  currentIndex: 0,

  answerQuestion: (questionId, value) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: value },
      currentIndex: state.currentIndex + 1,
    })),

  goBack: () =>
    set((state) => ({
      currentIndex: Math.max(0, state.currentIndex - 1),
    })),

  reset: () => set({ answers: {}, currentIndex: 0 }),
}));
