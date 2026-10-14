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
export async function activeGame() {
  const id = await redis("GET", P + "active");
  return id ? getJSON("game:" + id) : null;
}

/* ---------- responses ---------- */
export const ok = (res, data) => { res.setHeader("Cache-Control", "no-store"); return res.status(200).json(data); };
export const fail = (res, code, error) => { res.setHeader("Cache-Control", "no-store"); return res.status(code).json({ error }); };
export const body = req => (typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {});
