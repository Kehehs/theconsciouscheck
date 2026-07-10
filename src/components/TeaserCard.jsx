import { motion } from "framer-motion";

/**
 * Section 2 "What You Get" card. Reusable template for any future
 * preview/teaser content per the theme's component patterns.
 */
export default function TeaserCard({ icon, text, bleedColor, index }) {
  return (
    <motion.div
      className="relative overflow-hidden rounded-[24px] px-6 pt-[30px] pb-7"
      style={{
        background: "rgba(169, 198, 232, 0.05)",
        boxShadow: "0 18px 40px -22px rgba(0,0,0,0.5)",
      }}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.65, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className="pointer-events-none absolute rounded-full opacity-50"
        style={{
          width: 130,
          height: 130,
          bottom: -60,
          right: -60,
          background: `radial-gradient(circle, ${bleedColor}, transparent 70%)`,
        }}
      />
      <div
        className="relative mb-[18px] flex h-[46px] w-[46px] items-center justify-center rounded-[14px]"
        style={{ background: "rgba(255,255,255,0.08)" }}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-[22px] w-[22px]"
          style={{
            stroke: "var(--color-tint-blue)",
            fill: "none",
            strokeWidth: 2.2,
            strokeLinecap: "round",
            strokeLinejoin: "round",
          }}
        >
          {icon}
        </svg>
      </div>
      <p className="relative m-0 font-body text-[0.98rem] font-semibold leading-snug text-white">
        {text}
      </p>
    </motion.div>
  );
}
