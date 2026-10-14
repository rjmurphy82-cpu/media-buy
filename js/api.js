// Browser side: talks to the Vercel API and polls for live updates.
const KEY = "mdmb-team-token";
export function getToken() { try { return localStorage.getItem(KEY); } catch { return null; } }
export function setToken(t) { try { t ? localStorage.setItem(KEY, t) : localStorage.removeItem(KEY); } catch {} }

export async function api(path, data) {
  const t = getToken();
  const r = await fetch("/api/" + path, {
    method: data ? "POST" : "GET",
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: "Bearer " + t } : {}) },
    body: data ? JSON.stringify(data) : undefined,
    cache: "no-store"
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) { const e = new Error(j.error || "Something went wrong. Try again."); e.status = r.status; throw e; }
  return j;
}

// Calls onState with fresh data every few seconds while the tab is visible.
// onState only fires when something changed, so screens don't flicker.
export function poll(onState, onAuthFail, ms = 2500, path = "state") {
  let last = "", timer = null, stopped = false;
  async function tick() {
    if (stopped) return;
    if (document.visibilityState === "visible") {
      try { const s = await api(path); const k = JSON.stringify(s); if (k !== last) { last = k; onState(s); } }
      catch (e) { if (e.status === 401) { stopped = true; onAuthFail(); return; } }
    }
    timer = setTimeout(tick, ms);
  }
  tick();
  return {
    stop() { stopped = true; clearTimeout(timer); },
    async now() { try { const s = await api(path); last = JSON.stringify(s); onState(s); } catch (e) { if (e.status === 401) { stopped = true; onAuthFail(); } } }
  };
}
