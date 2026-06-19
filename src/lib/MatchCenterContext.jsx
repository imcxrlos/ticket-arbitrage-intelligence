import { createContext, useContext, useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";

const MatchCenterContext = createContext(null);
const CACHE_KEY = "ghost_wc2026_games_v2";

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { games, ts } = JSON.parse(raw);
    // Only use cache if less than 10 minutes old
    if (Date.now() - ts < 10 * 60 * 1000) return games;
  } catch {}
  return null;
}

function saveCache(games) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ games, ts: Date.now() }));
  } catch {}
}

function getPollingInterval(games) {
  const hasLive = games.some(g => g.status === "live" || g.status === "halftime");
  return hasLive ? 30_000 : 5 * 60_000;
}

export function MatchCenterProvider({ children }) {
  const cached = loadCache();
  const [games, setGames] = useState(cached || []);
  // Only show loading spinner if we have no cached data at all
  const [loading, setLoading] = useState(!cached);
  const intervalRef = useRef(null);
  const isFetching = useRef(false);

  const fetchGames = async () => {
    if (isFetching.current) return;
    isFetching.current = true;
    try {
      const res = await base44.functions.invoke('proxyWC2026', {});
      const newGames = res.data?.games || [];
      setGames(newGames);
      saveCache(newGames);
      // Reschedule with smart interval after each fetch
      scheduleNext(newGames);
    } catch {
      // silently keep existing data
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  };

  const scheduleNext = (currentGames) => {
    if (intervalRef.current) clearTimeout(intervalRef.current);
    const delay = getPollingInterval(currentGames);
    intervalRef.current = setTimeout(fetchGames, delay);
  };

  useEffect(() => {
    fetchGames();
    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, []);

  return (
    <MatchCenterContext.Provider value={{ games, loading }}>
      {children}
    </MatchCenterContext.Provider>
  );
}

export function useMatchCenter() {
  return useContext(MatchCenterContext);
}