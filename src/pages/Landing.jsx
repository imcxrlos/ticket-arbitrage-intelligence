import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Shield, TrendingUp, Clock, ChevronRight, ExternalLink } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const TICKER_ITEMS = [
  { match: "Argentina vs Brazil", score: 94, discount: "41%" },
  { match: "USA vs Mexico", score: 88, discount: "28%" },
  { match: "France vs England", score: 91, discount: "35%" },
  { match: "Spain vs Germany", score: 86, discount: "22%" },
  { match: "Portugal vs Netherlands", score: 79, discount: "18%" },
  { match: "Morocco vs Senegal", score: 83, discount: "31%" },
  { match: "Japan vs South Korea", score: 77, discount: "24%" },
  { match: "Brazil vs France", score: 96, discount: "44%" },
];

const FEATURES = [
  { icon: Zap, title: "Real-time Scanning", desc: "Continuous market surveillance across 12+ ticket platforms, updated every 60 seconds." },
  { icon: TrendingUp, title: "Opportunity Scoring", desc: "Proprietary 0–100 score weighing price delta, demand tier, and historical trend." },
  { icon: Shield, title: "Instant Alerts", desc: "Multi-channel notifications the moment a high-score opportunity enters your criteria." },
  { icon: Clock, title: "Edge Window", desc: "Mispriced tickets rarely last more than minutes. Ghost gets you there first." },
];

const HOW_STEPS = [
  { num: "01", title: "Scan", desc: "Ghost monitors live ticket listings across all major secondary markets simultaneously." },
  { num: "02", title: "Score", desc: "Each listing is scored against estimated fair market value, demand data, and match tier." },
  { num: "03", title: "Alert", desc: "When an opportunity meets your criteria, you're notified before the market corrects." },
];

const ROADMAP = [
  {
    phase: "Phase 1", status: "live", label: "Open Beta", tag: "Now",
    title: "Free for everyone. Always.",
    desc: "Ghost launches in open beta — no paywalls, no waitlists. Every feature is free. Use it, break it, tell us what to fix.",
  },
  {
    phase: "Phase 2", status: "upcoming", label: "Algorithm Refinement", tag: "Q3 2026",
    title: "Smarter signals, more markets.",
    desc: "Expanded platform coverage, improved arbitrage scoring accuracy, and demand-tier forecasting. The scanner becomes genuinely predictive.",
  },
  {
    phase: "Phase 3", status: "upcoming", label: "Coin Launch", tag: "Q4 2026",
    title: "Community funds the mission.",
    desc: "A token launch via pump.fun to fund infrastructure, data partnerships, and a full-time dev team. Token holders get early access and governance input.",
    highlight: true,
  },
  {
    phase: "Phase 4", status: "future", label: "Pro Intelligence Layer", tag: "2027",
    title: "Institutional-grade tooling. Still free.",
    desc: "AI-driven opportunity forecasting, automated triggers, portfolio tracking, and multi-event arbitrage routing — all funded by the community.",
  },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.75, delay, ease: [0.25, 0.46, 0.45, 0.94] },
});

const fadeUpView = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] },
});

function RoadmapCard({ item, index }) {
  const [hovered, setHovered] = useState(false);

  const accentColor = item.status === "live" ? "#22c55e" : item.highlight ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.25)";
  const borderColor = item.status === "live"
    ? hovered ? "rgba(34,197,94,0.4)" : "rgba(34,197,94,0.18)"
    : item.highlight
    ? hovered ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.09)"
    : hovered ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)";

  const bg = item.status === "live"
    ? hovered ? "rgba(34,197,94,0.06)" : "rgba(34,197,94,0.03)"
    : item.highlight
    ? hovered ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.025)"
    : hovered ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.015)";

  return (
    <motion.div
      {...fadeUpView(index * 0.1)}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative rounded-2xl overflow-hidden cursor-default"
      animate={{ borderColor, background: bg }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{ border: `1px solid ${borderColor}`, background: bg }}
    >
      {/* Animated top line */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-px"
        animate={{
          background: hovered
            ? item.status === "live"
              ? "linear-gradient(90deg, transparent 0%, rgba(34,197,94,0.9) 50%, transparent 100%)"
              : item.highlight
              ? "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)"
              : "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)"
            : "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)",
          scaleX: hovered ? 1 : 0.3,
          opacity: hovered ? 1 : 0.5,
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />

      {/* Radial hover glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        style={{
          background: item.status === "live"
            ? "radial-gradient(ellipse at 20% 50%, rgba(34,197,94,0.07) 0%, transparent 55%)"
            : item.highlight
            ? "radial-gradient(ellipse at 20% 50%, rgba(255,255,255,0.04) 0%, transparent 55%)"
            : "radial-gradient(ellipse at 20% 50%, rgba(255,255,255,0.02) 0%, transparent 55%)"
        }}
      />

      <div className="relative flex items-center gap-8 px-7 py-6">

        {/* Left: big number */}
        <motion.div
          className="shrink-0 font-mono font-bold leading-none select-none w-14 text-right"
          animate={{
            color: hovered
              ? item.status === "live" ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.18)"
              : item.status === "live" ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.06)"
          }}
          transition={{ duration: 0.3 }}
          style={{ fontSize: 48 }}
        >
          {String(index + 1).padStart(2, "0")}
        </motion.div>

        {/* Vertical divider */}
        <motion.div
          className="shrink-0 w-px self-stretch"
          animate={{ background: hovered ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)" }}
          transition={{ duration: 0.3 }}
        />

        {/* Center: content */}
        <div className="flex-1 min-w-0 py-1">
          <div className="flex items-center gap-2.5 mb-2">
            <span className="text-[9px] font-mono tracking-[0.2em] uppercase" style={{ color: "rgba(255,255,255,0.2)" }}>{item.phase}</span>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider" style={{
              background: item.status === "live" ? "rgba(34,197,94,0.12)" : item.highlight ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${item.status === "live" ? "rgba(34,197,94,0.3)" : item.highlight ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)"}`,
              color: item.status === "live" ? "#22c55e" : item.highlight ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.22)",
            }}>
              {item.label}
            </span>
          </div>
          <div className="font-display text-[17px] font-bold text-white leading-snug tracking-tight mb-1.5">{item.title}</div>
          <motion.div
            className="text-[13px] leading-relaxed overflow-hidden"
            animate={{ color: hovered ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.32)" }}
            transition={{ duration: 0.3 }}
          >
            {item.desc}
          </motion.div>
          {item.highlight && (
            <a
              href="https://pump.fun" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-3 text-[11px] font-mono transition-colors duration-200"
              style={{ color: "rgba(255,255,255,0.3)" }}
              onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}
              onClick={e => e.stopPropagation()}
            >
              <span className="w-1 h-1 rounded-full bg-ghost-green pulse-dot" />
              pump.fun <ExternalLink className="w-2.5 h-2.5" />
            </a>
          )}
        </div>

        {/* Right: status */}
        <div className="shrink-0 text-right flex flex-col items-end gap-2">
          {item.status === "live" ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)" }}>
              <div className="w-1.5 h-1.5 rounded-full bg-ghost-green pulse-dot" />
              <span className="text-[10px] font-mono text-ghost-green font-semibold">Now</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <span className="text-[10px] font-mono font-medium" style={{ color: "rgba(255,255,255,0.3)" }}>Soon</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Landing() {
  const [liveCount, setLiveCount] = useState(142);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.6], [0, 60]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCount(prev => prev >= 160 ? prev : prev + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#080808] text-white overflow-x-hidden">

      {/* ── Nav ── */}
      <motion.nav
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50"
        style={{ background: "rgba(8,8,8,0.7)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-white pulse-dot" />
            <span className="font-display font-bold tracking-tight text-white text-[15px]">Ghost</span>
          </div>
          <div className="hidden md:flex items-center gap-7">
            <Link to="/scanner" className="text-[13px] text-white/45 hover:text-white transition-colors duration-200 font-medium">Scanner</Link>
            <Link to="/watchlist" className="text-[13px] text-white/45 hover:text-white transition-colors duration-200 font-medium">Watchlist</Link>
            <Link to="/alerts" className="text-[13px] text-white/45 hover:text-white transition-colors duration-200 font-medium">Alerts</Link>
          </div>
          <Link
            to="/scanner"
            className="group h-8 px-4 text-[13px] font-semibold rounded-lg flex items-center gap-1.5 transition-all duration-200"
            style={{ background: "rgba(255,255,255,0.9)", color: "#000" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,1)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.9)"}
          >
            Open Scanner
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-150" />
          </Link>
        </div>
      </motion.nav>

      {/* ── Live Ticker ── */}
      <div className="fixed top-14 left-0 right-0 z-40 overflow-hidden h-8 flex items-center"
        style={{ background: "rgba(8,8,8,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="flex items-center gap-3 px-4 shrink-0 h-full" style={{ borderRight: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="w-1.5 h-1.5 rounded-full bg-ghost-green pulse-dot" />
          <span className="text-[10px] text-white/35 font-mono uppercase tracking-[0.18em]">Live</span>
        </div>
        <div className="overflow-hidden flex-1">
          <div className="ticker-track">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <div key={i} className="flex items-center gap-4 px-6 shrink-0">
                <span className="text-[11px] text-white/55 font-mono">{item.match}</span>
                <span className="text-[11px] text-ghost-green font-mono font-medium">{item.discount} below market</span>
                <span className="text-[11px] text-white/15">·</span>
                <span className="text-[11px] text-white/30 font-mono">Score {item.score}</span>
                <span className="text-white/10 mx-3 text-xs">|</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Hero ── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col justify-center pt-32 pb-24 px-6 overflow-hidden">

        {/* Ambient background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[140px] opacity-[0.07]"
            style={{ background: "radial-gradient(circle, #22c55e 0%, transparent 70%)" }} />
          <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full blur-[120px] opacity-[0.05]"
            style={{ background: "radial-gradient(circle, #60a5fa 0%, transparent 70%)" }} />
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.018) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        </div>

        <motion.div style={{ opacity: heroOpacity, y: heroY }} className="relative max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-[1fr_1.1fr] gap-20 items-center">

            {/* Left */}
            <div>
              <motion.div {...fadeUp(0.1)}>
                <div className="inline-flex items-center gap-2.5 mb-10 px-3.5 py-1.5 rounded-full"
                  style={{ background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.2)" }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-ghost-green pulse-dot" />
                  <span className="text-[11px] text-white/60 font-mono tracking-wider uppercase">FIFA World Cup 2026 — Active</span>
                </div>
              </motion.div>

              <motion.h1
                {...fadeUp(0.18)}
                className="font-display font-bold leading-[0.92] tracking-[-0.03em] text-white mb-7"
                style={{ fontSize: "clamp(4.5rem,11vw,9rem)" }}
              >
                Ghost
              </motion.h1>

              <motion.p {...fadeUp(0.28)} className="text-[17px] text-white/45 leading-relaxed max-w-[440px] mb-3 font-light">
                FIFA World Cup 2026 ticket arbitrage intelligence.
              </motion.p>
              <motion.p {...fadeUp(0.32)} className="text-[14px] text-white/25 leading-relaxed max-w-[400px]">
                Ghost scans secondary markets in real time and surfaces mispriced tickets — before the market self-corrects.
              </motion.p>

              <motion.div {...fadeUp(0.42)} className="flex flex-col sm:flex-row gap-3 mt-11">
                <Link
                  to="/scanner"
                  className="group inline-flex items-center justify-center gap-2 h-12 px-8 font-semibold rounded-xl text-[14px] transition-all duration-200"
                  style={{ background: "#fff", color: "#000", boxShadow: "0 0 0 1px rgba(255,255,255,0.1), 0 8px 32px rgba(255,255,255,0.08)" }}
                >
                  Scan the Market
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-150" />
                </Link>
                <a
                  href="https://pump.fun"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative inline-flex items-center justify-center gap-2.5 h-12 px-8 font-medium rounded-xl text-[14px] transition-all duration-200 overflow-hidden"
                  style={{
                    background: "rgba(34,197,94,0.06)",
                    border: "1px solid rgba(34,197,94,0.3)",
                    boxShadow: "0 0 24px rgba(34,197,94,0.1)",
                    color: "rgba(255,255,255,0.8)"
                  }}
                >
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
                    style={{ background: "rgba(34,197,94,0.1)" }} />
                  <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: "#22c55e" }} />
                  <span className="relative">pump.fun</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-40 group-hover:translate-x-0.5 transition-transform duration-150" />
                </a>
              </motion.div>

              {/* Stats */}
              <motion.div {...fadeUp(0.52)} className="flex gap-10 mt-14 pt-10" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                {[
                  { label: "Opportunities Found", value: liveCount + "+" },
                  { label: "Avg. Discount", value: "31%" },
                  { label: "Markets Scanned", value: "12" },
                ].map((s, i) => (
                  <div key={i}>
                    <div className="font-display text-[26px] font-bold text-white leading-none tracking-tight">{s.value}</div>
                    <div className="text-[11px] text-white/30 mt-1.5 tracking-wide">{s.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right */}
            <motion.div
              initial={{ opacity: 0, x: 40, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="hidden lg:block"
            >
              <PreviewCard />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── Independence Banner ── */}
      <section className="py-12 px-6" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            {...fadeUpView(0)}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 px-8 py-6 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(8px)" }}
          >
            <div>
              <div className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em] mb-2.5">Independent Tool</div>
              <p className="text-[14px] text-white/55 leading-relaxed max-w-xl">
                Ghost is fully independent. We use <span className="text-white/90">no affiliate links</span>, earn <span className="text-white/90">zero commission</span> from any platform, and have <span className="text-white/90">no referral deals</span>. Every ranking is purely algorithmic.
              </p>
            </div>
            <div className="flex flex-col gap-2.5 shrink-0">
              {["No affiliate links", "No referral commissions", "No sponsored results"].map((item) => (
                <div key={item} className="flex items-center gap-2.5">
                  <div className="w-1 h-1 rounded-full bg-ghost-green" />
                  <span className="text-[12px] font-mono text-white/35">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-32 px-6" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeUpView()} className="mb-20">
            <p className="text-[11px] text-white/25 font-mono tracking-[0.22em] uppercase mb-4">How Ghost Works</p>
            <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] font-bold text-white leading-tight tracking-tight">Three steps to an edge.</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-px bg-white/[0.04] rounded-2xl overflow-hidden">
            {HOW_STEPS.map((step, i) => (
              <motion.div
                key={i}
                {...fadeUpView(i * 0.1)}
                className="relative p-10 group transition-all duration-300 cursor-default"
                style={{ background: "#0c0c0c" }}
                whileHover={{ background: "#111111" }}
              >
                <div className="font-mono text-[56px] font-bold leading-none mb-8 transition-colors duration-300"
                  style={{ color: "rgba(255,255,255,0.05)" }}
                  onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.12)"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.05)"}
                >
                  {step.num}
                </div>
                <div className="font-display text-[22px] font-bold text-white mb-3 tracking-tight">{step.title}</div>
                <div className="text-[14px] text-white/35 leading-relaxed">{step.desc}</div>
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Intelligence Stack (Features) ── */}
      <section className="py-32 px-6" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeUpView()} className="mb-20">
            <p className="text-[11px] text-white/25 font-mono tracking-[0.22em] uppercase mb-4">Intelligence Stack</p>
            <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] font-bold text-white leading-tight tracking-tight">Built for asymmetric advantage.</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                {...fadeUpView(i * 0.08)}
                className="group relative p-7 rounded-2xl transition-all duration-300 cursor-default overflow-hidden"
                style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}
                whileHover={{ borderColor: "rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)" }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                  style={{ background: "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.04) 0%, transparent 60%)" }} />
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-6 transition-all duration-300"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <f.icon className="w-4 h-4 text-white/60" />
                  </div>
                  <div className="font-display text-[16px] font-bold text-white mb-2.5 tracking-tight">{f.title}</div>
                  <div className="text-[13px] text-white/35 leading-relaxed">{f.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roadmap ── */}
      <section className="py-32 px-6" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeUpView()} className="mb-20 text-center">
            <p className="text-[11px] text-white/25 font-mono tracking-[0.22em] uppercase mb-4">Roadmap</p>
            <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] font-bold text-white leading-tight tracking-tight">Where Ghost is going.</h2>
            <p className="text-[14px] text-white/30 mt-4 max-w-lg mx-auto leading-relaxed">An open, community-funded project. Free at the core — forever.</p>
          </motion.div>

          {/* Stacked cards */}
          <div className="max-w-3xl mx-auto space-y-3">
            {ROADMAP.map((item, i) => (
              <RoadmapCard key={i} item={item} index={i} />
            ))}
          </div>

          {/* Bottom note */}
          <motion.p {...fadeUpView(0.4)} className="text-center text-[12px] font-mono mt-12" style={{ color: "rgba(255,255,255,0.18)" }}>
            The tool stays free at every phase. The token funds the infrastructure — not access.
          </motion.p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-40 px-6 relative overflow-hidden" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full blur-[140px] opacity-[0.06]"
            style={{ background: "radial-gradient(ellipse, #ffffff 0%, transparent 70%)" }} />
        </div>
        <div className="max-w-3xl mx-auto text-center relative">
          <motion.div {...fadeUpView()}>
            <p className="text-[11px] text-white/20 font-mono tracking-[0.22em] uppercase mb-8">Ready?</p>
            <h2 className="font-display font-bold text-white mb-7 leading-tight tracking-tight"
              style={{ fontSize: "clamp(2.4rem,6vw,5rem)" }}>
              Find World Cup tickets<br />before the market catches up.
            </h2>
            <p className="text-[15px] text-white/30 mb-12 leading-relaxed max-w-lg mx-auto">
              No account required. No paywalls. Start scanning in seconds.
            </p>
            <Link
              to="/scanner"
              className="group inline-flex items-center gap-2.5 h-14 px-12 font-bold rounded-2xl text-[15px] transition-all duration-200"
              style={{ background: "#fff", color: "#000", boxShadow: "0 0 0 1px rgba(255,255,255,0.15), 0 16px 48px rgba(255,255,255,0.1)" }}
            >
              Launch Scanner
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <motion.footer
        {...fadeUpView()}
        className="py-10 px-6"
        style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.25)" }} />
            <span className="text-[13px] font-display font-bold" style={{ color: "rgba(255,255,255,0.35)" }}>Ghost</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/terms" className="text-[12px] font-mono transition-colors duration-200" style={{ color: "rgba(255,255,255,0.2)" }}
              onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.2)"}>Terms</Link>
            <Link to="/privacy" className="text-[12px] font-mono transition-colors duration-200" style={{ color: "rgba(255,255,255,0.2)" }}
              onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.2)"}>Privacy</Link>
            <span className="text-[12px] font-mono" style={{ color: "rgba(255,255,255,0.12)" }}>FIFA World Cup 2026 Arbitrage Intelligence</span>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}

// ── Chart data ──
const PRICE_HISTORY = [
  { day: "Jun 12", tm: 2180, sg: 2340, stub: 2510, vvd: 2620 },
  { day: "Jun 13", tm: 2150, sg: 2290, stub: 2480, vvd: 2590 },
  { day: "Jun 14", tm: 2210, sg: 2380, stub: 2530, vvd: 2640 },
  { day: "Jun 15", tm: 2080, sg: 2260, stub: 2400, vvd: 2560 },
  { day: "Jun 16", tm: 1940, sg: 2190, stub: 2310, vvd: 2490 },
  { day: "Jun 17", tm: 1870, sg: 2140, stub: 2250, vvd: 2430 },
  { day: "Jun 18", tm: 1760, sg: 2090, stub: 2180, vvd: 2370 },
];

const PLATFORMS = [
  { key: "tm",   label: "Ticketmaster", color: "#22c55e" },
  { key: "sg",   label: "SeatGeek",     color: "#60a5fa" },
  { key: "stub", label: "StubHub",      color: "#f59e0b" },
  { key: "vvd",  label: "Vivid Seats",  color: "rgba(255,255,255,0.3)" },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const sorted = [...payload].sort((a, b) => a.value - b.value);
  return (
    <div style={{ background: "rgba(6,6,6,0.98)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 32px 64px rgba(0,0,0,0.8)", borderRadius: 12 }}
      className="px-4 py-3.5 backdrop-blur-2xl min-w-[150px]">
      <p className="text-[9px] font-mono text-white/20 mb-3 uppercase tracking-widest">{label}</p>
      {sorted.map((p) => {
        const platform = PLATFORMS.find(pl => pl.key === p.dataKey);
        const isLowest = p.value === sorted[0].value;
        return (
          <div key={p.dataKey} className="flex items-center justify-between gap-6 mb-1.5 last:mb-0">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: platform?.color }} />
              <span className="text-[10px] font-mono text-white/30">{platform?.label}</span>
            </div>
            <span className={`text-[11px] font-mono font-bold ${isLowest ? "text-ghost-green" : "text-white/55"}`}>${p.value.toLocaleString()}</span>
          </div>
        );
      })}
      <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex justify-between items-center">
          <span className="text-[9px] font-mono text-white/20">Spread</span>
          <span className="text-[10px] font-mono text-ghost-amber font-semibold">${(sorted[sorted.length-1].value - sorted[0].value).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

function PreviewCard() {
  const [activePlatforms, setActivePlatforms] = useState(new Set(['tm', 'sg', 'stub', 'vvd']));
  const latest = PRICE_HISTORY[PRICE_HISTORY.length - 1];
  const first = PRICE_HISTORY[0];
  const tmDrop = Math.round(((first.tm - latest.tm) / first.tm) * 100);
  const maxSpread = latest.vvd - latest.tm;
  const spreadPct = Math.round(((latest.vvd - latest.tm) / latest.vvd) * 100);

  const togglePlatform = (key) => {
    setActivePlatforms(prev => {
      const next = new Set(prev);
      if (next.has(key) && next.size > 1) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="relative select-none">
      {/* Layered glows */}
      <div className="absolute -inset-8 -z-10 blur-[80px] opacity-25 rounded-full"
        style={{ background: "radial-gradient(ellipse at 55% 45%, #22c55e 0%, transparent 55%)" }} />
      <div className="absolute -inset-12 -z-10 blur-[120px] opacity-10 rounded-full"
        style={{ background: "radial-gradient(ellipse at 40% 60%, #60a5fa 0%, transparent 55%)" }} />

      <div className="rounded-3xl overflow-hidden"
        style={{
          background: "rgba(10,10,10,0.97)",
          border: "1px solid rgba(255,255,255,0.09)",
          boxShadow: "0 48px 96px rgba(0,0,0,0.8), 0 0 0 0.5px rgba(255,255,255,0.05) inset, 0 1px 0 rgba(255,255,255,0.06) inset"
        }}>

        {/* Top bar */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-ghost-green pulse-dot" />
            <span className="text-[9px] text-white/30 font-mono uppercase tracking-[0.18em]">Price Intelligence · Live</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg px-2.5 py-1" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <span className="text-[9px] font-mono text-white/25">7D</span>
            <span className="text-[9px] font-mono text-white/10">·</span>
            <span className="text-[9px] font-mono text-white/45 font-semibold">4 Markets</span>
          </div>
        </div>

        {/* Price header */}
        <div className="px-5 pt-5 pb-2">
          <div className="text-[10px] font-mono text-white/20 mb-1.5 tracking-wider">FIFA World Cup 2026 Final</div>
          <div className="flex items-end justify-between gap-2">
            <div>
              <div className="font-display text-[34px] font-bold text-white tracking-tight leading-none">${latest.tm.toLocaleString()}</div>
              <div className="flex items-center gap-1.5 mt-2">
                <div className="flex items-center gap-1 rounded-full px-2 py-0.5"
                  style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
                  <svg width="7" height="7" viewBox="0 0 8 8" fill="none">
                    <path d="M4 7V1M1.5 3.5L4 1L6.5 3.5" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-[9px] font-mono text-ghost-green font-semibold">Best price</span>
                </div>
                <span className="text-[9px] font-mono text-white/20">Ticketmaster</span>
              </div>
            </div>
            <div className="text-right pb-0.5">
              <div className="text-[9px] font-mono text-white/18 mb-1">Arb spread</div>
              <div className="font-display text-[22px] font-bold text-ghost-amber leading-none">−{spreadPct}%</div>
              <div className="text-[9px] font-mono text-white/18 mt-1">${maxSpread.toLocaleString()} gap</div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div style={{ height: 148 }} className="px-1 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={PRICE_HISTORY} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
              <defs>
                {PLATFORMS.map(p => (
                  <linearGradient key={p.key} id={`grad2-${p.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={p.color} stopOpacity={p.key === 'tm' ? 0.22 : 0.07} />
                    <stop offset="100%" stopColor={p.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.022)" />
              <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.12)", fontSize: 8, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.12)", fontSize: 8, fontFamily: "monospace" }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} domain={['auto', 'auto']} width={42} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.05)", strokeWidth: 1, strokeDasharray: "3 3" }} />
              {PLATFORMS.map((p) => activePlatforms.has(p.key) && (
                <Area key={p.key} type="monotone" dataKey={p.key} stroke={p.color}
                  strokeWidth={p.key === "tm" ? 2.5 : 1.5} fill={`url(#grad2-${p.key})`} dot={false}
                  activeDot={p.key === "tm" ? { r: 4, fill: p.color, strokeWidth: 0 } : false} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Platform toggles */}
        <div className="flex items-center gap-1.5 px-4 pt-3 pb-3.5 flex-wrap">
          {PLATFORMS.map((p) => {
            const isActive = activePlatforms.has(p.key);
            return (
              <button key={p.key} onClick={() => togglePlatform(p.key)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all duration-200 text-[9px] font-mono"
                style={{
                  background: isActive ? `${p.color}12` : "rgba(255,255,255,0.025)",
                  border: `1px solid ${isActive ? `${p.color}30` : "rgba(255,255,255,0.05)"}`,
                  color: isActive ? p.color : "rgba(255,255,255,0.2)",
                }}
              >
                <div className="w-1 h-1 rounded-full" style={{ background: isActive ? p.color : "rgba(255,255,255,0.12)" }} />
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 mx-4 mb-5 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.05)" }}>
          {[
            { label: "Best Price", value: `$${latest.tm.toLocaleString()}`, sub: "Ticketmaster", accent: "text-white" },
            { label: "7-Day Drop", value: `−${tmDrop}%`, sub: "cheapest market", accent: "text-ghost-green" },
            { label: "Arb Spread", value: `$${maxSpread.toLocaleString()}`, sub: "TM vs Vivid", accent: "text-ghost-amber" },
          ].map((s, i) => (
            <div key={i} className="px-4 py-3.5" style={{
              background: i === 1 ? "rgba(34,197,94,0.04)" : "rgba(255,255,255,0.015)",
              borderRight: i < 2 ? "1px solid rgba(255,255,255,0.04)" : "none"
            }}>
              <div className="text-[8px] text-white/18 font-mono uppercase tracking-widest mb-1.5">{s.label}</div>
              <div className={`font-display text-[13px] font-bold ${s.accent}`}>{s.value}</div>
              <div className="text-[8px] text-white/15 font-mono mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}