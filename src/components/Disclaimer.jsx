import shared from "../data/shared.json";
import uiStrings from "../data/uiStrings.json";
import { useQuizStore } from "../store/quizStore";

/**
 * Highlighted callout, distinct from the page's navy — warm amber tint
 * with a solid amber border and dark text, so it reads as a distinct box
 * at a glance, before the body copy is even read. Sits directly after
 * the composite band ("near the score"), never in a footer.
 */
export default function Disclaimer() {
  const language = useQuizStore((state) => state.language);

  return (
    <div
      className="mx-auto max-w-[600px] rounded-2xl border-2 px-6 py-5 text-center"
      style={{
        background: "#f3ddc4",
        borderColor: "#e97f3f",
      }}
    >
      <p className="font-display mb-2 text-xs font-semibold uppercase tracking-[0.08em]" style={{ color: "#b35a1f" }}>
        {uiStrings.disclaimerEyebrow[language]}
      </p>
      <p className="font-body text-sm leading-[1.7]" style={{ color: "#3a2a1a" }}>
        {shared.disclaimer[language]}
      </p>
    </div>
  );
}
