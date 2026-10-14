// POST /api/login  -> students make or join a team. No passwords.
//   channel "class" (the teacher's game) or "open" (Open Play)
//   New team:  { channel, mode: "new",  names: ["Ava", "Marcus"] }   team name becomes "Ava & Marcus"
//   Join team: { channel, mode: "join", team: "<team id>", name: "Jordan" }
import { sign, gameFor, teamsOf, firstName, teamLabel, maxTeams, redis, P, ok, fail, body } from "./_lib.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return fail(res, 405, "Use POST.");
  try {
    const b = body(req);
    const game = await gameFor(b.channel === "open" ? "open" : "class");
    if (!game) return fail(res, 409, "No class game is running yet. Wait for your teacher, or pick Open Play.");
    const key = `${P}teams:${game.id}`;
    const { ids, all } = await teamsOf(game.id);

    if (b.mode === "join") {
      const t = all[b.team];
      if (!t) return fail(res, 404, "That team isn't in this game anymore. Pick another or make a new one.");
      const n = firstName(b.name);
      if (!n) return fail(res, 400, "Type your first name.");
      if (!t.members.some(m => m.toLowerCase() === n.toLowerCase()) && t.members.length < 5) t.members.push(n);
      t.name = teamLabel(t.members);
      await redis("HSET", key, b.team, JSON.stringify(t));
      return ok(res, { token: sign({ role: "team", team: b.team, game: game.id }), team: b.team, name: t.name });
    }

    const members = [];
    (Array.isArray(b.names) ? b.names : []).map(firstName).filter(Boolean).forEach(n => { if (!members.some(m => m.toLowerCase() === n.toLowerCase())) members.push(n); });
    if (!members.length) return fail(res, 400, "Type at least one first name.");
    if (ids.length >= maxTeams(game)) return fail(res, 409, `This game is full (${maxTeams(game)} teams). Join one of the teams already listed.`);
    let name = teamLabel(members.slice(0, 5));
    const taken = new Set(ids.map(id => all[id].name.toLowerCase()));
    for (let i = 2; taken.has(name.toLowerCase()); i++) name = teamLabel(members.slice(0, 5)) + " " + i;
    const id = "t" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    await redis("HSET", key, id, JSON.stringify({ name, members: members.slice(0, 5), created: Date.now() }));
    return ok(res, { token: sign({ role: "team", team: id, game: game.id }), team: id, name });
  } catch (e) { return fail(res, 500, e.message); }
}
