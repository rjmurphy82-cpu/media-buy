// POST /api/teacher { action, ... }  -> teacher controls
//   create   { name, minSeg, luck, teams }  new game for a class period, made active
//   activate { id }                          switch the active game
//   open                                     open buying for the current year (or the next year after a reveal)
//   reveal                                   close buying, score the year, show results
//   final                                    show final standings after Year 4
import { who, getJSON, setJSON, redis, hgetall, P, ok, fail, body } from "./_lib.js";
import { YEARS, scoreYear } from "../js/model.js";
import { TEAMS } from "../js/teams.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return fail(res, 405, "Use POST.");
  const me = who(req);
  if (!me || me.role !== "teacher") return fail(res, 401, "Teacher login required.");
  try {
    const b = body(req);
    if (b.action === "create") {
      const teams = (b.teams || []).filter(id => TEAMS.some(t => t.id === id));
      if (teams.length < 2) return fail(res, 400, "Pick at least two teams.");
      const id = Date.now().toString(36);
      const game = { id, name: String(b.name || "Game").slice(0, 30), minSeg: [2, 3, 4].includes(+b.minSeg) ? +b.minSeg : 3, luck: !!b.luck, teams, phase: "lobby", year: 0, results: [], createdAt: Date.now() };
      await setJSON("game:" + id, game);
      const ids = (await getJSON("gameids")) || []; ids.unshift(id); await setJSON("gameids", ids);
      await redis("SET", P + "active", id);
      return ok(res, { game });
    }
    if (b.action === "activate") {
      if (!(await getJSON("game:" + b.id))) return fail(res, 404, "Game not found.");
      await redis("SET", P + "active", b.id);
      return ok(res, { active: b.id });
    }
    const activeId = await redis("GET", P + "active");
    const game = activeId ? await getJSON("game:" + activeId) : null;
    if (!game) return fail(res, 409, "No active game.");

    if (b.action === "open") {
      if (game.phase === "lobby") { game.phase = "open"; game.year = 0; }
      else if (game.phase === "revealed" && game.year < YEARS.length - 1) { game.phase = "open"; game.year += 1; }
      else return fail(res, 409, "Can't open buying right now.");
    } else if (b.action === "reveal") {
      if (game.phase !== "open") return fail(res, 409, "Buying isn't open.");
      const buys = await hgetall(`buys:${game.id}:${game.year}`);
      game.results[game.year] = scoreYear(game, game.year, buys, game.results[game.year - 1] || null);
      game.phase = "revealed";
    } else if (b.action === "final") {
      if (game.phase !== "revealed" || game.year < YEARS.length - 1) return fail(res, 409, "Finish Year 4 first.");
      game.phase = "final";
    } else return fail(res, 400, "Unknown action.");
    await setJSON("game:" + game.id, game);
    return ok(res, { game });
  } catch (e) { return fail(res, 500, e.message); }
}
