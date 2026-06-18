import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const tdUser = Deno.env.get('TICKETSDATA_USERNAME');
    const tdPass = Deno.env.get('TICKETSDATA_PASSWORD');

    // Step 1: Discover WC2026 events from StubHub performer page
    const eventsUrl = new URL('https://ticketsdata.com/events');
    eventsUrl.searchParams.set('username', tdUser);
    eventsUrl.searchParams.set('password', tdPass);
    eventsUrl.searchParams.set('platform', 'stubhub');
    eventsUrl.searchParams.set('performer_url', 'https://www.stubhub.com/fifa-world-cup-tickets/performer/4750453/');

    const evRes = await fetch(eventsUrl.toString());
    const evText = await evRes.text();
    let evData;
    try { evData = JSON.parse(evText); } catch { evData = { raw: evText.substring(0, 1000) }; }

    // Step 2: Also try seatgeek performer page
    const sgUrl = new URL('https://ticketsdata.com/events');
    sgUrl.searchParams.set('username', tdUser);
    sgUrl.searchParams.set('password', tdPass);
    sgUrl.searchParams.set('platform', 'seatgeek');
    sgUrl.searchParams.set('performer_url', 'https://seatgeek.com/fifa-world-cup-tickets');

    const sgRes = await fetch(sgUrl.toString());
    const sgText = await sgRes.text();
    let sgData;
    try { sgData = JSON.parse(sgText); } catch { sgData = { raw: sgText.substring(0, 1000) }; }

    return Response.json({
      stubhub_status: evRes.status,
      stubhub_events: evData,
      seatgeek_status: sgRes.status,
      seatgeek_events: sgData,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});