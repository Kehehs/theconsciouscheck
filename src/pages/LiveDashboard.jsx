import { useEffect, useRef, useState } from "react";
import Pusher from "pusher-js";
import { useReducedMotion } from "framer-motion";
import myndverseLogo from "../assets/myndverse-logo.png";
import awcLogo from "../assets/awc-logo.png";
import awcQr from "../assets/awc-gate-qr.svg";
import LiveBubbles from "../components/LiveBubbles";
import badgeSeeker from "../assets/badge-seeker.jpg";
import badgeCatalyst from "../assets/badge-catalyst.jpg";
import badgeAnchor from "../assets/badge-anchor.jpg";
import badgeBuilder from "../assets/badge-builder.jpg";
import badgeSage from "../assets/badge-sage.jpg";
import badgeConfluence from "../assets/badge-confluence.jpg";

const ARCHETYPES = [
  { id: "seeker", name: "Seeker" },
  { id: "catalyst", name: "Catalyst" },
  { id: "anchor", name: "Anchor" },
  { id: "builder", name: "Builder" },
  { id: "sage", name: "Sage" },
  { id: "confluence", name: "Confluence" },
];

const STORAGE_KEY = "mc_live_counts";
const CHART_VH = 40; // total chart area
const BAR_VH = 34; // tallest possible bar, leaves room for the count above it
const BADGE_SIZE = "min(7vw, 11vh)";
// Fill = each image's own corner pixel colour, so the circle has no visible edge.
const BADGES = {
  seeker: { src: badgeSeeker, bg: "#F7F7F7", alt: "Seeker badge: a compass rose above a winding path" },
  catalyst: { src: badgeCatalyst, bg: "#F6F6F6", alt: "Catalyst badge: a lightning bolt breaking out of a circle" },
  anchor: { src: badgeAnchor, bg: "#F6F6F6", alt: "Anchor badge: a lighthouse on a rock above waves" },
  builder: { src: badgeBuilder, bg: "#F6F6F6", alt: "Builder badge: a hand placing the keystone of a brick arch" },
  sage: { src: badgeSage, bg: "#F6F6F6", alt: "Sage badge: an open book with a leaf rising in front of a sun" },
  confluence: { src: badgeConfluence, bg: "#F6F6F6", alt: "Confluence badge: five streams flowing into a central ring" },
};
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

  // Per-archetype badge bounce: only when that archetype's count goes up
  // (not on load, localStorage restore or reset).
  const prevCounts = useRef(counts);
  const [bounces, setBounces] = useState({});
  useEffect(() => {
    const prev = prevCounts.current;
    const grew = ARCHETYPES.filter((a) => (counts[a.id] || 0) > (prev[a.id] || 0));
    prevCounts.current = counts;
    if (grew.length === 0) return;
    setBounces((b) => {
      const next = { ...b };
      grew.forEach((a) => {
        next[a.id] = (next[a.id] || 0) + 1;
      });
      return next;
    });
  }, [counts]);

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
        isolation: "isolate",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        padding: "4vh 5vw",
        boxSizing: "border-box",
      }}
    >
      <LiveBubbles reduceMotion={reduceMotion} />
      <style>{`
        @keyframes live-flash { from { opacity: 0.9; } to { opacity: 0; } }
        @keyframes live-badge-bounce { 0% { transform: scale(1); } 50% { transform: scale(1.12); } 100% { transform: scale(1); } }
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
          <div style={{ display: "flex", alignItems: "center", gap: "2.4vh", height: "11vh", marginTop: "1.5vh", marginBottom: "1vh" }}>
            <img src={myndverseLogo} alt="MyndVerse logo" style={{ height: "11vh", width: "auto", display: "block" }} />
            <span aria-hidden="true" className="font-display text-tint-blue" style={{ fontSize: "4vh", lineHeight: 1 }}>×</span>
            <span className="bg-white" style={{ display: "flex", alignItems: "center", height: "7vh", padding: "0 2.2vh", borderRadius: 9999 }}>
              <img src={awcLogo} alt="AWC, Passion to excel" style={{ height: "5.2vh", width: "auto", display: "block" }} />
            </span>
          </div>
          <div className="font-display text-white" style={{ fontSize: "4vw", fontWeight: 700, marginTop: 8 }}>
            Who is in the room?
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "2vw" }}>
          <div style={{ textAlign: "right" }}>
            <div className="font-display text-amber-accent" style={{ fontSize: "5.5vw", fontWeight: 700, lineHeight: 1 }}>
              {total}
            </div>
            {/* negative right margin cancels the trailing letter-spacing so the caption lines up with the digits */}
            <div className="font-body text-tint-blue" style={{ fontSize: 14, letterSpacing: "0.25em", marginTop: 2, marginRight: "-0.25em" }}>RESULTS IN</div>
          </div>
          {/* Gate-link QR (https://myndcheck.vercel.app/?event=awc). Black on white with its own quiet zone; keep it unscaled-looking and unobstructed. */}
          <img
            src={awcQr}
            alt="QR code: scan to take the MyndCheck"
            style={{ width: "15vh", height: "15vh", flex: "none", display: "block", borderRadius: "1vh" }}
          />
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", marginTop: "2vh" }}>
        <div style={{ position: "relative", height: `${CHART_VH}vh` }}>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${BAR_VH}vh` }}>
            {[0.25, 0.5, 0.75, 1].map((f) => (
              <div key={f} className="border-t border-white/[0.06]" style={{ position: "absolute", left: 0, right: 0, bottom: `${f * 100}%` }} />
            ))}
          </div>
          <div className="bg-white/40" style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 2 }} />
          <div style={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "repeat(6, 1fr)", columnGap: "2vw" }}>
            {ARCHETYPES.map((a, i) => {
              const n = counts[a.id] || 0;
              const frac = Math.max(MIN_FRAC, n / ceiling);
              // same trigger as the badge bounce: only set when this archetype's count goes up
              const flash = bounces[a.id] || 0;
              return (
                <div key={a.id} style={{ position: "relative", height: "100%" }}>
                  <div
                    className={i % 2 === 0 ? "bg-white" : "bg-blue-mid"}
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: 0,
                      height: `${BAR_VH}vh`,
                      transformOrigin: "bottom",
                      transform: `scaleY(${frac})`,
                      transition: move,
                    }}
                  />
                  {flash > 0 && !reduceMotion && (
                    <div
                      key={flash}
                      className="bg-amber-accent"
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: `${BAR_VH}vh`,
                        transformOrigin: "bottom",
                        transform: `scaleY(${frac})`,
                        transition: move,
                        opacity: 0,
                        animation: "live-flash 700ms ease-out forwards",
                      }}
                    />
                  )}
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", columnGap: "2vw", marginTop: "1.2vh" }}>
          {ARCHETYPES.map((a) => {
            const badge = BADGES[a.id];
            const bounce = bounces[a.id] || 0;
            return (
              <div key={a.id} style={{ display: "flex", justifyContent: "center" }}>
                <div
                  key={bounce}
                  style={{
                    width: BADGE_SIZE,
                    height: BADGE_SIZE,
                    borderRadius: "50%",
                    overflow: "hidden",
                    boxSizing: "border-box",
                    padding: "3%",
                    background: badge.bg,
                    animation: bounce > 0 && !reduceMotion ? "live-badge-bounce 400ms ease-out" : "none",
                  }}
                >
                  <img src={badge.src} alt={badge.alt} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", columnGap: "2vw", marginTop: "0.8vh" }}>
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
