// GET /api/lobby  -> public: the active game's name and teams, for the login screen
import { activeGame, ok, fail } from "./_lib.js";

export default async function handler(req, res) {
  try {
    const g = await activeGame();
    return ok(res, { game: g ? { id: g.id, name: g.name, teams: g.teams } : null });
  } catch (e) { return fail(res, 500, e.message); }
}
