import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Radio } from "lucide-react";

const API_BASE = "http://worldcup26.ir:3050";

function parseScorers(raw) {
  if (!raw || raw === "null") return [];
  try {
    const clean = raw.replace(/^\{/, "[").replace(/\}$/, "]").replace(/"/g, '"');
    return JSON.parse(clean);
  } catch {
    return raw.replace(/[{}"]/g, "").split(",").map(s => s.trim()).filter(Boolean);
  }
}

function MatchCard({ game }) {
  const isLive = game.time_elapsed && game.time_elapsed !== "finished" && game.finished !== "TRUE";
  const isFinished = game.finished === "TRUE" || game.time_elapsed === "finished";
  const homeScore = game.home_score ?? "-";
  const awayScore = game.away_score ?? "-";
  const homeScorers = parseScorers(game.home_scorers);
  const awayScorers = parseScorers(game.away_scorers);

  return (
    <div className={`glass-card rounded-lg p-3 border transition-all ${isLive ? "border-ghost-green/30" : "border-white/5"}`}>
      {/* Status badge */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] font-mono text-white/25 uppercase tracking-widest">
          {game.type === "group" ? `Group ${game.group} · MD${game.matchday}` : game.type?.replace(/_/g, " ")}
        </span>
        {isLive ? (
          <span className="flex items-center gap-1 text-[9px] font-mono text-ghost-green uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-ghost-green pulse-dot" />
            {game.time_elapsed}'
          </span>
        ) : isFinished ? (
          <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">FT</span>
        ) : (
          <span className="text-[9px] font-mono text-white/30">
            {game.local_date?.split(" ")[1] || ""}
          </span>
        )}
      </div>

      {/* Score row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-display font-semibold text-white truncate">{game.home_team_name_en}</div>
          {homeScorers.length > 0 && (
            <div className="text-[9px] text-white/30 font-mono mt-0.5 truncate">{homeScorers.join(", ")}</div>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`text-lg font-display font-bold tabular-nums ${isLive ? "text-ghost-green" : isFinished ? "text-white" : "text-white/20"}`}>
            {homeScore}
          </span>
          <span className="text-white/20 text-sm">–</span>
          <span className={`text-lg font-display font-bold tabular-nums ${isLive ? "text-ghost-green" : isFinished ? "text-white" : "text-white/20"}`}>
            {awayScore}
          </span>
        </div>

        <div className="flex-1 min-w-0 text-right">
          <div className="text-sm font-display font-semibold text-white truncate">{game.away_team_name_en}</div>
          {awayScorers.length > 0 && (
            <div className="text-[9px] text-white/30 font-mono mt-0.5 truncate">{awayScorers.join(", ")}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LiveScoresPanel() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(true);
  const [tab, setTab] = useState("today"); // today | live | recent

  const fetchGames = async () => {
    try {
      const res = await fetch(`${API_BASE}/get/games`);
      if (!res.ok) return;
      const data = await res.json();
      setGames(data.games || []);
    } catch {
      // API may be flaky; silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
    const interval = setInterval(fetchGames, 60_000); // refresh every 60s
    return () => clearInterval(interval);
  }, []);

  // Derive views
  const today = new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });

  const liveGames = games.filter(g =>
    g.time_elapsed && g.time_elapsed !== "finished" && g.finished !== "TRUE"
  );

  const todayGames = games.filter(g => {
    if (!g.local_date) return false;
    const [datePart] = g.local_date.split(" ");
    return datePart === today;
  });

  const recentGames = games
    .filter(g => g.finished === "TRUE" || g.time_elapsed === "finished")
    .slice(-8)
    .reverse();

  const visibleGames = tab === "live" ? liveGames
    : tab === "today" ? todayGames
    : recentGames;

  const liveCount = liveGames.length;

  return (
    <div className="mb-6">
      {/* Header toggle */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 glass-card rounded-lg border border-white/5 hover:border-white/10 transition-all"
      >
        <div className="flex items-center gap-2.5">
          <Radio className="w-3.5 h-3.5 text-white/40" />
          <span className="text-xs font-display font-semibold text-white/70 tracking-wide">Live Scores — WC 2026</span>
          {liveCount > 0 && (
            <span className="flex items-center gap-1 text-[9px] font-mono text-ghost-green uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-ghost-green pulse-dot" />
              {liveCount} LIVE
            </span>
          )}
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-white/25 transition-transform ${open ? "rotate-180" : ""}`} />
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
            <div className="flex gap-1 mt-2 mb-2">
              {[
                { key: "live", label: "Live", count: liveCount },
                { key: "today", label: "Today", count: todayGames.length },
                { key: "recent", label: "Recent", count: recentGames.length },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`h-7 px-3 rounded text-[10px] font-mono font-medium transition-all flex items-center gap-1.5 ${
                    tab === t.key ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60"
                  }`}
                >
                  {t.label}
                  {t.key === "live" && t.count > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-ghost-green pulse-dot" />
                  )}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 glass-card rounded-lg shimmer" />
                ))}
              </div>
            ) : visibleGames.length === 0 ? (
              <div className="py-6 text-center text-xs text-white/20 font-mono">
                {tab === "live" ? "No live matches right now" : tab === "today" ? "No matches today" : "No recent matches"}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {visibleGames.map(game => (
                  <MatchCard key={game._id} game={game} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}