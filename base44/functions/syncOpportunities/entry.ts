import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Ghost — syncOpportunities (v5: dynamic TM search + SeatGeek)
 *
 * Step 1: Search TM Discovery API for FIFA World Cup 2026 events (no hardcoded IDs)
 * Step 2: For each TM event, search SeatGeek by event name + date
 * Step 3: Compute arbitrage/price analysis signal from real data
 */

const TM_BASE = 'https://app.ticketmaster.com/discovery/v2';
const SG_BASE = 'https://api.seatgeek.com/2';

async function searchTMEvents(apiKey) {
  // Search for all FIFA World Cup 2026 events
  const url = `${TM_BASE}/events.json?apikey=${apiKey}&keyword=FIFA+World+Cup+2026&size=200&sort=date,asc&classificationName=Sports`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`TM search failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  return data._embedded?.events || [];
}

async function fetchTMEventPrices(eventId, apiKey) {
  try {
    const url = `${TM_BASE}/events/${eventId}?apikey=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
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

async function fetchSeatGeek(matchName, dateStr) {
  try {
    // Search by date range (±1 day) and keyword
    const date = new Date(dateStr);
    const from = new Date(date); from.setDate(from.getDate() - 1);
    const to = new Date(date); to.setDate(to.getDate() + 1);
    const fromStr = from.toISOString().split('T')[0];
    const toStr = to.toISOString().split('T')[0];

    // Use a general FIFA WC search with date filter
    const url = `${SG_BASE}/events?q=FIFA+World+Cup+2026&datetime_local.gte=${fromStr}T00:00:00&datetime_local.lte=${toStr}T23:59:59&per_page=10&sort=score.desc`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const events = data.events || [];
    if (events.length === 0) return null;
    // Pick first event with a lowest_price
    const ev = events.find(e => e.stats?.lowest_price) || events[0];
    const stats = ev?.stats;
    if (!stats?.lowest_price) return null;
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

function computeOpportunity(summaries, eventMeta) {
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
  const round = eventMeta.round || "Group Stage";
  const spreadScore = Math.min(discountVsHighest * 0.8, 30);
  const platformBonus = Math.min((withPrice.length - 1) * 8, 20);
  const roundScore = roundPts[round] || 5;
  const score = Math.min(Math.round(spreadScore + platformBonus + roundScore), 99);

  const totalListings = withPrice.reduce((a, s) => a + (s.listing_count || 0), 0);
  const demandTier = round === 'Final' || round === 'Semi-Final' ? 'Ultra High'
    : round === 'Quarter-Final' ? 'High'
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

function classifyRound(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('final') && n.includes('third')) return 'Third Place';
  if (n.includes('final')) return n.includes('semi') ? 'Semi-Final' : n.includes('quarter') ? 'Quarter-Final' : 'Final';
  if (n.includes('semi')) return 'Semi-Final';
  if (n.includes('quarter')) return 'Quarter-Final';
  if (n.includes('round of 16')) return 'Round of 16';
  if (n.includes('round of 32')) return 'Round of 32';
  return 'Group Stage';
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

    // Step 1: Search TM for all WC2026 events
    const tmEvents = await searchTMEvents(tmApiKey);

    if (tmEvents.length === 0) {
      return Response.json({ error: 'No WC2026 events found on Ticketmaster', hint: 'Check API key or keyword' }, { status: 404 });
    }

    const opportunities = [];
    const debugErrors = [];
    let matchErrors = 0;

    for (const ev of tmEvents) {
      try {
        const eventDate = ev.dates?.start?.localDate || ev.dates?.start?.dateTime;
        const eventName = ev.name;
        const venue = ev._embedded?.venues?.[0];
        const stadium = venue?.name || 'Unknown';
        const city = venue?.city?.name && venue?.state?.stateCode
          ? `${venue.city.name}, ${venue.state.stateCode}`
          : venue?.city?.name || 'Unknown';

        const round = classifyRound(eventName);

        // Fetch TM prices + SeatGeek in parallel
        const [tmPrices, sgPrices] = await Promise.all([
          fetchTMEventPrices(ev.id, tmApiKey),
          fetchSeatGeek(eventName, eventDate),
        ]);

        const summaries = [tmPrices, sgPrices].filter(Boolean);
        const oppData = computeOpportunity(summaries, { round });

        if (!oppData) {
          debugErrors.push({ match: eventName, reason: 'no_price_data', tm: !!tmPrices, sg: !!sgPrices });
          matchErrors++;
          continue;
        }

        opportunities.push({
          match: eventName,
          stadium,
          city,
          match_date: eventDate ? new Date(eventDate).toISOString() : null,
          category: 'Category 1',
          round,
          is_active: true,
          last_scanned: new Date().toISOString(),
          ...oppData,
        });
      } catch (err) {
        debugErrors.push({ match: ev.name, error: err.message });
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
      tm_events_found: tmEvents.length,
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