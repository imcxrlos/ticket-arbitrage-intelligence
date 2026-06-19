import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Ghost — syncOpportunities
 *
 * TWO-TRACK STRATEGY (credit-efficient):
 *
 * TRACK A — Market Intelligence (/match): 1 credit per event.
 *   Used ONLY for the 3 highest-value matches (Final + 2 Semi-Finals).
 *   Returns full cross-market intelligence from TicketsData.
 *
 * TRACK B — Engine Arbitrage (/fetch): FREE / low-cost per event.
 *   Used for up to 15 additional WC2026 matches (Quarter-Finals, R16, etc.)
 *   We fetch raw inventory from multiple platforms independently and run
 *   our own arbitrage engine to compute spreads, scores, and signals.
 *   No Market Intelligence credits consumed.
 */

const TD_BASE = 'https://ticketsdata.com';

// TRACK A — Premium matches only (1 credit each via /match)
const PREMIUM_MATCHES = [
  {
    stubhub_url: 'https://www.stubhub.com/world-cup-east-rutherford-tickets-7-19-2026/event/153020449/',
    match: 'World Cup Final',
    round: 'Final',
    stadium: 'MetLife Stadium',
    city: 'East Rutherford, NJ',
    match_date: '2026-07-19T15:00:00',
  },
  {
    stubhub_url: 'https://www.stubhub.com/world-cup-arlington-tickets-7-14-2026/event/153021542/',
    match: 'World Cup Semi-Final 1',
    round: 'Semi-Final',
    stadium: 'AT&T Stadium',
    city: 'Arlington, TX',
    match_date: '2026-07-14T14:00:00',
  },
  {
    stubhub_url: 'https://www.stubhub.com/world-cup-atlanta-tickets-7-15-2026/event/153023901/',
    match: 'World Cup Semi-Final 2',
    round: 'Semi-Final',
    stadium: 'Mercedes-Benz Stadium',
    city: 'Atlanta, GA',
    match_date: '2026-07-15T15:00:00',
  },
];

// TRACK B — Broader matches via /fetch (our own arbitrage engine, no credits burned)
// Platforms we hit independently: stubhub, ticketmaster, seatgeek, vividseats
const ENGINE_MATCHES = [
  {
    match: 'World Cup Quarter-Final 1',
    round: 'Quarter-Final',
    stadium: 'SoFi Stadium',
    city: 'Los Angeles, CA',
    match_date: '2026-07-09T20:00:00',
    stubhub_url: 'https://www.stubhub.com/world-cup-inglewood-tickets-7-9-2026/event/153020451/',
  },
  {
    match: 'World Cup Quarter-Final 2',
    round: 'Quarter-Final',
    stadium: 'MetLife Stadium',
    city: 'East Rutherford, NJ',
    match_date: '2026-07-10T20:00:00',
    stubhub_url: 'https://www.stubhub.com/world-cup-east-rutherford-tickets-7-10-2026/event/153020452/',
  },
  {
    match: 'World Cup Quarter-Final 3',
    round: 'Quarter-Final',
    stadium: 'AT&T Stadium',
    city: 'Arlington, TX',
    match_date: '2026-07-11T20:00:00',
    stubhub_url: 'https://www.stubhub.com/world-cup-arlington-tickets-7-11-2026/event/153021544/',
  },
  {
    match: 'World Cup Quarter-Final 4',
    round: 'Quarter-Final',
    stadium: 'Mercedes-Benz Stadium',
    city: 'Atlanta, GA',
    match_date: '2026-07-12T20:00:00',
    stubhub_url: 'https://www.stubhub.com/world-cup-atlanta-tickets-7-12-2026/event/153023902/',
  },
  {
    match: 'World Cup Round of 16 — A',
    round: 'Round of 16',
    stadium: 'Arrowhead Stadium',
    city: 'Kansas City, MO',
    match_date: '2026-07-01T20:00:00',
    stubhub_url: 'https://www.stubhub.com/world-cup-kansas-city-tickets-7-1-2026/event/153021550/',
  },
  {
    match: 'World Cup Round of 16 — B',
    round: 'Round of 16',
    stadium: 'Levi\'s Stadium',
    city: 'Santa Clara, CA',
    match_date: '2026-07-02T20:00:00',
    stubhub_url: 'https://www.stubhub.com/world-cup-santa-clara-tickets-7-2-2026/event/153020460/',
  },
  {
    match: 'World Cup Round of 16 — C',
    round: 'Round of 16',
    stadium: 'Rose Bowl',
    city: 'Pasadena, CA',
    match_date: '2026-07-03T20:00:00',
    stubhub_url: 'https://www.stubhub.com/world-cup-pasadena-tickets-7-3-2026/event/153020461/',
  },
  {
    match: 'World Cup Round of 16 — D',
    round: 'Round of 16',
    stadium: 'Hard Rock Stadium',
    city: 'Miami, FL',
    match_date: '2026-07-04T20:00:00',
    stubhub_url: 'https://www.stubhub.com/world-cup-miami-tickets-7-4-2026/event/153023910/',
  },
];

// ── TRACK A: Market Intelligence via /match ──────────────────────────────────

async function tdMatch(username, password, eventUrl) {
  const url = new URL(`${TD_BASE}/match`);
  url.searchParams.set('username', username);
  url.searchParams.set('password', password);
  url.searchParams.set('event_url', eventUrl);

  const res = await fetch(url.toString());
  const data = await res.json();

  if (!res.ok || data.status === 'error') {
    throw new Error(`/match failed for ${eventUrl}: ${JSON.stringify(data)}`);
  }
  return data;
}

function extractFromIntelligence(matchData, meta) {
  const intel = matchData?.fetch_results?.intelligence;
  const summaries = intel?.market_summaries || {};
  const sectionArb = intel?.section_arbitrage || [];

  if (!Object.keys(summaries).length) return null;

  const platformList = Object.entries(summaries).map(([platform, s]) => ({
    platform,
    min_price: s.cheapest_entry_total ?? s.cheapest_entry_prefee ?? s.price_stats?.min ?? 0,
    avg_price: s.price_stats?.median ?? s.price_stats?.avg ?? 0,
    listing_count: s.listing_count ?? 0,
    url: matchData?.matches?.[platform] ?? '',
  })).filter(p => p.min_price > 0);

  if (!platformList.length) return null;

  return buildOpportunity(platformList, meta, sectionArb, 'intelligence');
}

// ── TRACK B: Raw fetch via /fetch + our own engine ───────────────────────────

// Platforms we query independently via /fetch (free)
const FETCH_PLATFORMS = ['stubhub', 'ticketmaster', 'seatgeek', 'vividseats'];

async function tdFetch(username, password, eventUrl, platform) {
  const url = new URL(`${TD_BASE}/fetch`);
  url.searchParams.set('username', username);
  url.searchParams.set('password', password);
  url.searchParams.set('event_url', eventUrl);
  url.searchParams.set('platform', platform);

  const res = await fetch(url.toString());
  if (!res.ok) return null;

  const data = await res.json();
  if (data.status === 'error' || !data.tickets?.length) return null;

  return data;
}

function parseFetchData(platform, data, sourceUrl) {
  const tickets = data?.tickets || [];
  if (!tickets.length) return null;

  const prices = tickets
    .map(t => t.price_with_fees ?? t.price ?? 0)
    .filter(p => p > 0)
    .sort((a, b) => a - b);

  if (!prices.length) return null;

  const min_price = prices[0];
  const avg_price = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);

  return {
    platform,
    min_price,
    avg_price,
    listing_count: tickets.length,
    url: sourceUrl,
  };
}

async function fetchAllPlatforms(username, password, meta) {
  const results = [];

  // Sequential to avoid hammering the API
  for (const platform of FETCH_PLATFORMS) {
    try {
      const data = await tdFetch(username, password, meta.stubhub_url, platform);
      if (!data) continue;

      const parsed = parseFetchData(platform, data, meta.stubhub_url);
      if (parsed) results.push(parsed);
    } catch (err) {
      console.log(`[Ghost/Engine] ${platform} fetch failed for ${meta.match}: ${err.message}`);
    }
  }

  return results;
}

// ── Shared arbitrage engine (used by both tracks) ────────────────────────────

function buildOpportunity(platformList, meta, sectionArb = [], source = 'engine') {
  platformList.sort((a, b) => a.min_price - b.min_price);
  const cheapest = platformList[0];
  const priciest = platformList[platformList.length - 1];

  const currentPrice = cheapest.min_price;
  const highestPrice = priciest.min_price;

  const allAvgs = platformList.filter(p => p.avg_price > 0).map(p => p.avg_price);
  const marketAvg = allAvgs.length
    ? Math.round(allAvgs.reduce((a, b) => a + b, 0) / allAvgs.length)
    : Math.round(platformList.map(p => p.min_price).reduce((a, b) => a + b, 0) / platformList.length);

  const discountVsAvg = marketAvg > 0 ? Math.round(((marketAvg - currentPrice) / marketAvg) * 100) : 0;
  const discountVsHighest = highestPrice > currentPrice
    ? Math.round(((highestPrice - currentPrice) / highestPrice) * 100)
    : 0;

  let topSection = null;
  if (sectionArb.length > 0) {
    const sorted = [...sectionArb].sort((a, b) => (b.spread_pct ?? 0) - (a.spread_pct ?? 0));
    topSection = sorted[0];
  }

  const signalType = platformList.length >= 2 ? 'Arbitrage' : 'Price Analysis';

  const roundPts = { 'Final': 35, 'Semi-Final': 28, 'Quarter-Final': 22, 'Round of 16': 16, 'Round of 32': 12, 'Third Place': 10, 'Group Stage': 5 };
  const spreadScore = Math.min(discountVsHighest * 0.8, 30);
  const platformBonus = Math.min((platformList.length - 1) * 8, 20);
  const roundScore = roundPts[meta.round] || 5;
  const opportunityScore = Math.min(Math.round(spreadScore + platformBonus + roundScore), 99);

  const demandMap = { 'Final': 'Ultra High', 'Semi-Final': 'Ultra High', 'Quarter-Final': 'High', 'Round of 16': 'Medium', 'Round of 32': 'Medium', 'Group Stage': 'Low' };

  const marketSummariesPayload = platformList.map(p => ({
    platform: p.platform,
    min_price: p.min_price,
    avg_price: p.avg_price,
    listing_count: p.listing_count,
    url: p.url,
  }));

  if (topSection) marketSummariesPayload.push({ section_arbitrage: topSection });

  return {
    match: meta.match,
    stadium: meta.stadium,
    city: meta.city,
    match_date: new Date(meta.match_date).toISOString(),
    round: meta.round,
    demand_tier: demandMap[meta.round] || 'Medium',
    signal_type: signalType,
    current_price: Math.round(currentPrice),
    market_value: marketAvg,
    highest_price: Math.round(highestPrice),
    discount_pct: discountVsAvg,
    vs_highest_pct: discountVsHighest,
    opportunity_score: opportunityScore,
    source: cheapest.platform,
    source_url: cheapest.url || meta.stubhub_url,
    best_platform: cheapest.platform,
    worst_platform: priciest.platform,
    platforms_compared: platformList.length,
    market_summaries: JSON.stringify(marketSummariesPayload),
    quantity_available: platformList.reduce((s, p) => s + (p.listing_count || 0), 0),
    category: 'Category 1',
    is_active: true,
    last_scanned: new Date().toISOString(),
  };
}

// ── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow scheduler (no user) or admin only
    try {
      const user = await base44.auth.me();
      if (user && user.role !== 'admin') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
    } catch { /* scheduler call — allow */ }

    const tdUser = Deno.env.get('TICKETSDATA_USERNAME');
    const tdPass = Deno.env.get('TICKETSDATA_PASSWORD');
    if (!tdUser || !tdPass) {
      return Response.json({ error: 'TICKETSDATA credentials not configured' }, { status: 500 });
    }

    const opportunities = [];
    const errors = [];
    let reportsRemaining = null;

    // ── TRACK A: Market Intelligence for premium matches ──
    console.log('[Ghost] === TRACK A: Market Intelligence ===');
    for (const matchMeta of PREMIUM_MATCHES) {
      try {
        console.log(`[Ghost/Intel] Fetching /match: ${matchMeta.match}`);
        const matchData = await tdMatch(tdUser, tdPass, matchMeta.stubhub_url);

        if (matchData.reports_remaining !== undefined) {
          reportsRemaining = matchData.reports_remaining;
        }

        const opp = extractFromIntelligence(matchData, matchMeta);
        if (!opp) {
          errors.push({ match: matchMeta.match, reason: 'no_price_data_in_response', track: 'A' });
          continue;
        }

        opportunities.push(opp);
        console.log(`[Ghost/Intel] ${matchMeta.match}: ${opp.platforms_compared} platforms, best $${opp.current_price}, spread ${opp.vs_highest_pct}%`);
      } catch (err) {
        errors.push({ match: matchMeta.match, error: err.message, track: 'A' });
        console.error(`[Ghost/Intel] Error for ${matchMeta.match}: ${err.message}`);
      }
    }

    // ── TRACK B: Engine arbitrage for broader matches ──
    console.log('[Ghost] === TRACK B: Engine Arbitrage ===');
    for (const matchMeta of ENGINE_MATCHES) {
      try {
        console.log(`[Ghost/Engine] Fetching platforms for: ${matchMeta.match}`);
        const platformList = await fetchAllPlatforms(tdUser, tdPass, matchMeta);

        if (platformList.length < 2) {
          errors.push({ match: matchMeta.match, reason: `only_${platformList.length}_platform(s)_found`, track: 'B' });
          continue;
        }

        const opp = buildOpportunity(platformList, matchMeta);
        opportunities.push(opp);
        console.log(`[Ghost/Engine] ${matchMeta.match}: ${opp.platforms_compared} platforms, best $${opp.current_price}, spread ${opp.vs_highest_pct}%`);
      } catch (err) {
        errors.push({ match: matchMeta.match, error: err.message, track: 'B' });
        console.error(`[Ghost/Engine] Error for ${matchMeta.match}: ${err.message}`);
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
      opportunities_saved: opportunities.length,
      track_a_count: opportunities.filter(o => PREMIUM_MATCHES.some(m => m.match === o.match)).length,
      track_b_count: opportunities.filter(o => ENGINE_MATCHES.some(m => m.match === o.match)).length,
      arbitrage_signals: opportunities.filter(o => o.signal_type === 'Arbitrage').length,
      errors: errors.length,
      error_list: errors,
      reports_remaining: reportsRemaining,
      opportunities: opportunities.map(o => ({
        match: o.match,
        track: PREMIUM_MATCHES.some(m => m.match === o.match) ? 'A (Intelligence)' : 'B (Engine)',
        platforms: o.platforms_compared,
        best_price: o.current_price,
        best_platform: o.best_platform,
        spread_pct: o.vs_highest_pct,
        score: o.opportunity_score,
      })),
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});