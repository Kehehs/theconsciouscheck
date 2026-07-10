import shared from "../data/shared.json";

/**
 * Full disclaimer text, positioned next to the score (not a footer),
 * per the result-page content spec.
 */
export default function Disclaimer() {
  return (
    <div
      className="mx-auto max-w-[600px] rounded-2xl border px-6 py-5 text-center"
      style={{
        background: "rgba(169, 198, 232, 0.05)",
        borderColor: "rgba(169, 198, 232, 0.15)",
      }}
    >
      <p className="font-body text-sm leading-[1.7] text-pale-tint opacity-85">
        {shared.disclaimer}
      </p>
    </div>
  );
}
