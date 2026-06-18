import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Ghost — syncOpportunities (v4: TM + SeatGeek free APIs)
 *
 * Sources:
 *   1. Ticketmaster Discovery API (free, keyed) — TM resale listings
 *   2. SeatGeek public API (free, no auth) — SG resale listings
 *   [3. TicketsData /match (dormant — re-enable when new account is ready)]
 *
 * Arbitrage = both TM + SG have live data → real cross-platform spread
 * Price Analysis = only one platform returned data
 */

const TM_BASE = 'https://app.ticketmaster.com/discovery/v2';
const SG_BASE = 'https://api.seatgeek.com/2';

// WC2026 matches with known TM event IDs + SeatGeek search terms
const WC2026_MATCHES = [
  { match: "Canada vs Qatar", stadium: "BC Place Stadium", city: "Vancouver, BC", date: "2026-06-18", group: "B", round: "Group Stage", tm_id: "1AtZAzp6k_Z175W", sg_query: "FIFA World Cup Vancouver June 18 2026" },
  { match: "Czech Republic vs South Africa", stadium: "Mercedes-Benz Stadium", city: "Atlanta, GA", date: "2026-06-18", group: "A", round: "Group Stage", tm_id: "1AtZAzp6k_Z175U", sg_query: "FIFA World Cup Atlanta June 18 2026" },
  { match: "Switzerland vs Bosnia and Herzegovina", stadium: "SoFi Stadium", city: "Los Angeles, CA", date: "2026-06-18", group: "B", round: "Group Stage", tm_id: "1AtZAzp6k_Z175V", sg_query: "FIFA World Cup Los Angeles June 18 2026" },
  { match: "United States vs Australia", stadium: "Lumen Field", city: "Seattle, WA", date: "2026-06-19", group: "D", round: "Group Stage", tm_id: "1AtZAzp6k_Z175Y", sg_query: "FIFA World Cup Seattle June 19 2026" },
  { match: "Brazil vs Haiti", stadium: "Lincoln Financial Field", city: "Philadelphia, PA", date: "2026-06-19", group: "C", round: "Group Stage", tm_id: "1AtZAzp6k_Z175X", sg_query: "FIFA World Cup Philadelphia June 19 2026" },
  { match: "Scotland vs Morocco", stadium: "Gillette Stadium", city: "Boston, MA", date: "2026-06-19", group: "C", round: "Group Stage", tm_id: "1AtZAzp6k_Z175Z", sg_query: "FIFA World Cup Boston June 19 2026" },
  { match: "Turkey vs Paraguay", stadium: "Levi's Stadium", city: "San Francisco, CA", date: "2026-06-19", group: "D", round: "Group Stage", tm_id: "1AtZAzp6k_Z1760", sg_query: "FIFA World Cup San Francisco June 19 2026" },
  { match: "Germany vs Côte d'Ivoire", stadium: "BMO Field", city: "Toronto, ON", date: "2026-06-20", group: "E", round: "Group Stage", tm_id: "1AtZAzp6k_Z1761", sg_query: "FIFA World Cup Toronto June 20 2026" },
  { match: "Netherlands vs Sweden", stadium: "NRG Stadium", city: "Houston, TX", date: "2026-06-20", group: "F", round: "Group Stage", tm_id: "1AtZAzp6k_Z1763", sg_query: "FIFA World Cup Houston June 20 2026" },
  { match: "Ecuador vs Curaçao", stadium: "GEHA Field at Arrowhead", city: "Kansas City, MO", date: "2026-06-20", group: "E", round: "Group Stage", tm_id: "1AtZAzp6k_Z1762", sg_query: "FIFA World Cup Kansas City June 20 2026" },
  { match: "Belgium vs Iran", stadium: "SoFi Stadium", city: "Los Angeles, CA", date: "2026-06-21", group: "G", round: "Group Stage", tm_id: "1AtZAzp6k_Z1767", sg_query: "FIFA World Cup Los Angeles June 21 2026" },
  { match: "Spain vs Saudi Arabia", stadium: "Mercedes-Benz Stadium", city: "Atlanta, GA", date: "2026-06-21", group: "H", round: "Group Stage", tm_id: "1AtZAzp6k_Z1766", sg_query: "FIFA World Cup Atlanta June 21 2026" },
  { match: "Uruguay vs Cabo Verde", stadium: "Hard Rock Stadium", city: "Miami, FL", date: "2026-06-21", group: "H", round: "Group Stage", tm_id: "1AtZAzp6k_Z1765", sg_query: "FIFA World Cup Miami June 21 2026" },
  { match: "Argentina vs Austria", stadium: "AT&T Stadium", city: "Dallas, TX", date: "2026-06-22", group: "J", round: "Group Stage", tm_id: "1AtZAzp6k_Z176a", sg_query: "FIFA World Cup Dallas June 22 2026" },
  { match: "France vs Iraq", stadium: "Lincoln Financial Field", city: "Philadelphia, PA", date: "2026-06-22", group: "I", round: "Group Stage", tm_id: "1AtZAzp6k_Z1769", sg_query: "FIFA World Cup Philadelphia June 22 2026" },
  { match: "Norway vs Senegal", stadium: "MetLife Stadium", city: "New York, NY", date: "2026-06-22", group: "I", round: "Group Stage", tm_id: "1AtZAzp6k_Z1768", sg_query: "FIFA World Cup New York June 22 2026" },
  { match: "Portugal vs Uzbekistan", stadium: "NRG Stadium", city: "Houston, TX", date: "2026-06-23", group: "K", round: "Group Stage", tm_id: "1AtZAzp6k_Z176d", sg_query: "FIFA World Cup Houston June 23 2026" },
  { match: "England vs Ghana", stadium: "Gillette Stadium", city: "Boston, MA", date: "2026-06-23", group: "L", round: "Group Stage", tm_id: "1AtZAzp6k_Z176b", sg_query: "FIFA World Cup Boston June 23 2026" },
  { match: "Colombia vs DR Congo", stadium: "Estadio Akron", city: "Guadalajara, MX", date: "2026-06-23", group: "K", round: "Group Stage", tm_id: "1AtZAzp6k_Z176e", sg_query: "FIFA World Cup Guadalajara June 23 2026" },
  { match: "Argentina vs Brazil", stadium: "AT&T Stadium", city: "Dallas, TX", date: "2026-06-28", group: "J", round: "Group Stage", tm_id: null, sg_query: "FIFA World Cup Dallas June 28 2026" },
  { match: "USA vs Mexico", stadium: "SoFi Stadium", city: "Los Angeles, CA", date: "2026-06-29", group: "D", round: "Group Stage", tm_id: null, sg_query: "FIFA World Cup Los Angeles June 29 2026" },
  { match: "Quarter-Final - Match 97", stadium: "MetLife Stadium", city: "New York, NY", date: "2026-07-10", group: null, round: "Quarter-Final", tm_id: "1AtZAzp6k_Z176w", sg_query: "FIFA World Cup New York July 10 2026" },
  { match: "Quarter-Final - Match 98", stadium: "AT&T Stadium", city: "Dallas, TX", date: "2026-07-11", group: null, round: "Quarter-Final", tm_id: "1AtZAzp6k_Z176x", sg_query: "FIFA World Cup Dallas July 11 2026" },
  { match: "Semi-Final - Match 105", stadium: "AT&T Stadium", city: "Dallas, TX", date: "2026-07-14", group: null, round: "Semi-Final", tm_id: "1AtZAzp6k_Z1772", sg_query: "FIFA World Cup Semi Final Dallas July 14 2026" },
  { match: "Semi-Final - Match 106", stadium: "MetLife Stadium", city: "New York, NY", date: "2026-07-15", group: null, round: "Semi-Final", tm_id: "1AtZAzp6k_Z1773", sg_query: "FIFA World Cup Semi Final New York July 15 2026" },
  { match: "FIFA World Cup 2026 Final", stadium: "MetLife Stadium", city: "New York, NY", date: "2026-07-19", group: null, round: "Final", tm_id: "1AtZAzp6k_Z1777", sg_query: "FIFA World Cup Final New York July 19 2026" },
];

async function fetchTM(tmId, apiKey) {
  if (!tmId) return null;
  try {
    const url = `${TM_BASE}/events/${tmId}?apikey=${apiKey}&includeLicensedContent=yes`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    // TM price ranges come from priceRanges array
    const prices = data.priceRanges;
    if (!prices || prices.length === 0) return null;
    const mins = prices.map(p => p.min).filter(Boolean);
    const maxs = prices.map(p => p.max).filter(Boolean);
    if (mins.length === 0) return null;
    return {
      platform: 'ticketmaster',
      min_price: Math.min(...mins),
      avg_price: (Math.min(...mins) + Math.max(...maxs)) / 2,
      max_price: Math.max(...maxs),
      listing_count: null,
      url: data.url || null,
    };
  } catch {
    return null;
  }
}

async function fetchSG(sgQuery) {
  try {
    const encoded = encodeURIComponent(sgQuery);
    const url = `${SG_BASE}/events?q=${encoded}&type=sports&per_page=5`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const events = data.events || [];
    if (events.length === 0) return null;
    // Pick the best matching event (first result)
    const ev = events[0];
    const stats = ev.stats;
    if (!stats || !stats.lowest_price) return null;
    return {
      platform: 'seatgeek',
      min_price: stats.lowest_price,
      avg_price: stats.average_price || stats.lowest_price,
      max_price: stats.highest_price || stats.lowest_price,
      listing_count: stats.listing_count || null,
      url: ev.url || null,
    };
  } catch {
    return null;
  }
}

// ── TICKETSDATA (dormant — re-enable when new account is ready) ──
// async function fetchTD(seedUrl, username, password) {
//   const url = new URL('https://ticketsdata.com/match');
//   url.searchParams.set('username', username);
//   url.searchParams.set('password', password);
//   url.searchParams.set('event_url', seedUrl);
//   const res = await fetch(url.toString());
//   const data = await res.json();
//   if (!data || (data.status !== 'success' && data.status !== 200)) return null;
//   // parse platform summaries from data.fetch_results.intelligence.market_summaries
//   return data;
// }

function computeOpportunity(summaries, ev) {
  const withPrice = summaries.filter(s => s && s.min_price && s.min_price > 0);
  if (withPrice.length === 0) return null;

  withPrice.sort((a, b) => a.min_price - b.min_price);

  const cheapest = withPrice[0];
  const mostExpensive = withPrice[withPrice.length - 1];
  const allMins = withPrice.map(s => s.min_price);
  const allAvgs = withPrice.filter(s => s.avg_price).map(s => s.avg_price);

  const currentPrice = Math.round(cheapest.min_price);
  const highestPrice = Math.round(mostExpensive.min_price);
  const marketAvg = allAvgs.length > 0
    ? Math.round(allAvgs.reduce((a, b) => a + b, 0) / allAvgs.length)
    : Math.round(allMins.reduce((a, b) => a + b, 0) / allMins.length);

  const discountVsAvg = marketAvg > 0 ? Math.round(((marketAvg - currentPrice) / marketAvg) * 100) : 0;
  const discountVsHighest = highestPrice > currentPrice ? Math.round(((highestPrice - currentPrice) / highestPrice) * 100) : 0;

  const signalType = withPrice.length >= 2 ? "Arbitrage" : "Price Analysis";

  const roundPts = { "Final": 35, "Semi-Final": 28, "Quarter-Final": 22, "Round of 16": 16, "Round of 32": 12, "Third Place": 10, "Group Stage": 5 };
  const spreadScore = Math.min(discountVsHighest * 0.8, 30);
  const platformBonus = Math.min((withPrice.length - 1) * 8, 20);
  const roundScore = roundPts[ev.round] || 5;
  const score = Math.min(Math.round(spreadScore + platformBonus + roundScore), 99);

  const totalListings = withPrice.reduce((a, s) => a + (s.listing_count || 0), 0);
  const demandTier = ev.round === 'Final' || ev.round === 'Semi-Final' ? 'Ultra High'
    : ev.round === 'Quarter-Final' ? 'High'
    : withPrice.length >= 2 ? 'Medium'
    : 'Low';

  return {
    signal_type: signalType,
    current_price: currentPrice,
    market_value: marketAvg,
    highest_price: highestPrice,
    discount_pct: discountVsAvg,
    vs_highest_pct: discountVsHighest,
    opportunity_score: score,
    source: cheapest.platform,
    source_url: cheapest.url,
    best_platform: cheapest.platform,
    worst_platform: mostExpensive.platform,
    platforms_compared: withPrice.length,
    market_summaries: JSON.stringify(withPrice),
    quantity_available: totalListings,
    demand_tier: demandTier,
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    try {
      const user = await base44.auth.me();
      if (user && user.role !== 'admin') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
    } catch { /* scheduler call — allow */ }

    const tmApiKey = Deno.env.get('TICKETMASTER_API_KEY');
    if (!tmApiKey) {
      return Response.json({ error: 'TICKETMASTER_API_KEY not configured' }, { status: 500 });
    }

    let body = {};
    try { body = await req.json(); } catch { /* no body */ }
    const limit = body.limit ? Math.min(body.limit, WC2026_MATCHES.length) : WC2026_MATCHES.length;
    const toProcess = WC2026_MATCHES.slice(0, limit);

    const opportunities = [];
    let matchErrors = 0;
    const debugErrors = [];

    for (const ev of toProcess) {
      try {
        // Fetch both platforms in parallel (free APIs, no credit cost)
        const [tmData, sgData] = await Promise.all([
          fetchTM(ev.tm_id, tmApiKey),
          fetchSG(ev.sg_query),
        ]);

        const summaries = [tmData, sgData].filter(Boolean);
        const oppData = computeOpportunity(summaries, ev);

        if (!oppData) {
          debugErrors.push({ match: ev.match, reason: 'no_price_data', tm: !!tmData, sg: !!sgData });
          matchErrors++;
          continue;
        }

        opportunities.push({
          match: ev.match,
          stadium: ev.stadium,
          city: ev.city,
          match_date: new Date(ev.date).toISOString(),
          category: 'Category 1',
          group: ev.group || null,
          round: ev.round,
          is_active: true,
          last_scanned: new Date().toISOString(),
          ...oppData,
        });
      } catch (err) {
        debugErrors.push({ match: ev.match, error: err.message });
        matchErrors++;
      }
    }

    opportunities.sort((a, b) => b.opportunity_score - a.opportunity_score);

    // Replace all existing records
    const svc = base44.asServiceRole;
    const existing = await svc.entities.TicketOpportunity.list();
    for (const e of existing) {
      await svc.entities.TicketOpportunity.delete(e.id);
    }
    for (const opp of opportunities) {
      await svc.entities.TicketOpportunity.create(opp);
    }

    return Response.json({
      success: true,
      matches_processed: toProcess.length,
      opportunities_saved: opportunities.length,
      arbitrage_signals: opportunities.filter(o => o.signal_type === 'Arbitrage').length,
      price_analysis_signals: opportunities.filter(o => o.signal_type === 'Price Analysis').length,
      match_errors: matchErrors,
      debug_errors: debugErrors,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});