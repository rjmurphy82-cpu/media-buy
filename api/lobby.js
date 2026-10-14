// GET /api/lobby  -> public: the active game and the teams already made, for the join screen
import { activeGame, teamsOf, MAX_TEAMS, ok, fail } from "./_lib.js";

export default async function handler(req, res) {
  try {
    const g = await activeGame();
    if (!g) return ok(res, { game: null });
    const t = await teamsOf(g.id);
    return ok(res, { game: { id: g.id, name: g.name }, teams: t.ids.map(id => ({ id, name: t.names[id] })), max: MAX_TEAMS });
  } catch (e) { return fail(res, 500, e.message); }
}
