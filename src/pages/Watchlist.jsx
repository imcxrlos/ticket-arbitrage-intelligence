import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import GhostNav from "@/components/GhostNav";
import OpportunityCard from "@/components/OpportunityCard";
import OpportunityDetailModal from "@/components/OpportunityDetailModal";
import { Bookmark, ArrowRight, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

export default function Watchlist() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [watchlistItems, setWatchlistItems] = useState([]);
  const [opportunities, setOpportunities] = useState({});
  const [selectedOpp, setSelectedOpp] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me()
      .then(u => { setUser(u); setAuthLoading(false); loadWatchlist(u.id); })
      .catch(() => { setAuthLoading(false); setLoading(false); });
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

  const handleRemove = async (opportunity) => {
    const item = watchlistItems.find(i => i.opportunity_id === opportunity.id);
    if (!item) return;
    await base44.entities.WatchlistItem.delete(item.id);
    setWatchlistItems(prev => prev.filter(i => i.id !== item.id));
    if (selectedOpp?.id === opportunity.id) setSelectedOpp(null);
  };

  const handleSetAlert = () => {
    navigate("/alerts");
  };

  const savedOpportunityIds = new Set(watchlistItems.map(i => i.opportunity_id));
  const savedOpportunities = watchlistItems
    .map(item => opportunities[item.opportunity_id])
    .filter(Boolean);

  if (!user && !loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white">
        <GhostNav user={null} authLoading={authLoading} />
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
      <GhostNav user={user} authLoading={authLoading} />
      <div className="pt-20 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => <div key={i} className="h-44 glass-card rounded-lg shimmer" />)}
            </div>
          ) : savedOpportunities.length === 0 ? (
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
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {savedOpportunities.map((opp, i) => (
                  <OpportunityCard
                    key={opp.id}
                    opportunity={opp}
                    index={i}
                    onSave={handleRemove}
                    isSaved={savedOpportunityIds.has(opp.id)}
                    onViewDetail={setSelectedOpp}
                  />
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>
      </div>

      {selectedOpp && (
        <OpportunityDetailModal
          opportunity={selectedOpp}
          isSaved={savedOpportunityIds.has(selectedOpp.id)}
          onSave={handleRemove}
          onSetAlert={handleSetAlert}
          onClose={() => setSelectedOpp(null)}
          user={user}
        />
      )}
    </div>
  );
}