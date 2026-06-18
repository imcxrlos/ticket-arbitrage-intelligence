import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import GhostNav from "@/components/GhostNav";
import LiveScoresPanel from "@/components/LiveScoresPanel";
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

      <div className="pt-20 pb-16 flex h-screen overflow-hidden">

        {/* ── LEFT SIDEBAR ── */}
        <aside className="hidden lg:flex flex-col w-72 shrink-0 border-r border-white/[0.05] overflow-y-auto px-5 py-6 gap-6">
          {/* Brand / status */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <h1 className="font-display text-sm font-semibold text-white tracking-wide">Market Scanner</h1>
              <div className="w-1.5 h-1.5 rounded-full bg-ghost-green pulse-dot" />
            </div>
            <p className="text-[10px] text-white/25 font-mono">
              {loading ? "Loading..." : `${filtered.length} results`}
            </p>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
            <input
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              placeholder="Search match or city..."
              className="w-full h-9 pl-9 pr-3 bg-white/4 border border-white/8 rounded-lg text-xs text-white placeholder:text-white/20 font-mono outline-none focus:border-white/15 transition-colors"
            />
          </div>

          {/* Sort */}
          <div>
            <label className="text-[9px] font-mono text-white/20 uppercase tracking-widest block mb-2">Sort by</label>
            <select
              value={filters.sortBy}
              onChange={e => setFilters(f => ({ ...f, sortBy: e.target.value }))}
              className="w-full h-8 px-2 bg-white/4 border border-white/8 rounded-lg text-xs text-white/60 font-mono outline-none appearance-none cursor-pointer"
            >
              <option value="score">Opportunity Score</option>
              <option value="discount">Discount %</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
            </select>
          </div>

          {/* Divider */}
          <div className="border-t border-white/[0.05]" />

          {/* Filters */}
          <div className="space-y-4">
            <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">Filters</span>

            {[
              { label: "City", key: "city", options: CITIES },
              { label: "Category", key: "category", options: CATEGORIES },
              { label: "Round", key: "round", options: ROUNDS },
            ].map(({ label, key, options }) => (
              <div key={key}>
                <label className="text-[10px] text-white/30 font-mono block mb-1.5">{label}</label>
                <select
                  value={filters[key]}
                  onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full h-8 px-2 bg-white/3 border border-white/8 rounded text-xs text-white/55 font-mono outline-none appearance-none cursor-pointer hover:border-white/12 transition-colors"
                >
                  {options.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}



            <div>
              <label className="text-[10px] text-white/30 font-mono block mb-1.5">Max Price ($)</label>
              <input type="number" value={filters.maxPrice}
                onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
                placeholder="Any"
                className="w-full h-8 px-2 bg-white/3 border border-white/8 rounded text-xs text-white/55 font-mono outline-none hover:border-white/12 transition-colors" />
            </div>

            <div>
              <label className="text-[10px] text-white/30 font-mono block mb-1.5">Min Discount (%)</label>
              <input type="number" min={0} max={100} value={filters.minDiscount}
                onChange={e => setFilters(f => ({ ...f, minDiscount: Number(e.target.value) }))}
                placeholder="0"
                className="w-full h-8 px-2 bg-white/3 border border-white/8 rounded text-xs text-white/55 font-mono outline-none hover:border-white/12 transition-colors" />
            </div>

            <button
              onClick={() => setFilters(f => ({ ...f, search: "", city: "All", category: "All", round: "All", minScore: 0, maxPrice: "", minDiscount: 0 }))}
              className="text-[10px] text-white/20 hover:text-white/50 font-mono transition-colors underline underline-offset-2"
            >
              Clear all filters
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-white/[0.05]" />


        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 overflow-y-auto px-6 lg:px-8 py-6">

          {/* Mobile header */}
          <div className="flex lg:hidden items-center justify-between mb-5">
            <div>
              <h1 className="font-display text-xl font-bold text-white">Market Scanner</h1>
              <p className="text-[10px] text-white/25 font-mono mt-0.5">{loading ? "Loading..." : `${filtered.length} results`}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowFilters(v => !v)}
                className={`h-8 px-3 rounded-lg text-xs flex items-center gap-1.5 transition-all ${showFilters ? "bg-white text-black" : "border border-white/10 text-white/50 hover:text-white"}`}>
                <SlidersHorizontal className="w-3 h-3" />
                Filters
              </button>

            </div>
          </div>

          {/* Mobile filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden lg:hidden">
                <div className="grid grid-cols-2 gap-2 mb-5 p-4 bg-white/3 border border-white/6 rounded-xl">
                  <div className="relative col-span-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20" />
                    <input value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} placeholder="Search..." className="w-full h-8 pl-8 pr-3 bg-white/4 border border-white/8 rounded text-xs text-white placeholder:text-white/20 font-mono outline-none" />
                  </div>
                  {[{ label: "City", key: "city", opts: CITIES }, { label: "Category", key: "category", opts: CATEGORIES }, { label: "Round", key: "round", opts: ROUNDS }].map(({ label, key, opts }) => (
                    <div key={key}>
                      <label className="text-[9px] text-white/25 font-mono block mb-1">{label}</label>
                      <select value={filters[key]} onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))} className="w-full h-7 px-2 bg-black/30 border border-white/8 rounded text-[10px] text-white/55 font-mono outline-none">
                        {opts.map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Match Center */}
          <LiveScoresPanel />

          {/* Cards */}
          {loading ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white/3 rounded-xl h-52 shimmer border border-white/[0.04]" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-32 text-center">
              <div className="text-white/20 font-mono text-sm mb-3">No opportunities match your filters</div>
              <button
                onClick={() => setFilters(f => ({ ...f, search: "", city: "All", category: "All", round: "All", minScore: 0, maxPrice: "", minDiscount: 0 }))}
                className="text-xs text-white/30 hover:text-white underline font-mono transition-colors"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              {/* Top opportunity */}
              {topOpp && (
                <div
                  className="bg-white/[0.03] border border-white/8 rounded-xl p-5 mb-6 cursor-pointer hover:border-white/14 transition-all relative overflow-hidden group"
                  onClick={() => setSelectedOpp(topOpp)}
                >
                  <div className="absolute top-0 right-0 w-48 h-48 bg-ghost-green/5 rounded-full -translate-y-12 translate-x-12 blur-3xl pointer-events-none group-hover:bg-ghost-green/8 transition-all" />
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

              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
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