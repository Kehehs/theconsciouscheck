import { motion, useReducedMotion } from "framer-motion";
import Bubble from "./Bubble";

const BUBBLES = [
  {
    title: "Consciousness",
    sizePct: 43,
    position: { top: "3%", left: "28%" },
    gradient: "radial-gradient(circle at 32% 28%, #35577E, #1E3A5F 70%)",
    shadow:
      "0 22px 48px -14px rgba(30,58,95,0.75), inset 0 0 0 1px rgba(255,255,255,0.08)",
    popDelay: 0.15,
    floatDur: 7.5,
    floatDelay: 0,
    drift: { x: 8, y: -24, r: 3 },
    icon: (
      <>
        <circle cx="24" cy="24" r="7" />
        <path d="M24 4v6M24 38v6M4 24h6M38 24h6M10 10l4.2 4.2M33.8 33.8L38 38M38 10l-4.2 4.2M14.2 33.8L10 38" />
      </>
    ),
  },
  {
    title: "Action",
    sizePct: 33,
    position: { top: "0%", right: "-2%" },
    gradient: "radial-gradient(circle at 32% 28%, #5586B8, #3B6C99 70%)",
    shadow:
      "0 20px 42px -12px rgba(59,108,153,0.6), inset 0 0 0 1px rgba(255,255,255,0.08)",
    popDelay: 0.3,
    floatDur: 6.5,
    floatDelay: 0.4,
    drift: { x: -12, y: 20, r: -4 },
    icon: (
      <>
        <path d="M8 40 L24 8 L40 40 Z" />
        <path d="M24 8v18" />
      </>
    ),
  },
  {
    title: "Responsibility",
    sizePct: 38,
    position: { bottom: "0%", left: "0%" },
    gradient: "radial-gradient(circle at 32% 28%, #8CADD1, #6E97C2 70%)",
    shadow:
      "0 20px 42px -12px rgba(110,151,194,0.55), inset 0 0 0 1px rgba(255,255,255,0.08)",
    popDelay: 0.45,
    floatDur: 8,
    floatDelay: 0.2,
    drift: { x: 16, y: 16, r: 4 },
    icon: <path d="M24 6 L40 12 V24 C40 34 33 41 24 44 C15 41 8 34 8 24 V12 Z" />,
  },
  {
    title: "Engagement",
    sizePct: 28,
    position: { bottom: "8%", right: "8%" },
    gradient: "radial-gradient(circle at 32% 28%, #C3D8ED, #A9C6E8 70%)",
    shadow:
      "0 16px 34px -12px rgba(169,198,232,0.5), inset 0 0 0 1px rgba(255,255,255,0.1)",
    popDelay: 0.6,
    floatDur: 6,
    floatDelay: 0.6,
    drift: { x: -10, y: -16, r: -3 },
    iconStroke: "rgba(30,58,95,0.55)",
    icon: (
      <>
        <circle cx="16" cy="18" r="7" />
        <circle cx="32" cy="18" r="7" />
        <path d="M4 40c0-7 5-12 12-12s12 5 12 12M20 40c0-7 5-12 12-12s12 5 12 12" />
      </>
    ),
  },
  {
    title: "Self-Growth",
    sizePct: 24,
    position: { top: "38%", left: "2%" },
    gradient: "radial-gradient(circle at 32% 28%, #F0A874, #E97F3F 70%)",
    shadow:
      "0 16px 36px -10px rgba(233,127,63,0.55), inset 0 0 0 1px rgba(255,255,255,0.12)",
    popDelay: 0.75,
    floatDur: 5.5,
    floatDelay: 0.1,
    drift: { x: 12, y: -14, r: 5 },
    icon: (
      <>
        <path d="M24 42V22" />
        <path d="M24 22c0-9-7-14-15-14 0 9 6 14 15 14Z" />
        <path d="M24 28c0-8 7-12 14-12 0 8-6 12-14 12Z" />
      </>
    ),
  },
];

const AMBIENT_DOTS = [
  { size: 5, top: "16%", left: "60%", delay: 0.3 },
  { size: 4, top: "58%", left: "80%", delay: 1.4 },
  { size: 6, top: "80%", left: "40%", delay: 2.1 },
  { size: 3, top: "28%", left: "10%", delay: 0.9 },
];

export default function BubbleStage() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      role="img"
      aria-label="Five floating spheres representing the five dimensions of conscious living: Consciousness, Action, Responsibility, Engagement, and Self-Growth"
      className="relative w-full max-w-[660px] aspect-square mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduceMotion ? 0 : 0.6, delay: reduceMotion ? 0 : 0.1 }}
    >
      {BUBBLES.map((b) => (
        <Bubble key={b.title} {...b} />
      ))}

      {!reduceMotion &&
        AMBIENT_DOTS.map((d, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/50"
            style={{ width: d.size, height: d.size, top: d.top, left: d.left }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{
              duration: 3,
              delay: d.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
    </motion.div>
  );
}
