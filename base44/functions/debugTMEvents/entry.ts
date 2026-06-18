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

    // Try multiple known StubHub FIFA WC2026 performer URLs
    const performerUrls = [
      'https://www.stubhub.com/fifa-world-cup-tickets/performer/4750453/',
      'https://www.stubhub.com/world-cup-soccer-tickets/performer/100296595/',
      'https://www.stubhub.com/2026-fifa-world-cup-tickets/performer/100296595/',
    ];

    const results = [];
    for (const pUrl of performerUrls) {
      const url = new URL('https://ticketsdata.com/events');
      url.searchParams.set('username', tdUser);
      url.searchParams.set('password', tdPass);
      url.searchParams.set('platform', 'stubhub');
      url.searchParams.set('performer_url', pUrl);

      const res = await fetch(url.toString());
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { raw: text.substring(0, 300) }; }

      results.push({ performer_url: pUrl, status: res.status, event_count: Array.isArray(data) ? data.length : data?.events?.length ?? null, sample: Array.isArray(data) ? data.slice(0, 2) : data });

      // Stop if we found events
      if (res.status === 200 && (Array.isArray(data) && data.length > 0)) break;
    }

    return Response.json({ results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});