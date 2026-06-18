import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const tmApiKey = Deno.env.get('TICKETMASTER_API_KEY');

    // Search for WC2026 events
    const searchUrl = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${tmApiKey}&keyword=FIFA+World+Cup+2026&size=10&sort=date,asc&classificationName=Sports`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    const events = searchData._embedded?.events || [];

    // Get full detail for first event
    const firstEvent = events[0];
    let fullDetail = null;
    if (firstEvent) {
      const detailRes = await fetch(`https://app.ticketmaster.com/discovery/v2/events/${firstEvent.id}?apikey=${tmApiKey}`);
      fullDetail = await detailRes.json();
    }

    // Also try SeatGeek for WC2026
    const sgRes = await fetch(`https://api.seatgeek.com/2/events?q=FIFA+World+Cup+2026&per_page=5&sort=score.desc`);
    const sgData = await sgRes.json();

    return Response.json({
      tm_count: events.length,
      tm_events_summary: events.map(e => ({
        id: e.id,
        name: e.name,
        date: e.dates?.start?.localDate,
        has_price_ranges: !!e.priceRanges,
        price_ranges: e.priceRanges || null,
        sales: e.sales || null,
        url: e.url,
      })),
      tm_first_full: fullDetail ? {
        priceRanges: fullDetail.priceRanges,
        sales: fullDetail.sales,
        ticketing: fullDetail.ticketing,
        accessibility: fullDetail.accessibility,
      } : null,
      sg_count: sgData.events?.length || 0,
      sg_events: (sgData.events || []).map(e => ({
        id: e.id,
        title: e.title,
        date: e.datetime_local,
        lowest_price: e.stats?.lowest_price,
        avg_price: e.stats?.average_price,
        listing_count: e.stats?.listing_count,
        url: e.url,
      })),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});