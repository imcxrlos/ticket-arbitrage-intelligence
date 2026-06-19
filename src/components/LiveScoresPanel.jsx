import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Radio } from "lucide-react";
import { useMatchCenter } from "@/lib/MatchCenterContext";

function MatchCard({ game }) {
  const isLive = game.status === "live";
  const isHalfTime = game.status === "halftime";
  const isActive = isLive || isHalfTime;
  const isFinished = game.status === "finished";
  const hasScore = game.home_score !== null && game.away_score !== null;

  const roundLabel = game.type === "group"
    ? `Group ${game.group} · MD${game.matchday}`
    : (game.type || "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  const timeDisplay = isLive && game.time_elapsed ? `${game.time_elapsed}'`
    : isHalfTime ? "HT"
    : isFinished ? "FT"
    : game.local_date?.split(" ")[1] || "";

  return (
    <div
      className="relative rounded-xl overflow-hidden transition-all"
      style={isActive ? {
        background: "linear-gradient(135deg, #0f1f0f, #0a0a0a)",
        border: "1px solid rgba(34,197,94,0.2)"
      } : {
        background: "#0f0f0f",
        border: "1px solid rgba(255,255,255,0.04)"
      }}
    >
      {isActive && (
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent 0%, rgba(34,197,94,0.4) 50%, transparent 100%)" }} />
      )}

      <div className="p-3.5">
        {/* Top row: round label + time */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">{roundLabel}</span>
          {isLive ? (
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: "#22c55e" }} />
              <span className="text-[10px] font-mono font-medium" style={{ color: "#22c55e" }}>{timeDisplay}</span>
            </div>
          ) : isHalfTime ? (
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: "#f59e0b" }} />
              <span className="text-[10px] font-mono font-medium" style={{ color: "#f59e0b" }}>HT</span>
            </div>
          ) : (
            <span className="text-[9px] font-mono text-white/25">{timeDisplay}</span>
          )}
        </div>

        {/* Score row */}
        <div className="flex items-center gap-2">
          {/* Home */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-display font-semibold truncate" style={{ color: isActive ? "#fff" : "rgba(255,255,255,0.7)" }}>
              {game.home}
            </div>
            {game.home_scorers?.length > 0 && (
              <div className="text-[9px] text-white/25 font-mono mt-0.5 truncate">
                {game.home_scorers.join(" · ")}
              </div>
            )}
          </div>

          {/* Score */}
          <div className="shrink-0 flex items-center gap-1.5 px-2">
            {hasScore ? (
              <>
                <span className="text-xl font-display font-bold tabular-nums leading-none"
                  style={{ color: isLive ? "#22c55e" : isHalfTime ? "#f59e0b" : "#fff" }}>{game.home_score}</span>
                <span className="text-white/15 text-base">–</span>
                <span className="text-xl font-display font-bold tabular-nums leading-none"
                  style={{ color: isLive ? "#22c55e" : isHalfTime ? "#f59e0b" : "#fff" }}>{game.away_score}</span>
              </>
            ) : (
              <span className="text-white/15 text-sm font-mono">vs</span>
            )}
          </div>

          {/* Away */}
          <div className="flex-1 min-w-0 text-right">
            <div className="text-sm font-display font-semibold truncate" style={{ color: isActive ? "#fff" : "rgba(255,255,255,0.7)" }}>
              {game.away}
            </div>
            {game.away_scorers?.length > 0 && (
              <div className="text-[9px] text-white/25 font-mono mt-0.5 truncate">
                {game.away_scorers.join(" · ")}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LiveScoresPanel() {
  const { games, loading } = useMatchCenter();
  const [open, setOpen] = useState(true);
  const [tab, setTab] = useState("today");

  const now = new Date();
  const todayStr = `${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}/${now.getFullYear()}`;

  const todayGames = games.filter(g => g.local_date?.startsWith(todayStr));
  const recentGames = [...games].filter(g => g.status === "finished").reverse().slice(0, 12);

  const visibleGames = tab === "today" ? todayGames : recentGames;

  const tabs = [
    { key: "today", label: "Today", count: todayGames.length },
    { key: "recent", label: "Results", count: recentGames.length },
  ];

  return (
    <div className="mb-6">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#0f0f0f] border border-white/[0.06] rounded-xl hover:border-white/10 transition-all"
      >
        <div className="flex items-center gap-3">
          <Radio className="w-3.5 h-3.5 text-white/30" />
          <span className="text-xs font-display font-semibold text-white/60 tracking-wide">WC 2026 — Match Center</span>

        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-white/20 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {/* Tabs */}
            <div className="flex gap-1 mt-3 mb-3">
              {tabs.map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`h-7 px-3 rounded-lg text-[10px] font-mono font-medium transition-all flex items-center gap-1.5 ${
                    tab === t.key
                      ? "bg-white/8 text-white border border-white/10"
                      : "text-white/25 hover:text-white/50"
                  }`}
                >
                  {t.label}
                  {t.count > 0 && (
                    <span className={`text-[9px] ${tab === t.key ? "text-white/50" : "text-white/20"}`}>
                      {t.count}
                    </span>
                  )}

                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex items-center gap-2 py-4 px-1">
                <div className="w-1 h-1 rounded-full bg-white/20 animate-pulse" />
                <span className="text-[10px] font-mono text-white/20">Fetching match data...</span>
              </div>
            ) : visibleGames.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-xs text-white/20 font-mono">
                  {tab === "today" ? "No matches scheduled today" : "No recent results"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {visibleGames.map(game => (
                  <MatchCard key={game.id} game={game} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}