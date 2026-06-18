import { motion } from "framer-motion";
import { MapPin, Bookmark, BookmarkCheck, GitCompareArrows, ChevronRight } from "lucide-react";
import { format } from "date-fns";

function ScoreRing({ score, size = 44 }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={3} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset} className="score-ring" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[11px] font-bold font-mono" style={{ color }}>{score}</span>
      </div>
    </div>
  );
}

export default function OpportunityCard({ opportunity, index = 0, onSave, isSaved, onViewDetail }) {
  const {
    match, stadium, city, match_date,
    current_price, market_value,
    discount_pct, vs_highest_pct, opportunity_score,
    round, signal_type, platforms_compared, best_platform, worst_platform
  } = opportunity;

  const disc = discount_pct ?? 0;
  const vsHighest = vs_highest_pct ?? 0;
  const score = opportunity_score ?? 0;
  const isArbitrage = signal_type === "Arbitrage";
  const date = match_date ? format(new Date(match_date), "MMM d") : "TBD";
  const edgeColor = vsHighest >= 25 ? "#22c55e" : vsHighest >= 12 ? "#f59e0b" : "#6b7280";
  const spreadValue = isArbitrage ? `−${vsHighest}%` : `−${disc}%`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      className="glass-card rounded-lg overflow-hidden hover:border-white/12 transition-all duration-200 group cursor-pointer active:scale-[0.99]"
      onClick={() => onViewDetail?.(opportunity)}
    >
      {/* Top row: round + badge + save */}
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-white/[0.05]">
        <div className="flex items-center gap-1.5">
          {isArbitrage && vsHighest >= 15 && (
            <div className="w-1 h-1 rounded-full bg-ghost-green pulse-dot" />
          )}
          <span className="text-[9px] font-mono text-white/25 uppercase tracking-widest">{round || "Match"}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`text-[8px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded ${
            isArbitrage
              ? "text-ghost-green bg-ghost-green/10 border border-ghost-green/20"
              : "text-white/20 bg-white/4 border border-white/8"
          }`}>
            {isArbitrage
              ? <span className="flex items-center gap-0.5"><GitCompareArrows className="w-2 h-2 inline" /> Arb</span>
              : "Analysis"}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onSave?.(opportunity); }}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/5 transition-colors"
          >
            {isSaved
              ? <BookmarkCheck className="w-3 h-3 text-white/60" />
              : <Bookmark className="w-3 h-3 text-white/20 group-hover:text-white/45 transition-colors" />
            }
          </button>
        </div>
      </div>

      {/* Main body */}
      <div className="px-3.5 py-3">
        {/* Match name + score ring */}
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="min-w-0">
            <div className="font-display text-sm font-semibold text-white leading-snug line-clamp-2 mb-1">{match}</div>
            <div className="flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5 text-white/20 shrink-0" />
              <span className="text-[10px] text-white/30 font-mono truncate">{city} · {date}</span>
            </div>
          </div>
          <ScoreRing score={score} />
        </div>

        {/* Price strip — horizontal, compact */}
        <div className="flex items-stretch gap-px rounded overflow-hidden bg-white/[0.04]">
          <div className="flex-1 bg-[#0f0f0f] px-2.5 py-2">
            <div className="text-[8px] text-white/20 font-mono uppercase tracking-widest mb-1">Best</div>
            <div className="font-display font-bold text-white text-sm leading-none">${current_price?.toLocaleString()}</div>
            {best_platform && <div className="text-[8px] text-white/20 font-mono mt-0.5 capitalize truncate">{best_platform}</div>}
          </div>
          <div className="flex-1 bg-[#0f0f0f] px-2.5 py-2">
            <div className="text-[8px] text-white/20 font-mono uppercase tracking-widest mb-1">Avg</div>
            <div className="font-display font-bold text-white/40 text-sm leading-none">${market_value?.toLocaleString()}</div>
            {platforms_compared > 0 && <div className="text-[8px] text-white/15 font-mono mt-0.5">{platforms_compared}p</div>}
          </div>
          <div className="flex-1 bg-[#0f0f0f] px-2.5 py-2">
            <div className="text-[8px] text-white/20 font-mono uppercase tracking-widest mb-1">
              {isArbitrage ? "Spread" : "vs Avg"}
            </div>
            <div className="font-display font-bold text-sm leading-none" style={{ color: edgeColor }}>{spreadValue}</div>
            {isArbitrage && worst_platform && (
              <div className="text-[8px] text-white/15 font-mono mt-0.5 capitalize truncate">vs {worst_platform}</div>
            )}
          </div>
        </div>
      </div>

      {/* Tap hint — subtle */}
      <div className="flex items-center justify-end px-3.5 pb-2.5">
        <span className="flex items-center gap-0.5 text-[9px] text-white/15 font-mono group-hover:text-white/35 transition-colors">
          Detail <ChevronRight className="w-2.5 h-2.5" />
        </span>
      </div>
    </motion.div>
  );
}