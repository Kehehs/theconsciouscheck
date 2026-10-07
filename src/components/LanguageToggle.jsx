import { useQuizStore } from "../store/quizStore";

/**
 * EN / हिंदी pill toggle. Two-state, not a dropdown. Fixed top-right by
 * default; `inline` drops the fixed positioning so a page can place it.
 * Display-only — flips `language` in the shared quiz store, never
 * touches `answers`. Used on Quiz and Result only; never on Intro.
 */
export default function LanguageToggle({ inline = false }) {
  const { language, setLanguage } = useQuizStore();

  return (
    <div
      className={`${inline ? "" : "fixed right-4 top-4 z-50"} flex rounded-full p-1`}
      style={{ background: "rgba(169, 198, 232, 0.12)", backdropFilter: "blur(8px)" }}
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => setLanguage("en")}
        aria-pressed={language === "en"}
        className="min-h-[36px] rounded-full px-4 font-body text-[13px] font-bold transition-transform duration-200 ease-out active:scale-95"
        style={{
          background: language === "en" ? "var(--color-amber-accent)" : "transparent",
          color: language === "en" ? "#ffffff" : "var(--color-pale-tint)",
        }}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage("hi")}
        aria-pressed={language === "hi"}
        className="min-h-[36px] rounded-full px-4 font-body text-[13px] font-bold transition-transform duration-200 ease-out active:scale-95"
        style={{
          background: language === "hi" ? "var(--color-amber-accent)" : "transparent",
          color: language === "hi" ? "#ffffff" : "var(--color-pale-tint)",
        }}
      >
        हिंदी
      </button>
    </div>
  );
}
