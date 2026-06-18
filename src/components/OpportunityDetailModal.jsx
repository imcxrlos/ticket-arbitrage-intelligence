import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Calendar, Tag, ExternalLink, Bookmark, BookmarkCheck, Bell, TrendingDown, ArrowUpRight, GitCompareArrows, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

function ScoreRing({ score, size = 64 }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";
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

function PlatformTable({ summaries }) {
  if (!summaries || summaries.length === 0) return null;

  const withPrice = summaries.filter(s => s.min_price && s.min_price > 0);
  if (withPrice.length === 0) return null;

  const sorted = [...withPrice].sort((a, b) => a.min_price - b.min_price);
  const lowestPrice = sorted[0].min_price;

  return (
    <div className="mx-7 mt-5">
      <div className="text-[9px] font-mono text-white/20 uppercase tracking-widest mb-3">Live Market Data</div>
      <div className="rounded-xl overflow-hidden border border-white/6">
        {/* Header */}
        <div className="grid grid-cols-4 px-4 py-2 bg-white/3 border-b border-white/5">
          <span className="text-[9px] font-mono text-white/25 uppercase tracking-widest">Platform</span>
          <span className="text-[9px] font-mono text-white/25 uppercase tracking-widest text-right">Cheapest</span>
          <span className="text-[9px] font-mono text-white/25 uppercase tracking-widest text-right">Avg</span>
          <span className="text-[9px] font-mono text-white/25 uppercase tracking-widest text-right">Listings</span>
        </div>
        {sorted.map((p, i) => {
          const isBest = i === 0;
          const isWorst = i === sorted.length - 1 && sorted.length > 1;
          const premium = lowestPrice > 0 ? Math.round(((p.min_price - lowestPrice) / lowestPrice) * 100) : 0;
          return (
            <div key={p.platform} className={`grid grid-cols-4 px-4 py-2.5 border-b border-white/[0.04] last:border-0 items-center ${isBest ? "bg-ghost-green/5" : "bg-transparent"}`}>
              <div className="flex items-center gap-2">
                {isBest && <div className="w-1 h-1 rounded-full bg-ghost-green" />}
                {isWorst && sorted.length > 1 && <div className="w-1 h-1 rounded-full bg-ghost-red" />}
                {!isBest && !isWorst && <div className="w-1 h-1" />}
                <span className="text-xs font-mono text-white/60 capitalize">{p.platform}</span>
                {p.url && (
                  <a href={p.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                    className="text-white/20 hover:text-white/60 transition-colors">
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
              <div className="text-right">
                <span className={`text-xs font-mono font-semibold ${isBest ? "text-ghost-green" : isWorst && sorted.length > 1 ? "text-ghost-red/70" : "text-white/60"}`}>
                  ${Math.round(p.min_price).toLocaleString()}
                </span>
                {premium > 0 && (
                  <span className="text-[9px] text-white/25 font-mono ml-1">+{premium}%</span>
                )}
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-white/35">
                  {p.avg_price ? `$${Math.round(p.avg_price).toLocaleString()}` : "—"}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-white/30">{p.listing_count ?? "—"}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function OpportunityDetailModal({ opportunity, isSaved, onSave, onSetAlert, onClose, user }) {
  const summaries = useMemo(() => {
    if (!opportunity?.market_summaries) return [];
    try { return JSON.parse(opportunity.market_summaries); } catch { return []; }
  }, [opportunity?.market_summaries]);

  if (!opportunity) return null;

  const {
    match, stadium, city, match_date, category,
    current_price, market_value, highest_price,
    discount_pct, vs_highest_pct,
    opportunity_score, quantity_available, demand_tier, round, source_url,
    signal_type, platforms_compared, best_platform, worst_platform
  } = opportunity;

  const isArbitrage = signal_type === "Arbitrage";
  const disc = discount_pct ?? 0;
  const vsHighest = vs_highest_pct ?? 0;
  const spread = highest_price && current_price ? highest_price - current_price : 0;
  const date = match_date ? format(new Date(match_date), "MMM d, yyyy") : "TBD";
  const edgeColor = isArbitrage
    ? (vsHighest >= 25 ? "#22c55e" : vsHighest >= 12 ? "#f59e0b" : "#6b7280")
    : (disc >= 20 ? "#f59e0b" : "#6b7280");

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
          className="relative w-full max-w-2xl bg-[#111] border border-white/8 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Header */}
          <div className="flex items-start justify-between px-7 pt-6 pb-0">
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">{round}</span>
                <span className={`flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded-full border ${
                  isArbitrage
                    ? "text-ghost-green bg-ghost-green/10 border-ghost-green/20"
                    : "text-white/30 bg-white/5 border-white/10"
                }`}>
                  {isArbitrage
                    ? <><GitCompareArrows className="w-2.5 h-2.5" /> Arbitrage · {platforms_compared} platforms</>
                    : <><AlertTriangle className="w-2.5 h-2.5" /> Price Analysis · {platforms_compared} platform</>
                  }
                </span>
              </div>
              <h2 className="font-display text-2xl font-bold text-white leading-tight mb-1">{match}</h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-white/35 font-mono">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{stadium}, {city}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{date}</span>
                {category && <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{category}</span>}
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <ScoreRing score={opportunity_score ?? 0} />
              <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/8 transition-colors">
                <X className="w-4 h-4 text-white/35" />
              </button>
            </div>
          </div>

          {/* Key metrics row */}
          <div className="grid grid-cols-3 gap-px mx-7 mt-6 bg-white/5 rounded-xl overflow-hidden">
            <div className="bg-[#0e0e0e] px-4 py-3">
              <div className="text-[9px] text-white/25 font-mono uppercase tracking-widest mb-1.5">
                Best Price
              </div>
              <div className="font-display text-xl font-bold text-white">${current_price?.toLocaleString()}</div>
              {best_platform && <div className="text-[9px] text-white/30 font-mono mt-0.5 capitalize">{best_platform}</div>}
            </div>
            <div className="bg-[#0e0e0e] px-4 py-3">
              <div className="text-[9px] text-white/25 font-mono uppercase tracking-widest mb-1.5">Market Avg</div>
              <div className="font-display text-xl font-bold text-white/40">${market_value?.toLocaleString()}</div>
              {platforms_compared > 0 && <div className="text-[9px] text-white/20 font-mono mt-0.5">{platforms_compared} platforms</div>}
            </div>
            <div className="bg-[#0e0e0e] px-4 py-3">
              <div className="text-[9px] text-white/25 font-mono uppercase tracking-widest mb-1.5">
                {isArbitrage ? "Market Spread" : "vs Avg"}
              </div>
              <div className="font-display text-xl font-bold" style={{ color: edgeColor }}>
                {isArbitrage
                  ? `−${vsHighest}% · $${spread?.toLocaleString()}`
                  : `−${disc}%`
                }
              </div>
              {isArbitrage && worst_platform && (
                <div className="text-[9px] text-white/20 font-mono mt-0.5 capitalize">vs {worst_platform}</div>
              )}
            </div>
          </div>

          {/* Platform comparison table */}
          <PlatformTable summaries={summaries} />

          {/* No cross-market data notice */}
          {!isArbitrage && (
            <div className="mx-7 mt-4 px-4 py-3 bg-white/3 border border-white/6 rounded-xl">
              <p className="text-xs text-white/30 font-mono">
                <span className="text-white/50">Price Analysis only</span> — only 1 marketplace had live data for this event. 
                True arbitrage requires pricing from 2+ platforms for the same match.
              </p>
            </div>
          )}

          {/* Meta chips */}
          <div className="flex items-center gap-2 mx-7 mt-4 flex-wrap">
            {demand_tier && (
              <span className="text-[9px] font-mono text-white/30 bg-white/5 border border-white/8 rounded-full px-2.5 py-1">
                {demand_tier} Demand
              </span>
            )}
            {quantity_available > 0 && (
              <span className="text-[9px] font-mono text-white/30 bg-white/5 border border-white/8 rounded-full px-2.5 py-1">
                ~{quantity_available} total listings
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
                  {source_url ? `Get Tickets on ${best_platform || "Best Platform"}` : "Search Tickets"}
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