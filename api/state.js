// GET /api/state               -> a team's view (needs the team login)
// GET /api/state?view=teacher  -> the teacher console view (open, no password)
import { who, getJSON, redis, hgetall, activeGame, withTeams, MAX_TEAMS, P, ok, fail } from "./_lib.js";

export default async function handler(req, res) {
  const teacher = req.query && req.query.view === "teacher";
  const me = teacher ? { role: "teacher" } : who(req);
  if (!me) return fail(res, 401, "Please log in again.");
  try {
    const raw = await activeGame();
    const game = await withTeams(raw);
    const members = game ? game._members : {};
    if (game) delete game._members;
    if (me.role === "teacher") {
      const ids = (await getJSON("gameids")) || [];
      const games = ids.length ? (await redis("MGET", ...ids.map(id => P + "game:" + id))).filter(Boolean).map(s => { const g = JSON.parse(s); return { id: g.id, name: g.name, phase: g.phase, year: g.year, minSeg: g.minSeg }; }) : [];
      const buys = game ? await hgetall(`buys:${game.id}:${game.year}`) : {};
      return ok(res, { role: "teacher", game, games, buys, members, max: MAX_TEAMS });
    }
    // A team login belongs to one game. If the teacher switched games, send the team back to the join screen.
    if (!game || (me.game && me.game !== game.id)) return fail(res, 401, "A new game started. Join again.");
    if (!game.teams.includes(me.team)) return fail(res, 401, "Your team was removed. Join again.");
    const v = await redis("HGET", `${P}buys:${game.id}:${game.year}`, me.team);
    return ok(res, { role: "team", team: me.team, roster: members[me.team] || [], game, myBuy: v ? JSON.parse(v) : null });
  } catch (e) { return fail(res, 500, e.message); }
}
