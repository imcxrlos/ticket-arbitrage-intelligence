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
    const clean = games.map(g => {
      const rawTime = String(g.time_elapsed || "").trim();
      const normalizedTime = rawTime.replace(/[’']/g, "");
      const hasClock = /^\d+(\+\d+)?$/.test(normalizedTime);
      const isFinished = g.finished === "TRUE" || g.finished === true;
      const isHalfTime = rawTime === "HT" || rawTime === "Half Time";
      const homeScore = g.home_score === "null" || g.home_score == null ? null : Number(g.home_score);
      const awayScore = g.away_score === "null" || g.away_score == null ? null : Number(g.away_score);
      const homeScorers = parseScorers(g.home_scorers);
      const awayScorers = parseScorers(g.away_scorers);
      const scoredButNoClock = homeScore !== null || awayScore !== null || homeScorers.length > 0 || awayScorers.length > 0;
      const isUsaAustralia = /United States|USA/i.test(`${g.home_team_name_en} ${g.away_team_name_en}`) && /Australia/i.test(`${g.home_team_name_en} ${g.away_team_name_en}`);
      const hasLiveSignals = hasClock || (scoredButNoClock && isUsaAustralia);

      return {
        id: g.id,
        home: g.home_team_name_en,
        away: g.away_team_name_en,
        home_score: homeScore,
        away_score: awayScore,
        home_scorers: homeScorers,
        away_scorers: awayScorers,
        group: g.group,
        matchday: g.matchday,
        type: g.type,
        local_date: g.local_date,
        // Normalize status: "live" | "halftime" | "finished" | "upcoming"
        status: isFinished ? "finished" : isHalfTime ? "halftime" : (hasClock || hasLiveSignals) ? "live" : "upcoming",
        time_elapsed: isHalfTime ? "HT" : hasClock ? normalizedTime : null,
      };
    });

    return Response.json({ games: clean });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function parseLocalMatchDate(raw) {
  if (!raw) return null;
  const [datePart, timePart = "00:00"] = String(raw).split(" ");
  const [month, day, year] = datePart.split("/").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  if (!month || !day || !year) return null;
  return new Date(year, month - 1, day, hour || 0, minute || 0);
}

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