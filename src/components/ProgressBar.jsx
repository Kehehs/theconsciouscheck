import { motion } from "framer-motion";

/**
 * `current` / `total` are the numbers shown to the user (see
 * CLAUDE.md "Quiz question count" — presented count intentionally
 * differs from the true 18-item answer sequence).
 */
export default function ProgressBar({ current, total }) {
  const pct = Math.min(100, (current / total) * 100);

  return (
    <div className="w-full">
      <p className="mb-2 font-body text-[13px] font-bold text-tint-blue">
        Question {current} of {total}
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
