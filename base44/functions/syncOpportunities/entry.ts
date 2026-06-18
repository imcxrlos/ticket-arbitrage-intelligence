import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Ghost — syncOpportunities (v3: Real Cross-Market Arbitrage)
 *
 * Uses TicketsData /match endpoint for true cross-platform price intelligence.
 * - Discovers the same event across all 9 marketplaces automatically
 * - Returns per-platform: min price, avg price, listing count
 * - Computes real arbitrage spread (cheapest vs most expensive platform)
 * - Labels signal as "Arbitrage" only when 2+ platforms have live data
 * - Otherwise labels as "Price Analysis"
 *
 * Events processed sequentially to avoid HTTP concurrency stall bug.
 * Credits: 12 per match (TicketsData /match = Pro plan)
 */

const MATCH_ENDPOINT = 'https://ticketsdata.com/match';

// WC2026 matches with at least one known marketplace URL (StubHub as seed)
// /match auto-discovers the same event on all other platforms
const WC2026_MATCHES = [
  { match: "Canada vs Qatar", stadium: "BC Place Stadium", city: "Vancouver, BC", date: "2026-06-18", group: "B", round: "Group Stage", seed_url: "https://www.stubhub.com/fifa-world-cup-2026-vancouver-tickets-6-18-2026/event/153033405/" },
  { match: "Czech Republic vs South Africa", stadium: "Mercedes-Benz Stadium", city: "Atlanta, GA", date: "2026-06-18", group: "A", round: "Group Stage", seed_url: "https://www.stubhub.com/fifa-world-cup-2026-atlanta-tickets-6-18-2026/event/153033403/" },
  { match: "Switzerland vs Bosnia and Herzegovina", stadium: "SoFi Stadium", city: "Los Angeles, CA", date: "2026-06-18", group: "B", round: "Group Stage", seed_url: "https://www.stubhub.com/fifa-world-cup-2026-los-angeles-tickets-6-18-2026/event/153033406/" },
  { match: "United States vs Australia", stadium: "Lumen Field", city: "Seattle, WA", date: "2026-06-19", group: "D", round: "Group Stage", seed_url: "https://www.stubhub.com/fifa-world-cup-2026-seattle-tickets-6-19-2026/event/153033410/" },
  { match: "Brazil vs Haiti", stadium: "Lincoln Financial Field", city: "Philadelphia, PA", date: "2026-06-19", group: "C", round: "Group Stage", seed_url: "https://www.stubhub.com/fifa-world-cup-2026-philadelphia-tickets-6-19-2026/event/153033408/" },
  { match: "Scotland vs Morocco", stadium: "Gillette Stadium", city: "Boston, MA", date: "2026-06-19", group: "C", round: "Group Stage", seed_url: "https://www.stubhub.com/fifa-world-cup-2026-boston-tickets-6-19-2026/event/153033409/" },
  { match: "Turkey vs Paraguay", stadium: "Levi's Stadium", city: "San Francisco, CA", date: "2026-06-19", group: "D", round: "Group Stage", seed_url: "https://www.stubhub.com/fifa-world-cup-2026-san-francisco-tickets-6-19-2026/event/153033411/" },
  { match: "Germany vs Côte d'Ivoire", stadium: "BMO Field", city: "Toronto, ON", date: "2026-06-20", group: "E", round: "Group Stage", seed_url: "https://www.stubhub.com/fifa-world-cup-2026-toronto-tickets-6-20-2026/event/153033412/" },
  { match: "Netherlands vs Sweden", stadium: "NRG Stadium", city: "Houston, TX", date: "2026-06-20", group: "F", round: "Group Stage", seed_url: "https://www.stubhub.com/fifa-world-cup-2026-houston-tickets-6-20-2026/event/153033414/" },
  { match: "Ecuador vs Curaçao", stadium: "GEHA Field at Arrowhead", city: "Kansas City, MO", date: "2026-06-20", group: "E", round: "Group Stage", seed_url: "https://www.stubhub.com/fifa-world-cup-2026-kansas-city-tickets-6-20-2026/event/153033413/" },
  { match: "Belgium vs Iran", stadium: "SoFi Stadium", city: "Los Angeles, CA", date: "2026-06-21", group: "G", round: "Group Stage", seed_url: "https://www.stubhub.com/fifa-world-cup-2026-los-angeles-tickets-6-21-2026/event/153033418/" },
  { match: "Spain vs Saudi Arabia", stadium: "Mercedes-Benz Stadium", city: "Atlanta, GA", date: "2026-06-21", group: "H", round: "Group Stage", seed_url: "https://www.stubhub.com/fifa-world-cup-2026-atlanta-tickets-6-21-2026/event/153033417/" },
  { match: "Uruguay vs Cabo Verde", stadium: "Hard Rock Stadium", city: "Miami, FL", date: "2026-06-21", group: "H", round: "Group Stage", seed_url: "https://www.stubhub.com/fifa-world-cup-2026-miami-tickets-6-21-2026/event/153033416/" },
  { match: "Argentina vs Austria", stadium: "AT&T Stadium", city: "Dallas, TX", date: "2026-06-22", group: "J", round: "Group Stage", seed_url: "https://www.stubhub.com/fifa-world-cup-2026-dallas-tickets-6-22-2026/event/153033421/" },
  { match: "France vs Iraq", stadium: "Lincoln Financial Field", city: "Philadelphia, PA", date: "2026-06-22", group: "I", round: "Group Stage", seed_url: "https://www.stubhub.com/fifa-world-cup-2026-philadelphia-tickets-6-22-2026/event/153033420/" },
  { match: "Norway vs Senegal", stadium: "MetLife Stadium", city: "New York, NY", date: "2026-06-22", group: "I", round: "Group Stage", seed_url: "https://www.stubhub.com/fifa-world-cup-2026-new-york-tickets-6-22-2026/event/153033419/" },
  { match: "Portugal vs Uzbekistan", stadium: "NRG Stadium", city: "Houston, TX", date: "2026-06-23", group: "K", round: "Group Stage", seed_url: "https://www.stubhub.com/fifa-world-cup-2026-houston-tickets-6-23-2026/event/153033424/" },
  { match: "England vs Ghana", stadium: "Gillette Stadium", city: "Boston, MA", date: "2026-06-23", group: "L", round: "Group Stage", seed_url: "https://www.stubhub.com/fifa-world-cup-2026-boston-tickets-6-23-2026/event/153033422/" },
  { match: "Colombia vs DR Congo", stadium: "Estadio Akron", city: "Guadalajara, MX", date: "2026-06-23", group: "K", round: "Group Stage", seed_url: "https://www.stubhub.com/fifa-world-cup-2026-guadalajara-tickets-6-23-2026/event/153033425/" },
  { match: "Turkey vs United States", stadium: "SoFi Stadium", city: "Los Angeles, CA", date: "2026-06-25", group: "D", round: "Group Stage", seed_url: "https://www.stubhub.com/fifa-world-cup-2026-los-angeles-tickets-6-25-2026/event/153033434/" },
  { match: "Ecuador vs Germany", stadium: "MetLife Stadium", city: "New York, NY", date: "2026-06-25", group: "E", round: "Group Stage", seed_url: "https://www.stubhub.com/fifa-world-cup-2026-new-york-tickets-6-25-2026/event/153033432/" },
  { match: "Norway vs France", stadium: "Gillette Stadium", city: "Boston, MA", date: "2026-06-26", group: "I", round: "Group Stage", seed_url: "https://www.stubhub.com/fifa-world-cup-2026-boston-tickets-6-26-2026/event/153033438/" },
  { match: "Uruguay vs Spain", stadium: "Estadio Akron", city: "Guadalajara, MX", date: "2026-06-26", group: "H", round: "Group Stage", seed_url: "https://www.stubhub.com/fifa-world-cup-2026-guadalajara-tickets-6-26-2026/event/153033443/" },
  { match: "Quarter-Final - Match 97", stadium: "MetLife Stadium", city: "New York, NY", date: "2026-07-10", group: null, round: "Quarter-Final", seed_url: "https://www.stubhub.com/fifa-world-cup-2026-new-york-tickets-7-10-2026/event/153033473/" },
  { match: "Semi-Final - Match 105", stadium: "AT&T Stadium", city: "Dallas, TX", date: "2026-07-14", group: null, round: "Semi-Final", seed_url: "https://www.stubhub.com/fifa-world-cup-2026-dallas-tickets-7-14-2026/event/153033479/" },
  { match: "Semi-Final - Match 106", stadium: "MetLife Stadium", city: "New York, NY", date: "2026-07-15", group: null, round: "Semi-Final", seed_url: "https://www.stubhub.com/fifa-world-cup-2026-new-york-tickets-7-15-2026/event/153033480/" },
  { match: "FIFA World Cup 2026 Final", stadium: "MetLife Stadium", city: "New York, NY", date: "2026-07-19", group: null, round: "Final", seed_url: "https://www.stubhub.com/fifa-world-cup-2026-new-york-tickets-7-19-2026/event/153033484/" },
];

function parsePlatformSummaries(matchResult) {
  const summaries = [];
  const intel = matchResult?.fetch_results?.intelligence?.market_summaries || {};
  const matches = matchResult?.matches || {};

  for (const [platform, summary] of Object.entries(intel)) {
    if (!summary || summary.listing_count === 0) continue;
    summaries.push({
      platform,
      min_price: summary.cheapest_entry_total ?? summary.cheapest_entry_prefee ?? null,
      avg_price: summary.price_stats?.median ?? summary.price_stats?.mean ?? null,
      max_price: summary.price_stats?.max ?? null,
      listing_count: summary.listing_count ?? 0,
      url: matches[platform] ?? null,
    });
  }
  return summaries;
}

function computeOpportunity(summaries, ev) {
  if (summaries.length === 0) return null;

  // Sort by min price ascending
  const withPrice = summaries.filter(s => s.min_price && s.min_price > 0);
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

  // Score: weighted on spread size, platforms compared, and round prestige
  const roundPts = { "Final": 35, "Semi-Final": 28, "Quarter-Final": 22, "Round of 16": 16, "Round of 32": 12, "Third Place": 10, "Group Stage": 5 };
  const spreadScore = Math.min(discountVsHighest * 0.8, 30);
  const platformBonus = Math.min((withPrice.length - 1) * 5, 20);
  const roundScore = roundPts[ev.round] || 5;
  const score = Math.min(Math.round(spreadScore + platformBonus + roundScore), 99);

  const totalListings = withPrice.reduce((a, s) => a + (s.listing_count || 0), 0);
  const demandTier = ev.round === 'Final' || ev.round === 'Semi-Final' ? 'Ultra High'
    : ev.round === 'Quarter-Final' ? 'High'
    : withPrice.length >= 4 ? 'High'
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
    market_summaries: JSON.stringify(summaries),
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

    const username = Deno.env.get('TICKETSDATA_USERNAME');
    const password = Deno.env.get('TICKETSDATA_PASSWORD');
    console.log('Credentials check — username set:', !!username, 'password set:', !!password);
    if (!username || !password) {
      return Response.json({ error: 'Credentials not configured' }, { status: 500 });
    }

    // Parse optional limit param
    let body = {};
    try { body = await req.json(); } catch { /* no body */ }
    const limit = body.limit ? Math.min(body.limit, WC2026_MATCHES.length) : WC2026_MATCHES.length;
    const toProcess = WC2026_MATCHES.slice(0, limit);

    const opportunities = [];
    let matchErrors = 0;
    let creditsUsed = 0;
    const debugErrors = [];

    // Process SEQUENTIALLY to avoid HTTP stall bug in Deno Workers
    for (const ev of toProcess) {
      try {
        const url = new URL(MATCH_ENDPOINT);
        url.searchParams.set('username', username);
        url.searchParams.set('password', password);
        url.searchParams.set('event_url', ev.seed_url);

        let res, data;
        try {
          res = await fetch(url.toString());
          data = await res.json();
          creditsUsed += 12;
        } catch (fetchErr) {
          debugErrors.push({ match: ev.match, stage: 'fetch', error: String(fetchErr) });
          matchErrors++;
          continue;
        }

        if (!data || (data.status !== 'success' && data.status !== 200)) {
          debugErrors.push({ match: ev.match, stage: 'api_response', http: res?.status, api_status: data?.status, api_error: data?.error || data?.message, raw: JSON.stringify(data).slice(0, 300) });
          matchErrors++;
          continue;
        }

        const summaries = parsePlatformSummaries(data);
        const oppData = computeOpportunity(summaries, ev);

        if (!oppData) {
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
        debugErrors.push({ match: ev.match, error: err.message, errorType: err.constructor?.name, errorStr: String(err) });
        matchErrors++;
      }
    }

    // Sort by opportunity score desc
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
      credits_used: creditsUsed,
      debug_errors: debugErrors,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});