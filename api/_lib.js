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
// The class game: whatever the teacher made active (live or self-paced). Null until the teacher sets one.
export async function activeGame() {
  const id = await redis("GET", P + "active");
  return id ? getJSON("game:" + id) : null;
}

// Open Play: a permanent self-paced game with all five companies that students can always play
// on their own. It never needs the teacher, and its reports show up in the teacher console.
export const OPEN_ID = "openplay";
export async function openPlayGame() {
  const g = await getJSON("game:" + OPEN_ID);
  if (g) return g;
  const { COMPANIES } = await import("../js/model.js");
  const game = { id: OPEN_ID, name: "Open Play", mode: "self", company: COMPANIES[0].id, companies: COMPANIES.map(c => c.id), minSeg: 3, luck: true, phase: "open", year: 0, results: [], maxTeams: 90, createdAt: Date.now() };
  await setJSON("game:" + OPEN_ID, game);
  return game;
}
export const gameFor = channel => channel === "open" ? openPlayGame() : activeGame();
// The game a team's login belongs to, or null if that class game is no longer the active one
export async function gameForToken(me) {
  if (me.game === OPEN_ID) return openPlayGame();
  const g = await activeGame();
  return g && g.id === me.game ? g : null;
}
export const maxTeams = g => g.maxTeams || MAX_TEAMS;

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
