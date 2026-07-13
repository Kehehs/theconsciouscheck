import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import questions from "../data/questions.json";
import { useQuizStore } from "../store/quizStore";
import { scoreQuiz } from "../lib/scoring";
import ProgressBar from "../components/ProgressBar";
import QuestionScreen from "../components/QuestionScreen";

export default function Quiz() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const { answers, currentIndex, answerQuestion, goBack, reset } = useQuizStore();
  const [calculating, setCalculating] = useState(false);
  const [incomplete, setIncomplete] = useState(false);

  const total = questions.length;
  const current = questions[currentIndex];

  const handleAnswer = (value) => {
    answerQuestion(current.id, value);

    if (currentIndex === total - 1) {
      setCalculating(true);
      const finalAnswers = { ...answers, [current.id]: value };
      setTimeout(() => {
        try {
          const result = scoreQuiz(finalAnswers);
          reset();
          navigate(`/result/${result.archetypeId}`, { state: { result } });
        } catch (err) {
          // Should be unreachable — Quiz's own flow only ever advances one
          // answer at a time, so the last question can't be reached without
          // every prior one recorded. If scoreQuiz's guard still fires,
          // fail safe: restart rather than show a skewed result.
          console.error("scoreQuiz refused incomplete answers", err);
          setCalculating(false);
          setIncomplete(true);
        }
      }, 2200);
    }
  };

  if (incomplete) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-navy-primary px-6 text-center">
        <p className="font-body text-base text-white">
          Something went wrong reading your answers. Let's start again.
        </p>
        <button
          type="button"
          onClick={() => {
            reset();
            setIncomplete(false);
          }}
          className="min-h-[48px] rounded-full border border-tint-blue/30 bg-transparent px-6 py-3 font-body text-sm font-bold text-tint-blue"
        >
          Restart the check
        </button>
      </div>
    );
  }

  if (calculating) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-navy-primary px-6 text-center">
        <motion.div
          className="mb-6 h-16 w-16 rounded-full border-4 border-amber-accent/30 border-t-amber-accent"
          animate={reduceMotion ? {} : { rotate: 360 }}
          transition={reduceMotion ? {} : { duration: 1.1, repeat: Infinity, ease: "linear" }}
        />
        <motion.p
          className="font-display text-xl font-semibold text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Reading what you told us...
        </motion.p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-primary px-6 py-12 md:py-20">
      <div className="mx-auto mb-10 w-full max-w-[640px]">
        <ProgressBar current={currentIndex + 1} total={total} />
      </div>

      <QuestionScreen
        question={current}
        onAnswer={handleAnswer}
        onBack={goBack}
        canGoBack={currentIndex > 0}
      />
    </div>
  );
}
