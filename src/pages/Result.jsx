import { useRef, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { toPng } from "html-to-image";
import archetypes from "../data/archetypes.json";
import shared from "../data/shared.json";
import { PILLARS, getCompositeBand, submitToWhatsAppRouting } from "../lib/scoring";
import ResultCard from "../components/ResultCard";
import CompositeBand from "../components/CompositeBand";
import Disclaimer from "../components/Disclaimer";
import CTAButton from "../components/CTAButton";

// Fallback so the page still renders sensibly if visited directly
// (no route state), e.g. from a shared link with no quiz session.
const FALLBACK_PILLAR_SCORES = Object.fromEntries(
  PILLARS.map((p) => [p, { normalized: 60 }])
);

export default function Result() {
  const { archetype: archetypeId } = useParams();
  const location = useLocation();
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const archetype = archetypes[archetypeId];
  const result = location.state?.result;
  const pillarScores = result?.pillarScores ?? FALLBACK_PILLAR_SCORES;
  const composite = result?.composite ?? 60;
  const bandId = result?.band ?? getCompositeBand(composite);

  if (!archetype) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-primary px-6 text-center text-white">
        <p className="font-body">
          We couldn't find that result. <Link to="/" className="text-amber-soft underline">Start over</Link>
        </p>
      </div>
    );
  }

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
      <div className="mx-auto flex max-w-[640px] flex-col items-center gap-14">
        {/* 1. Shareable result card */}
        <div className="flex w-full flex-col items-center gap-5">
          <ResultCard ref={cardRef} archetype={archetype} pillarScores={pillarScores} />
          <button
            type="button"
            onClick={handleShare}
            disabled={downloading}
            className="min-h-[48px] rounded-full border border-tint-blue/30 bg-tint-blue/10 px-6 py-3 font-body text-sm font-bold text-tint-blue disabled:opacity-60"
          >
            {downloading ? "Preparing image..." : "Save / Share your card"}
          </button>
        </div>

        {/* 2. Archetype name + identity */}
        <div className="text-center">
          <h1 className="font-display mb-2 text-[clamp(2rem,4vw,2.6rem)] font-semibold text-white">
            {archetype.name}
          </h1>
          <p className="font-body text-lg italic text-pale-tint">{archetype.identity}</p>
        </div>

        {/* 3. Composite band */}
        <CompositeBand bandId={bandId} composite={composite} />

        {/* 4. Disclaimer, next to the score */}
        <Disclaimer />

        {/* 5. Recognition */}
        <Section text={archetype.recognition} />

        {/* 6. Light and Shadow */}
        <div className="w-full max-w-[600px] space-y-5">
          <div>
            <h3 className="font-display mb-1.5 text-sm font-semibold uppercase tracking-[0.06em] text-amber-soft">
              Light
            </h3>
            <p className="font-body text-[1.05rem] leading-[1.7] text-pale-tint">{archetype.light}</p>
          </div>
          <div>
            <h3 className="font-display mb-1.5 text-sm font-semibold uppercase tracking-[0.06em] text-tint-blue">
              Shadow
            </h3>
            <p className="font-body text-[1.05rem] leading-[1.7] text-pale-tint">{archetype.shadow}</p>
          </div>
        </div>

        {/* 7. Growth Edge */}
        <Section heading="Growth Edge" text={archetype.growthEdge} />

        {/* 8. Career */}
        <Section heading="Career" text={archetype.career} />

        {/* 9. Relationships */}
        <Section heading="Relationships" text={archetype.relationships} />

        {/* 10. Closing line */}
        <p className="max-w-[520px] text-center font-display text-xl font-semibold italic text-white">
          {archetype.closingLine}
        </p>

        {/* 11. Single CTA */}
        <div className="flex flex-col items-center gap-3 pt-4 text-center">
          <p className="font-body text-sm text-pale-tint opacity-80">
            {shared.cta.supportingLine}
          </p>
          <CTAButton onClick={handleJoinCommunity} size="large">
            {shared.cta.buttonLabel}
          </CTAButton>
          <Link
            to="/"
            className="mt-2 font-body text-xs font-semibold text-tint-blue opacity-60 hover:opacity-90"
          >
            Retake the check
          </Link>
        </div>
      </div>
    </div>
  );
}

function Section({ heading, text }) {
  return (
    <div className="w-full max-w-[600px]">
      {heading && (
        <h3 className="font-display mb-1.5 text-sm font-semibold uppercase tracking-[0.06em] text-amber-soft">
          {heading}
        </h3>
      )}
      <p className="font-body text-[1.05rem] leading-[1.7] text-pale-tint">{text}</p>
    </div>
  );
}
