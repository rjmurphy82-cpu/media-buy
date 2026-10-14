// POST /api/login
//   Team:    { role: "team", team, names: ["Ava", "Marcus"] }   no password, like Bond Desk
//   Teacher: { role: "teacher", password }
import { sign, same, activeGame, redis, P, ok, fail, body } from "./_lib.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return fail(res, 405, "Use POST.");
  try {
    const b = body(req);
    if (b.role === "teacher") {
      if (!process.env.TEACHER_PASSWORD) return fail(res, 500, "TEACHER_PASSWORD is not set in Vercel.");
      if (!same(b.password, process.env.TEACHER_PASSWORD)) return fail(res, 401, "Wrong teacher password.");
      return ok(res, { token: sign({ role: "teacher" }), role: "teacher" });
    }
    const game = await activeGame();
    if (!game) return fail(res, 409, "No game is running yet. Wait for your teacher.");
    if (!game.teams.includes(b.team)) return fail(res, 400, "Pick your team.");
    const names = (Array.isArray(b.names) ? b.names : []).map(n => String(n).trim().replace(/\s+/g, " ").slice(0, 30)).filter(Boolean).slice(0, 5);
    if (!names.length) return fail(res, 400, "Type at least one name.");
    // Add these names to the team's roster for this game (no duplicates)
    const key = `${P}members:${game.id}`;
    const prev = JSON.parse((await redis("HGET", key, b.team)) || "[]");
    const roster = [...prev]; names.forEach(n => { if (!roster.some(r => r.toLowerCase() === n.toLowerCase())) roster.push(n); });
    await redis("HSET", key, b.team, JSON.stringify(roster.slice(0, 8)));
    return ok(res, { token: sign({ role: "team", team: b.team, names, game: game.id }), role: "team", team: b.team, names });
  } catch (e) { return fail(res, 500, e.message); }
}
