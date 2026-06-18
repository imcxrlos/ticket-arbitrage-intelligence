import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Ghost — syncOpportunities
 *
 * 1. Call TicketsData /events with StubHub WC2026 performer URL → all match event URLs (1 credit)
 * 2. For each match, fetch StubHub + SeatGeek + VividSeats in parallel via /fetch (3 credits each)
 * 3. Compute real arbitrage spread across platforms, score, save
 */

const TD_BASE = 'https://ticketsdata.com';
const WC2026_STUBHUB_PERFORMER = 'https://www.stubhub.com/fifa-world-cup-tickets/performer/4750453/';

// Platforms to fetch for each match — real arbitrage needs 2+ markets
const PLATFORMS = ['stubhub', 'seatgeek', 'vividseats'];

async function tdEvents(username, password) {
  const url = new URL(`${TD_BASE}/events`);
  url.searchParams.set('username', username);
  url.searchParams.set('password', password);
  url.searchParams.set('platform', 'stubhub');
  url.searchParams.set('performer_url', WC2026_STUBHUB_PERFORMER);

  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`TicketsData /events failed: ${res.status} — ${body}`);
  }
  return res.json();
}

async function tdFetch(username, password, platform, eventUrl) {
  try {
    const url = new URL(`${TD_BASE}/fetch`);
    url.searchParams.set('username', username);
    url.searchParams.set('password', password);
    url.searchParams.set('platform', platform);
    url.searchParams.set('event_url', eventUrl);

    const res = await fetch(url.toString());
    if (!res.ok) return null;
    const data = await res.json();

    // Normalize items array regardless of platform response shape
    const items = data.items || data.listings || data.body?._embedded?.offer || [];
    if (!items.length) return null;

    const prices = items
      .map(i => parseFloat(i.rawPrice || i.price?.replace(/[^0-9.]/g, '') || i.listPrice || i.totalPrice || 0))
      .filter(p => p > 0);

    if (!prices.length) return null;

    prices.sort((a, b) => a - b);
    const min = prices[0];
    const max = prices[prices.length - 1];
    const avg = Math.round(prices.reduce((s, p) => s + p, 0) / prices.length);

    return {
      platform,
      min_price: Math.round(min),
      avg_price: avg,
      max_price: Math.round(max),
      listing_count: items.length,
      url: eventUrl,
    };
  } catch {
    return null;
  }
}

// Map StubHub event URL → equivalent URLs on other platforms
// TicketsData /events only gives StubHub URLs; for SeatGeek/VividSeats we pass the StubHub
// URL and TicketsData resolves the cross-platform match automatically.
function crossPlatformUrls(stubhubUrl) {
  return {
    stubhub: stubhubUrl,
    seatgeek: stubhubUrl,   // TD accepts SH url and cross-matches
    vividseats: stubhubUrl, // same
  };
}

function computeOpportunity(platformSummaries) {
  const valid = platformSummaries.filter(s => s && s.min_price > 0);
  if (valid.length < 1) return null;

  valid.sort((a, b) => a.min_price - b.min_price);
  const cheapest = valid[0];
  const priciest = valid[valid.length - 1];

  const currentPrice = cheapest.min_price;
  const highestPrice = priciest.min_price;
  const allAvgs = valid.filter(s => s.avg_price).map(s => s.avg_price);
  const marketAvg = allAvgs.length
    ? Math.round(allAvgs.reduce((a, b) => a + b, 0) / allAvgs.length)
    : Math.round(valid.map(s => s.min_price).reduce((a, b) => a + b, 0) / valid.length);

  const discountVsAvg = marketAvg > 0 ? Math.round(((marketAvg - currentPrice) / marketAvg) * 100) : 0;
  const discountVsHighest = highestPrice > currentPrice
    ? Math.round(((highestPrice - currentPrice) / highestPrice) * 100)
    : 0;

  const signalType = valid.length >= 2 ? 'Arbitrage' : 'Price Analysis';

  return {
    signal_type: signalType,
    current_price: currentPrice,
    market_value: marketAvg,
    highest_price: highestPrice,
    discount_pct: discountVsAvg,
    vs_highest_pct: discountVsHighest,
    source: cheapest.platform,
    source_url: cheapest.url,
    best_platform: cheapest.platform,
    worst_platform: priciest.platform,
    platforms_compared: valid.length,
    market_summaries: JSON.stringify(valid),
    quantity_available: valid.reduce((s, p) => s + (p.listing_count || 0), 0),
  };
}

function scoreOpportunity(opp, round) {
  const roundPts = { 'Final': 35, 'Semi-Final': 28, 'Quarter-Final': 22, 'Round of 16': 16, 'Round of 32': 12, 'Third Place': 10, 'Group Stage': 5 };
  const spreadScore = Math.min((opp.vs_highest_pct || 0) * 0.8, 30);
  const platformBonus = Math.min((opp.platforms_compared - 1) * 8, 20);
  const roundScore = roundPts[round] || 5;
  return Math.min(Math.round(spreadScore + platformBonus + roundScore), 99);
}

function classifyRound(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('third')) return 'Third Place';
  if (n.includes('final') && n.includes('semi')) return 'Semi-Final';
  if (n.includes('final') && n.includes('quarter')) return 'Quarter-Final';
  if (n.includes('final')) return 'Final';
  if (n.includes('semi')) return 'Semi-Final';
  if (n.includes('quarter')) return 'Quarter-Final';
  if (n.includes('round of 16')) return 'Round of 16';
  if (n.includes('round of 32')) return 'Round of 32';
  return 'Group Stage';
}

function demandTier(round) {
  if (round === 'Final' || round === 'Semi-Final') return 'Ultra High';
  if (round === 'Quarter-Final') return 'High';
  if (round === 'Round of 16' || round === 'Round of 32') return 'Medium';
  return 'Low';
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

    // Step 1: Get all WC2026 StubHub event URLs (1 credit)
    const events = await tdEvents(tdUser, tdPass);
    if (!Array.isArray(events) || events.length === 0) {
      return Response.json({ error: 'No events returned', raw: events }, { status: 404 });
    }

    const opportunities = [];
    const errors = [];

    // Step 2: For each match, fetch all 3 platforms in parallel
    for (const ev of events) {
      try {
        const stubhubUrl = ev.url || ev.event_url || ev.link;
        if (!stubhubUrl) continue;

        const matchName = ev.name || ev.title || ev.event_name || 'Unknown Match';
        const venue = ev.venue || ev.venue_name || '';
        const city = ev.city || ev.location || '';
        const eventDate = ev.date || ev.event_date || ev.datetime || null;
        const round = classifyRound(matchName);

        const urls = crossPlatformUrls(stubhubUrl);

        // Fetch all platforms in parallel
        const [shData, sgData, vsData] = await Promise.all([
          tdFetch(tdUser, tdPass, 'stubhub', urls.stubhub),
          tdFetch(tdUser, tdPass, 'seatgeek', urls.seatgeek),
          tdFetch(tdUser, tdPass, 'vividseats', urls.vividseats),
        ]);

        const summaries = [shData, sgData, vsData].filter(Boolean);
        const opp = computeOpportunity(summaries);
        if (!opp) {
          errors.push({ match: matchName, reason: 'no_price_data' });
          continue;
        }

        const score = scoreOpportunity(opp, round);

        opportunities.push({
          match: matchName,
          stadium: venue,
          city,
          match_date: eventDate ? new Date(eventDate).toISOString() : null,
          category: 'Category 1',
          round,
          demand_tier: demandTier(round),
          opportunity_score: score,
          is_active: true,
          last_scanned: new Date().toISOString(),
          ...opp,
        });
      } catch (err) {
        errors.push({ match: ev.name || ev.title, error: err.message });
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
      events_found: events.length,
      opportunities_saved: opportunities.length,
      arbitrage_signals: opportunities.filter(o => o.signal_type === 'Arbitrage').length,
      price_analysis_signals: opportunities.filter(o => o.signal_type === 'Price Analysis').length,
      errors: errors.length,
      error_list: errors,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});