import { forwardRef } from "react";
import RadarChart from "./RadarChart";

/**
 * The shareable visual: archetype card art + radar + watermark.
 * Deliberately NOT in the navy/bubble theme — this is the mythic-tarot
 * handoff, a clean cut from the rest of the result page's chrome.
 */
const ResultCard = forwardRef(function ResultCard({ archetype, pillarScores }, ref) {
  return (
    <div
      ref={ref}
      className="mx-auto w-full max-w-[420px] overflow-hidden rounded-[20px]"
      style={{ background: "#0d0704", boxShadow: "0 30px 70px -20px rgba(0,0,0,0.6)" }}
    >
      <img
        src={archetype.cardImage}
        alt={`${archetype.name} archetype card`}
        className="block w-full"
        crossOrigin="anonymous"
      />
      <div className="bg-[#f6ecd9] px-5 pb-5 pt-4">
        <RadarChart pillarScores={pillarScores} />
      </div>
      <div className="flex items-center justify-between bg-[#f6ecd9] px-5 pb-4">
        <span className="font-body text-[11px] font-bold uppercase tracking-[0.08em] text-[#6b4a2b]">
          The Conscious Check
        </span>
        <span className="font-body text-[11px] font-bold text-[#6b4a2b]">
          imalcares.org/check
        </span>
      </div>
    </div>
  );
});

export default ResultCard;
