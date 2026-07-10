import shared from "../data/shared.json";

export default function CompositeBand({ bandId, composite }) {
  const band = shared.compositeBands.find((b) => b.id === bandId);
  if (!band) return null;

  return (
    <div className="mx-auto max-w-[600px] text-center">
      <p className="font-display mb-2 text-sm font-semibold uppercase tracking-[0.08em] text-amber-soft">
        {band.label} · {Math.round(composite)}/100
      </p>
      <p className="font-body text-[1.05rem] leading-[1.7] text-pale-tint">{band.text}</p>
    </div>
  );
}
