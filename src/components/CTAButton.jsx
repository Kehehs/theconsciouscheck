import { forwardRef } from "react";
import { motion } from "framer-motion";

/**
 * Pill CTA. Fredoka 600 label, amber fill, spring hover lift. Reused for
 * every "Start" instance across the intro page (hero + closing).
 * Forwards ref so callers (e.g. FeedbackModal) can return focus to it on close.
 */
const CTAButton = forwardRef(function CTAButton(
  { children, onClick, type = "button", size = "default", className = "", href },
  ref
) {
  const sizing =
    size === "large" ? "px-[54px] py-[19px] text-[19px]" : "px-12 py-[17px] text-lg";

  // With `href` it renders an external link (new tab) in exactly the same style.
  const Tag = href ? motion.a : motion.button;
  const tagProps = href
    ? { href, target: "_blank", rel: "noopener noreferrer" }
    : { type };
  const linkClasses = href ? "inline-flex items-center justify-center text-center no-underline" : "";

  return (
    <Tag
      ref={ref}
      {...tagProps}
      onClick={onClick}
      className={`font-display font-semibold text-white rounded-full bg-amber-accent min-h-[48px] min-w-[48px] cursor-pointer ${linkClasses} ${sizing} ${className}`}
      style={{ boxShadow: "0 12px 28px -8px rgba(233, 127, 63, 0.5)" }}
      whileHover={{
        y: -3,
        scale: 1.03,
        backgroundColor: "#ED8A50",
        boxShadow: "0 16px 34px -8px rgba(233, 127, 63, 0.65)",
      }}
      whileTap={{ y: 0, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
    >
      {children}
    </Tag>
  );
});

export default CTAButton;
