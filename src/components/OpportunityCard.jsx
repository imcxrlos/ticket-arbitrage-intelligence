import { motion } from "framer-motion";
import { MapPin, Calendar, Tag, Bookmark, BookmarkCheck, ExternalLink, ArrowRight } from "lucide-react";
import { format } from "date-fns";

function ScoreRing({ score, size = 52 }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 85 ? "#22c55e" : score >= 65 ? "#f59e0b" : "#ef4444";
  const label = score >= 85 ? "Strong" : score >= 65 ? "Fair" : "Weak";
  return (
    <div className="relative shrink-0 flex flex-col items-center gap-1">
      <div style={{ width: size, height: size, position: "relative" }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={4} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={4} strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={offset} className="score-ring" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold font-mono" style={{ color }}>{score}</span>
        </div>
      </div>
      <span className="text-[10px] font-mono tracking-wider" style={{ color, opacity: 0.8 }}>{label}</span>
    </div>
  );
}

export default function OpportunityCard({ opportunity, index = 0, onSave, isSaved, onViewDetail }) {
  const {
    match, team_home, team_away, stadium, city, match_date,
    category, current_price, market_value, discount_pct,
    opportunity_score, quantity_available, demand_tier, round, source_url
  } = opportunity;

  const disc = discount_pct ?? (market_value > 0 ? Math.round((1 - current_price / market_value) * 100) : 0);
  const score = opportunity_score ?? 0;

  const demandColor = {
    "Ultra High": "text-ghost-green",
    "High": "text-ghost-amber",
    "Medium": "text-white/50",
    "Low": "text-white/30",
  }[demand_tier] || "text-white/30";

  const date = match_date ? format(new Date(match_date), "MMM d, yyyy") : "TBD";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className="glass-card rounded-lg overflow-hidden hover:border-white/12 transition-all duration-300 group cursor-pointer"
      onClick={() => onViewDetail?.(opportunity)}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
        <div className="flex items-center gap-2">
          {disc >= 30 && (
            <div className="w-1.5 h-1.5 rounded-full bg-ghost-green pulse-dot" />
          )}
          <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
            {round || "Match"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {demand_tier && (
            <span className={`text-[10px] font-mono ${demandColor} uppercase tracking-wider`}>
              {demand_tier} Demand
            </span>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onSave?.(opportunity); }}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/5 transition-colors"
          >
            {isSaved
              ? <BookmarkCheck className="w-3.5 h-3.5 text-white/70" />
              : <Bookmark className="w-3.5 h-3.5 text-white/25 group-hover:text-white/50 transition-colors" />
            }
          </button>
        </div>
      </div>

      <div className="p-5">
        {/* Match + Score */}
        <div className="flex items-start justify-between mb-5 gap-4">
          <div className="min-w-0">
            <div className="font-display text-base font-semibold text-white mb-1.5 leading-tight truncate">{match}</div>
            <div className="flex items-center gap-1.5 mb-1">
              <MapPin className="w-3 h-3 text-white/25 shrink-0" />
              <span className="text-xs text-white/35 font-mono truncate">{stadium}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-white/25 shrink-0" />
              <span className="text-xs text-white/25 font-mono">{date} · {city}</span>
            </div>
          </div>
          <ScoreRing score={score} />
        </div>

        {/* Price grid */}
        <div className="grid grid-cols-3 gap-px bg-white/5 rounded-md overflow-hidden mb-4">
          <div className="bg-[#111]/80 p-3">
            <div className="text-[9px] text-white/25 font-mono mb-1.5 uppercase tracking-widest">Current</div>
            <div className="font-display font-bold text-white text-base">${current_price?.toLocaleString()}</div>
          </div>
          <div className="bg-[#111]/80 p-3">
            <div className="text-[9px] text-white/25 font-mono mb-1.5 uppercase tracking-widest">Market</div>
            <div className="font-display font-bold text-white/40 text-base">${market_value?.toLocaleString()}</div>
          </div>
          <div className="bg-[#111]/80 p-3">
            <div className="text-[9px] text-white/25 font-mono mb-1.5 uppercase tracking-widest">Edge</div>
            <div className={`font-display font-bold text-base ${disc >= 30 ? "text-ghost-green" : disc >= 15 ? "text-ghost-amber" : "text-white/60"}`}>
              −{disc}%
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Tag className="w-3 h-3 text-white/20" />
              <span className="text-[10px] text-white/30 font-mono">{category}</span>
            </div>
            {quantity_available !== undefined && (
              <span className="text-[10px] text-white/20 font-mono">{quantity_available} left</span>
            )}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onViewDetail?.(opportunity); }}
            className="flex items-center gap-1 text-[10px] text-white/35 hover:text-white font-mono transition-colors group-hover:text-white/60"
          >
            View Deal <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}