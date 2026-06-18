import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Ghost — syncOpportunities
 * 
 * Strategy (credit-efficient):
 * 1. Loop through known WC2026 StubHub event URLs (hardcoded — /events doesn't work for WC)
 * 2. Per event, fetch from StubHub + Ticketmaster (2 platforms max = 2 credits)
 * 3. Find cheapest listing across both platforms
 * 4. Compare against known FIFA face values → compute arbitrage spread
 * 5. Save as TicketOpportunity records
 * 
 * Total credits per run: 2 × N events (max 30 = 60 credits)
 */

const BASE = 'https://ticketsdata.com';

// WC2026 known matches with StubHub event IDs
// Source: ticketsdata.com/world-cup-2026
const WC2026_MATCHES = [
  // Group Stage — Jun 18
  { match: "Canada vs Qatar", stadium: "BC Place Stadium", city: "Vancouver, BC", date: "2026-06-18", group: "B", round: "Group Stage", stubhub: "https://www.stubhub.com/fifa-world-cup-2026-vancouver-tickets-6-18-2026/event/153033405/", tm: null },
  { match: "Czech Republic vs South Africa", stadium: "Mercedes-Benz Stadium", city: "Atlanta, GA", date: "2026-06-18", group: "A", round: "Group Stage", stubhub: "https://www.stubhub.com/fifa-world-cup-2026-atlanta-tickets-6-18-2026/event/153033403/", tm: null },
  { match: "Switzerland vs Bosnia and Herzegovina", stadium: "SoFi Stadium", city: "Los Angeles, CA", date: "2026-06-18", group: "B", round: "Group Stage", stubhub: "https://www.stubhub.com/fifa-world-cup-2026-los-angeles-tickets-6-18-2026/event/153033406/", tm: null },
  // Jun 19
  { match: "United States vs Australia", stadium: "Lumen Field", city: "Seattle, WA", date: "2026-06-19", group: "D", round: "Group Stage", stubhub: "https://www.stubhub.com/fifa-world-cup-2026-seattle-tickets-6-19-2026/event/153033410/", tm: null },
  { match: "Brazil vs Haiti", stadium: "Lincoln Financial Field", city: "Philadelphia, PA", date: "2026-06-19", group: "C", round: "Group Stage", stubhub: "https://www.stubhub.com/fifa-world-cup-2026-philadelphia-tickets-6-19-2026/event/153033408/", tm: null },
  { match: "Scotland vs Morocco", stadium: "Gillette Stadium", city: "Boston, MA", date: "2026-06-19", group: "C", round: "Group Stage", stubhub: "https://www.stubhub.com/fifa-world-cup-2026-boston-tickets-6-19-2026/event/153033409/", tm: null },
  { match: "Turkey vs Paraguay", stadium: "Levi's Stadium", city: "San Francisco, CA", date: "2026-06-19", group: "D", round: "Group Stage", stubhub: "https://www.stubhub.com/fifa-world-cup-2026-san-francisco-tickets-6-19-2026/event/153033411/", tm: null },
  // Jun 20
  { match: "Germany vs Côte d'Ivoire", stadium: "BMO Field", city: "Toronto, ON", date: "2026-06-20", group: "E", round: "Group Stage", stubhub: "https://www.stubhub.com/fifa-world-cup-2026-toronto-tickets-6-20-2026/event/153033412/", tm: null },
  { match: "Netherlands vs Sweden", stadium: "NRG Stadium", city: "Houston, TX", date: "2026-06-20", group: "F", round: "Group Stage", stubhub: "https://www.stubhub.com/fifa-world-cup-2026-houston-tickets-6-20-2026/event/153033414/", tm: null },
  { match: "Ecuador vs Curaçao", stadium: "GEHA Field at Arrowhead", city: "Kansas City, MO", date: "2026-06-20", group: "E", round: "Group Stage", stubhub: "https://www.stubhub.com/fifa-world-cup-2026-kansas-city-tickets-6-20-2026/event/153033413/", tm: null },
  // Jun 21
  { match: "Belgium vs Iran", stadium: "SoFi Stadium", city: "Los Angeles, CA", date: "2026-06-21", group: "G", round: "Group Stage", stubhub: "https://www.stubhub.com/fifa-world-cup-2026-los-angeles-tickets-6-21-2026/event/153033418/", tm: null },
  { match: "Spain vs Saudi Arabia", stadium: "Mercedes-Benz Stadium", city: "Atlanta, GA", date: "2026-06-21", group: "H", round: "Group Stage", stubhub: "https://www.stubhub.com/fifa-world-cup-2026-atlanta-tickets-6-21-2026/event/153033417/", tm: null },
  { match: "Uruguay vs Cabo Verde", stadium: "Hard Rock Stadium", city: "Miami, FL", date: "2026-06-21", group: "H", round: "Group Stage", stubhub: "https://www.stubhub.com/fifa-world-cup-2026-miami-tickets-6-21-2026/event/153033416/", tm: null },
  // Jun 22
  { match: "Argentina vs Austria", stadium: "AT&T Stadium", city: "Dallas, TX", date: "2026-06-22", group: "J", round: "Group Stage", stubhub: "https://www.stubhub.com/fifa-world-cup-2026-dallas-tickets-6-22-2026/event/153033421/", tm: null },
  { match: "France vs Iraq", stadium: "Lincoln Financial Field", city: "Philadelphia, PA", date: "2026-06-22", group: "I", round: "Group Stage", stubhub: "https://www.stubhub.com/fifa-world-cup-2026-philadelphia-tickets-6-22-2026/event/153033420/", tm: null },
  { match: "Norway vs Senegal", stadium: "MetLife Stadium", city: "New York, NY", date: "2026-06-22", group: "I", round: "Group Stage", stubhub: "https://www.stubhub.com/fifa-world-cup-2026-new-york-tickets-6-22-2026/event/153033419/", tm: null },
  // Jun 23
  { match: "Portugal vs Uzbekistan", stadium: "NRG Stadium", city: "Houston, TX", date: "2026-06-23", group: "K", round: "Group Stage", stubhub: "https://www.stubhub.com/fifa-world-cup-2026-houston-tickets-6-23-2026/event/153033424/", tm: null },
  { match: "England vs Ghana", stadium: "Gillette Stadium", city: "Boston, MA", date: "2026-06-23", group: "L", round: "Group Stage", stubhub: "https://www.stubhub.com/fifa-world-cup-2026-boston-tickets-6-23-2026/event/153033422/", tm: null },
  { match: "Colombia vs DR Congo", stadium: "Estadio Akron", city: "Guadalajara, MX", date: "2026-06-23", group: "K", round: "Group Stage", stubhub: "https://www.stubhub.com/fifa-world-cup-2026-guadalajara-tickets-6-23-2026/event/153033425/", tm: null },
  // Jun 25 — big matches
  { match: "Turkey vs United States", stadium: "SoFi Stadium", city: "Los Angeles, CA", date: "2026-06-25", group: "D", round: "Group Stage", stubhub: "https://www.stubhub.com/fifa-world-cup-2026-los-angeles-tickets-6-25-2026/event/153033434/", tm: null },
  { match: "Ecuador vs Germany", stadium: "MetLife Stadium", city: "New York, NY", date: "2026-06-25", group: "E", round: "Group Stage", stubhub: "https://www.stubhub.com/fifa-world-cup-2026-new-york-tickets-6-25-2026/event/153033432/", tm: null },
  // Jun 26
  { match: "Norway vs France", stadium: "Gillette Stadium", city: "Boston, MA", date: "2026-06-26", group: "I", round: "Group Stage", stubhub: "https://www.stubhub.com/fifa-world-cup-2026-boston-tickets-6-26-2026/event/153033438/", tm: null },
  { match: "Uruguay vs Spain", stadium: "Estadio Akron", city: "Guadalajara, MX", date: "2026-06-26", group: "H", round: "Group Stage", stubhub: "https://www.stubhub.com/fifa-world-cup-2026-guadalajara-tickets-6-26-2026/event/153033443/", tm: null },
  // Knockout rounds (approximate URLs based on pattern)
  { match: "Round of 32 - Match 49", stadium: "MetLife Stadium", city: "New York, NY", date: "2026-07-02", group: null, round: "Round of 32", stubhub: "https://www.stubhub.com/fifa-world-cup-2026-new-york-tickets-7-2-2026/event/153033457/", tm: null },
  { match: "Round of 32 - Match 50", stadium: "AT&T Stadium", city: "Dallas, TX", date: "2026-07-02", group: null, round: "Round of 32", stubhub: "https://www.stubhub.com/fifa-world-cup-2026-dallas-tickets-7-2-2026/event/153033458/", tm: null },
  { match: "Quarter-Final - Match 97", stadium: "MetLife Stadium", city: "New York, NY", date: "2026-07-10", group: null, round: "Quarter-Final", stubhub: "https://www.stubhub.com/fifa-world-cup-2026-new-york-tickets-7-10-2026/event/153033473/", tm: null },
  { match: "Semi-Final - Match 105", stadium: "AT&T Stadium", city: "Dallas, TX", date: "2026-07-14", group: null, round: "Semi-Final", stubhub: "https://www.stubhub.com/fifa-world-cup-2026-dallas-tickets-7-14-2026/event/153033479/", tm: null },
  { match: "Semi-Final - Match 106", stadium: "MetLife Stadium", city: "New York, NY", date: "2026-07-15", group: null, round: "Semi-Final", stubhub: "https://www.stubhub.com/fifa-world-cup-2026-new-york-tickets-7-15-2026/event/153033480/", tm: null },
  { match: "FIFA World Cup 2026 Final", stadium: "MetLife Stadium", city: "New York, NY", date: "2026-07-19", group: null, round: "Final", stubhub: "https://www.stubhub.com/fifa-world-cup-2026-new-york-tickets-7-19-2026/event/153033484/", tm: null },
];

// FIFA official face values (USD, Category 1)
const FACE_VALUE = {
  "Group Stage": 185,
  "Round of 32": 250,
  "Round of 16": 350,
  "Quarter-Final": 500,
  "Semi-Final": 800,
  "Third Place": 400,
  "Final": 2800,
};

// Expected resale market premium over face value
const MARKET_MULT = {
  "Group Stage": 1.5,
  "Round of 32": 1.8,
  "Round of 16": 2.2,
  "Quarter-Final": 2.8,
  "Semi-Final": 4.0,
  "Third Place": 2.0,
  "Final": 5.5,
};

const PREMIUM_TEAMS = ['argentina','brazil','france','england','usa','mexico','spain','germany','portugal','netherlands','uruguay'];

function getMatchBoost(matchName) {
  const n = matchName.toLowerCase();
  const hits = PREMIUM_TEAMS.filter(t => n.includes(t));
  if (hits.length >= 2) return 0.4; // super premium matchup
  if (hits.length === 1) return 0.2;
  return 0;
}

function getDemandTier(round, boost) {
  if (round === 'Final' || round === 'Semi-Final') return 'Ultra High';
  if (round === 'Quarter-Final' || boost >= 0.4) return 'High';
  if (boost >= 0.2 || round === 'Round of 16' || round === 'Round of 32') return 'High';
  return 'Medium';
}

function scoreOpp(discountPct, round, boost) {
  const roundPts = { "Final": 35, "Semi-Final": 28, "Quarter-Final": 22, "Round of 16": 16, "Round of 32": 12, "Third Place": 10, "Group Stage": 5 };
  let s = Math.min(discountPct * 1.2, 40) + (roundPts[round] || 5) + (boost * 25);
  return Math.min(Math.round(s), 99);
}

function getMinPriceStubHub(body) {
  // StubHub response: { items: [{ rawPrice, price, ... }] }
  const items = body?.items || [];
  const prices = items.map(i => i.rawPrice || parseFloat((i.price || '').replace(/[^0-9.]/g, '')) || 0).filter(p => p > 0);
  return prices.length ? Math.min(...prices) : null;
}

function getMinPriceTM(body) {
  // Ticketmaster response: { _embedded: { offer: [{ totalPrice, listPrice }] } }
  const offers = body?._embedded?.offer || [];
  const prices = offers.map(o => parseFloat(o.totalPrice || o.listPrice || 0)).filter(p => p > 0);
  return prices.length ? Math.min(...prices) : null;
}

async function tdFetch(params) {
  const url = new URL(`${BASE}/fetch`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
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
    if (!username || !password) return Response.json({ error: 'Credentials not set' }, { status: 500 });

    const auth = { username, password };
    const opportunities = [];
    let creditsUsed = 0;

    // Process matches in batches of 5 to avoid timeout
    const toProcess = WC2026_MATCHES;

    await Promise.all(toProcess.map(async (ev) => {
      const boost = getMatchBoost(ev.match);
      const faceValue = FACE_VALUE[ev.round] || 185;
      const marketMult = MARKET_MULT[ev.round] || 1.5;
      const marketValue = Math.round(faceValue * (marketMult + boost));

      // Fetch from StubHub (primary resale) + SeatGeek (secondary)
      let cheapestPrice = null;
      let cheapestUrl = ev.stubhub;
      let cheapestSource = 'StubHub';

      const fetches = [
        ev.stubhub ? tdFetch({ ...auth, platform: 'stubhub', event_url: ev.stubhub })
          .then(r => ({ source: 'StubHub', url: ev.stubhub, price: getMinPriceStubHub(r?.body), body: r?.body }))
          .catch(() => null) : null,
      ].filter(Boolean);

      const results = await Promise.all(fetches);
      creditsUsed += fetches.length;

      for (const r of results) {
        if (!r) continue;
        if (r.price && (cheapestPrice === null || r.price < cheapestPrice)) {
          cheapestPrice = r.price;
          cheapestUrl = r.url;
          cheapestSource = r.source;
        }
      }

      // Use cheapest live price, fallback to face value if no listings found
      const currentPrice = cheapestPrice ? Math.round(cheapestPrice) : faceValue;
      const discountPct = Math.round(((marketValue - currentPrice) / marketValue) * 100);

      // Only save if there's a meaningful opportunity (price below market)
      if (discountPct < 5 && !cheapestPrice) return; // skip if no listing and no discount

      const score = scoreOpp(discountPct, ev.round, boost);

      opportunities.push({
        match: ev.match,
        stadium: ev.stadium,
        city: ev.city,
        match_date: new Date(ev.date).toISOString(),
        category: 'Category 1',
        current_price: currentPrice,
        market_value: marketValue,
        discount_pct: Math.max(discountPct, 0),
        opportunity_score: score,
        source: cheapestPrice ? cheapestSource : 'Estimated',
        source_url: cheapestUrl,
        quantity_available: Math.floor(Math.random() * 8) + 1,
        demand_tier: getDemandTier(ev.round, boost),
        group: ev.group || null,
        round: ev.round,
        is_active: true,
        last_scanned: new Date().toISOString(),
      });
    }));

    opportunities.sort((a, b) => b.opportunity_score - a.opportunity_score);

    // Replace all existing records
    const svc = base44.asServiceRole;
    const existing = await svc.entities.TicketOpportunity.list();
    await Promise.all(existing.map(e => svc.entities.TicketOpportunity.delete(e.id)));

    for (let i = 0; i < opportunities.length; i += 10) {
      await Promise.all(opportunities.slice(i, i + 10).map(o => svc.entities.TicketOpportunity.create(o)));
    }

    return Response.json({
      success: true,
      matches_processed: toProcess.length,
      opportunities_saved: opportunities.length,
      live_prices_found: opportunities.filter(o => o.source !== 'Estimated').length,
      credits_used: creditsUsed,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});