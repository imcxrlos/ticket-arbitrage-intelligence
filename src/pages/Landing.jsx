import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Shield, TrendingUp, Clock, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

const HERO_STATS = [
  { label: "Opportunities Found", value: "142+" },
  { label: "Avg. Discount", value: "31%" },
  { label: "Markets Scanned", value: "12" },
];

const FEATURES = [
  {
    icon: Zap,
    title: "Real-time Scanning",
    desc: "Continuous market surveillance across 12+ ticket platforms, updated every 60 seconds.",
  },
  {
    icon: TrendingUp,
    title: "Opportunity Scoring",
    desc: "Proprietary 0–100 score weighing price delta, demand tier, and historical trend.",
  },
  {
    icon: Shield,
    title: "Instant Alerts",
    desc: "Multi-channel notifications the moment a high-score opportunity enters your criteria.",
  },
  {
    icon: Clock,
    title: "Edge Window",
    desc: "Mispriced tickets rarely last more than minutes. Ghost gets you there first.",
  },
];

const HOW_STEPS = [
  { num: "01", title: "Scan", desc: "Ghost monitors live ticket listings across all major secondary markets simultaneously." },
  { num: "02", title: "Score", desc: "Each listing is scored against estimated fair market value, demand data, and match tier." },
  { num: "03", title: "Alert", desc: "When an opportunity meets your criteria, you're notified before the market corrects." },
];

export default function Landing() {
  const [scanActive, setScanActive] = useState(false);
  const [liveCount, setLiveCount] = useState(142);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCount(prev => {
        if (prev >= 160) return prev;
        return prev + 1;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white pulse-dot" />
            <span className="font-display font-semibold tracking-tight text-white">Ghost</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/scanner" className="text-sm text-white/50 hover:text-white transition-colors">Scanner</Link>
            <Link to="/watchlist" className="text-sm text-white/50 hover:text-white transition-colors">Watchlist</Link>
            <Link to="/alerts" className="text-sm text-white/50 hover:text-white transition-colors">Alerts</Link>
            <Link
              to="/scanner"
              className="h-8 px-4 bg-white text-black text-sm font-medium rounded hover:bg-white/90 transition-all flex items-center gap-1.5"
            >
              Scan Now
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Live ticker */}
      <div className="fixed top-14 left-0 right-0 z-40 border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-md overflow-hidden h-8 flex items-center">
        <div className="flex items-center gap-3 px-4 shrink-0 border-r border-white/10 h-full">
          <div className="w-1.5 h-1.5 rounded-full bg-ghost-green pulse-dot" />
          <span className="text-xs text-white/40 font-mono uppercase tracking-widest">Live</span>
        </div>
        <div className="overflow-hidden flex-1">
          <div className="ticker-track">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <div key={i} className="flex items-center gap-4 px-6 shrink-0">
                <span className="text-xs text-white/60 font-mono">{item.match}</span>
                <span className="text-xs text-ghost-green font-mono">{item.discount} below market</span>
                <span className="text-xs text-white/20">·</span>
                <span className="text-xs text-white/40 font-mono">Score {item.score}</span>
                <span className="text-white/10 mx-2">|</span>
              </div>
            ))}
          </div>
        </div>
      </div>



      {/* Hero */}
      <section className="min-h-screen flex flex-col justify-center pt-28 pb-20 px-6">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 glass px-3 py-1.5 rounded-full mb-8">
                  <div className="w-1.5 h-1.5 rounded-full bg-ghost-green pulse-dot" />
                  <span className="text-xs text-white/60 font-mono tracking-wider">FIFA WORLD CUP 2026 — ACTIVE</span>
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="font-display text-[clamp(4rem,10vw,8rem)] font-bold leading-none tracking-tight text-white mb-6"
              >
                Ghost
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <p className="text-lg text-white/50 font-mono mb-2 tracking-wide">
                  FIFA World Cup 2026 Ticket Arbitrage Bot
                </p>
                <p className="text-white/30 text-sm max-w-md leading-relaxed">
                  Ghost scans the secondary ticket market in real time and surfaces opportunities where tickets are priced below fair market value — before the market corrects.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="flex flex-col sm:flex-row gap-3 mt-10"
              >
                <Link
                  to="/scanner"
                  className="group inline-flex items-center justify-center gap-2 h-12 px-7 bg-white text-black font-semibold rounded hover:bg-white/90 transition-all text-sm"
                >
                  Scan the Market
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <a
                  href="https://pump.fun"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative inline-flex items-center justify-center gap-2 h-12 px-7 text-white font-medium rounded transition-all text-sm overflow-hidden"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(34,197,94,0.35)",
                    boxShadow: "0 0 18px rgba(34,197,94,0.15), inset 0 0 18px rgba(34,197,94,0.04)"
                  }}
                >
                  <span className="absolute inset-0 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ boxShadow: "0 0 28px rgba(34,197,94,0.25), inset 0 0 24px rgba(34,197,94,0.07)" }} />
                  <span className="relative flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: "#22c55e" }} />
                    pump.fun
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform opacity-50" />
                  </span>
                </a>
              </motion.div>

              {/* Stats row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="flex gap-8 mt-12 pt-8 border-t border-white/6"
              >
                {HERO_STATS.map((s, i) => (
                  <div key={i}>
                    <div className="font-display text-2xl font-bold text-white">{i === 0 ? liveCount.toLocaleString() : s.value}</div>
                    <div className="text-xs text-white/35 mt-1 tracking-wide">{s.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right — preview card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden lg:block"
            >
              <PreviewCard />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Independence statement */}
      <section className="py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-6 rounded-xl"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div>
              <div className="text-[9px] font-mono text-white/25 uppercase tracking-widest mb-2">Independent Tool</div>
              <p className="text-white/70 text-sm font-mono leading-relaxed max-w-xl">
                Ghost is a fully independent arbitrage scanner. We use <span className="text-white">no affiliate links</span>, earn <span className="text-white">zero commission</span> from any ticket platform, and have <span className="text-white">no referral deals</span>. Every ranking is based purely on price data.
              </p>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              {["No affiliate links", "No referral commissions", "No sponsored results"].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-ghost-green" />
                  <span className="text-[11px] font-mono text-white/40">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="mb-16"
          >
            <p className="text-xs text-white/30 font-mono tracking-widest uppercase mb-3">How Ghost Works</p>
            <h2 className="font-display text-4xl font-bold text-white">Three steps to an edge.</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-0.5">
            {HOW_STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="glass-card p-8 group hover:border-white/12 transition-all"
              >
                <div className="font-mono text-5xl font-bold text-white/8 mb-6 group-hover:text-white/15 transition-colors">{step.num}</div>
                <div className="font-display text-xl font-semibold text-white mb-3">{step.title}</div>
                <div className="text-sm text-white/40 leading-relaxed">{step.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="mb-16"
          >
            <p className="text-xs text-white/30 font-mono tracking-widest uppercase mb-3">Intelligence Stack</p>
            <h2 className="font-display text-4xl font-bold text-white">Built for asymmetric advantage.</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-0.5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 group hover:border-white/12 transition-all"
              >
                <div className="w-8 h-8 rounded glass flex items-center justify-center mb-5 group-hover:bg-white/8 transition-all">
                  <f.icon className="w-4 h-4 text-white/70" />
                </div>
                <div className="font-display text-base font-semibold text-white mb-2">{f.title}</div>
                <div className="text-sm text-white/40 leading-relaxed">{f.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="mb-16"
          >
            <p className="text-xs text-white/30 font-mono tracking-widest uppercase mb-3">Roadmap</p>
            <h2 className="font-display text-4xl font-bold text-white">Where Ghost is going.</h2>
          </motion.div>

          <div className="relative">
            {/* Connector line */}
            <div className="absolute left-[18px] top-0 bottom-0 w-px bg-gradient-to-b from-white/10 via-white/5 to-transparent hidden md:block" />

            <div className="space-y-0">
              {[
                {
                  phase: "Phase 1",
                  status: "live",
                  label: "Open Beta",
                  title: "Free for everyone. Always.",
                  desc: "Ghost launches in open beta — no paywalls, no waitlists. Every feature is free. We want the community to use it, break it, and tell us what to fix.",
                  tag: "Now",
                },
                {
                  phase: "Phase 2",
                  status: "upcoming",
                  label: "Algorithm Refinement",
                  title: "Smarter signals, more markets.",
                  desc: "We expand platform coverage, improve arbitrage scoring accuracy, and add demand-tier forecasting. The scanner becomes genuinely predictive, not just reactive.",
                  tag: "Q3 2026",
                },
                {
                  phase: "Phase 3",
                  status: "upcoming",
                  label: "Coin Launch",
                  title: "Community funds the mission.",
                  desc: "A token launch via pump.fun to fund infrastructure, data partnerships, and a full-time dev team. Token holders get early access to new features and governance input.",
                  tag: "Q4 2026",
                  highlight: true,
                },
                {
                  phase: "Phase 4",
                  status: "future",
                  label: "Pro Intelligence Layer",
                  title: "Institutional-grade tooling. Still free.",
                  desc: "AI-driven opportunity forecasting, automated alert triggers, portfolio tracking, and multi-event arbitrage routing — all funded by the community, free at the core.",
                  tag: "2027",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
                  className="relative flex gap-8 md:gap-12 pb-10 last:pb-0 group"
                >
                  {/* Node */}
                  <div className="relative shrink-0 flex flex-col items-center" style={{ width: 36 }}>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center border z-10 transition-all ${
                      item.status === "live"
                        ? "bg-ghost-green/10 border-ghost-green/40 group-hover:bg-ghost-green/20"
                        : item.highlight
                        ? "bg-white/[0.04] border-white/20 group-hover:border-white/30"
                        : "bg-white/[0.03] border-white/8 group-hover:border-white/14"
                    }`}>
                      {item.status === "live" ? (
                        <div className="w-2 h-2 rounded-full bg-ghost-green pulse-dot" />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className={`flex-1 rounded-xl p-5 mb-2 transition-all ${
                    item.highlight
                      ? "border border-white/12 group-hover:border-white/20"
                      : "border border-white/[0.05] group-hover:border-white/10"
                  }`}
                    style={{
                      background: item.highlight
                        ? "rgba(255,255,255,0.04)"
                        : item.status === "live"
                        ? "rgba(34,197,94,0.03)"
                        : "rgba(255,255,255,0.02)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] font-mono text-white/25 uppercase tracking-widest">{item.phase}</span>
                        <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          item.status === "live"
                            ? "bg-ghost-green/10 text-ghost-green border border-ghost-green/20"
                            : item.highlight
                            ? "bg-white/6 text-white/50 border border-white/12"
                            : "bg-white/[0.03] text-white/20 border border-white/6"
                        }`}>
                          {item.label}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-white/20 shrink-0">{item.tag}</span>
                    </div>
                    <div className="font-display text-base font-semibold text-white mb-2">{item.title}</div>
                    <div className="text-sm text-white/40 leading-relaxed">{item.desc}</div>
                    {item.highlight && (
                      <a
                        href="https://pump.fun"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 mt-4 text-[11px] font-mono text-white/40 hover:text-white/70 transition-colors"
                      >
                        <span className="w-1 h-1 rounded-full bg-ghost-green pulse-dot" />
                        pump.fun
                        <ChevronRight className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xs text-white/30 font-mono tracking-widest uppercase mb-6">Ready?</p>
            <h2 className="font-display text-5xl font-bold text-white mb-6 leading-tight">
              Find World Cup tickets<br />before the market catches up.
            </h2>
            <p className="text-white/35 mb-10 leading-relaxed">
              No account required to scan. Start finding opportunities in seconds.
            </p>
            <Link
              to="/scanner"
              className="group inline-flex items-center gap-2 h-14 px-10 bg-white text-black font-semibold rounded hover:bg-white/90 transition-all text-base"
            >
              Launch Scanner
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="border-t border-white/5 py-8 px-6"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
            <span className="text-sm font-display font-semibold text-white/40">Ghost</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="text-xs text-white/20 hover:text-white/50 font-mono transition-colors">Terms</Link>
            <Link to="/privacy" className="text-xs text-white/20 hover:text-white/50 font-mono transition-colors">Privacy</Link>
            <span className="text-xs text-white/20 font-mono">FIFA World Cup 2026 Arbitrage Intelligence</span>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}

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
  { key: "vvd",  label: "Vivid Seats",  color: "rgba(255,255,255,0.35)" },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const sorted = [...payload].sort((a, b) => a.value - b.value);
  return (
    <div style={{ background: "rgba(8,8,8,0.97)", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 24px 48px rgba(0,0,0,0.6)" }}
      className="rounded-xl px-3.5 py-3 backdrop-blur-2xl min-w-[140px]">
      <p className="text-[9px] font-mono text-white/20 mb-2.5 uppercase tracking-widest">{label}</p>
      {sorted.map((p) => {
        const platform = PLATFORMS.find(pl => pl.key === p.dataKey);
        const isLowest = p.value === sorted[0].value;
        return (
          <div key={p.dataKey} className="flex items-center justify-between gap-5 mb-1.5 last:mb-0">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: platform?.color }} />
              <span className="text-[10px] font-mono text-white/35">{platform?.label}</span>
            </div>
            <span className={`text-[11px] font-mono font-bold ${isLowest ? "text-ghost-green" : "text-white/60"}`}>${p.value.toLocaleString()}</span>
          </div>
        );
      })}
      <div className="mt-2.5 pt-2.5 border-t border-white/[0.06]">
        <div className="flex justify-between items-center">
          <span className="text-[9px] font-mono text-white/20">Spread</span>
          <span className="text-[10px] font-mono text-ghost-amber font-semibold">
            ${(sorted[sorted.length-1].value - sorted[0].value).toLocaleString()}
          </span>
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
      {/* Glow behind card */}
      <div className="absolute inset-0 -z-10 blur-3xl opacity-20 rounded-3xl"
        style={{ background: "radial-gradient(ellipse at 60% 40%, #22c55e 0%, transparent 60%)" }} />

      <div className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(11,11,11,0.96)", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 40px 80px rgba(0,0,0,0.7), 0 0 0 0.5px rgba(255,255,255,0.04) inset" }}>

        {/* Top bar */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/[0.04]">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-ghost-green pulse-dot" />
            <span className="text-[9px] text-white/30 font-mono uppercase tracking-[0.15em]">Price Intelligence · Live</span>
          </div>
          <div className="flex items-center gap-1 bg-white/[0.04] rounded-md px-2 py-1">
            <span className="text-[9px] font-mono text-white/20">7D</span>
            <span className="text-[9px] font-mono text-white/10 mx-1">·</span>
            <span className="text-[9px] font-mono text-white/40 font-semibold">4 Markets</span>
          </div>
        </div>

        {/* Match info + big price */}
        <div className="px-5 pt-4 pb-2">
          <div className="text-[10px] font-mono text-white/25 mb-1 tracking-wide">FIFA World Cup 2026 Final</div>
          <div className="flex items-end justify-between gap-2">
            <div>
              <div className="font-display text-3xl font-bold text-white tracking-tight leading-none">
                ${latest.tm.toLocaleString()}
              </div>
              <div className="flex items-center gap-1.5 mt-1.5">
                <div className="flex items-center gap-1 bg-ghost-green/10 border border-ghost-green/20 rounded-full px-2 py-0.5">
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M4 7V1M1.5 3.5L4 1L6.5 3.5" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-[9px] font-mono text-ghost-green font-semibold">Best price</span>
                </div>
                <span className="text-[9px] font-mono text-white/20">Ticketmaster</span>
              </div>
            </div>
            <div className="text-right pb-0.5">
              <div className="text-[9px] font-mono text-white/20 mb-0.5">Arb spread</div>
              <div className="font-display text-xl font-bold text-ghost-amber">−{spreadPct}%</div>
              <div className="text-[9px] font-mono text-white/20">${maxSpread.toLocaleString()} gap</div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div style={{ height: 140 }} className="px-1 pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={PRICE_HISTORY} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
              <defs>
                {PLATFORMS.map(p => (
                  <linearGradient key={p.key} id={`grad-${p.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={p.color} stopOpacity={p.key === 'tm' ? 0.18 : 0.06} />
                    <stop offset="100%" stopColor={p.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.025)" />
              <XAxis
                dataKey="day"
                tick={{ fill: "rgba(255,255,255,0.15)", fontSize: 8, fontFamily: "monospace" }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                tick={{ fill: "rgba(255,255,255,0.15)", fontSize: 8, fontFamily: "monospace" }}
                axisLine={false} tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
                domain={['auto', 'auto']}
                width={42}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.06)", strokeWidth: 1, strokeDasharray: "3 3" }} />
              {PLATFORMS.map((p) => activePlatforms.has(p.key) && (
                <Area
                  key={p.key}
                  type="monotone"
                  dataKey={p.key}
                  stroke={p.color}
                  strokeWidth={p.key === "tm" ? 2 : 1.5}
                  fill={`url(#grad-${p.key})`}
                  dot={false}
                  activeDot={p.key === "tm" ? { r: 3.5, fill: p.color, strokeWidth: 0 } : false}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Platform toggle pills */}
        <div className="flex items-center gap-1.5 px-4 pt-2 pb-3 flex-wrap">
          {PLATFORMS.map((p) => {
            const isActive = activePlatforms.has(p.key);
            return (
              <button
                key={p.key}
                onClick={() => togglePlatform(p.key)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all text-[9px] font-mono"
                style={{
                  background: isActive ? `${p.color}14` : "rgba(255,255,255,0.03)",
                  border: `1px solid ${isActive ? `${p.color}35` : "rgba(255,255,255,0.06)"}`,
                  color: isActive ? p.color : "rgba(255,255,255,0.2)",
                }}
              >
                <div className="w-1 h-1 rounded-full" style={{ background: isActive ? p.color : "rgba(255,255,255,0.15)" }} />
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 mx-4 mb-4 rounded-xl overflow-hidden border border-white/[0.05]">
          {[
            { label: "Best Price", value: `$${latest.tm.toLocaleString()}`, sub: "Ticketmaster", accent: "text-white" },
            { label: "7-Day Drop", value: `−${tmDrop}%`, sub: "cheapest market", accent: "text-ghost-green" },
            { label: "Arb Spread", value: `$${maxSpread.toLocaleString()}`, sub: "TM vs Vivid", accent: "text-ghost-amber" },
          ].map((s, i) => (
            <div key={i} className="px-3.5 py-3" style={{ background: i === 1 ? "rgba(34,197,94,0.04)" : "rgba(255,255,255,0.02)", borderRight: i < 2 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
              <div className="text-[8px] text-white/20 font-mono uppercase tracking-widest mb-1.5">{s.label}</div>
              <div className={`font-display text-sm font-bold ${s.accent}`}>{s.value}</div>
              <div className="text-[8px] text-white/15 font-mono mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScoreRing({ score, size = 48 }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 85 ? "#22c55e" : score >= 65 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={3} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset} className="score-ring" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold font-mono" style={{ color }}>{score}</span>
      </div>
    </div>
  );
}