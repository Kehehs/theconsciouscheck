import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toPng } from "html-to-image";
import archetypes from "../data/archetypes.json";
import shared from "../data/shared.json";
import uiStrings from "../data/uiStrings.json";
import { submitToWhatsAppRouting } from "../lib/scoring";
import { decodeResultToken } from "../lib/resultToken";
import { useQuizStore } from "../store/quizStore";
import ResultCard from "../components/ResultCard";
import CompositeBand from "../components/CompositeBand";
import Disclaimer from "../components/Disclaimer";
import CTAButton from "../components/CTAButton";
import LanguageToggle from "../components/LanguageToggle";
import FeedbackModal from "../components/FeedbackModal";

// One result page component for every archetype (see CLAUDE.md's
// architecture rule), now sourced from a self-contained, signed permalink
// token (/check/r/:token) instead of route params + router state, so the
// page renders identically on reload, on another device, or opened cold
// from a shared link, no session, no database lookup.
export default function Result() {
  const { token } = useParams();
  const cardRef = useRef(null);
  const ctaRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [decoded, setDecoded] = useState(undefined); // undefined = loading, null = invalid, object = ready
  const language = useQuizStore((state) => state.language);

  useEffect(() => {
    let cancelled = false;
    setDecoded(undefined);
    decodeResultToken(token).then((value) => {
      if (!cancelled) setDecoded(value);
    });
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (decoded === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-primary px-6">
        <LanguageToggle />
      </div>
    );
  }

  if (decoded === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-primary px-6 text-center text-white">
        <LanguageToggle />
        <p className="font-body">
          {uiStrings.invalidLinkMessage[language]}{" "}
          <Link to="/quiz" className="text-amber-soft underline">{uiStrings.takeTheCheck[language]}</Link>
        </p>
      </div>
    );
  }

  const { result } = decoded;
  const archetype = archetypes[result.archetypeId];
  const composite = result.composite;
  const bandId = result.band;
  const permalinkUrl = `${window.location.origin}/check/r/${token}`;

  const handleShare = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2, cacheBust: true });
      const link = document.createElement("a");
      link.download = `conscious-check-${archetype.id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to export result card", err);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(permalinkUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy result link", err);
    }
  };

  // Swappable entry point: WhatsApp community isn't live for this
  // distribution, so shared.json's cta.mode points the primary CTA at the
  // feedback flow instead. Flip cta.mode back to "whatsapp" when the
  // community goes live, this component doesn't need to change.
  const ctaMode = shared.cta.mode;
  const ctaCopy = ctaMode === "feedback" ? shared.cta.feedback : shared.cta;

  const handleCtaClick = () => {
    if (ctaMode === "feedback") {
      setFeedbackOpen(true);
      return;
    }
    submitToWhatsAppRouting(result?.answers, archetype.id);
    // TODO(kanishk): placeholder destination until WhatsApp routing UX is decided.
  };

  return (
    <div className="min-h-screen bg-navy-primary px-6 py-16">
      <LanguageToggle />
      <div className="mx-auto flex max-w-[640px] flex-col items-center gap-3">
        {/* 1. Result card (hero) */}
        <ResultCard ref={cardRef} archetype={archetype} />

        {/* 2. Save / share action */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleShare}
            disabled={downloading}
            className="min-h-[48px] rounded-full border border-tint-blue/30 bg-transparent px-6 py-3 font-body text-sm font-bold text-tint-blue disabled:opacity-60"
          >
            {downloading ? uiStrings.preparingImage[language] : uiStrings.saveYourCard[language]}
          </button>
          <button
            type="button"
            onClick={handleCopyLink}
            className="min-h-[48px] rounded-full border border-tint-blue/30 bg-transparent px-6 py-3 font-body text-sm font-bold text-tint-blue"
          >
            {linkCopied ? uiStrings.linkCopied[language] : uiStrings.copyLink[language]}
          </button>
        </div>

        {/* 3. Archetype name + identity */}
        <div className="mt-10 text-center">
          <h1 className="font-display mb-2 text-[22px] font-semibold text-white sm:text-2xl">
            {archetype.name}
          </h1>
          <p className="font-body text-base italic text-pale-tint opacity-80">
            {archetype.identity[language]}
          </p>
        </div>

        {/* 4. Composite band */}
        <div className="mt-6">
          <CompositeBand bandId={bandId} composite={composite} />
        </div>

        {/* 5. Disclaimer, highlighted */}
        <div className="mt-6 w-full">
          <Disclaimer />
        </div>

        {/* 6. Recognition paragraph */}
        <p className="mt-10 w-full max-w-[600px] font-body text-[1.05rem] leading-[1.7] text-pale-tint">
          {archetype.recognition[language]}
        </p>

        {/* 7. Divider */}
        <Divider />

        {/* 8. Light and Shadow, two columns */}
        <div className="grid w-full max-w-[600px] grid-cols-1 gap-4 sm:grid-cols-2">
          <div
            className="rounded-xl border-l-4 px-5 py-4"
            style={{
              borderColor: "var(--color-amber-accent)",
              background: "rgba(233, 127, 63, 0.07)",
            }}
          >
            <h3 className="font-display mb-1.5 text-sm font-semibold uppercase tracking-[0.06em] text-amber-soft">
              {uiStrings.sectionLight[language]}
            </h3>
            <p className="font-body text-[0.98rem] leading-[1.65] text-pale-tint">
              {archetype.light[language]}
            </p>
          </div>
          <div
            className="rounded-xl border-l-4 px-5 py-4"
            style={{
              borderColor: "var(--color-blue-mid)",
              background: "rgba(110, 151, 194, 0.1)",
            }}
          >
            <h3 className="font-display mb-1.5 text-sm font-semibold uppercase tracking-[0.06em] text-tint-blue">
              {uiStrings.sectionShadow[language]}
            </h3>
            <p className="font-body text-[0.98rem] leading-[1.65] text-pale-tint">
              {archetype.shadow[language]}
            </p>
          </div>
        </div>

        {/* 9. Your Growth Trajectory, standout callout */}
        <div
          className="mt-6 w-full max-w-[600px] rounded-xl px-6 py-5 text-center"
          style={{ background: "rgba(255, 255, 255, 0.06)" }}
        >
          <h3 className="font-display mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-amber-soft">
            {uiStrings.sectionGrowthTrajectory[language]}
          </h3>
          <p className="font-body text-lg font-semibold leading-snug text-white">
            {archetype.growthTrajectory[language]}
          </p>
        </div>

        <Divider />

        {/* 10. Career and Relationships, two columns */}
        <div className="grid w-full max-w-[600px] grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <h3 className="font-display mb-1.5 text-sm font-semibold uppercase tracking-[0.06em] text-amber-soft">
              {uiStrings.sectionCareer[language]}
            </h3>
            <p className="font-body text-[0.98rem] leading-[1.65] text-pale-tint">
              {archetype.career[language]}
            </p>
          </div>
          <div>
            <h3 className="font-display mb-1.5 text-sm font-semibold uppercase tracking-[0.06em] text-amber-soft">
              {uiStrings.sectionRelationships[language]}
            </h3>
            <p className="font-body text-[0.98rem] leading-[1.65] text-pale-tint">
              {archetype.relationships[language]}
            </p>
          </div>
        </div>

        {/* 11. Closing line */}
        <p className="my-12 max-w-[520px] text-center font-display text-base italic text-white sm:text-[1.05rem]">
          {archetype.closingLine[language]}
        </p>

        {/* 12. CTA */}
        <div className="flex w-full flex-col items-center gap-3 text-center">
          <p className="font-body text-sm text-pale-tint opacity-80">
            {ctaCopy.supportingLine[language]}
          </p>
          <CTAButton ref={ctaRef} onClick={handleCtaClick} size="large" className="w-full sm:w-auto">
            {ctaCopy.buttonLabel[language]}
          </CTAButton>
          <Link
            to="/quiz"
            className="mt-1 font-body text-xs font-semibold text-tint-blue opacity-60 hover:opacity-90"
          >
            {uiStrings.retakeTheCheck[language]}
          </Link>
        </div>
      </div>

      {ctaMode === "feedback" && (
        <FeedbackModal
          isOpen={feedbackOpen}
          onClose={() => setFeedbackOpen(false)}
          triggerRef={ctaRef}
        />
      )}
    </div>
  );
}

function Divider() {
  return (
    <div
      className="my-8 h-px w-full max-w-[600px]"
      style={{ background: "rgba(240, 168, 116, 0.25)" }}
    />
  );
}
