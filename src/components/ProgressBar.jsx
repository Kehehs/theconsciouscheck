import { motion } from "framer-motion";
import { useQuizStore } from "../store/quizStore";
import uiStrings from "../data/uiStrings.json";

/**
 * `current` / `total` are the numbers shown to the user, taken directly
 * from questions.json's length (15) — no separate hidden item count.
 */
export default function ProgressBar({ current, total }) {
  const language = useQuizStore((state) => state.language);
  const pct = Math.min(100, (current / total) * 100);
  const label = uiStrings.questionProgress[language]
    .replace("{current}", current)
    .replace("{total}", total);

  return (
    <div className="w-full">
      <p className="mb-2 font-body text-[13px] font-bold text-tint-blue">
        {label}
      </p>
      <div
        className="h-2 w-full overflow-hidden rounded-full"
        style={{ background: "rgba(169, 198, 232, 0.15)" }}
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={total}
      >
        <motion.div
          className="h-full rounded-full bg-amber-accent"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
