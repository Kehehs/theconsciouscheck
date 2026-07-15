import { useRef, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { toPng } from "html-to-image";
import archetypes from "../data/archetypes.json";
import shared from "../data/shared.json";
import uiStrings from "../data/uiStrings.json";
import { submitToWhatsAppRouting } from "../lib/scoring";
import { useQuizStore } from "../store/quizStore";
import ResultCard from "../components/ResultCard";
import CompositeBand from "../components/CompositeBand";
import Disclaimer from "../components/Disclaimer";
import CTAButton from "../components/CTAButton";
import LanguageToggle from "../components/LanguageToggle";

export default function Result() {
  const { archetype: archetypeId } = useParams();
  const location = useLocation();
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const language = useQuizStore((state) => state.language);

  const archetype = archetypes[archetypeId];
  const result = location.state?.result;

  if (!archetype || !result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-primary px-6 text-center text-white">
        <LanguageToggle />
        <p className="font-body">
          {uiStrings.expiredMessage[language]}{" "}
          <Link to="/quiz" className="text-amber-soft underline">{uiStrings.takeTheCheck[language]}</Link>
        </p>
      </div>
    );
  }

  const composite = result.composite;
  const bandId = result.band;

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

  const handleJoinCommunity = () => {
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
        <button
          type="button"
          onClick={handleShare}
          disabled={downloading}
          className="mt-3 min-h-[48px] rounded-full border border-tint-blue/30 bg-transparent px-6 py-3 font-body text-sm font-bold text-tint-blue disabled:opacity-60"
        >
          {downloading ? uiStrings.preparingImage[language] : uiStrings.saveYourCard[language]}
        </button>

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
            {shared.cta.supportingLine[language]}
          </p>
          <CTAButton onClick={handleJoinCommunity} size="large" className="w-full sm:w-auto">
            {shared.cta.buttonLabel[language]}
          </CTAButton>
          <Link
            to="/"
            className="mt-1 font-body text-xs font-semibold text-tint-blue opacity-60 hover:opacity-90"
          >
            {uiStrings.retakeTheCheck[language]}
          </Link>
        </div>
      </div>
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
