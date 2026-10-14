// Shared server helpers: Redis storage (Upstash via Vercel Marketplace), login tokens, responses.
// Files that start with "_" in /api are not public routes.
import crypto from "node:crypto";

/* ---------- Redis over REST (no packages needed) ---------- */
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export async function redis(...cmd) {
  if (!URL_ || !TOKEN) throw new Error("Storage is not connected. Add a Redis database in Vercel > Storage.");
  const r = await fetch(URL_, { method: "POST", headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" }, body: JSON.stringify(cmd) });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}
export const P = "mdmb:"; // key prefix so this game can share a database with other apps
export async function getJSON(key) { const v = await redis("GET", P + key); return v ? JSON.parse(v) : null; }
export async function setJSON(key, val) { return redis("SET", P + key, JSON.stringify(val)); }
export async function hgetall(key) {
  const flat = (await redis("HGETALL", P + key)) || [];
  if (!Array.isArray(flat)) return flat;
  const o = {}; for (let i = 0; i < flat.length; i += 2) o[flat[i]] = JSON.parse(flat[i + 1]); return o;
}

/* ---------- login tokens ---------- */
// Signs team logins so a browser stays on the team it joined. SESSION_SECRET is optional.
const SECRET = process.env.SESSION_SECRET || "mdmb-hersey-media-buy";
const b64 = s => Buffer.from(s).toString("base64url");
const hmac = s => crypto.createHmac("sha256", SECRET).update(s).digest("base64url");

export function sign(payload, hours = 12) {
  const body = b64(JSON.stringify({ ...payload, exp: Date.now() + hours * 3600e3 }));
  return body + "." + hmac(body);
}
export function who(req) {
  const t = (req.headers.authorization || "").replace(/^Bearer /, "");
  const [body, sig] = t.split(".");
  if (!body || !sig) return null;
  const good = hmac(body);
  if (sig.length !== good.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good))) return null;
  try { const p = JSON.parse(Buffer.from(body, "base64url").toString()); return p.exp > Date.now() ? p : null; } catch { return null; }
}
export function same(a, b) {
  const x = Buffer.from(String(a ?? "")), y = Buffer.from(String(b ?? ""));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}
// The game students land in. If the teacher hasn't set one up, a self-paced game with
// all five companies starts on its own, so students can always just log on and play.
export async function activeGame() {
  const id = await redis("GET", P + "active");
  if (id) { const g = await getJSON("game:" + id); if (g) return g; }
  const { COMPANIES } = await import("../js/model.js");
  const nid = Date.now().toString(36);
  const game = { id: nid, name: "Open Play", mode: "self", company: COMPANIES[0].id, companies: COMPANIES.map(c => c.id), minSeg: 3, luck: true, phase: "open", year: 0, results: [], createdAt: Date.now() };
  await setJSON("game:" + nid, game);
  const won = await redis("SET", P + "active", nid, "NX");
  if (won !== "OK" && id === null) { const cur = await redis("GET", P + "active"); if (cur && cur !== nid) { const g = await getJSON("game:" + cur); if (g) return g; } }
  if (won !== "OK") await redis("SET", P + "active", nid); // the old active game was deleted
  const ids = (await getJSON("gameids")) || []; ids.unshift(nid); await setJSON("gameids", ids);
  return game;
}

/* ---------- student-made teams ---------- */
export const MAX_TEAMS = 15;
// Teams for a game live in one hash: teamId -> { name, members, created }
export async function teamsOf(gameId) {
  const all = await hgetall(`teams:${gameId}`);
  const ids = Object.keys(all).sort((a, b) => all[a].created - all[b].created);
  const names = {}, members = {};
  ids.forEach(id => { names[id] = all[id].name; members[id] = all[id].members; });
  return { ids, names, members, all };
}
// Adds the live team list to a game object so pages and scoring can use it
export async function withTeams(game) {
  if (!game) return null;
  const t = await teamsOf(game.id);
  return { ...game, teams: t.ids, teamNames: t.names, _members: t.members };
}
// First names only: "ava lopez" -> "Ava"
export const firstName = n => { const w = String(n || "").trim().split(/\s+/)[0].replace(/[^\p{L}'-]/gu, "").slice(0, 14); return w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ""; };
export function teamLabel(members) {
  const m = members.slice(0, 5);
  if (m.length <= 1) return m[0] || "Team";
  if (m.length === 2) return m[0] + " & " + m[1];
  return m.slice(0, -1).join(", ") + " & " + m[m.length - 1];
}

/* ---------- responses ---------- */
export const ok = (res, data) => { res.setHeader("Cache-Control", "no-store"); return res.status(200).json(data); };
export const fail = (res, code, error) => { res.setHeader("Cache-Control", "no-store"); return res.status(code).json({ error }); };
export const body = req => (typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {});
