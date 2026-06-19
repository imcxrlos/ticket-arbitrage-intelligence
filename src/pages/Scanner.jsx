import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Search, RefreshCw } from "lucide-react";
import GhostNav from "@/components/GhostNav";
import LiveScoresPanel from "@/components/LiveScoresPanel";
import OpportunityCard from "@/components/OpportunityCard";
import OpportunityDetailModal from "@/components/OpportunityDetailModal";
import { useNavigate } from "react-router-dom";

const OPP_CACHE_KEY = "ghost_opportunities_priority_v3";
const OPP_CACHE_TTL = 5 * 60 * 1000; // 5 min

const TRACKED_MATCHES = new Set([
  "World Cup Round of 32 — SoFi Stadium",
  "World Cup Round of 32 — Houston",
  "World Cup Round of 32 — Foxborough",
  "World Cup Round of 32 — Arlington",
  "World Cup Round of 32 — East Rutherford",
  "World Cup Semi-Final 1",
  "World Cup Semi-Final 2",
  "World Cup Final",
]);

function loadOppCache() {
  try {
    const raw = localStorage.getItem(OPP_CACHE_KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts < OPP_CACHE_TTL) return data;
  } catch {}
  return null;
}

function saveOppCache(data) {
  try {
    localStorage.setItem(OPP_CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
  } catch {}
}

export default function Scanner() {
  const cached = loadOppCache();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [opportunities, setOpportunities] = useState(cached || []);
  const [loading, setLoading] = useState(!cached);
  const [savedIds, setSavedIds] = useState(new Set());
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("score");

  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(u => { setUser(u); setAuthLoading(false); }).catch(() => setAuthLoading(false));
    // Only fetch from DB if cache is stale/empty
    if (!cached) loadOpportunities();
  }, []);

  useEffect(() => {
    if (!user) return;
    base44.entities.WatchlistItem.filter({ user_id: user.id })
      .then(items => setSavedIds(new Set(items.map(i => i.opportunity_id))))
      .catch(() => {});
  }, [user]);

  const loadOpportunities = async (force = false) => {
    if (force) localStorage.removeItem(OPP_CACHE_KEY);
    setLoading(true);
    try {
      const data = await base44.entities.TicketOpportunity.filter({ is_active: true }, "-opportunity_score", 100);
      const trackedData = data.filter(opp => TRACKED_MATCHES.has(opp.match)).slice(0, 8);
      setOpportunities(trackedData);
      saveOppCache(trackedData);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (opp) => {
    if (!user) { navigate("/login"); return; }
    if (savedIds.has(opp.id)) {
      const items = await base44.entities.WatchlistItem.filter({ user_id: user.id, opportunity_id: opp.id });
      if (items.length) await base44.entities.WatchlistItem.delete(items[0].id);
      setSavedIds(prev => { const n = new Set(prev); n.delete(opp.id); return n; });
    } else {
      await base44.entities.WatchlistItem.create({ user_id: user.id, opportunity_id: opp.id, match: opp.match });
      setSavedIds(prev => new Set([...prev, opp.id]));
    }
  };

  const handleSetAlert = () => {
    if (!user) { navigate("/login"); return; }
    navigate("/alerts");
  };

  const filtered = opportunities
    .filter(o => {
      if (!search) return true;
      const q = search.toLowerCase();
      return o.match?.toLowerCase().includes(q) || o.city?.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortBy === "score") return (b.opportunity_score ?? 0) - (a.opportunity_score ?? 0);
      if (sortBy === "discount") return (b.discount_pct ?? 0) - (a.discount_pct ?? 0);
      if (sortBy === "price_asc") return a.current_price - b.current_price;
      if (sortBy === "price_desc") return b.current_price - a.current_price;
      return 0;
    });

  const topOpp = filtered[0] ?? null;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <GhostNav user={user} authLoading={authLoading} />

      <div className="pt-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-center">
          <span className="font-display text-sm font-semibold text-white">Ghost is free ⚡</span>
          <span className="ml-2 text-xs text-white/45 font-mono">See live ticket arbitrage opportunities — updated automatically.</span>
        </div>
      </div>

      <div className="pt-3 pb-4">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-ghost-green pulse-dot" />
                <h1 className="font-display text-base font-bold text-white">Market Scanner</h1>
                <span className="text-[10px] text-white/25 font-mono">{loading ? "…" : `${filtered.length} result${filtered.length !== 1 ? "s" : ""}`}</span>
              </div>
              <button
                onClick={() => loadOpportunities(true)}
                disabled={loading}
                title="Refresh data"
                className="lg:hidden text-white/25 hover:text-white/60 transition-colors disabled:opacity-30"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>

            <div className="flex gap-2 lg:w-[520px]">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search match or city..."
                  className="w-full h-9 pl-7 pr-3 rounded-lg text-xs text-white placeholder:text-white/20 font-mono outline-none focus:border-white/15 transition-colors" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                />
              </div>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="h-9 px-2 rounded-lg text-xs text-white/50 font-mono outline-none appearance-none cursor-pointer" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <option value="score">Score</option>
                <option value="discount">Discount</option>
                <option value="price_asc">$ Low</option>
                <option value="price_desc">$ High</option>
              </select>
              <button
                onClick={() => loadOpportunities(true)}
                disabled={loading}
                title="Refresh data"
                className="hidden lg:flex h-9 w-9 items-center justify-center rounded-lg text-white/25 hover:text-white/60 transition-colors disabled:opacity-30"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Match Center */}
          <LiveScoresPanel />

          {/* Cards */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white/3 rounded-xl h-40 shimmer border border-white/[0.04]" />
              ))}
            </div>
          ) : opportunities.length === 0 ? (
            <div className="py-32 text-center">
              <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center mx-auto mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
              </div>
              <div className="text-white/40 font-display text-lg font-semibold mb-2">No live data yet</div>
              <div className="text-white/20 font-mono text-xs max-w-xs mx-auto leading-relaxed">
                The hourly market scan is running. Data will appear automatically once live ticket pricing is detected across platforms.
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-32 text-center">
              <div className="text-white/20 font-mono text-sm mb-3">No matches found for "{search}"</div>
              <button onClick={() => setSearch("")} className="text-xs text-white/30 hover:text-white underline font-mono transition-colors">
                Clear search
              </button>
            </div>
          ) : (
            <>
              {topOpp && (
                <div
                  className="hidden sm:block bg-white/[0.03] border border-white/8 rounded-xl p-5 mb-5 cursor-pointer hover:border-white/14 transition-all relative overflow-hidden group"
                  onClick={() => setSelectedOpp(topOpp)}
                >
                  <div className="absolute top-0 right-0 w-48 h-48 bg-ghost-green/5 rounded-full -translate-y-12 translate-x-12 blur-3xl pointer-events-none" />
                  <div className="flex items-center justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-ghost-green pulse-dot" />
                        <span className="text-[9px] font-mono text-white/25 uppercase tracking-widest">Top Opportunity</span>
                      </div>
                      <div className="font-display text-lg font-bold text-white mb-1">{topOpp.match}</div>
                      <div className="text-xs text-white/30 font-mono">{topOpp.stadium} · {topOpp.city}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-4xl font-display font-bold text-ghost-green leading-none">
                        −{topOpp.discount_pct ?? Math.round((1 - topOpp.current_price / topOpp.market_value) * 100)}%
                      </div>
                      <div className="text-[10px] text-white/25 font-mono mt-1">below market · score {topOpp.opportunity_score}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {filtered.map((opp, i) => (
                  <OpportunityCard
                    key={opp.id}
                    opportunity={opp}
                    index={i}
                    onSave={handleSave}
                    isSaved={savedIds.has(opp.id)}
                    onViewDetail={setSelectedOpp}
                  />
                ))}
              </div>
            </>
          )}
        </main>
      </div>

      {selectedOpp && (
        <OpportunityDetailModal
          opportunity={selectedOpp}
          isSaved={savedIds.has(selectedOpp.id)}
          onSave={handleSave}
          onSetAlert={handleSetAlert}
          onClose={() => setSelectedOpp(null)}
          user={user}
        />
      )}
    </div>
  );
}