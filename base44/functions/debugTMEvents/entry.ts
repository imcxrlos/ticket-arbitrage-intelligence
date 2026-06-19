import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Debug: fetch ONE StubHub + ONE SeatGeek call and return raw body structure
// Uses /fetch quota (huge pool) - safe to run

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const tdUser = Deno.env.get('TICKETSDATA_USERNAME');
    const tdPass = Deno.env.get('TICKETSDATA_PASSWORD');

    let payload = {};
    try { payload = await req.json(); } catch { payload = {}; }
    if (payload.confirmPaidFetch !== 'RUN_PAID_FETCH') {
      return Response.json({
        success: true,
        mode: 'dry_run',
        paid_calls_made: 0,
        message: 'No TicketsData credits used. Pass confirmPaidFetch:"RUN_PAID_FETCH" to inspect one live response.'
      });
    }

    const targets = [
      { platform: 'stubhub', event_url: 'https://www.stubhub.com/world-cup-east-rutherford-tickets-7-19-2026/event/153020449/' },
      { platform: 'seatgeek', event_url: 'https://seatgeek.com/fifa-world-cup-tickets/international-soccer/2026-07-19-3-pm/17307574' },
    ];

    const results = [];

    for (const t of targets.slice(0, 1)) {
      const url = new URL('https://ticketsdata.com/fetch');
      url.searchParams.set('username', tdUser);
      url.searchParams.set('password', tdPass);
      url.searchParams.set('platform', t.platform);
      url.searchParams.set('event_url', t.event_url);

      const res = await fetch(url.toString());
      const data = await res.json();

      const body = data?.body;
      const bodyKeys = body ? Object.keys(body) : [];

      // Drill into every possible nested key to find where listings live
      let sample = null;
      if (body) {
        // Try common paths
        if (Array.isArray(body.items)) sample = { path: 'body.items', type: 'array', length: body.items.length, first: body.items[0] };
        else if (body.items && Array.isArray(body.items.offers)) sample = { path: 'body.items.offers', type: 'array', length: body.items.offers.length, first: body.items.offers[0] };
        else if (body._embedded?.offer) sample = { path: 'body._embedded.offer', type: 'array', length: body._embedded.offer.length, first: body._embedded.offer[0] };
        else if (Array.isArray(body.listings)) sample = { path: 'body.listings', type: 'array', length: body.listings.length, first: body.listings[0] };
        else if (Array.isArray(body.events)) sample = { path: 'body.events', type: 'array', length: body.events.length, first: body.events[0] };
        else {
          // dump full body if small
          sample = { path: 'unknown', body_keys: bodyKeys, raw: JSON.stringify(body).slice(0, 800) };
        }
      }

      results.push({
        platform: t.platform,
        http_status: res.status,
        api_status: data?.status,
        quota_remaining: data?.quota_remaining,
        body_keys: bodyKeys,
        sample,
      });
    }

    return Response.json({ paid_calls_made: results.length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});