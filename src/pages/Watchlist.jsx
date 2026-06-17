import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import GhostNav from "@/components/GhostNav";
import { Bookmark, Trash2, ArrowRight, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

export default function Watchlist() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [watchlistItems, setWatchlistItems] = useState([]);
  const [opportunities, setOpportunities] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me()
      .then(u => { setUser(u); loadWatchlist(u.id); })
      .catch(() => setLoading(false));
  }, []);

  const loadWatchlist = async (userId) => {
    setLoading(true);
    try {
      const items = await base44.entities.WatchlistItem.filter({ user_id: userId }, "-created_date");
      setWatchlistItems(items);
      const oppIds = [...new Set(items.map(i => i.opportunity_id))];
      const opps = {};
      await Promise.all(oppIds.map(async (id) => {
        try {
          const list = await base44.entities.TicketOpportunity.filter({ id });
          if (list.length) opps[id] = list[0];
        } catch {}
      }));
      setOpportunities(opps);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (item) => {
    await base44.entities.WatchlistItem.delete(item.id);
    setWatchlistItems(prev => prev.filter(i => i.id !== item.id));
  };

  if (!user && !loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white">
        <GhostNav user={null} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Lock className="w-8 h-8 text-white/20 mx-auto mb-4" />
            <h2 className="font-display text-xl font-semibold text-white mb-2">Sign in to view your watchlist</h2>
            <p className="text-sm text-white/35 mb-6">Save opportunities and track them here</p>
            <Link to="/login" className="h-10 px-6 bg-white text-black text-sm font-semibold rounded hover:bg-white/90 transition-all inline-flex items-center">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <GhostNav user={user} />
      <div className="pt-20 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end justify-between mb-8 pt-6">
            <div>
              <h1 className="font-display text-2xl font-bold text-white mb-1">Watchlist</h1>
              <p className="text-sm text-white/30 font-mono">
                {watchlistItems.length} saved {watchlistItems.length === 1 ? "opportunity" : "opportunities"}
              </p>
            </div>
            <Link to="/scanner" className="h-8 px-4 glass border border-white/10 rounded text-xs text-white/50 hover:text-white transition-all flex items-center gap-1.5">
              Browse Scanner <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => <div key={i} className="h-20 glass-card rounded-lg shimmer" />)}
            </div>
          ) : watchlistItems.length === 0 ? (
            <div className="py-24 text-center">
              <Bookmark className="w-8 h-8 text-white/15 mx-auto mb-4" />
              <p className="text-sm text-white/30 font-mono mb-2">Your watchlist is empty</p>
              <p className="text-xs text-white/20 font-mono mb-6">Save opportunities from the scanner to track them here</p>
              <Link to="/scanner" className="h-9 px-5 bg-white text-black text-xs font-semibold rounded hover:bg-white/90 transition-all inline-flex items-center gap-1.5">
                Go to Scanner <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <AnimatePresence>
              <div className="space-y-2">
                {watchlistItems.map((item, i) => {
                  const opp = opportunities[item.opportunity_id];
                  const disc = opp ? (opp.discount_pct ?? Math.round((1 - opp.current_price / opp.market_value) * 100)) : null;
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: i * 0.04 }}
                      className="glass-card rounded-lg p-4 flex items-center gap-4 hover:border-white/10 transition-all"
                    >
                      {opp && (
                        <div className={`w-1 h-10 rounded-full shrink-0 ${disc >= 30 ? "bg-ghost-green" : disc >= 15 ? "bg-ghost-amber" : "bg-white/20"}`} />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-display text-sm font-semibold text-white truncate">{item.match}</div>
                        {opp ? (
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-white/35 font-mono">${opp.current_price?.toLocaleString()}</span>
                            <span className="text-xs text-white/20 font-mono">vs</span>
                            <span className="text-xs text-white/20 font-mono line-through">${opp.market_value?.toLocaleString()}</span>
                            {disc !== null && (
                              <span className={`text-xs font-mono font-semibold ${disc >= 30 ? "text-ghost-green" : disc >= 15 ? "text-ghost-amber" : "text-white/40"}`}>
                                −{disc}%
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-white/20 font-mono mt-1">Opportunity data unavailable</div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        {opp && (
                          <div className="text-sm font-mono font-bold text-white mb-0.5">{opp.opportunity_score}/100</div>
                        )}
                        <div className="text-[10px] text-white/20 font-mono">
                          {formatDistanceToNow(new Date(item.created_date), { addSuffix: true })}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemove(item)}
                        className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/5 transition-colors shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-white/20 hover:text-white/50 transition-colors" />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}