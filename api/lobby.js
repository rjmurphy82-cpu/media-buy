// GET /api/lobby                -> public: what the student start screen needs (is a class game running?)
// GET /api/lobby?channel=class  -> the class game and its teams, for the join screen
// GET /api/lobby?channel=open   -> Open Play and its teams
import { activeGame, gameFor, teamsOf, maxTeams, ok, fail } from "./_lib.js";

export default async function handler(req, res) {
  try {
    const channel = req.query && req.query.channel;
    if (!channel) {
      const g = await activeGame();
      return ok(res, { classGame: g ? { id: g.id, name: g.name, mode: g.mode || "live", phase: g.phase } : null });
    }
    const g = await gameFor(channel);
    if (!g) return ok(res, { game: null });
    const t = await teamsOf(g.id);
    return ok(res, { game: { id: g.id, name: g.name, mode: g.mode || "live" }, teams: t.ids.map(id => ({ id, name: t.names[id] })), max: maxTeams(g) });
  } catch (e) { return fail(res, 500, e.message); }
}
