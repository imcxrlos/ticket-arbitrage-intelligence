import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Ghost — syncOpportunities
 *
 * STRATEGY (credit-safe):
 *
 * /fetch = uses quota_remaining (huge pool, ~free). Needs a platform-specific event URL.
 * /match = costs 12 credits each. At 25/month cap → max 2 calls/month. Used ONLY on demand, not here.
 *
 * This function uses /fetch ONLY:
 * - We have confirmed platform-specific URLs for each match on stubhub + ticketmaster.
 * - We fetch both platforms per match and compute our own arbitrage spread.
 * - Zero /match credits consumed.
 *
 * Event URLs verified from StubHub live listings (June 2026).
 */

const TD_BASE = 'https://ticketsdata.com';

// Each match has confirmed URLs for multiple platforms.
// stubhub + ticketmaster gives us real cross-market spread.
const MATCHES = [
  {
    match: 'World Cup Final',
    round: 'Final',
    stadium: 'MetLife Stadium',
    city: 'East Rutherford, NJ',
    match_date: '2026-07-19T15:00:00',
    urls: {
      stubhub: 'https://www.stubhub.com/world-cup-east-rutherford-tickets-7-19-2026/event/153020449/',
      ticketmaster: 'https://www.ticketmaster.com/world-cup-final-match-104-east-rutherford-new-jersey-07-19-2026/event/02006239A0E942E6',
    },
  },
  {
    match: 'World Cup Semi-Final 1',
    round: 'Semi-Final',
    stadium: 'AT&T Stadium',
    city: 'Arlington, TX',
    match_date: '2026-07-14T14:00:00',
    urls: {
      stubhub: 'https://www.stubhub.com/world-cup-arlington-tickets-7-14-2026/event/153021542/',
      ticketmaster: 'https://www.ticketmaster.com/world-cup-semi-final-match-102-arlington-texas-07-14-2026/event/0A00623AA83C1B8B',
    },
  },
  {
    match: 'World Cup Semi-Final 2',
    round: 'Semi-Final',
    stadium: 'Mercedes-Benz Stadium',
    city: 'Atlanta, GA',
    match_date: '2026-07-15T15:00:00',
    urls: {
      stubhub: 'https://www.stubhub.com/world-cup-atlanta-tickets-7-15-2026/event/153023901/',
      ticketmaster: 'https://www.ticketmaster.com/world-cup-semi-final-match-103-atlanta-georgia-07-15-2026/event/1D00623AA83C1B8C',
    },
  },
  {
    match: 'World Cup Quarter-Final 1',
    round: 'Quarter-Final',
    stadium: 'SoFi Stadium',
    city: 'Inglewood, CA',
    match_date: '2026-07-09T20:00:00',
    urls: {
      stubhub: 'https://www.stubhub.com/world-cup-inglewood-tickets-7-9-2026/event/153020451/',
    },
  },
  {
    match: 'World Cup Quarter-Final 2',
    round: 'Quarter-Final',
    stadium: 'MetLife Stadium',
    city: 'East Rutherford, NJ',
    match_date: '2026-07-10T20:00:00',
    urls: {
      stubhub: 'https://www.stubhub.com/world-cup-east-rutherford-tickets-7-10-2026/event/153020452/',
    },
  },
  {
    match: 'World Cup Quarter-Final 3',
    round: 'Quarter-Final',
    stadium: 'AT&T Stadium',
    city: 'Arlington, TX',
    match_date: '2026-07-11T20:00:00',
    urls: {
      stubhub: 'https://www.stubhub.com/world-cup-arlington-tickets-7-11-2026/event/153021544/',
    },
  },
  {
    match: 'World Cup Quarter-Final 4',
    round: 'Quarter-Final',
    stadium: 'Mercedes-Benz Stadium',
    city: 'Atlanta, GA',
    match_date: '2026-07-12T20:00:00',
    urls: {
      stubhub: 'https://www.stubhub.com/world-cup-atlanta-tickets-7-12-2026/event/153023902/',
    },
  },
  {
    match: 'World Cup Round of 16 — Houston',
    round: 'Round of 16',
    stadium: 'NRG Stadium',
    city: 'Houston, TX',
    match_date: '2026-07-04T16:00:00',
    urls: {
      stubhub: 'https://www.stubhub.com/world-cup-houston-tickets-7-4-2026/event/153021196/',
    },
  },
  {
    match: 'World Cup Round of 16 — Philadelphia',
    round: 'Round of 16',
    stadium: 'Lincoln Financial Field',
    city: 'Philadelphia, PA',
    match_date: '2026-07-04T17:00:00',
    urls: {
      stubhub: 'https://www.stubhub.com/world-cup-philadelphia-tickets-7-4-2026/event/153023863/',
    },
  },
  {
    match: 'World Cup Round of 16 — East Rutherford',
    round: 'Round of 16',
    stadium: 'MetLife Stadium',
    city: 'East Rutherford, NJ',
    match_date: '2026-07-05T16:00:00',
    urls: {
      stubhub: 'https://www.stubhub.com/world-cup-east-rutherford-tickets-7-5-2026/event/153023886/',
    },
  },
  {
    match: 'World Cup Round of 16 — Arlington',
    round: 'Round of 16',
    stadium: 'AT&T Stadium',
    city: 'Arlington, TX',
    match_date: '2026-07-06T14:00:00',
    urls: {
      stubhub: 'https://www.stubhub.com/world-cup-arlington-tickets-7-6-2026/event/153021528/',
    },
  },
  {
    match: 'World Cup Round of 16 — Seattle',
    round: 'Round of 16',
    stadium: 'Lumen Field',
    city: 'Seattle, WA',
    match_date: '2026-07-06T17:00:00',
    urls: {
      stubhub: 'https://www.stubhub.com/world-cup-seattle-tickets-7-6-2026/event/153020574/',
    },
  },
  {
    match: 'World Cup Round of 32 — SoFi Stadium',
    round: 'Round of 32',
    stadium: 'SoFi Stadium',
    city: 'Inglewood, CA',
    match_date: '2026-06-28T12:00:00',
    urls: {
      stubhub: 'https://www.stubhub.com/world-cup-inglewood-tickets-6-28-2026/event/153020724/',
    },
  },
  {
    match: 'World Cup Round of 32 — Houston',
    round: 'Round of 32',
    stadium: 'NRG Stadium',
    city: 'Houston, TX',
    match_date: '2026-06-29T12:00:00',
    urls: {
      stubhub: 'https://www.stubhub.com/world-cup-houston-tickets-6-29-2026/event/153021172/',
    },
  },
  {
    match: 'World Cup Round of 32 — Foxborough',
    round: 'Round of 32',
    stadium: 'Gillette Stadium',
    city: 'Foxborough, MA',
    match_date: '2026-06-29T16:30:00',
    urls: {
      stubhub: 'https://www.stubhub.com/world-cup-foxborough-tickets-6-29-2026/event/153023830/',
    },
  },
  {
    match: 'World Cup Round of 32 — Arlington',
    round: 'Round of 32',
    stadium: 'AT&T Stadium',
    city: 'Arlington, TX',
    match_date: '2026-06-30T12:00:00',
    urls: {
      stubhub: 'https://www.stubhub.com/world-cup-arlington-tickets-6-30-2026/event/153021470/',
    },
  },
  {
    match: 'World Cup Round of 32 — East Rutherford',
    round: 'Round of 32',
    stadium: 'MetLife Stadium',
    city: 'East Rutherford, NJ',
    match_date: '2026-06-30T17:00:00',
    urls: {
      stubhub: 'https://www.stubhub.com/world-cup-east-rutherford-tickets-6-30-2026/event/153023840/',
    },
  },
  {
    match: 'World Cup Third Place',
    round: 'Third Place',
    stadium: 'Hard Rock Stadium',
    city: 'Miami, FL',
    match_date: '2026-07-18T15:00:00',
    urls: {
      stubhub: 'https://www.stubhub.com/world-cup-miami-gardens-tickets-7-18-2026/event/153023915/',
    },
  },
];

// ── /fetch helper ─────────────────────────────────────────────────────────────

async function fetchPlatform(username, password, platform, eventUrl) {
  const url = new URL(`${TD_BASE}/fetch`);
  url.searchParams.set('username', username);
  url.searchParams.set('password', password);
  url.searchParams.set('platform', platform);
  url.searchParams.set('event_url', eventUrl);

  const res = await fetch(url.toString());
  if (!res.ok) return null;

  const data = await res.json();
  if (!data || data.status >= 400) return null;

  return data;
}

// ── Parse raw /fetch response into { min_price, avg_price, listing_count } ───

function parseInventory(platform, data) {
  const body = data?.body;
  if (!body) return null;

  let prices = [];

  // StubHub
  if (platform === 'stubhub') {
    const listings = body?.listings || body?.data?.listings || [];
    prices = listings
      .map(l => l.seatPrice?.totalPrice ?? l.pricePerTicket?.amount ?? l.totalPrice ?? 0)
      .filter(p => p > 0);
  }

  // Ticketmaster
  if (platform === 'ticketmaster') {
    const offers = body?._embedded?.offer || [];
    prices = offers
      .map(o => parseFloat(o.totalPrice ?? o.listPrice ?? 0))
      .filter(p => p > 0);
  }

  // SeatGeek
  if (platform === 'seatgeek') {
    const listings = body?.listings || [];
    prices = listings
      .map(l => l.price ?? 0)
      .filter(p => p > 0);
  }

  // VividSeats
  if (platform === 'vividseats') {
    const rows = body?.rows || body?.listings || [];
    prices = rows
      .map(r => r.price ?? r.ticketPrice ?? 0)
      .filter(p => p > 0);
  }

  if (!prices.length) return null;

  prices.sort((a, b) => a - b);
  return {
    platform,
    min_price: Math.round(prices[0]),
    avg_price: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
    listing_count: prices.length,
  };
}

// ── Build opportunity record from platform data ───────────────────────────────

function buildOpportunity(platformResults, meta) {
  platformResults.sort((a, b) => a.min_price - b.min_price);
  const cheapest = platformResults[0];
  const priciest = platformResults[platformResults.length - 1];

  const currentPrice = cheapest.min_price;
  const highestPrice = priciest.min_price;

  const allAvgs = platformResults.filter(p => p.avg_price > 0).map(p => p.avg_price);
  const marketAvg = allAvgs.length
    ? Math.round(allAvgs.reduce((a, b) => a + b, 0) / allAvgs.length)
    : currentPrice;

  const discountVsAvg = marketAvg > currentPrice
    ? Math.round(((marketAvg - currentPrice) / marketAvg) * 100)
    : 0;
  const discountVsHighest = highestPrice > currentPrice
    ? Math.round(((highestPrice - currentPrice) / highestPrice) * 100)
    : 0;

  const signalType = platformResults.length >= 2 ? 'Arbitrage' : 'Price Analysis';

  const roundPts = { 'Final': 35, 'Semi-Final': 28, 'Quarter-Final': 22, 'Round of 16': 16, 'Round of 32': 10, 'Third Place': 8 };
  const spreadScore = Math.min(discountVsHighest * 0.8, 30);
  const platformBonus = Math.min((platformResults.length - 1) * 8, 20);
  const roundScore = roundPts[meta.round] || 5;
  const opportunityScore = Math.min(Math.round(spreadScore + platformBonus + roundScore), 99);

  const demandMap = { 'Final': 'Ultra High', 'Semi-Final': 'Ultra High', 'Quarter-Final': 'High', 'Round of 16': 'High', 'Round of 32': 'Medium', 'Third Place': 'Medium' };

  const marketSummaries = platformResults.map(p => ({
    platform: p.platform,
    min_price: p.min_price,
    avg_price: p.avg_price,
    listing_count: p.listing_count,
    url: meta.urls[p.platform] || '',
  }));

  return {
    match: meta.match,
    stadium: meta.stadium,
    city: meta.city,
    match_date: new Date(meta.match_date).toISOString(),
    round: meta.round,
    demand_tier: demandMap[meta.round] || 'Medium',
    signal_type: signalType,
    current_price: currentPrice,
    market_value: marketAvg,
    highest_price: highestPrice,
    discount_pct: discountVsAvg,
    vs_highest_pct: discountVsHighest,
    opportunity_score: opportunityScore,
    source: cheapest.platform,
    source_url: meta.urls[cheapest.platform] || meta.urls.stubhub || '',
    best_platform: cheapest.platform,
    worst_platform: priciest.platform,
    platforms_compared: platformResults.length,
    market_summaries: JSON.stringify(marketSummaries),
    quantity_available: platformResults.reduce((s, p) => s + p.listing_count, 0),
    category: 'Category 1',
    is_active: true,
    last_scanned: new Date().toISOString(),
  };
}

// ── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    try {
      const user = await base44.auth.me();
      if (user && user.role !== 'admin') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
    } catch { /* scheduler — allow */ }

    const tdUser = Deno.env.get('TICKETSDATA_USERNAME');
    const tdPass = Deno.env.get('TICKETSDATA_PASSWORD');
    if (!tdUser || !tdPass) {
      return Response.json({ error: 'TICKETSDATA credentials not configured' }, { status: 500 });
    }

    const opportunities = [];
    const errors = [];

    for (const meta of MATCHES) {
      const platformResults = [];

      for (const [platform, eventUrl] of Object.entries(meta.urls)) {
        try {
          console.log(`[Ghost] /fetch ${platform} → ${meta.match}`);
          const raw = await fetchPlatform(tdUser, tdPass, platform, eventUrl);
          if (!raw) {
            console.log(`[Ghost] No data: ${platform} / ${meta.match}`);
            continue;
          }
          const parsed = parseInventory(platform, raw);
          if (parsed) {
            platformResults.push(parsed);
            console.log(`[Ghost] ✓ ${platform}: min=$${parsed.min_price}, count=${parsed.listing_count}`);
          } else {
            console.log(`[Ghost] Could not parse prices for ${platform} / ${meta.match}`);
            // Log raw body structure for debugging
            console.log(`[Ghost] Raw body keys: ${Object.keys(raw.body || {}).join(', ')}`);
          }
        } catch (err) {
          console.error(`[Ghost] Error ${platform}/${meta.match}: ${err.message}`);
        }
      }

      if (!platformResults.length) {
        errors.push({ match: meta.match, reason: 'no_platform_data' });
        continue;
      }

      const opp = buildOpportunity(platformResults, meta);
      opportunities.push(opp);
      console.log(`[Ghost] ✅ ${meta.match}: ${opp.platforms_compared} platforms, best $${opp.current_price} (${opp.best_platform}), score ${opp.opportunity_score}`);
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