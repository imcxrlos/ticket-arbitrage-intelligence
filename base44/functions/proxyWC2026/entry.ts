import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const res = await fetch('http://worldcup26.ir:3050/get/games');
    if (!res.ok) {
      return Response.json({ error: `API returned ${res.status}` }, { status: 502 });
    }
    const data = await res.json();
    const games = data.games || [];

    // Return only fields we need — keeps payload small and clean
    const clean = games.map(g => ({
      id: g.id,
      home: g.home_team_name_en,
      away: g.away_team_name_en,
      home_score: g.home_score === "null" || g.home_score == null ? null : Number(g.home_score),
      away_score: g.away_score === "null" || g.away_score == null ? null : Number(g.away_score),
      home_scorers: parseScorers(g.home_scorers),
      away_scorers: parseScorers(g.away_scorers),
      group: g.group,
      matchday: g.matchday,
      type: g.type,
      local_date: g.local_date,
      // Normalize status: "live" | "finished" | "upcoming"
      status: g.finished === "TRUE" ? "finished"
        : (g.time_elapsed && g.time_elapsed !== "finished") ? "live"
        : "upcoming",
      time_elapsed: (g.time_elapsed && g.time_elapsed !== "finished") ? g.time_elapsed : null,
    }));

    return Response.json({ games: clean });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function parseScorers(raw) {
  if (!raw || raw === "null") return [];
  try {
    const clean = raw
      .replace(/^\{/, "[").replace(/\}$/, "]")
      .replace(/\u201c|\u201d/g, '"')
      .replace(/\u2019/g, "'");
    return JSON.parse(clean);
  } catch {
    return raw.replace(/[{}"]/g, "").split(",").map(s => s.trim()).filter(Boolean);
  }
}