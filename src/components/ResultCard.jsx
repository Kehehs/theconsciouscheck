import { forwardRef } from "react";

/**
 * The shareable visual: the archetype's full mythic-tarot-deck card art,
 * nothing else. This is the exact node html-to-image captures, so no
 * radar/data-viz or extra panel lives inside or beneath it — v2 result
 * page design spec removed those entirely.
 */
const ResultCard = forwardRef(function ResultCard({ archetype }, ref) {
  return (
    <div
      ref={ref}
      className="mx-auto w-[80%] max-w-[460px] overflow-hidden rounded-2xl sm:w-[85%]"
      style={{ boxShadow: "0 30px 70px -20px rgba(0,0,0,0.6)" }}
    >
      <img
        src={archetype.cardImage}
        alt={`${archetype.name} archetype card`}
        className="block w-full"
        crossOrigin="anonymous"
      />
    </div>
  );
});

export default ResultCard;
