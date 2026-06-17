import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, RefreshCw, X, Lock, Zap } from "lucide-react";
import GhostNav from "@/components/GhostNav";
import OpportunityCard from "@/components/OpportunityCard";
import OpportunityDetailModal from "@/components/OpportunityDetailModal";
import { useNavigate } from "react-router-dom";

const TICKER = [
  { match: "Argentina vs Brazil", score: 94, discount: "41%" },
  { match: "USA vs Mexico", score: 88, discount: "28%" },
  { match: "France vs England", score: 91, discount: "35%" },
  { match: "Spain vs Germany", score: 86, discount: "22%" },
  { match: "Brazil vs France", score: 96, discount: "44%" },
];

const CATEGORIES = ["All", "Category 1", "Category 2", "Category 3", "Category 4", "VIP", "Premium"];
const ROUNDS = ["All", "Group Stage", "Round of 32", "Round of 16", "Quarter-Final", "Semi-Final", "Final"];
const CITIES = ["All", "New York", "Los Angeles", "Dallas", "Miami", "Boston", "Atlanta", "Kansas City", "San Francisco", "Seattle", "Houston", "Philadelphia", "Vancouver", "Toronto", "Mexico City", "Monterrey", "Guadalajara"];

export default function Scanner() {
  const [user, setUser] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savedIds, setSavedIds] = useState(new Set());
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [lastScan, setLastScan] = useState(new Date());

  const [filters, setFilters] = useState({
    search: "",
    city: "All",
    category: "All",
    round: "All",
    minScore: 0,
    maxPrice: "",
    minDiscount: 0,
    sortBy: "score",
  });

  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    loadOpportunities();
  }, []);

  useEffect(() => {
    if (!user) return;
    base44.entities.WatchlistItem.filter({ user_id: user.id })
      .then(items => setSavedIds(new Set(items.map(i => i.opportunity_id))))
      .catch(() => {});
  }, [user]);

  const loadOpportunities = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.TicketOpportunity.filter({ is_active: true }, "-opportunity_score", 100);
      setOpportunities(data);
      setLastScan(new Date());
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOpportunities();
    setRefreshing(false);
  };

  const handleSyncLive = async () => {
    if (!user) { navigate("/login"); return; }
    setRefreshing(true);
    try {
      await base44.functions.invoke('syncOpportunities', {});
      await loadOpportunities();
    } finally {
      setRefreshing(false);
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

  const handleSetAlert = (opp) => {
    if (!user) { navigate("/login"); return; }
    navigate("/alerts");
  };

  const filtered = opportunities.filter(o => {
    const q = filters.search.toLowerCase();
    if (q && !o.match?.toLowerCase().includes(q) && !o.city?.toLowerCase().includes(q)) return false;
    if (filters.city !== "All" && o.city !== filters.city) return false;
    if (filters.category !== "All" && o.category !== filters.category) return false;
    if (filters.round !== "All" && o.round !== filters.round) return false;
    if (o.opportunity_score < filters.minScore) return false;
    if (filters.maxPrice && o.current_price > Number(filters.maxPrice)) return false;
    const disc = o.discount_pct ?? (o.market_value > 0 ? (1 - o.current_price / o.market_value) * 100 : 0);
    if (disc < filters.minDiscount) return false;
    return true;
  }).sort((a, b) => {
    if (filters.sortBy === "score") return (b.opportunity_score ?? 0) - (a.opportunity_score ?? 0);
    if (filters.sortBy === "discount") {
      const da = a.discount_pct ?? (1 - a.current_price / a.market_value) * 100;
      const db = b.discount_pct ?? (1 - b.current_price / b.market_value) * 100;
      return db - da;
    }
    if (filters.sortBy === "price_asc") return a.current_price - b.current_price;
    if (filters.sortBy === "price_desc") return b.current_price - a.current_price;
    return 0;
  });

  const topOpp = filtered.length > 0 ? filtered[0] : null;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <GhostNav user={user} />

      {/* Ticker */}
      <div className="fixed top-14 left-0 right-0 z-40 border-b border-white/5 bg-[#0A0A0A]/90 backdrop-blur-md overflow-hidden h-8 flex items-center">
        <div className="flex items-center gap-3 px-4 shrink-0 border-r border-white/8 h-full">
          <div className={`w-1.5 h-1.5 rounded-full ${refreshing ? "bg-ghost-amber" : "bg-ghost-green"} pulse-dot`} />
          <span className="text-[10px] text-white/35 font-mono uppercase tracking-widest">
            {refreshing ? "Scanning..." : "Live"}
          </span>
        </div>
        <div className="overflow-hidden flex-1">
          <div className="ticker-track">
            {[...TICKER, ...TICKER].map((item, i) => (
              <div key={i} className="flex items-center gap-4 px-6 shrink-0">
                <span className="text-[11px] text-white/50 font-mono">{item.match}</span>
                <span className="text-[11px] text-ghost-green font-mono">{item.discount} below market</span>
                <span className="text-white/15 mx-1">|</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-28 pb-16 px-6">
        <div className="max-w-7xl mx-auto">

          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-2xl font-bold text-white mb-1">Market Scanner</h1>
              <p className="text-sm text-white/30 font-mono">
                {loading ? "Loading..." : `${filtered.length} opportunities detected · Last scan ${lastScan.toLocaleTimeString()}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {user && (
                <button
                  onClick={handleSyncLive}
                  disabled={refreshing}
                  className="h-8 px-3 bg-white/8 border border-white/15 rounded text-xs text-white/70 hover:text-white hover:bg-white/12 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Zap className={`w-3 h-3 ${refreshing ? "animate-pulse" : ""}`} />
                  Sync Live
                </button>
              )}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="h-8 px-3 glass border border-white/10 rounded text-xs text-white/50 hover:text-white transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <button
                onClick={() => setShowFilters(v => !v)}
                className={`h-8 px-3 rounded text-xs flex items-center gap-1.5 transition-all ${showFilters ? "bg-white text-black" : "glass border border-white/10 text-white/50 hover:text-white"}`}
              >
                <SlidersHorizontal className="w-3 h-3" />
                Filters
              </button>
            </div>
          </div>

          {/* Search + Sort */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
              <input
                value={filters.search}
                onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                placeholder="Search match or city..."
                className="w-full h-9 pl-9 pr-4 bg-white/4 border border-white/8 rounded text-sm text-white placeholder:text-white/20 font-mono outline-none focus:border-white/20 transition-colors"
              />
            </div>
            <select
              value={filters.sortBy}
              onChange={e => setFilters(f => ({ ...f, sortBy: e.target.value }))}
              className="h-9 px-3 bg-white/4 border border-white/8 rounded text-xs text-white/60 font-mono outline-none appearance-none cursor-pointer hover:border-white/15 transition-colors"
            >
              <option value="score">Sort: Score</option>
              <option value="discount">Sort: Discount</option>
              <option value="price_asc">Sort: Price ↑</option>
              <option value="price_desc">Sort: Price ↓</option>
            </select>
          </div>

          {/* Filters panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="glass-card rounded-lg p-4 mb-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div>
                    <label className="text-[10px] text-white/25 font-mono uppercase tracking-wider block mb-1.5">City</label>
                    <select value={filters.city} onChange={e => setFilters(f => ({ ...f, city: e.target.value }))}
                      className="w-full h-8 px-2 bg-black/40 border border-white/8 rounded text-xs text-white/60 font-mono outline-none">
                      {CITIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-white/25 font-mono uppercase tracking-wider block mb-1.5">Category</label>
                    <select value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
                      className="w-full h-8 px-2 bg-black/40 border border-white/8 rounded text-xs text-white/60 font-mono outline-none">
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-white/25 font-mono uppercase tracking-wider block mb-1.5">Round</label>
                    <select value={filters.round} onChange={e => setFilters(f => ({ ...f, round: e.target.value }))}
                      className="w-full h-8 px-2 bg-black/40 border border-white/8 rounded text-xs text-white/60 font-mono outline-none">
                      {ROUNDS.map(r => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-white/25 font-mono uppercase tracking-wider block mb-1.5">Min Score</label>
                    <input type="number" min={0} max={100} value={filters.minScore}
                      onChange={e => setFilters(f => ({ ...f, minScore: Number(e.target.value) }))}
                      placeholder="0"
                      className="w-full h-8 px-2 bg-black/40 border border-white/8 rounded text-xs text-white/60 font-mono outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/25 font-mono uppercase tracking-wider block mb-1.5">Max Price</label>
                    <input type="number" value={filters.maxPrice}
                      onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
                      placeholder="Any"
                      className="w-full h-8 px-2 bg-black/40 border border-white/8 rounded text-xs text-white/60 font-mono outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/25 font-mono uppercase tracking-wider block mb-1.5">Min Discount</label>
                    <input type="number" min={0} max={100} value={filters.minDiscount}
                      onChange={e => setFilters(f => ({ ...f, minDiscount: Number(e.target.value) }))}
                      placeholder="0%"
                      className="w-full h-8 px-2 bg-black/40 border border-white/8 rounded text-xs text-white/60 font-mono outline-none" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty / Loading */}
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-card rounded-lg h-52 shimmer" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center">
              <div className="text-white/20 font-mono text-sm mb-2">No opportunities match your filters</div>
              <button onClick={() => setFilters(f => ({ ...f, search: "", city: "All", category: "All", round: "All", minScore: 0, maxPrice: "", minDiscount: 0 }))}
                className="text-xs text-white/30 hover:text-white underline font-mono transition-colors">
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              {/* Top opportunity highlight */}
              {topOpp && (
                <div
                  className="glass-card rounded-lg border-white/12 p-5 mb-6 cursor-pointer hover:border-white/18 transition-all relative overflow-hidden"
                  onClick={() => setSelectedOpp(topOpp)}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-ghost-green/5 rounded-full -translate-y-8 translate-x-8 blur-2xl pointer-events-none" />
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-ghost-green pulse-dot" />
                        <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Top Opportunity</span>
                      </div>
                      <div className="font-display text-xl font-bold text-white mb-1">{topOpp.match}</div>
                      <div className="text-xs text-white/35 font-mono">{topOpp.stadium} · {topOpp.city}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-3xl font-display font-bold text-ghost-green">
                        −{topOpp.discount_pct ?? Math.round((1 - topOpp.current_price / topOpp.market_value) * 100)}%
                      </div>
                      <div className="text-xs text-white/25 font-mono">below market</div>
                      <div className="text-sm text-white/50 font-mono mt-1">Score {topOpp.opportunity_score}/100</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
        </div>
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