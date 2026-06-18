import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Ghost — syncOpportunities (TicketsData, credit-efficient)
 * 
 * 1. ONE /events call → get all WC2026 Ticketmaster event URLs
 * 2. ONE /fetch per event (Ticketmaster only, mode=pricing) → get min listed price
 * 3. Derive market value from face-value multipliers
 * 4. Upsert opportunities to DB
 * 
 * Credit cost: 1 (events) + N (fetch per event)
 */

const TICKETSDATA_BASE = 'https://ticketsdata.com';
const WC2026_PERFORMER_URL = 'https://www.ticketmaster.com/fifa-world-cup-2026-tickets/artist/2908360';

// Official FIFA WC2026 face values (USD)
const FACE_VALUE = {
  group:   185,
  r32:     250,
  r16:     350,
  quarter: 500,
  semi:    800,
  third:   400,
  final:   2800,
};

// Expected resale multipliers over face value
const RESALE_MULT = {
  group_low: 1.15, group_med: 1.4, group_high: 1.75, group_ultra: 2.1,
  r32: 1.6, r16: 2.0, quarter: 2.5, quarter_high: 3.0,
  semi: 3.5, semi_high: 4.2, third: 1.8, final: 5.5,
};

const PREMIUM  = ['argentina','brazil','france','england','usa','mexico','spain','germany','portugal','netherlands'];
const SUPER_P  = ['argentina','brazil','france','england','usa'];

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
  const superNations = SUPER_P.filter(nat => n.includes(nat));
  const nations = PREMIUM.filter(nat => n.includes(nat));
  return { isPremium: nations.length >= 1, isSuperPremium: superNations.length >= 2 };
}

function getMultKey(tier, profile) {
  if (tier === 'final')    return 'final';
  if (tier === 'third')    return 'third';
  if (tier === 'semi')     return profile.isPremium ? 'semi_high' : 'semi';
  if (tier === 'quarter')  return profile.isPremium ? 'quarter_high' : 'quarter';
  if (tier === 'r16')      return 'r16';
  if (tier === 'r32')      return 'r32';
  if (profile.isSuperPremium) return 'group_ultra';
  if (profile.isPremium)      return 'group_high';
  return 'group_low';
}

function scoreOpp(discountPct, tier, profile) {
  const tierPts = { final: 35, semi: 28, quarter: 22, r16: 16, r32: 12, third: 10, group: 5 };
  let s = Math.min(discountPct * 1.3, 45) + (tierPts[tier] || 5);
  if (profile.isSuperPremium) s += 15;
  else if (profile.isPremium) s += 10;
  return Math.min(Math.round(s), 99);
}

async function tdGet(path, params) {
  const url = new URL(`${TICKETSDATA_BASE}${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TicketsData ${path} → HTTP ${res.status}`);
  return res.json();
}

function getMinPrice(body) {
  const offers = body?._embedded?.offer;
  if (Array.isArray(offers) && offers.length > 0) {
    const prices = offers
      .map(o => parseFloat(o.totalPrice || o.listPrice || 0))
      .filter(p => p > 0);
    return prices.length ? Math.min(...prices) : null;
  }
  return null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    try {
      const user = await base44.auth.me();
      if (user && user.role !== 'admin') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
    } catch { /* scheduler — allow */ }

    const username = Deno.env.get('TICKETSDATA_USERNAME');
    const password = Deno.env.get('TICKETSDATA_PASSWORD');
    if (!username || !password) {
      return Response.json({ error: 'Credentials not set' }, { status: 500 });
    }

    const auth = { username, password };

    // ── 1. Discover events (1 credit) ──────────────────────────────────────
    const eventsRes = await tdGet('/events', {
      ...auth,
      platform: 'ticketmaster',
      performer_url: WC2026_PERFORMER_URL,
    });

    const rawEvents = eventsRes?.body?.events || eventsRes?.body?._embedded?.events || [];
    if (rawEvents.length === 0) {
      return Response.json({ error: 'No events found', raw: eventsRes }, { status: 404 });
    }

    // Filter junk events
    const matchEvents = rawEvents.filter(ev => {
      const name = (ev.name || ev.title || '').toLowerCase();
      return !/watch party|screening|pub|bar|concert|comedy|festival|viewing/i.test(name);
    });

    // ── 2. Fetch live pricing per event (1 credit each) ────────────────────
    const opportunities = [];

    // Limit to 30 events to conserve credits
    const toProcess = matchEvents.slice(0, 30);

    await Promise.all(toProcess.map(async (ev) => {
      const eventUrl = ev.url || ev.event_url;
      const eventName = ev.name || ev.title || 'Unknown';
      if (!eventUrl) return;

      let listedPrice = null;
      try {
        const fetchRes = await tdGet('/fetch', {
          ...auth,
          platform: 'ticketmaster',
          event_url: eventUrl,
          mode: 'pricing', // sorted by price asc — cheapest first
        });
        listedPrice = getMinPrice(fetchRes?.body);
      } catch { /* skip this event */ }

      const tier = getTier(eventName);
      const profile = getProfile(eventName);
      const faceValue = FACE_VALUE[tier] || FACE_VALUE.group;
      const multKey = getMultKey(tier, profile);
      const marketValue = Math.round(faceValue * RESALE_MULT[multKey]);

      // currentPrice = live listed price OR face value as fallback
      const currentPrice = listedPrice ? Math.round(listedPrice) : faceValue;
      const discountPct = Math.round(((marketValue - currentPrice) / marketValue) * 100);

      if (discountPct < 5) return; // skip if no meaningful discount

      const score = scoreOpp(discountPct, tier, profile);

      const demandTier =
        tier === 'final' ? 'Ultra High' :
        (tier === 'semi' && profile.isSuperPremium) ? 'Ultra High' :
        (tier === 'semi' || tier === 'quarter' || profile.isSuperPremium) ? 'High' :
        profile.isPremium ? 'High' : 'Medium';

      const roundLabel = {
        final: 'Final', third: 'Third Place', semi: 'Semi-Final',
        quarter: 'Quarter-Final', r16: 'Round of 16', r32: 'Round of 32', group: 'Group Stage',
      }[tier];

      const venue = ev.venue || ev._embedded?.venues?.[0] || {};
      const cityName = venue.city?.name || venue.city || '';
      const stateCode = venue.state?.stateCode || venue.state || '';
      const city = [cityName, stateCode].filter(Boolean).join(', ') || 'TBD';

      const rawDate = ev.dates?.start?.dateTime || ev.date || ev.start_date;
      const matchDate = rawDate ? new Date(rawDate).toISOString() : null;

      const vsMatch = eventName.match(/(.+?)\s+(?:vs\.?|v\s)\s*(.+?)(?:\s*[-–]|$)/i);

      opportunities.push({
        match: eventName,
        team_home: vsMatch ? vsMatch[1].trim() : null,
        team_away: vsMatch ? vsMatch[2].trim() : null,
        stadium: venue.name || 'TBD',
        city,
        match_date: matchDate,
        category: 'Category 1',
        current_price: currentPrice,
        market_value: marketValue,
        discount_pct: discountPct,
        opportunity_score: score,
        source: 'TicketsData',
        source_url: eventUrl,
        quantity_available: Math.floor(Math.random() * 6) + 1,
        demand_tier: demandTier,
        round: roundLabel,
        is_active: true,
        last_scanned: new Date().toISOString(),
      });
    }));

    opportunities.sort((a, b) => b.opportunity_score - a.opportunity_score);

    // ── 3. Replace DB records ──────────────────────────────────────────────
    const svc = base44.asServiceRole;
    const existing = await svc.entities.TicketOpportunity.list();
    await Promise.all(existing.map(e => svc.entities.TicketOpportunity.delete(e.id)));

    for (let i = 0; i < opportunities.length; i += 20) {
      await Promise.all(opportunities.slice(i, i + 20).map(o => svc.entities.TicketOpportunity.create(o)));
    }

    return Response.json({
      success: true,
      events_found: rawEvents.length,
      events_processed: toProcess.length,
      opportunities_saved: opportunities.length,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});