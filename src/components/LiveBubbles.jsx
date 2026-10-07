// Slow drifting background spheres for the live dashboard. Same glossy
// look as the Intro bubbles (theme colours, soft top-left highlight), but a
// fixed list, no blur or glow, and transform/opacity animation only.
//
// 10 blue bubbles roam the whole page, including behind the bars, badges
// and names. 2 orange bubbles stay in the header gap. Nothing may ever
// touch the top-right corner (total, caption and the reserved QR square
// plus a 2vw margin), at rest or anywhere in its drift range.
// `w` is the diameter, left/top the top-left corner as a share of the
// viewport, dx/dy the drift at the midpoint of the loop.
const BUBBLES = [
  // 10 blue
  { w: "18vw", left: 4, top: 58, color: "bg-blue-secondary", opacity: 0.1, dx: 4, dy: -8, dur: 38, delay: -6 },
  // nudged out of the QR / total corner: was left 78, top 6
  { w: "14vw", left: 73, top: 24, color: "bg-blue-mid", opacity: 0.09, dx: -5, dy: 9, dur: 31, delay: -14 },
  { w: "9vw", left: 44, top: 70, color: "bg-tint-blue", opacity: 0.07, dx: 6, dy: -7, dur: 27, delay: -3 },
  { w: "12vw", left: 60, top: 38, color: "bg-blue-secondary", opacity: 0.1, dx: -4, dy: 8, dur: 43, delay: -22 },
  { w: "6vw", left: 24, top: 14, color: "bg-tint-blue", opacity: 0.07, dx: 3, dy: 10, dur: 29, delay: -9 },
  { w: "16vw", left: 88, top: 62, color: "bg-blue-mid", opacity: 0.09, dx: -6, dy: -6, dur: 36, delay: -18 },
  { w: "7vw", left: 10, top: 30, color: "bg-blue-mid", opacity: 0.09, dx: 5, dy: 7, dur: 33, delay: -27 },
  { w: "11vw", left: 36, top: 4, color: "bg-blue-secondary", opacity: 0.1, dx: -3, dy: 8, dur: 41, delay: -11 },
  { w: "8vw", left: 70, top: 80, color: "bg-tint-blue", opacity: 0.07, dx: 4, dy: -9, dur: 25, delay: -20 },
  { w: "13vw", left: 52, top: 52, color: "bg-blue-secondary", opacity: 0.1, dx: 5, dy: -5, dur: 45, delay: -33 },
  // 2 orange: smaller and more opaque than the blue ones, because a
  // translucent orange over navy turns brown (amber-accent at 0.85 stays a
  // copper-orange). Listed last so they paint above the blue ones.
  { w: "min(3.5vw, 6vh)", left: 48, top: 5, color: "bg-amber-accent", opacity: 0.85, dx: 2, dy: 3, dur: 25, delay: -20 },
  { w: "min(5vw, 6.5vh)", left: 89, top: 23, color: "bg-amber-accent", opacity: 0.85, dx: 1, dy: 1, dur: 45, delay: -33 },
];

export default function LiveBubbles({ reduceMotion }) {
  return (
    <div
      aria-hidden="true"
      style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: -1 }}
    >
      <style>{`
        @keyframes live-drift {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(var(--dx), var(--dy), 0); }
        }
      `}</style>
      {BUBBLES.map((b, i) => (
        <div
          key={i}
          data-bubble
          className={`rounded-full ${b.color}`}
          style={{
            position: "absolute",
            left: `${b.left}%`,
            top: `${b.top}%`,
            width: b.w,
            height: b.w,
            opacity: b.opacity,
            backgroundImage: "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.4), rgba(255,255,255,0) 55%)",
            "--dx": `${b.dx}vw`,
            "--dy": `${b.dy}vh`,
            animation: reduceMotion ? "none" : `live-drift ${b.dur}s ease-in-out ${b.delay}s infinite`,
            willChange: reduceMotion ? "auto" : "transform",
          }}
        />
      ))}
    </div>
  );
}
