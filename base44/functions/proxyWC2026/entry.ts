import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const res = await fetch('http://worldcup26.ir:3050/get/games');
    if (!res.ok) {
      return Response.json({ error: `API returned ${res.status}` }, { status: 502 });
    }
    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});