import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Calendar, Tag, ExternalLink, Bookmark, BookmarkCheck, Bell } from "lucide-react";
import { format } from "date-fns";

function ScoreRing({ score, size = 72 }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 85 ? "#22c55e" : score >= 65 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={5} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset} className="score-ring" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold font-mono" style={{ color }}>{score}</span>
        <span className="text-[9px] text-white/30 font-mono">/100</span>
      </div>
    </div>
  );
}

export default function OpportunityDetailModal({ opportunity, isSaved, onSave, onSetAlert, onClose, user }) {
  if (!opportunity) return null;
  const {
    match, stadium, city, match_date, category, current_price, market_value,
    discount_pct, opportunity_score, quantity_available, demand_tier, round, source_url
  } = opportunity;

  const disc = discount_pct ?? (market_value > 0 ? Math.round((1 - current_price / market_value) * 100) : 0);
  const savings = market_value - current_price;
  const date = match_date ? format(new Date(match_date), "EEEE, MMMM d, yyyy") : "TBD";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={e => e.stopPropagation()}
          className="relative w-full max-w-lg glass-card rounded-xl border border-white/10 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/6">
            <div className="flex items-center gap-2">
              {disc >= 30 && <div className="w-1.5 h-1.5 rounded-full bg-ghost-green pulse-dot" />}
              <span className="text-xs font-mono text-white/35 uppercase tracking-widest">Opportunity Detail</span>
            </div>
            <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/8 transition-colors">
              <X className="w-4 h-4 text-white/40" />
            </button>
          </div>

          <div className="p-6">
            {/* Match info + score */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <div className="font-display text-xl font-bold text-white mb-2">{match}</div>
                <div className="flex items-center gap-1.5 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-white/25" />
                  <span className="text-sm text-white/40 font-mono">{stadium}, {city}</span>
                </div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-white/25" />
                  <span className="text-sm text-white/30 font-mono">{date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-white/25" />
                  <span className="text-sm text-white/30 font-mono">{category} · {round}</span>
                </div>
              </div>
              <ScoreRing score={opportunity_score ?? 0} />
            </div>

            {/* Price breakdown */}
            <div className="grid grid-cols-2 gap-px bg-white/5 rounded-lg overflow-hidden mb-4">
              <div className="bg-[#111] p-4">
                <div className="text-[10px] text-white/25 font-mono mb-2 uppercase tracking-widest">Listed Price</div>
                <div className="font-display text-2xl font-bold text-white">${current_price?.toLocaleString()}</div>
              </div>
              <div className="bg-[#111] p-4">
                <div className="text-[10px] text-white/25 font-mono mb-2 uppercase tracking-widest">Market Value</div>
                <div className="font-display text-2xl font-bold text-white/40">${market_value?.toLocaleString()}</div>
              </div>
              <div className="bg-[#111] p-4">
                <div className="text-[10px] text-white/25 font-mono mb-2 uppercase tracking-widest">Your Edge</div>
                <div className={`font-display text-2xl font-bold ${disc >= 30 ? "text-ghost-green" : disc >= 15 ? "text-ghost-amber" : "text-white/60"}`}>
                  −{disc}% below market
                </div>
              </div>
              <div className="bg-[#111] p-4">
                <div className="text-[10px] text-white/25 font-mono mb-2 uppercase tracking-widest">Potential Savings</div>
                <div className="font-display text-2xl font-bold text-white">${savings?.toLocaleString()}</div>
              </div>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-4 mb-6 text-[10px] font-mono text-white/25">
              {demand_tier && <span>{demand_tier} Demand</span>}
              {quantity_available && <span>{quantity_available} tickets available</span>}
            </div>

            {/* Actions */}
            {!user ? (
              <div className="glass rounded-lg p-4 text-center">
                <p className="text-sm text-white/50 mb-3">Sign in to save opportunities & set alerts</p>
                <a href="/login" className="inline-flex items-center h-9 px-5 bg-white text-black text-xs font-semibold rounded hover:bg-white/90 transition-all">
                  Create Free Account
                </a>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => onSave(opportunity)}
                  className={`flex-1 h-10 flex items-center justify-center gap-2 rounded text-sm font-medium transition-all ${
                    isSaved ? "bg-white/10 text-white border border-white/15" : "glass border border-white/10 text-white/70 hover:text-white hover:border-white/20"
                  }`}
                >
                  {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  {isSaved ? "Saved" : "Save"}
                </button>
                <button
                  onClick={() => onSetAlert(opportunity)}
                  className="flex-1 h-10 flex items-center justify-center gap-2 rounded text-sm font-medium glass border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition-all"
                >
                  <Bell className="w-4 h-4" />
                  Set Alert
                </button>
                {source_url && (
                  <a
                    href={source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-10 w-10 flex items-center justify-center rounded glass border border-white/10 text-white/40 hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}