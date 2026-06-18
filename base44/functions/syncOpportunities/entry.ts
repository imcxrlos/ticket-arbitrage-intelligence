import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Ghost — syncOpportunities (Market Intelligence Edition)
 *
 * Uses TicketsData /match endpoint — 1 credit per event, fetches ALL platforms
 * simultaneously and returns full cross-market arbitrage intelligence.
 *
 * 3 reports used for the 3 highest-value WC2026 matches:
 *   1. Final — MetLife Stadium, East Rutherford NJ (Jul 19)
 *   2. Semi-Final 1 — AT&T Stadium, Arlington TX (Jul 14)
 *   3. Semi-Final 2 — Mercedes-Benz Stadium, Atlanta GA (Jul 15)
 */

const TD_BASE = 'https://ticketsdata.com';

// 3 premium WC2026 matches with confirmed StubHub event URLs
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

function extractOpportunity(matchData, meta) {
  const intel = matchData?.fetch_results?.intelligence;
  const snapshot = intel?.cross_market_snapshot;
  const summaries = intel?.market_summaries || {};
  const sectionArb = intel?.section_arbitrage || [];
  const recs = intel?.recommendations || {};

  if (!snapshot && !Object.keys(summaries).length) return null;

  // Build per-platform summaries array
  const platformList = Object.entries(summaries).map(([platform, s]) => ({
    platform,
    min_price: s.cheapest_entry_total ?? s.cheapest_entry_prefee ?? s.price_stats?.min ?? 0,
    avg_price: s.price_stats?.median ?? s.price_stats?.avg ?? 0,
    listing_count: s.listing_count ?? 0,
    url: matchData?.matches?.[platform] ?? '',
  })).filter(p => p.min_price > 0);

  if (!platformList.length) return null;

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

  // Find best section arbitrage spread if available
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

  // Enhanced market summaries with section arb data
  const marketSummariesPayload = platformList.map(p => ({
    platform: p.platform,
    min_price: p.min_price,
    avg_price: p.avg_price,
    listing_count: p.listing_count,
    url: p.url,
  }));

  if (topSection) {
    marketSummariesPayload.push({
      section_arbitrage: topSection,
    });
  }

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

    // Process sequentially to avoid rate-limiting — 1 report per match
    for (const matchMeta of PREMIUM_MATCHES) {
      try {
        console.log(`[Ghost] Fetching /match for: ${matchMeta.match}`);
        const matchData = await tdMatch(tdUser, tdPass, matchMeta.stubhub_url);

        // Capture remaining quota from last response
        if (matchData.reports_remaining !== undefined) {
          reportsRemaining = matchData.reports_remaining;
        }

        const opp = extractOpportunity(matchData, matchMeta);
        if (!opp) {
          errors.push({ match: matchMeta.match, reason: 'no_price_data_in_response' });
          continue;
        }

        opportunities.push(opp);
        console.log(`[Ghost] ${matchMeta.match}: ${opp.platforms_compared} platforms, best $${opp.current_price} (${opp.best_platform}), spread ${opp.vs_highest_pct}%`);
      } catch (err) {
        errors.push({ match: matchMeta.match, error: err.message });
        console.error(`[Ghost] Error for ${matchMeta.match}: ${err.message}`);
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
      arbitrage_signals: opportunities.filter(o => o.signal_type === 'Arbitrage').length,
      errors: errors.length,
      error_list: errors,
      reports_remaining: reportsRemaining,
      opportunities: opportunities.map(o => ({
        match: o.match,
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