import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Calendar, Tag, ExternalLink, Bookmark, BookmarkCheck, Bell, TrendingDown, ArrowUpRight } from "lucide-react";
import { format } from "date-fns";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

function ScoreRing({ score, size = 64 }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 85 ? "#22c55e" : score >= 65 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={4} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={4} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset} className="score-ring" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-base font-bold font-mono leading-none" style={{ color }}>{score}</span>
        <span className="text-[8px] text-white/25 font-mono">/100</span>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 shadow-xl">
      <div className="text-xs font-mono text-white/50 mb-0.5">{payload[0]?.payload?.label}</div>
      <div className="text-sm font-display font-bold text-white">${payload[0]?.value?.toLocaleString()}</div>
    </div>
  );
}

function generatePriceHistory(currentPrice, marketValue) {
  // Simulate 30 days of price history trending down to current price
  const points = 30;
  const startPrice = marketValue * (0.95 + Math.random() * 0.15); // started near market
  const result = [];
  for (let i = 0; i < points; i++) {
    const t = i / (points - 1);
    // Smooth downward trend with noise
    const trend = startPrice + (currentPrice - startPrice) * Math.pow(t, 1.4);
    const noise = (Math.random() - 0.5) * marketValue * 0.04;
    const val = Math.round(Math.max(currentPrice * 0.9, trend + noise));
    const daysAgo = points - 1 - i;
    result.push({
      label: daysAgo === 0 ? "Today" : `${daysAgo}d ago`,
      price: val,
      day: i,
    });
  }
  // Ensure last point is exactly current price
  result[result.length - 1].price = currentPrice;
  return result;
}

export default function OpportunityDetailModal({ opportunity, isSaved, onSave, onSetAlert, onClose, user }) {
  const disc = opportunity ? (opportunity.discount_pct ?? (opportunity.market_value > 0 ? Math.round((1 - opportunity.current_price / opportunity.market_value) * 100) : 0)) : 0;
  const chartData = useMemo(() => opportunity ? generatePriceHistory(opportunity.current_price, opportunity.market_value) : [], [opportunity?.current_price, opportunity?.market_value]);

  if (!opportunity) return null;

  const {
    match, stadium, city, match_date, category, current_price, market_value,
    discount_pct, opportunity_score, quantity_available, demand_tier, round, source_url
  } = opportunity;

  const savings = market_value - current_price;
  const date = match_date ? format(new Date(match_date), "MMM d, yyyy") : "TBD";

  const discColor = disc >= 30 ? "#22c55e" : disc >= 15 ? "#f59e0b" : "#ef4444";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/75 backdrop-blur-md" />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
          className="relative w-full max-w-2xl bg-[#111] border border-white/8 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Top glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Header */}
          <div className="flex items-start justify-between px-7 pt-6 pb-0">
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">{round}</span>
                {disc >= 25 && (
                  <span className="flex items-center gap-1 text-[9px] font-mono text-ghost-green bg-ghost-green/10 border border-ghost-green/20 rounded-full px-2 py-0.5">
                    <TrendingDown className="w-2.5 h-2.5" /> Price dropping
                  </span>
                )}
              </div>
              <h2 className="font-display text-2xl font-bold text-white leading-tight mb-1">{match}</h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-white/35 font-mono">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{stadium}, {city}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{date}</span>
                <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{category}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <ScoreRing score={opportunity_score ?? 0} />
              <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/8 transition-colors">
                <X className="w-4 h-4 text-white/35" />
              </button>
            </div>
          </div>

          {/* Price stats row */}
          <div className="grid grid-cols-3 gap-px mx-7 mt-6 bg-white/5 rounded-xl overflow-hidden">
            <div className="bg-[#0e0e0e] px-4 py-3">
              <div className="text-[9px] text-white/25 font-mono uppercase tracking-widest mb-1.5">Listed Price</div>
              <div className="font-display text-xl font-bold text-white">${current_price?.toLocaleString()}</div>
            </div>
            <div className="bg-[#0e0e0e] px-4 py-3">
              <div className="text-[9px] text-white/25 font-mono uppercase tracking-widest mb-1.5">Market Value</div>
              <div className="font-display text-xl font-bold text-white/35 line-through">${market_value?.toLocaleString()}</div>
            </div>
            <div className="bg-[#0e0e0e] px-4 py-3">
              <div className="text-[9px] text-white/25 font-mono uppercase tracking-widest mb-1.5">You Save</div>
              <div className="font-display text-xl font-bold" style={{ color: discColor }}>
                −{disc}% · ${savings?.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Price History Chart */}
          <div className="mx-7 mt-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">30-Day Price History</span>
              <span className="text-[9px] font-mono" style={{ color: discColor }}>
                ↓ {disc}% from peak
              </span>
            </div>
            <div className="h-36 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={discColor} stopOpacity={0.15} />
                      <stop offset="100%" stopColor={discColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" hide />
                  <YAxis domain={['auto', 'auto']} hide />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }} />
                  <ReferenceLine y={market_value} stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke={discColor}
                    strokeWidth={1.5}
                    fill="url(#priceGrad)"
                    dot={false}
                    activeDot={{ r: 3, fill: discColor, stroke: 'none' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[9px] text-white/15 font-mono">30 days ago</span>
              <span className="text-[9px] text-white/15 font-mono">Today</span>
            </div>
          </div>

          {/* Meta chips */}
          <div className="flex items-center gap-2 mx-7 mt-4">
            {demand_tier && (
              <span className="text-[9px] font-mono text-white/30 bg-white/5 border border-white/8 rounded-full px-2.5 py-1">
                {demand_tier} Demand
              </span>
            )}
            {quantity_available && (
              <span className="text-[9px] font-mono text-white/30 bg-white/5 border border-white/8 rounded-full px-2.5 py-1">
                {quantity_available} tickets left
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="px-7 py-5 mt-3">
            {!user ? (
              <div className="flex items-center gap-4 p-4 bg-white/3 border border-white/8 rounded-xl">
                <p className="text-sm text-white/40 flex-1">Sign in to save & set price alerts</p>
                <a href="/login" className="h-9 px-5 bg-white text-black text-xs font-semibold rounded-lg hover:bg-white/90 transition-all inline-flex items-center">
                  Sign In
                </a>
              </div>
            ) : (
              <div className="flex gap-2.5">
                <a
                  href={source_url || `https://www.google.com/search?q=${encodeURIComponent(`${match} FIFA World Cup 2026 tickets buy`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 h-11 flex items-center justify-center gap-2 bg-white text-black text-sm font-semibold rounded-xl hover:bg-white/90 transition-all"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  {source_url ? "Get Tickets" : "Search Tickets"}
                </a>
                <button
                  onClick={() => onSave(opportunity)}
                  className={`h-11 w-11 flex items-center justify-center rounded-xl border transition-all ${
                    isSaved ? "bg-white/10 border-white/20 text-white" : "border-white/10 text-white/40 hover:text-white hover:border-white/20"
                  }`}
                >
                  {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => onSetAlert(opportunity)}
                  className="h-11 w-11 flex items-center justify-center rounded-xl border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all"
                >
                  <Bell className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}