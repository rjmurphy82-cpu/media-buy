// GET /api/state  -> everything the signed-in page needs. Pages poll this every few seconds.
import { who, getJSON, redis, hgetall, P, ok, fail } from "./_lib.js";

export default async function handler(req, res) {
  const me = who(req);
  if (!me) return fail(res, 401, "Please log in again.");
  try {
    const activeId = await redis("GET", P + "active");
    const game = activeId ? await getJSON("game:" + activeId) : null;
    if (me.role === "teacher") {
      const ids = (await getJSON("gameids")) || [];
      const games = ids.length ? (await redis("MGET", ...ids.map(id => P + "game:" + id))).filter(Boolean).map(s => { const g = JSON.parse(s); return { id: g.id, name: g.name, phase: g.phase, year: g.year, teams: g.teams, minSeg: g.minSeg }; }) : [];
      const buys = game ? await hgetall(`buys:${game.id}:${game.year}`) : {};
      const members = game ? await hgetall(`members:${game.id}`) : {};
      return ok(res, { role: "teacher", game, games, buys, members });
    }
    let myBuy = null;
    if (game) { const v = await redis("HGET", `${P}buys:${game.id}:${game.year}`, me.team); myBuy = v ? JSON.parse(v) : null; }
    // A team login belongs to one game. If the teacher switched games, send the team back to log in.
    if (game && me.game && me.game !== game.id) return fail(res, 401, "A new game started. Log in again.");
    const roster = game ? JSON.parse((await redis("HGET", `${P}members:${game.id}`, me.team)) || "[]") : [];
    return ok(res, { role: "team", team: me.team, names: me.names || [], roster, game, myBuy });
  } catch (e) { return fail(res, 500, e.message); }
}
