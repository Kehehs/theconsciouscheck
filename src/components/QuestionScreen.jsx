import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

/**
 * One question, five tap-target options. No pillar labels, no scores.
 */
export default function QuestionScreen({ question, onAnswer, onBack, canGoBack }) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: reduceMotion ? 0 : -16 }}
        transition={{ duration: reduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto w-full max-w-[640px]"
      >
        <h2 className="font-display mb-8 text-[clamp(1.4rem,3vw,1.9rem)] font-semibold leading-snug text-white">
          {question.stem}
        </h2>

        <div className="flex flex-col gap-3">
          {question.options.map((option, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onAnswer(i + 1)}
              className="min-h-[48px] rounded-2xl border px-5 py-4 text-left font-body text-[1rem] font-medium text-pale-tint transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:text-white active:translate-y-0"
              style={{
                background: "rgba(169, 198, 232, 0.06)",
                borderColor: "rgba(169, 198, 232, 0.18)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(233, 127, 63, 0.12)";
                e.currentTarget.style.borderColor = "rgba(233, 127, 63, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(169, 198, 232, 0.06)";
                e.currentTarget.style.borderColor = "rgba(169, 198, 232, 0.18)";
              }}
            >
              {option}
            </button>
          ))}
        </div>

        {canGoBack && (
          <button
            type="button"
            onClick={onBack}
            className="mt-8 min-h-[48px] font-body text-sm font-semibold text-tint-blue opacity-70 transition-opacity hover:opacity-100"
          >
            ← Back
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
