// POST /api/buy { alloc: [6 block counts] }  -> saves this team's buy for the open year
import { who, getJSON, redis, P, ok, fail, body } from "./_lib.js";
import { SEGS, rowState } from "../js/model.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return fail(res, 405, "Use POST.");
  const me = who(req);
  if (!me || me.role !== "team") return fail(res, 401, "Please log in again.");
  try {
    const { alloc } = body(req);
    const activeId = await redis("GET", P + "active");
    const game = activeId ? await getJSON("game:" + activeId) : null;
    if (!game) return fail(res, 409, "No game is running.");
    if (me.game && me.game !== game.id) return fail(res, 401, "A new game started. Log in again.");
    if (!game.teams.includes(me.team)) return fail(res, 403, "Your team isn't in this game.");
    if (game.phase !== "open") return fail(res, 409, "Buying is closed.");
    if (!Array.isArray(alloc) || alloc.length !== SEGS.length || alloc.some(n => !Number.isInteger(n) || n < 0 || n > 10)) return fail(res, 400, "That buy isn't valid.");
    const st = rowState(alloc, game.minSeg);
    if (!st.ok) return fail(res, 400, st.txt);
    await redis("HSET", `${P}buys:${game.id}:${game.year}`, me.team, JSON.stringify(alloc));
    return ok(res, { saved: true, year: game.year, alloc });
  } catch (e) { return fail(res, 500, e.message); }
}
