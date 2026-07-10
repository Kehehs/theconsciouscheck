/**
 * Always exactly three trust markers, per the theme rule. Do not pass a
 * fourth — it starts reading as a list rather than a set of quick facts.
 */
export default function TrustMarkers({ items, className = "" }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-3.5 gap-y-2.5 ${className}`}>
      {items.slice(0, 3).map((item) => (
        <span
          key={item}
          className="inline-flex items-center whitespace-nowrap rounded-full border px-3.5 py-[7px] text-[13px] font-bold text-tint-blue"
          style={{
            background: "rgba(169, 198, 232, 0.1)",
            borderColor: "rgba(169, 198, 232, 0.22)",
          }}
        >
          {item}
        </span>
      ))}
    </div>
  );
}
