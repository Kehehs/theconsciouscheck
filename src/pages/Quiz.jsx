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

  const total = questions.length;
  const current = questions[currentIndex];

  const handleAnswer = (value) => {
    answerQuestion(current.id, value);

    if (currentIndex === total - 1) {
      setCalculating(true);
      const finalAnswers = { ...answers, [current.id]: value };
      setTimeout(() => {
        const result = scoreQuiz(finalAnswers);
        reset();
        navigate(`/result/${result.archetypeId}`, { state: { result } });
      }, 2200);
    }
  };

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
