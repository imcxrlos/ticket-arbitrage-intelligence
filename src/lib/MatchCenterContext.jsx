import { createContext, useContext, useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";

const MatchCenterContext = createContext(null);

export function MatchCenterProvider({ children }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchedOnce = useRef(false);

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
    if (!fetchedOnce.current) {
      fetchedOnce.current = true;
      fetchGames();
    }
    const interval = setInterval(fetchGames, 60_000);
    return () => clearInterval(interval);
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