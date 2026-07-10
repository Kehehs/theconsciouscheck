import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import BubbleStage from "../components/BubbleStage";
import CTAButton from "../components/CTAButton";
import TrustMarkers from "../components/TrustMarkers";
import TeaserCard from "../components/TeaserCard";

const TEASER_CARDS = [
  {
    text: "A name for the pattern you already live by",
    bleedColor: "#35577E",
    icon: (
      <>
        <path d="M4 12a8 8 0 1116 0 8 8 0 01-16 0z" />
        <path d="M12 8v4l3 2" />
      </>
    ),
  },
  {
    text: "Where you're strong, and where it quietly costs you",
    bleedColor: "#6E97C2",
    icon: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" />
      </>
    ),
  },
  {
    text: "One honest edge worth paying attention to",
    bleedColor: "#E97F3F",
    icon: <path d="M12 2v20M5 9l7-7 7 7" />,
  },
  {
    text: "How it shows up at work, and with people",
    bleedColor: "#A9C6E8",
    icon: (
      <>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
      </>
    ),
  },
];

export default function Intro() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  const start = () => navigate("/quiz");
  const scrollToTaste = () =>
    document.getElementById("what-you-get")?.scrollIntoView({ behavior: "smooth" });

  return (
    <div>
      {/* SECTION 1 — HERO */}
      <section
        className="relative overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 900px 700px at 82% 28%, rgba(233,127,63,0.14), transparent 60%), radial-gradient(ellipse 1000px 800px at 15% 88%, rgba(59,108,153,0.35), transparent 55%), linear-gradient(160deg, #1E3A5F, #16304F)",
        }}
      >
        <div className="relative mx-auto flex min-h-screen max-w-[1240px] flex-col px-[6vw]">
          <div className="font-display flex items-center gap-[9px] pt-10 text-[19px] font-semibold text-white/95">
            <span className="inline-block h-[9px] w-[9px] rounded-full bg-amber-accent" />
            Conscious Check
          </div>

          <div className="grid flex-1 grid-cols-1 items-center gap-4 py-6 pb-10 md:grid-cols-[minmax(300px,500px)_1fr]">
            <motion.div
              className="order-2 flex flex-col items-start md:order-1"
              initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.8, delay: reduceMotion ? 0 : 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="font-display my-4 max-w-[12ch] text-[clamp(2.1rem,4.4vw,3.6rem)] font-semibold leading-[1.18] tracking-[-0.01em] text-white">
                You already know who you are.{" "}
                <span className="text-amber-soft">This just gives it a name.</span>
              </h1>
              <p className="mb-2 max-w-[36ch] font-body text-[clamp(1rem,1.3vw,1.15rem)] font-medium leading-[1.6] text-pale-tint opacity-90">
                18 questions, 4 to 5 minutes, one honest reading of who you are right now.
              </p>

              <CTAButton onClick={start} className="mt-2.5">
                Start
              </CTAButton>

              <button
                type="button"
                onClick={scrollToTaste}
                className="mt-7 flex items-center gap-2 text-[13px] font-semibold tracking-[0.02em] text-tint-blue opacity-55 hover:opacity-80"
                style={{ animation: reduceMotion ? "none" : "bob 2.4s ease-in-out infinite" }}
              >
                <span>See what you'll get</span>
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" style={{ stroke: "var(--color-tint-blue)", fill: "none", strokeWidth: 2.4, strokeLinecap: "round", strokeLinejoin: "round" }}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            </motion.div>

            <div className="order-1 md:order-2">
              <BubbleStage />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — WHAT YOU GET */}
      <section
        id="what-you-get"
        className="px-[6vw] py-[100px] pb-[110px]"
        style={{ background: "linear-gradient(180deg, #16304F, #112742)" }}
      >
        <motion.div
          className="mx-auto mb-14 max-w-[620px] text-center"
          initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: reduceMotion ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="font-display mb-3 text-[13px] font-semibold uppercase tracking-[0.08em] text-amber-soft">
            What's Waiting on the Other Side
          </p>
          <h2 className="font-display mb-3.5 text-[clamp(1.7rem,3vw,2.3rem)] font-semibold leading-[1.25] text-white">
            Not a score. A mirror.
          </h2>
          <p className="m-0 font-body text-base leading-[1.6] text-pale-tint opacity-85">
            Answer honestly and you'll get more than a label — a few real things worth
            sitting with.
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-[1080px] grid-cols-1 gap-[22px] sm:grid-cols-2 lg:grid-cols-4">
          {TEASER_CARDS.map((card, i) => (
            <TeaserCard key={card.text} {...card} index={i} />
          ))}
        </div>
      </section>

      {/* SECTION 3 — CLOSING */}
      <section
        className="relative overflow-hidden px-[6vw] py-[130px] pb-[150px] text-center"
        style={{
          background:
            "radial-gradient(ellipse 700px 500px at 50% 60%, rgba(233,127,63,0.16), transparent 65%), linear-gradient(180deg, #112742, #1E3A5F)",
        }}
      >
        {!reduceMotion && (
          <>
            <motion.div
              className="pointer-events-none absolute rounded-full opacity-[0.12]"
              style={{ width: 90, height: 90, top: "12%", left: "12%", background: "radial-gradient(circle, #6E97C2, transparent 70%)" }}
              animate={{ y: [0, -22, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="pointer-events-none absolute rounded-full opacity-[0.12]"
              style={{ width: 60, height: 60, bottom: "16%", right: "16%", background: "radial-gradient(circle, #E97F3F, transparent 70%)" }}
              animate={{ y: [0, -22, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            />
            <motion.div
              className="pointer-events-none absolute rounded-full opacity-[0.12]"
              style={{ width: 40, height: 40, top: "22%", right: "24%", background: "radial-gradient(circle, #A9C6E8, transparent 70%)" }}
              animate={{ y: [0, -22, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
            />
          </>
        )}

        <motion.div
          className="relative mx-auto flex max-w-[560px] flex-col items-center"
          initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: reduceMotion ? 0 : 0.7 }}
        >
          <p className="font-display mb-[26px] text-[clamp(1.5rem,2.6vw,2rem)] font-semibold text-white">
            Ready when you are.
          </p>

          <TrustMarkers
            items={["18 questions", "4–5 minutes", "A reflection, not a diagnosis"]}
            className="mb-[34px] justify-center"
          />

          <CTAButton onClick={start} size="large">
            Start
          </CTAButton>
        </motion.div>
      </section>

      <style>{`
        @keyframes bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(5px); }
        }
      `}</style>
    </div>
  );
}
