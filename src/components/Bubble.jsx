import { motion, useReducedMotion } from "framer-motion";

/**
 * One floating pillar bubble. Pops in (spring) then hands off into an
 * independent, continuous float loop. No visible label — pillar name only
 * lives in `title` (SVG) and the combined stage aria-label.
 */
export default function Bubble({
  title,
  sizePct,
  position,
  gradient,
  shadow,
  popDelay,
  floatDur,
  floatDelay,
  drift,
  iconStroke = "rgba(255,255,255,0.85)",
  icon,
}) {
  const reduceMotion = useReducedMotion();

  const popTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.7, delay: popDelay, ease: [0.34, 1.56, 0.64, 1] };

  const floatTransition = reduceMotion
    ? { duration: 0 }
    : {
        duration: floatDur,
        delay: popDelay + 0.7 + floatDelay,
        repeat: Infinity,
        ease: "easeInOut",
      };

  return (
    <motion.div
      title={title}
      className="absolute rounded-full flex items-center justify-center"
      style={{
        width: `${sizePct}%`,
        height: `${sizePct}%`,
        background: gradient,
        boxShadow: shadow,
        ...position,
      }}
      initial={{ opacity: 0, scale: 0.4, x: 0, y: 0, rotate: 0 }}
      animate={{
        opacity: 1,
        scale: 1,
        x: reduceMotion ? 0 : [0, drift.x, 0],
        y: reduceMotion ? 0 : [0, drift.y, 0],
        rotate: reduceMotion ? 0 : [0, drift.r, 0],
      }}
      transition={{
        opacity: popTransition,
        scale: popTransition,
        x: floatTransition,
        y: floatTransition,
        rotate: floatTransition,
      }}
    >
      <div
        className="absolute rounded-full blur-[2px]"
        style={{
          top: "13%",
          left: "19%",
          width: "24%",
          height: "17%",
          background: "rgba(255,255,255,0.35)",
        }}
      />
      <svg
        viewBox="0 0 48 48"
        className="relative w-[40%] h-[40%]"
        style={{
          stroke: iconStroke,
          fill: "none",
          strokeWidth: 4.5,
          strokeLinecap: "round",
          strokeLinejoin: "round",
        }}
      >
        {icon}
      </svg>
    </motion.div>
  );
}
