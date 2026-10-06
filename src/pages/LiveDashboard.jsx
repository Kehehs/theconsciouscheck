import { useEffect, useState } from "react";
import Pusher from "pusher-js";
import { useReducedMotion } from "framer-motion";

const ARCHETYPES = [
  { id: "seeker", name: "Seeker", color: "#E8B04A" },
  { id: "catalyst", name: "Catalyst", color: "#E2673F" },
  { id: "anchor", name: "Anchor", color: "#5FA37E" },
  { id: "builder", name: "Builder", color: "#5C93C4" },
  { id: "sage", name: "Sage", color: "#9B7FC7" },
  { id: "confluence", name: "Confluence", color: "#3FB5BC" },
];

const STORAGE_KEY = "mc_live_counts";
const CHART_VH = 50; // total chart area
const BAR_VH = 44; // tallest possible bar, leaves room for the count above it
const MIN_FRAC = 0.012; // thin stub so all six columns show at zero
const empty = () => Object.fromEntries(ARCHETYPES.map((a) => [a.id, 0]));

function load() {
  const counts = empty();
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (stored && typeof stored === "object") {
      for (const a of ARCHETYPES) {
        const v = stored[a.id];
        if (Number.isInteger(v) && v >= 0) counts[a.id] = v;
      }
    }
  } catch {}
  return counts;
}

export default function LiveDashboard() {
  const [counts, setCounts] = useState(load);
  const [status, setStatus] = useState("connecting");
  const reduceMotion = useReducedMotion();

  // keep this page out of search engines
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => document.head.removeChild(meta);
  }, []);

  // persist counts so a refresh mid-event doesn't lose them
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
    } catch {}
  }, [counts]);

  useEffect(() => {
    const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
      cluster: import.meta.env.VITE_PUSHER_CLUSTER,
    });
    pusher.connection.bind("state_change", (s) => setStatus(s.current));
    const channel = pusher.subscribe("myndcheck-live");
    channel.bind("result", (data) => {
      const id = data?.archetype;
      if (!ARCHETYPES.some((a) => a.id === id)) return;
      setCounts((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    });
    return () => {
      channel.unbind_all();
      pusher.unsubscribe("myndcheck-live");
      pusher.disconnect();
    };
  }, []);

  const total = ARCHETYPES.reduce((sum, a) => sum + (counts[a.id] || 0), 0);
  // ceiling of at least 10 so the first few results look small and grow
  const ceiling = Math.max(10, ...ARCHETYPES.map((a) => counts[a.id] || 0));
  const move = reduceMotion ? "none" : "transform 600ms cubic-bezier(.2,.9,.3,1.1)";
  const dotColor = status === "connected" ? "#5FA37E" : status === "connecting" ? "#E8B04A" : "#E2673F";

  const reset = () => {
    if (window.confirm("Reset all counts to zero?")) setCounts(empty());
  };

  return (
    <div
      className="bg-navy-primary font-body text-white"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        padding: "4vh 5vw",
        boxSizing: "border-box",
      }}
    >
      <style>{`
        .live-reset { transition: opacity 200ms cubic-bezier(.2,.8,.2,1), transform 200ms cubic-bezier(.2,.8,.2,1); }
        .live-reset:hover, .live-reset:focus-visible { opacity: 0.7 !important; outline: none; }
        .live-reset:active { transform: scale(0.96); }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div className="font-body text-tint-blue" style={{ fontSize: 14, letterSpacing: "0.25em", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: dotColor, display: "inline-block" }} />
            LIVE &nbsp;·&nbsp; MYNDCHECK
          </div>
          <div className="font-display text-white" style={{ fontSize: "4vw", fontWeight: 700, marginTop: 8 }}>
            Who is in the room?
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="font-display text-white" style={{ fontSize: "9vw", fontWeight: 700, lineHeight: 1 }}>
            {total}
          </div>
          <div className="font-body text-tint-blue" style={{ fontSize: 14, letterSpacing: "0.25em", marginTop: 6 }}>RESULTS IN</div>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", marginTop: "2vh" }}>
        <div style={{ position: "relative", height: `${CHART_VH}vh` }}>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${BAR_VH}vh` }}>
            {[0.25, 0.5, 0.75, 1].map((f) => (
              <div key={f} className="border-t border-white/10" style={{ position: "absolute", left: 0, right: 0, bottom: `${f * 100}%` }} />
            ))}
          </div>
          <div className="bg-white/40" style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 2 }} />
          <div style={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "repeat(6, 1fr)", columnGap: "2vw" }}>
            {ARCHETYPES.map((a) => {
              const n = counts[a.id] || 0;
              const frac = Math.max(MIN_FRAC, n / ceiling);
              return (
                <div key={a.id} style={{ position: "relative", height: "100%" }}>
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: 0,
                      height: `${BAR_VH}vh`,
                      background: a.color,
                      transformOrigin: "bottom",
                      transform: `scaleY(${frac})`,
                      transition: move,
                    }}
                  />
                  <div
                    className="font-display text-white"
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: "1vh",
                      textAlign: "center",
                      fontSize: "4vw",
                      fontWeight: 700,
                      lineHeight: 1,
                      transform: `translateY(calc(${-frac} * ${BAR_VH}vh))`,
                      transition: move,
                    }}
                  >
                    {n}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", columnGap: "2vw", marginTop: "1.5vh" }}>
          {ARCHETYPES.map((a) => (
            <div key={a.id} className="font-display text-white" style={{ textAlign: "center", fontSize: "1.6vw", fontWeight: 700 }}>
              {a.name}
            </div>
          ))}
        </div>
      </div>

      <button
        className="live-reset border border-white text-white"
        onClick={reset}
        style={{ position: "fixed", right: 12, bottom: 10, opacity: 0.15, background: "none", padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontSize: 12 }}
      >
        reset
      </button>
    </div>
  );
}
