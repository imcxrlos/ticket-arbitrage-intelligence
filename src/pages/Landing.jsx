import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Shield, TrendingUp, Clock, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

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
  { label: "Opportunities Found", value: "2,841" },
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
  const [liveCount, setLiveCount] = useState(2841);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCount(prev => prev + Math.floor(Math.random() * 3));
    }, 3000);
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
                  Ghost scans the secondary ticket market and surfaces opportunities where tickets are priced below fair market value — before the market corrects.
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
                <Link
                  to="/scanner"
                  className="group inline-flex items-center justify-center gap-2 h-12 px-7 glass text-white font-medium rounded hover:bg-white/5 transition-all text-sm border border-white/10"
                >
                  Find Opportunities
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform opacity-50" />
                </Link>
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

      {/* How it works */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <p className="text-xs text-white/30 font-mono tracking-widest uppercase mb-3">How Ghost Works</p>
            <h2 className="font-display text-4xl font-bold text-white">Three steps to an edge.</h2>
          </div>
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
          <div className="mb-16">
            <p className="text-xs text-white/30 font-mono tracking-widest uppercase mb-3">Intelligence Stack</p>
            <h2 className="font-display text-4xl font-bold text-white">Built for asymmetric advantage.</h2>
          </div>
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

      {/* No affiliates */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid lg:grid-cols-2 gap-16 items-center"
          >
            <div>
              <p className="text-xs text-white/30 font-mono tracking-widest uppercase mb-3">No Agenda</p>
              <h2 className="font-display text-4xl font-bold text-white leading-tight mb-5">
                No affiliates.<br />No commissions.<br />No conflict.
              </h2>
              <p className="text-white/40 leading-relaxed text-sm max-w-md">
                Ghost doesn't earn a cut from any ticket platform. We don't have referral deals, sponsored listings, or financial incentives to push you toward any particular marketplace.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-0.5">
              {[
                { label: "Pure signal", desc: "Every opportunity is ranked on price data alone — not who's paying us." },
                { label: "For the game", desc: "Built by fans who believe great seats shouldn't require a broker relationship." },
                { label: "You choose where to buy", desc: "We surface the edge. The transaction is entirely yours." },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card px-6 py-5 flex items-start gap-4 group hover:border-white/10 transition-all"
                >
                  <div className="w-1 h-1 rounded-full bg-white/20 mt-2 shrink-0 group-hover:bg-white/50 transition-colors" />
                  <div>
                    <div className="font-display text-sm font-semibold text-white mb-1">{item.label}</div>
                    <div className="text-xs text-white/35 leading-relaxed">{item.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
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
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
            <span className="text-sm font-display font-semibold text-white/40">Ghost</span>
          </div>
          <p className="text-xs text-white/20 font-mono">FIFA World Cup 2026 Arbitrage Intelligence</p>
        </div>
      </footer>
    </div>
  );
}

const PRICE_HISTORY = [
  { day: "Jun 12", tm: 2180, sg: 2340 },
  { day: "Jun 13", tm: 2150, sg: 2290 },
  { day: "Jun 14", tm: 2210, sg: 2380 },
  { day: "Jun 15", tm: 2080, sg: 2260 },
  { day: "Jun 16", tm: 1940, sg: 2190 },
  { day: "Jun 17", tm: 1870, sg: 2140 },
  { day: "Jun 18", tm: 1760, sg: 2090 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card border border-white/10 rounded-lg px-3 py-2.5 shadow-2xl">
      <p className="text-[10px] font-mono text-white/30 mb-1.5 uppercase tracking-widest">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-xs font-mono">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-white/50 capitalize">{p.dataKey === "tm" ? "Ticketmaster" : "SeatGeek"}</span>
          <span className="text-white font-semibold ml-1">${p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

function PreviewCard() {
  const latest = PRICE_HISTORY[PRICE_HISTORY.length - 1];
  const prev = PRICE_HISTORY[0];
  const tmDrop = Math.round(((prev.tm - latest.tm) / prev.tm) * 100);
  const spread = latest.sg - latest.tm;

  return (
    <div className="relative">
      <div className="glass-card rounded-xl overflow-hidden border border-white/8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-ghost-green pulse-dot" />
            <span className="text-[10px] text-white/40 font-mono uppercase tracking-widest">Price Intelligence</span>
          </div>
          <span className="text-[10px] font-mono text-white/20">Last 7 days</span>
        </div>

        {/* Match info */}
        <div className="px-5 pt-4 pb-2">
          <div className="font-display text-base font-semibold text-white leading-tight">FIFA World Cup 2026 Final</div>
          <div className="text-[11px] text-white/30 font-mono mt-0.5">MetLife Stadium · New York, NY · Jul 19, 2026</div>
        </div>

        {/* Chart */}
        <div className="px-2 pt-2 pb-1" style={{ height: 160 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={PRICE_HISTORY} margin={{ top: 4, right: 12, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="day"
                tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 9, fontFamily: "monospace" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 9, fontFamily: "monospace" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.06)", strokeWidth: 1 }} />
              <Line
                type="monotone"
                dataKey="sg"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth={1.5}
                dot={false}
                strokeDasharray="4 3"
              />
              <Line
                type="monotone"
                dataKey="tm"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3, fill: "#22c55e", strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend + metrics */}
        <div className="px-5 pb-2 flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-px bg-ghost-green" />
            <span className="text-[10px] font-mono text-white/30">Ticketmaster</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-px bg-white/25" style={{ borderTop: "1px dashed rgba(255,255,255,0.25)" }} />
            <span className="text-[10px] font-mono text-white/30">SeatGeek</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-px mx-5 mb-5 mt-2 bg-white/5 rounded-lg overflow-hidden">
          <div className="bg-[#111]/80 px-3 py-3">
            <div className="text-[9px] text-white/25 font-mono uppercase tracking-widest mb-1">Best Price</div>
            <div className="font-display text-base font-bold text-white">${latest.tm.toLocaleString()}</div>
            <div className="text-[9px] text-white/20 font-mono mt-0.5">Ticketmaster</div>
          </div>
          <div className="bg-[#111]/80 px-3 py-3">
            <div className="text-[9px] text-white/25 font-mono uppercase tracking-widest mb-1">7-Day Drop</div>
            <div className="font-display text-base font-bold text-ghost-green">−{tmDrop}%</div>
            <div className="text-[9px] text-white/20 font-mono mt-0.5">on cheapest market</div>
          </div>
          <div className="bg-[#111]/80 px-3 py-3">
            <div className="text-[9px] text-white/25 font-mono uppercase tracking-widest mb-1">Spread</div>
            <div className="font-display text-base font-bold text-ghost-amber">${spread.toLocaleString()}</div>
            <div className="text-[9px] text-white/20 font-mono mt-0.5">TM vs SeatGeek</div>
          </div>
        </div>
      </div>
      {/* Ghost cards behind */}
      <div className="absolute -bottom-3 -right-3 -z-10 w-full h-full glass-card rounded-xl border border-white/4 opacity-50" />
      <div className="absolute -bottom-6 -right-6 -z-20 w-full h-full glass-card rounded-xl border border-white/2 opacity-25" />
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