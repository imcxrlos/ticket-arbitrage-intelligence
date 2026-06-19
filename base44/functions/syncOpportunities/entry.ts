import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Ghost — syncOpportunities
 *
 * Uses /fetch endpoint ONLY (quota_remaining pool — not monthly credits).
 * NEVER call test_backend_function on this — it burns real API quota.
 *
 * Verified response schemas per TicketsData docs:
 *
 * Ticketmaster: body._embedded.offer[] → { totalPrice, listPrice, sellableQuantities }
 * StubHub:      body.items[]           → { rawPrice, price, availableTickets }
 * SeatGeek:     body.items.offers[]    → { rawPrice, rawPriceWithFees, availableTickets }
 * VividSeats:   body.items.offers[]    → { rawPrice, rawPriceWithFees, availableTickets }
 */

const TD_BASE = 'https://ticketsdata.com';

const MATCHES = [
  {
    match: 'World Cup Final',
    round: 'Final',
    stadium: 'MetLife Stadium',
    city: 'East Rutherford, NJ',
    match_date: '2026-07-19T15:00:00',
    urls: {
      stubhub: 'https://www.stubhub.com/world-cup-east-rutherford-tickets-7-19-2026/event/153020449/',
      seatgeek: 'https://seatgeek.com/fifa-world-cup-tickets/international-soccer/2026-07-19-3-pm/17307574',
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
      seatgeek: 'https://seatgeek.com/fifa-world-cup-tickets/international-soccer/2026-07-14-2-pm/17385150',
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

// ── /fetch a single platform URL ─────────────────────────────────────────────

async function fetchPlatform(username, password, platform, eventUrl) {
  const url = new URL(`${TD_BASE}/fetch`);
  url.searchParams.set('username', username);
  url.searchParams.set('password', password);
  url.searchParams.set('platform', platform);
  url.searchParams.set('event_url', eventUrl);

  const res = await fetch(url.toString());
  if (!res.ok) {
    console.log(`[Ghost] HTTP ${res.status} for ${platform}`);
    return null;
  }

  const data = await res.json();
  // Top-level status can be a number (200) or string
  const topStatus = data?.status;
  if (topStatus && topStatus !== 200 && topStatus !== '200' && topStatus !== 'success') {
    console.log(`[Ghost] API status ${topStatus} for ${platform}: ${JSON.stringify(data).slice(0, 200)}`);
    return null;
  }

  return data;
}

// ── Parse each platform's body into { platform, min_price, avg_price, listing_count } ──
// Schemas verified from TicketsData docs:
//
// ticketmaster: body._embedded.offer[] → totalPrice (number), listPrice (string)
// stubhub:      body.items[]           → rawPrice (number), price (string "$107")
// seatgeek:     body.items.offers[]    → rawPrice (number), rawPriceWithFees (number)
// vividseats:   body.items.offers[]    → rawPrice (number), rawPriceWithFees (number)

function parseInventory(platform, data) {
  const body = data?.body;
  if (!body) {
    console.log(`[Ghost] No body for ${platform}`);
    return null;
  }

  let prices = [];

  if (platform === 'ticketmaster') {
    // body._embedded.offer[].totalPrice (number) or listPrice (string)
    const offers = body?._embedded?.offer || [];
    prices = offers
      .map(o => {
        const p = o.totalPrice ?? parseFloat(o.listPrice ?? '0');
        return typeof p === 'string' ? parseFloat(p) : p;
      })
      .filter(p => p > 0);
    console.log(`[Ghost] TM offers: ${offers.length}, prices parsed: ${prices.length}`);
  }

  else if (platform === 'stubhub') {
    // body.items[] or body.listings[] → rawPrice (number) is the cleanest field
    const items = Array.isArray(body?.items) ? body.items
      : Array.isArray(body?.listings) ? body.listings
      : Array.isArray(body?.events) ? body.events
      : [];
    console.log(`[Ghost] SH raw body keys: ${Object.keys(body || {}).join(', ')}`);
    prices = items
      .map(i => i.rawPrice ?? i.currentPrice ?? i.salePrice ?? parseFloat((i.price ?? '0').replace(/[^0-9.]/g, '')))
      .filter(p => p > 0);
    console.log(`[Ghost] SH items: ${items.length}, prices parsed: ${prices.length}`);
  }

  else if (platform === 'seatgeek') {
    // body.items.offers[] → rawPrice (pre-fee) or rawPriceWithFees
    const offers = body?.items?.offers || [];
    prices = offers
      .map(o => o.rawPrice ?? o.rawPriceWithFees ?? 0)
      .filter(p => p > 0);
    console.log(`[Ghost] SG offers: ${offers.length}, prices parsed: ${prices.length}`);
  }

  else if (platform === 'vividseats') {
    // body.items.offers[] → rawPrice (pre-fee) or rawPriceWithFees
    const offers = body?.items?.offers || [];
    prices = offers
      .map(o => o.rawPrice ?? o.rawPriceWithFees ?? 0)
      .filter(p => p > 0);
    console.log(`[Ghost] VS offers: ${offers.length}, prices parsed: ${prices.length}`);
  }

  if (!prices.length) {
    // Log body shape to help debug without re-burning credits
    const bodyKeys = Object.keys(body || {});
    console.log(`[Ghost] Zero prices for ${platform}. Body keys: ${bodyKeys.join(', ')}`);
    if (body?.items) console.log(`[Ghost] items type: ${Array.isArray(body.items) ? 'array len=' + body.items.length : typeof body.items}`);
    return null;
  }

  prices.sort((a, b) => a - b);
  return {
    platform,
    min_price: Math.round(prices[0]),
    avg_price: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
    listing_count: prices.length,
  };
}

// ── Build opportunity from platform results ───────────────────────────────────

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

    // Auth check — allow scheduler (no user), block non-admin users
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

    let payload = {};
    try { payload = await req.json(); } catch { payload = {}; }

    const dryRun = payload.dryRun !== false;
    const confirmPaidFetch = payload.confirmPaidFetch === 'RUN_PAID_FETCH';
    const maxCalls = Math.max(1, Math.min(Number(payload.maxCalls || 1), 3));

    const plannedCalls = MATCHES.flatMap(meta =>
      Object.entries(meta.urls).map(([platform, eventUrl]) => ({ match: meta.match, platform, eventUrl }))
    );

    if (dryRun || !confirmPaidFetch) {
      return Response.json({
        success: true,
        mode: 'dry_run',
        paid_calls_made: 0,
        message: 'No TicketsData credits used. Pass dryRun:false and confirmPaidFetch:"RUN_PAID_FETCH" to run paid fetches.',
        planned_total_calls: plannedCalls.length,
        capped_max_calls: maxCalls,
        first_calls: plannedCalls.slice(0, maxCalls).map(c => ({ match: c.match, platform: c.platform })),
      });
    }

    const opportunities = [];
    const errors = [];
    let callsMade = 0;

    for (const meta of MATCHES) {
      const platformResults = [];

      for (const [platform, eventUrl] of Object.entries(meta.urls)) {
        try {
          if (callsMade >= maxCalls) {
            console.log(`[Ghost] Max paid call cap reached: ${maxCalls}`);
            break;
          }

          console.log(`[Ghost] Fetching ${platform} → ${meta.match}`);
          callsMade += 1;
          const raw = await fetchPlatform(tdUser, tdPass, platform, eventUrl);
          if (!raw) {
            errors.push({ match: meta.match, platform, reason: 'no_response' });
            continue;
          }
          const parsed = parseInventory(platform, raw);
          if (parsed) {
            platformResults.push(parsed);
            console.log(`[Ghost] ✓ ${platform}: min=$${parsed.min_price}, avg=$${parsed.avg_price}, count=${parsed.listing_count}`);
          } else {
            errors.push({ match: meta.match, platform, reason: 'parse_failed' });
          }
        } catch (err) {
          console.error(`[Ghost] Error ${platform}/${meta.match}: ${err.message}`);
          errors.push({ match: meta.match, platform, reason: err.message });
        }
      }

      if (!platformResults.length) {
        console.log(`[Ghost] ⚠ No data for ${meta.match}`);
        if (callsMade >= maxCalls) break;
        continue;
      }

      const opp = buildOpportunity(platformResults, meta);
      opportunities.push(opp);
      console.log(`[Ghost] ✅ ${meta.match}: ${opp.platforms_compared} platforms, best $${opp.current_price} (${opp.best_platform}), score ${opp.opportunity_score}`);
      if (callsMade >= maxCalls) break;
    }

    const writeToDb = payload.writeToDb === true;
    let opportunitiesSaved = 0;

    if (writeToDb && opportunities.length > 0) {
      const svc = base44.asServiceRole;
      const existing = await svc.entities.TicketOpportunity.list();
      const scanId = `sync_${Date.now()}`;

      for (const opp of opportunities) {
        const match = existing.find(e => e.match === opp.match);
        let opportunityId = match?.id;

        if (match) {
          await svc.entities.TicketOpportunity.update(match.id, opp);
        } else {
          const created = await svc.entities.TicketOpportunity.create(opp);
          opportunityId = created.id;
        }

        await svc.entities.OpportunityPriceSnapshot.create({
          opportunity_id: opportunityId,
          match: opp.match,
          scan_id: scanId,
          scan_source: 'syncOpportunities',
          current_price: opp.current_price,
          market_value: opp.market_value,
          highest_price: opp.highest_price,
          discount_pct: opp.discount_pct,
          vs_highest_pct: opp.vs_highest_pct,
          opportunity_score: opp.opportunity_score,
          source: opp.source,
          best_platform: opp.best_platform,
          worst_platform: opp.worst_platform,
          platforms_compared: opp.platforms_compared,
          quantity_available: opp.quantity_available,
          market_summaries: opp.market_summaries,
          scanned_at: opp.last_scanned,
        });

        opportunitiesSaved += 1;
      }
    }

    return Response.json({
      success: true,
      write_to_db: writeToDb,
      write_mode: 'merge_update_existing_matches',
      opportunities_found: opportunities.length,
      opportunities_saved: opportunitiesSaved,
      arbitrage_signals: opportunities.filter(o => o.signal_type === 'Arbitrage').length,
      paid_calls_made: callsMade,
      max_calls_allowed: maxCalls,
      errors_count: errors.length,
      errors,
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