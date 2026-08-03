import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useQuizStore } from "../store/quizStore";
import feedbackData from "../data/feedbackQuestions.json";
import { submitFeedback } from "../lib/feedback";
import ProgressBar from "./ProgressBar";

const { questions, thankYou, done, closeLabel, backLabel, retryLabel } = feedbackData;
const TOTAL = questions.length;

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * Result-page feedback flow: 6 single-select questions, one per screen,
 * then a thank-you screen. Lives entirely in-memory until Q6 is answered,
 * a partial close (resetAndClose) never writes a row.
 *
 * The write POST fires once, the moment Q6 is answered (see handleAnswer
 * / attemptSubmit). The thank-you screen is only ever reached on a
 * successful response, on failure or timeout the user stays on Q6 with
 * their answer intact and an inline retry link, which re-sends the same
 * answers without requiring them to re-answer anything.
 *
 * Reuses the quiz's tap-target visual language (QuestionScreen.jsx) and
 * progress bar (ProgressBar.jsx) rather than introducing new styling.
 */
export default function FeedbackModal({ isOpen, onClose, triggerRef }) {
  const reduceMotion = useReducedMotion();
  const language = useQuizStore((state) => state.language);
  const [step, setStep] = useState(0); // 0-5 = questions, 6 = thank you (only reached on a successful submit)
  const [answers, setAnswers] = useState(() => Array(TOTAL).fill(null));
  const [submissionStatus, setSubmissionStatus] = useState("idle"); // idle | pending | error

  const dialogRef = useRef(null);
  const previouslyFocused = useRef(null);
  // Synchronous (non-state) guards so a fast double-tap can't fire two
  // requests: inFlightRef blocks re-entry while a POST is outstanding,
  // tokenRef invalidates any still-outstanding POST from a session the
  // user has since closed/reset, so it can't resurrect into a new one.
  const inFlightRef = useRef(false);
  const tokenRef = useRef(0);

  const resetAndClose = () => {
    tokenRef.current += 1;
    inFlightRef.current = false;
    setStep(0);
    setAnswers(Array(TOTAL).fill(null));
    setSubmissionStatus("idle");
    onClose();
  };

  // Focus trap + return focus to the triggering CTA on close.
  useEffect(() => {
    if (!isOpen) return;
    previouslyFocused.current = triggerRef?.current ?? document.activeElement;

    const node = dialogRef.current;
    const focusables = () => node?.querySelectorAll(FOCUSABLE_SELECTOR) ?? [];
    focusables()[0]?.focus();

    const handleKeydown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        resetAndClose();
        return;
      }
      if (e.key !== "Tab") return;
      const items = Array.from(focusables());
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.removeEventListener("keydown", handleKeydown);
      previouslyFocused.current?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Fires exactly once per completed set of 6 answers: called directly
  // from handleAnswer the moment Q6 is answered, and again (with the same
  // answers) if the retry control on that same screen is tapped. Only a
  // successful response advances to the thank-you screen; a failure (or
  // the 9s timeout in submitFeedback) leaves the user on Q6 with their
  // answer intact and an inline retry affordance.
  const attemptSubmit = async (finalAnswers) => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    const myToken = tokenRef.current;
    setSubmissionStatus("pending");
    try {
      const payload = {};
      questions.forEach((q, i) => {
        payload[q.id] = q.options[finalAnswers[i]].en;
      });
      await submitFeedback(payload);
      if (tokenRef.current !== myToken) return; // modal was closed/reset meanwhile
      setSubmissionStatus("idle");
      setStep(TOTAL);
    } catch (err) {
      console.error("Feedback submission failed", err);
      if (tokenRef.current !== myToken) return;
      setSubmissionStatus("error");
    } finally {
      inFlightRef.current = false;
    }
  };

  const handleAnswer = (optionIndex) => {
    if (inFlightRef.current) return; // a submit for this answer set is already outstanding
    const next = [...answers];
    next[step] = optionIndex;
    setAnswers(next);

    if (step === TOTAL - 1) {
      attemptSubmit(next);
      return;
    }
    setStep((s) => s + 1);
  };

  const handleRetry = () => attemptSubmit(answers);

  const handleBack = () => {
    if (inFlightRef.current) return;
    setSubmissionStatus("idle");
    setStep((s) => Math.max(0, s - 1));
  };

  if (!isOpen) return null;

  const question = step < TOTAL ? questions[step] : null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) resetAndClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={question ? `feedback-heading-${step}` : "feedback-thankyou-heading"}
        className="relative w-full max-w-[640px] max-h-[90vh] overflow-y-auto rounded-2xl bg-navy-primary px-6 py-8 sm:px-10 sm:py-10"
        style={{ boxShadow: "0 24px 60px -12px rgba(0, 0, 0, 0.6)" }}
      >
        {question && (
          <button
            type="button"
            onClick={resetAndClose}
            aria-label={closeLabel[language]}
            className="absolute right-4 top-4 flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-pale-tint opacity-70 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-accent"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M1 1L17 17M17 1L1 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}

        {question && (
          <div className="mb-6 max-w-[480px]">
            <ProgressBar current={step + 1} total={TOTAL} />
          </div>
        )}

        <AnimatePresence mode="wait">
          {question ? (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduceMotion ? 0 : -16 }}
              transition={{ duration: reduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <h2
                id={`feedback-heading-${step}`}
                className="font-display mb-6 pr-10 text-[clamp(1.3rem,3vw,1.7rem)] font-semibold leading-snug text-white"
              >
                {question.stem[language]}
              </h2>

              <div
                role="group"
                aria-labelledby={`feedback-heading-${step}`}
                className="flex flex-col gap-3"
              >
                {question.options.map((option, i) => {
                  const selected = answers[step] === i;
                  return (
                    <button
                      key={i}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => handleAnswer(i)}
                      className="min-h-[48px] rounded-2xl border px-5 py-4 text-left font-body text-[1rem] font-medium text-pale-tint transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:text-white active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-accent"
                      style={{
                        background: selected
                          ? "rgba(233, 127, 63, 0.16)"
                          : "rgba(169, 198, 232, 0.06)",
                        borderColor: selected
                          ? "rgba(233, 127, 63, 0.5)"
                          : "rgba(169, 198, 232, 0.18)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(233, 127, 63, 0.12)";
                        e.currentTarget.style.borderColor = "rgba(233, 127, 63, 0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = selected
                          ? "rgba(233, 127, 63, 0.16)"
                          : "rgba(169, 198, 232, 0.06)";
                        e.currentTarget.style.borderColor = selected
                          ? "rgba(233, 127, 63, 0.5)"
                          : "rgba(169, 198, 232, 0.18)";
                      }}
                    >
                      {option[language]}
                    </button>
                  );
                })}
              </div>

              {submissionStatus === "error" && (
                <button
                  type="button"
                  onClick={handleRetry}
                  className="mt-6 font-body text-sm font-semibold text-amber-soft underline opacity-90 hover:opacity-100"
                >
                  {retryLabel[language]}
                </button>
              )}

              {step > 0 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="mt-8 min-h-[48px] font-body text-sm font-semibold text-tint-blue opacity-70 transition-opacity hover:opacity-100"
                >
                  {backLabel[language]}
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="thankyou"
              initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduceMotion ? 0 : -16 }}
              transition={{ duration: reduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center py-6 text-center"
            >
              <h2
                id="feedback-thankyou-heading"
                className="font-display mb-8 text-[clamp(1.3rem,3vw,1.7rem)] font-semibold leading-snug text-white"
              >
                {thankYou[language]}
              </h2>

              <button
                type="button"
                onClick={resetAndClose}
                className="font-display min-h-[48px] min-w-[48px] cursor-pointer rounded-full bg-amber-accent px-12 py-[17px] text-lg font-semibold text-white"
                style={{ boxShadow: "0 12px 28px -8px rgba(233, 127, 63, 0.5)" }}
              >
                {done[language]}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>,
    document.body
  );
}
