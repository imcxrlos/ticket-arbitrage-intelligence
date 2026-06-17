import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Radio } from "lucide-react";
import { base44 } from "@/api/base44Client";

function MatchCard({ game }) {
  const isLive = game.status === "live";
  const isFinished = game.status === "finished";
  const hasScore = game.home_score !== null && game.away_score !== null;

  const roundLabel = game.type === "group"
    ? `Group ${game.group} · MD${game.matchday}`
    : (game.type || "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  const timeDisplay = isLive && game.time_elapsed ? `${game.time_elapsed}'` : isFinished ? "FT" : game.local_date?.split(" ")[1] || "";

  return (
    <div className={`relative rounded-xl overflow-hidden transition-all ${
      isLive
        ? "bg-gradient-to-br from-[#0f1f0f] to-[#0a0a0a] border border-[hsl(var(--ghost-green))/20]"
        : "bg-[#0f0f0f] border border-white/[0.04]"
    }`}>
      {isLive && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[hsl(var(--ghost-green))/40] to-transparent" />
      )}

      <div className="p-3.5">
        {/* Top row: round label + time */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">{roundLabel}</span>
          {isLive ? (
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--ghost-green))] pulse-dot" />
              <span className="text-[10px] font-mono text-[hsl(var(--ghost-green))] font-medium">{timeDisplay}</span>
            </div>
          ) : (
            <span className="text-[9px] font-mono text-white/25">{timeDisplay}</span>
          )}
        </div>

        {/* Score row */}
        <div className="flex items-center gap-2">
          {/* Home */}
          <div className="flex-1 min-w-0">
            <div className={`text-sm font-display font-semibold truncate ${isLive ? "text-white" : "text-white/70"}`}>
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
                <span className={`text-xl font-display font-bold tabular-nums leading-none ${
                  isLive ? "text-[hsl(var(--ghost-green))]" : "text-white"
                }`}>{game.home_score}</span>
                <span className="text-white/15 text-base">–</span>
                <span className={`text-xl font-display font-bold tabular-nums leading-none ${
                  isLive ? "text-[hsl(var(--ghost-green))]" : "text-white"
                }`}>{game.away_score}</span>
              </>
            ) : (
              <span className="text-white/15 text-sm font-mono">vs</span>
            )}
          </div>

          {/* Away */}
          <div className="flex-1 min-w-0 text-right">
            <div className={`text-sm font-display font-semibold truncate ${isLive ? "text-white" : "text-white/70"}`}>
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
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(true);
  const [tab, setTab] = useState("today");

  const fetchGames = async () => {
    try {
      const res = await base44.functions.invoke('proxyWC2026', {});
      setGames(res.data?.games || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
    const interval = setInterval(fetchGames, 60_000);
    return () => clearInterval(interval);
  }, []);

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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 bg-[#0f0f0f] rounded-xl shimmer border border-white/[0.04]" />
                ))}
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