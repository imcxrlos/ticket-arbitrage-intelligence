import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Debug: test ONE ticketmaster /fetch call and return raw response
// Costs 1 quota credit — use sparingly

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const tdUser = Deno.env.get('TICKETSDATA_USERNAME');
    const tdPass = Deno.env.get('TICKETSDATA_PASSWORD');

    const tmUrl = 'https://www.ticketmaster.com/world-cup-final-match-104-east-rutherford-new-jersey-07-19-2026/event/02006239A0E942E6';

    const url = new URL('https://ticketsdata.com/fetch');
    url.searchParams.set('username', tdUser);
    url.searchParams.set('password', tdPass);
    url.searchParams.set('platform', 'ticketmaster');
    url.searchParams.set('event_url', tmUrl);

    const res = await fetch(url.toString());
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text.substring(0, 500) }; }

    // Return the top-level keys and body keys so we know the structure without dumping everything
    const bodyKeys = data?.body ? Object.keys(data.body) : [];
    const embeddedKeys = data?.body?._embedded ? Object.keys(data.body._embedded) : [];
    const offerSample = data?.body?._embedded?.offer?.slice(0, 2) ?? null;
    const itemsSample = Array.isArray(data?.body?.items) ? data.body.items.slice(0, 2) : null;

    return Response.json({
      http_status: res.status,
      top_level_keys: Object.keys(data || {}),
      api_status: data?.status,
      body_keys: bodyKeys,
      embedded_keys: embeddedKeys,
      offer_sample: offerSample,
      items_sample: itemsSample,
      quota_remaining: data?.quota_remaining ?? null,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});