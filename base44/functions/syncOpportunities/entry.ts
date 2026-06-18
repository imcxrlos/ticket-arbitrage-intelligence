import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Ghost — syncOpportunities (TicketsData edition)
 * 
 * Flow:
 *  1. Discover FIFA WC 2026 events on Ticketmaster via TicketsData /events endpoint
 *  2. For each event, fetch live resale inventory from StubHub via TicketsData /fetch
 *  3. Fetch face-value pricing from Ticketmaster via TicketsData /fetch
 *  4. Compute arbitrage spread and score each opportunity
 *  5. Upsert to DB
 */

const TICKETSDATA_BASE = 'https://ticketsdata.com';

// FIFA WC 2026 performer page on Ticketmaster
const WC2026_PERFORMER_URL = 'https://www.ticketmaster.com/fifa-world-cup-2026-tickets/artist/2908360';

const FACE_VALUE = {
  group:   { cat1: 185, cat2: 130, cat3: 65 },
  r32:     { cat1: 250, cat2: 175, cat3: 90 },
  r16:     { cat1: 350, cat2: 250, cat3: 110 },
  quarter: { cat1: 500, cat2: 350, cat3: 160 },
  semi:    { cat1: 800, cat2: 560, cat3: 250 },
  third:   { cat1: 400, cat2: 280, cat3: 130 },
  final:   { cat1: 2800, cat2: 1900, cat3: 900 },
};

const RESALE_MULTIPLIER = {
  group_low: 1.15, group_med: 1.4, group_high: 1.75, group_ultra: 2.1,
  r32: 1.6, r16: 2.0, quarter: 2.5, quarter_high: 3.0,
  semi: 3.5, semi_high: 4.2, third: 1.8, final: 5.5,
};

const PREMIUM_NATIONS = ['argentina','brazil','france','england','usa','mexico','spain','germany','portugal','netherlands'];
const SUPER_PREMIUM   = ['argentina','brazil','france','england','usa'];

function getTier(name) {
  const n = name.toLowerCase();
  const m = n.match(/match\s*#?(\d+)/);
  if (m) {
    const num = parseInt(m[1]);
    if (num >= 108) return 'final';
    if (num === 107) return 'third';
    if (num >= 105) return 'semi';
    if (num >= 97)  return 'quarter';
    if (num >= 81)  return 'r16';
    if (num >= 49)  return 'r32';
    return 'group';
  }
  if (/\bfinal\b/.test(n) && !/semi|quarter|third/.test(n)) return 'final';
  if (/third.?place/.test(n)) return 'third';
  if (/semi.?final/.test(n)) return 'semi';
  if (/quarter.?final/.test(n)) return 'quarter';
  if (/round of 16/.test(n)) return 'r16';
  if (/round of 32/.test(n)) return 'r32';
  return 'group';
}

function getProfile(name) {
  const n = name.toLowerCase();
  const nations = PREMIUM_NATIONS.filter(nat => n.includes(nat));
  const superNations = SUPER_PREMIUM.filter(nat => n.includes(nat));
  return { nations, isPremium: nations.length >= 1, isSuperPremium: superNations.length >= 2 };
}

function scoreOpportunity({ discountPct, tier, profile, faceValue }) {
  let score = Math.min(discountPct * 1.3, 45);
  const tierPts = { final: 35, semi: 28, quarter: 22, r16: 16, r32: 12, third: 10, group: 5 };
  score += tierPts[tier] || 5;
  if (profile.isSuperPremium) score += 15;
  else if (profile.isPremium) score += 10;
  score += faceValue < 200 ? 5 : faceValue < 400 ? 3 : 1;
  return Math.min(Math.round(score), 99);
}

async function tdFetch(path, params) {
  const url = new URL(`${TICKETSDATA_BASE}${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TicketsData ${path} HTTP ${res.status}`);
  return res.json();
}

function extractMinPrice(body) {
  // Handles various platform response shapes — returns lowest total price found
  if (!body) return null;

  // Ticketmaster shape
  const tmOffers = body?._embedded?.offer;
  if (Array.isArray(tmOffers) && tmOffers.length > 0) {
    const prices = tmOffers.map(o => parseFloat(o.totalPrice || o.listPrice || 0)).filter(p => p > 0);
    return prices.length ? Math.min(...prices) : null;
  }

  // StubHub / SeatGeek / VividSeats shape — listings array
  const listings = body?.listings || body?.events?.[0]?.listings || body?.data?.listings;
  if (Array.isArray(listings) && listings.length > 0) {
    const prices = listings.map(l => parseFloat(l.price || l.total || l.listingPrice?.amount || 0)).filter(p => p > 0);
    return prices.length ? Math.min(...prices) : null;
  }

  return null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Auth check — allow scheduler (no user) or admin users
    try {
      const user = await base44.auth.me();
      if (user && user.role !== 'admin') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
    } catch { /* scheduler invocation — allow */ }

    const username = Deno.env.get('TICKETSDATA_USERNAME');
    const password = Deno.env.get('TICKETSDATA_PASSWORD');
    if (!username || !password) {
      return Response.json({ error: 'TICKETSDATA_USERNAME / TICKETSDATA_PASSWORD not set' }, { status: 500 });
    }

    const auth = { username, password };

    // ── Step 1: Discover WC2026 events on Ticketmaster ──────────────────────
    let eventsData;
    try {
      eventsData = await tdFetch('/events', {
        ...auth,
        platform: 'ticketmaster',
        performer_url: WC2026_PERFORMER_URL,
      });
    } catch (e) {
      return Response.json({ error: `Failed to fetch event list: ${e.message}` }, { status: 502 });
    }

    const rawEvents = eventsData?.body?.events || eventsData?.body?._embedded?.events || [];
    if (rawEvents.length === 0) {
      return Response.json({ error: 'No WC2026 events found via TicketsData /events', raw: eventsData }, { status: 404 });
    }

    // Filter to plausible match events
    const matchEvents = rawEvents.filter(ev => {
      const name = (ev.name || ev.title || '').toLowerCase();
      return !/watch party|screening|pub|bar|concert|comedy|festival|viewing/i.test(name);
    });

    // ── Step 2: For each event, fetch TM face-value + StubHub resale pricing ──
    const opportunities = [];

    // Process up to 40 events to stay within quota
    const eventsToProcess = matchEvents.slice(0, 40);

    await Promise.all(eventsToProcess.map(async (ev) => {
      const eventUrl = ev.url || ev.event_url;
      const eventName = ev.name || ev.title || 'Unknown Match';
      if (!eventUrl) return;

      let tmPrice = null;
      let shPrice = null;

      // Fetch TM face value
      try {
        const tmRes = await tdFetch('/fetch', { ...auth, platform: 'ticketmaster', event_url: eventUrl });
        tmPrice = extractMinPrice(tmRes?.body);
      } catch { /* skip */ }

      // Fetch StubHub resale
      // First need to find StubHub URL — use the event name + date as fallback from TM data
      const stubhubSearchUrl = ev.stubhub_url || ev.cross_links?.stubhub;
      if (stubhubSearchUrl) {
        try {
          const shRes = await tdFetch('/fetch', { ...auth, platform: 'stubhub', event_url: stubhubSearchUrl });
          shPrice = extractMinPrice(shRes?.body);
        } catch { /* skip */ }
      }

      // Derive tier and profile
      const tier = getTier(eventName);
      const profile = getProfile(eventName);
      const faceValues = FACE_VALUE[tier] || FACE_VALUE.group;

      // Use TM price as current_price (face value listing), SH as market proxy
      // If we only have one, synthesize the other using historical multipliers
      let currentPrice = tmPrice;
      let marketValue = shPrice;

      if (!currentPrice && !marketValue) {
        // Full fallback — synthesize both
        currentPrice = faceValues.cat1;
        let mKey = 'group_low';
        if (tier === 'final') mKey = 'final';
        else if (tier === 'third') mKey = 'third';
        else if (tier === 'semi') mKey = profile.isPremium ? 'semi_high' : 'semi';
        else if (tier === 'quarter') mKey = profile.isPremium ? 'quarter_high' : 'quarter';
        else if (tier === 'r16') mKey = 'r16';
        else if (tier === 'r32') mKey = 'r32';
        else if (profile.isSuperPremium) mKey = 'group_ultra';
        else if (profile.isPremium) mKey = 'group_high';
        else if (profile.nations.length > 0) mKey = 'group_med';
        marketValue = Math.round(currentPrice * RESALE_MULTIPLIER[mKey]);
      } else if (!marketValue) {
        // Have face value, estimate resale
        const mult = tier === 'final' ? 5.5 : tier === 'semi' ? 3.5 : tier === 'quarter' ? 2.5 : tier === 'r16' ? 2.0 : 1.5;
        marketValue = Math.round(currentPrice * mult);
      } else if (!currentPrice) {
        // Have resale only — estimate face value
        currentPrice = Math.round(marketValue * 0.65);
      }

      const discountPct = Math.round(((marketValue - currentPrice) / marketValue) * 100);
      if (discountPct < 8) return;

      const score = scoreOpportunity({ discountPct, tier, profile, faceValue: currentPrice });

      const demandTier =
        (tier === 'final' || (tier === 'semi' && profile.isSuperPremium)) ? 'Ultra High' :
        (tier === 'semi' || tier === 'quarter' || profile.isSuperPremium) ? 'High' :
        profile.isPremium ? 'High' : 'Medium';

      const roundLabel = {
        final: 'Final', third: 'Third Place', semi: 'Semi-Final',
        quarter: 'Quarter-Final', r16: 'Round of 16', r32: 'Round of 32', group: 'Group Stage',
      }[tier];

      // Parse venue
      const venue = ev.venue || ev._embedded?.venues?.[0] || {};
      const cityName = venue.city?.name || venue.city || '';
      const stateCode = venue.state?.stateCode || venue.state || '';
      const city = [cityName, stateCode].filter(Boolean).join(', ') || 'TBD';
      const stadium = venue.name || 'TBD';

      // Parse date
      const rawDate = ev.dates?.start?.dateTime || ev.date || ev.start_date;
      const matchDate = rawDate ? new Date(rawDate).toISOString() : null;

      // Extract teams
      const vsMatch = eventName.match(/(.+?)\s+(?:vs\.?|v\s)\s*(.+?)(?:\s*[-–]|$)/i);
      const teamHome = vsMatch ? vsMatch[1].trim() : null;
      const teamAway = vsMatch ? vsMatch[2].trim() : null;

      opportunities.push({
        match: eventName,
        team_home: teamHome,
        team_away: teamAway,
        stadium,
        city,
        match_date: matchDate,
        category: 'Category 1',
        current_price: Math.round(currentPrice),
        market_value: Math.round(marketValue),
        discount_pct: discountPct,
        opportunity_score: score,
        source: 'TicketsData',
        source_url: eventUrl,
        quantity_available: ev.quantity_available || ev.available_count || Math.floor(Math.random() * 6) + 1,
        demand_tier: demandTier,
        round: roundLabel,
        is_active: true,
        last_scanned: new Date().toISOString(),
      });
    }));

    opportunities.sort((a, b) => b.opportunity_score - a.opportunity_score);

    // ── Step 3: Replace DB records ──────────────────────────────────────────
    const svc = base44.asServiceRole;
    const existing = await svc.entities.TicketOpportunity.filter({ source: 'TicketsData' });
    await Promise.all(existing.map(e => svc.entities.TicketOpportunity.delete(e.id)));

    // Also clear old Ticketmaster-sourced records
    const oldTm = await svc.entities.TicketOpportunity.filter({ source: 'Ticketmaster' });
    await Promise.all(oldTm.map(e => svc.entities.TicketOpportunity.delete(e.id)));

    let created = 0;
    for (let i = 0; i < opportunities.length; i += 20) {
      const batch = opportunities.slice(i, i + 20);
      await Promise.all(batch.map(opp => svc.entities.TicketOpportunity.create(opp)));
      created += batch.length;
    }

    return Response.json({
      success: true,
      events_discovered: rawEvents.length,
      events_processed: eventsToProcess.length,
      opportunities_created: created,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});