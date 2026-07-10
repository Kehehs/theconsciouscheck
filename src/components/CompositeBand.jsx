import shared from "../data/shared.json";

/**
 * Small, centred, quiet — context for the archetype below, not a second
 * heading competing with it. Score line is the label; the band
 * description (if shown) stays short so it doesn't wall-of-text against
 * the recognition paragraph further down.
 */
export default function CompositeBand({ bandId, composite }) {
  const band = shared.compositeBands.find((b) => b.id === bandId);
  if (!band) return null;

  return (
    <div className="mx-auto max-w-[440px] text-center">
      <p className="font-display mb-2 text-sm font-semibold uppercase tracking-[0.1em] text-amber-soft">
        {band.label} · {Math.round(composite)}/100
      </p>
      <p className="font-body text-sm leading-[1.6] text-pale-tint opacity-75">{band.text}</p>
    </div>
  );
}
