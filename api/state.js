// GET /api/state               -> a team's view (needs the team login)
// GET /api/state?view=teacher  -> the teacher console view of the class game (open, no password)
// GET /api/state?view=teacher&game=openplay -> the teacher console view of Open Play
import { who, getJSON, redis, hgetall, activeGame, openPlayGame, gameForToken, withTeams, maxTeams, OPEN_ID, P, ok, fail } from "./_lib.js";

export default async function handler(req, res) {
  const teacher = req.query && req.query.view === "teacher";
  const me = teacher ? { role: "teacher" } : who(req);
  if (!me) return fail(res, 401, "Please log in again.");
  try {
    const raw = me.role === "teacher" ? (req.query.game === OPEN_ID ? await openPlayGame() : await activeGame()) : await gameForToken(me);
    const game = await withTeams(raw);
    const members = game ? game._members : {};
    if (game) delete game._members;
    if (me.role === "teacher") {
      const ids = (await getJSON("gameids")) || [];
      const games = ids.length ? (await redis("MGET", ...ids.map(id => P + "game:" + id))).filter(Boolean).map(s => { const g = JSON.parse(s); return { id: g.id, name: g.name, phase: g.phase, year: g.year, minSeg: g.minSeg, mode: g.mode || "live", company: g.company, companies: g.companies }; }) : [];
      const buys = game && game.mode !== "self" ? await hgetall(`buys:${game.id}:${game.year}`) : {};
      const progress = game && game.mode === "self" ? await hgetall(`prog:${game.id}`) : {};
      return ok(res, { role: "teacher", game, games, buys, progress, members, max: game ? maxTeams(game) : 15, activeId: await redis("GET", P + "active") });
    }
    // A team login belongs to one game. If the teacher switched games, send the team back to the join screen.
    if (!game) return fail(res, 401, "Your teacher started a new game. Join again.");
    if (!game.teams.includes(me.team)) return fail(res, 401, "Your team was removed. Join again.");
    if (game.mode === "self") {
      const p = await redis("HGET", `${P}prog:${game.id}`, me.team);
      return ok(res, { role: "team", team: me.team, roster: members[me.team] || [], game, prog: p ? JSON.parse(p) : { companies: {} } });
    }
    const v = await redis("HGET", `${P}buys:${game.id}:${game.year}`, me.team);
    return ok(res, { role: "team", team: me.team, roster: members[me.team] || [], game, myBuy: v ? JSON.parse(v) : null });
  } catch (e) { return fail(res, 500, e.message); }
}
