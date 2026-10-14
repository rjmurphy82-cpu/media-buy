// Teacher console: create a game per class period, open each year, close buying, reveal results.
import { api, poll } from "./api.js";
import { teamName, setTeamNames } from "./teams.js";
import { YEARS, esc, rowState, briefHTML, rulesHTML, newsHTML, resultsHTML, standingsHTML, finalHTML, yearBar } from "./game.js";

const $ = s => document.querySelector(s);
const S = { view: "control", game: null, games: [], buys: {}, members: {}, max: 15, confirm: false, removing: null, busy: false };
let poller = null;

/* ---------- start: no teacher login ---------- */
function start() {
  $("#tabs").hidden = false;
  $("#app").innerHTML = `<p class="muted">Connecting\u2026</p>`;
  poller = poll(onState, () => {}, 2000, "state?view=teacher");
}

function onState(s) {
  S.game = s.game; S.games = s.games || []; S.buys = s.buys || {}; S.members = s.members || {}; S.max = s.max || 15;
  setTeamNames(S.game ? S.game.teamNames : {});
  if (!S.game && S.view === "control") S.view = "games";
  render();
}

/* ---------- screens ---------- */
function render() {
  // Don't redraw the new-game form while the teacher is typing in it
  if (S.view === "games" && document.activeElement && document.activeElement.closest && document.activeElement.closest("#newGame")) { refreshGameList(); return; }
  document.querySelectorAll("#tabs button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.view === S.view)));
  $("#yearbar").innerHTML = S.game ? yearBar(S.game) : "";
  const app = $("#app"), results = S.game ? S.game.results || [] : [];
  if (S.view === "brief") app.innerHTML = briefHTML();
  else if (S.view === "standings") app.innerHTML = `<div class="stack"><div><span class="eyebrow">${S.game ? esc(S.game.name) : ""}</span><h2>Standings</h2></div><div class="panel">${S.game ? standingsHTML(S.game, results) : `<p class="muted">No active game.</p>`}</div></div>`;
  else if (S.view === "games" || !S.game) app.innerHTML = gamesHTML();
  else app.innerHTML = controlHTML();
  bind();
}

const namesLine = id => (S.members[id] || []).length ? `<small class="muted" style="font-size:13px;line-height:1.3">${esc(S.members[id].join(", "))}</small>` : "";
const statusText = g => g.phase === "lobby" ? "Not started" : g.phase === "final" ? "Finished" : g.phase === "open" ? `Year ${g.year + 1} buying` : `Year ${g.year + 1} results`;
function gameListHTML() {
  return S.games.length ? `<div class="tablewrap"><table><thead><tr><th>Game</th><th>Status</th><th></th></tr></thead><tbody>${S.games.map(g => `<tr><td><b>${esc(g.name)}</b><div class="muted" style="font-size:14px">Min ${g.minSeg} segments</div></td><td>${statusText(g)}</td><td class="r">${S.game && g.id === S.game.id ? `<span class="pill ok">Active</span>` : `<button class="btn ghost small" data-activate="${g.id}">Make active</button>`}</td></tr>`).join("")}</tbody></table></div>` : `<p class="muted">No games yet. Create one to start.</p>`;
}
function refreshGameList() { const el = $("#gameList"); if (el) { el.innerHTML = gameListHTML(); bind(); } }

function gamesHTML() {
  return `<div class="stack">
  <div><span class="eyebrow">Class periods</span><h2>Games</h2><p class="lede">Make one game per class period. Teams always join whichever game is active.</p></div>
  <div class="grid2">
    <form class="panel stack" id="newGame" style="gap:14px"><h3>New game</h3>
      <div class="opts">
        <label for="gname">Name<input type="text" id="gname" placeholder="Period 8" required maxlength="30"></label>
        <label for="minSeg">Minimum segments<select id="minSeg"><option>2</option><option selected>3</option><option>4</option></select></label>
        <label class="check" for="luck"><input type="checkbox" id="luck" checked> Market luck (up to 10%)</label>
      </div>
      <p class="muted" style="margin:0">Students make their own teams (up to 15) from their first names when they join.</p>
      <div class="row"><button class="btn" type="submit" id="createBtn">Create and make active</button></div>
    </form>
    <div class="panel"><h3>Saved games</h3><div id="gameList">${gameListHTML()}</div></div>
  </div></div>`;
}

function controlHTML() {
  const g = S.game, y = g.year, results = g.results || [];
  if (g.phase === "lobby") return `<div class="stack">
    <div><span class="eyebrow">${esc(g.name)} · Ready</span><h2>Teams are joining</h2><p class="lede">Students go to the main link and type their first names to make a team. Open Year 1 when everyone is in.</p></div>
    <div class="grid2"><div class="panel"><h3>Rules</h3>${rulesHTML(g.minSeg)}</div>
    <div class="panel stack" style="gap:12px"><h3>${g.teams.length} of ${S.max} teams</h3>
      ${g.teams.length ? `<div class="statusgrid">${g.teams.map(id => `<div class="done"><b>${esc(teamName(id))}</b>${S.removing === id ? `<span><button class="btn small" data-remove="${id}">Remove</button> <button class="btn ghost small" id="keepTeam">Keep</button></span>` : `<button class="btn ghost small" data-askremove="${id}" style="align-self:flex-start;margin-top:4px">Remove</button>`}</div>`).join("")}</div>` : `<p class="muted">No teams yet. They appear here as students join.</p>`}
    <div class="row"><button class="btn" data-act="open" ${g.teams.length ? "" : "disabled"}>Open Year 1 buying</button><button class="btn ghost small" data-view="brief">Show the brief</button></div></div></div></div>`;

  if (g.phase === "open") {
    const ready = g.teams.filter(id => S.buys[id] && rowState(S.buys[id], g.minSeg).ok);
    const missing = g.teams.filter(id => !ready.includes(id));
    return `<div class="stack">${newsHTML(y)}
      <div><h2>Buys coming in</h2><p class="muted" style="margin:0">${ready.length} of ${g.teams.length} teams submitted. Splits stay hidden until the reveal.</p></div>
      <div class="statusgrid">${g.teams.map(id => `<div class="${ready.includes(id) ? "done" : ""}"><b>${esc(teamName(id))}</b><span>${ready.includes(id) ? "Submitted" : "Working"}</span></div>`).join("")}</div>
      ${S.confirm ? `<div class="confirm"><span>${missing.length} team(s) haven’t submitted: ${missing.map(id => esc(teamName(id))).join(", ")}. They will earn $0 this year.</span><button class="btn small" data-act="reveal">Reveal anyway</button><button class="btn ghost small" id="cancel">Keep waiting</button></div>` : ""}
      <div class="row"><button class="btn" id="tryReveal" ${S.busy ? "disabled" : ""}>${S.busy ? "Scoring…" : "Close buying and reveal"}</button></div></div>`;
  }

  if (g.phase === "revealed") {
    const last = y >= YEARS.length - 1;
    return `<div class="stack">${results[y] ? resultsHTML(g, results[y]) : ""}
      <div class="row"><button class="btn" data-act="${last ? "final" : "open"}" ${S.busy ? "disabled" : ""}>${last ? "Show final standings" : "Open Year " + (y + 2) + " buying"}</button><button class="btn ghost small" data-view="standings">Standings so far</button></div></div>`;
  }

  return `<div class="stack">${finalHTML(g, results)}<div class="row"><button class="btn ghost" data-view="games">Start a new game</button></div></div>`;
}

/* ---------- actions ---------- */
async function act(data) {
  S.busy = true; S.confirm = false; render();
  try { await api("teacher", data); }
  catch (e) { toast(e.message); }
  S.busy = false;
  if (poller) await poller.now(); else render();
  window.scrollTo(0, 0);
}

function bind() {
  document.querySelectorAll("[data-view]").forEach(b => b.onclick = () => { S.view = b.dataset.view; S.confirm = false; render(); window.scrollTo(0, 0); });
  document.querySelectorAll("[data-activate]").forEach(b => b.onclick = async () => { S.view = "control"; await act({ action: "activate", id: b.dataset.activate }); });
  document.querySelectorAll("[data-act]").forEach(b => b.onclick = () => act({ action: b.dataset.act }));
  const ng = $("#newGame");
  if (ng) ng.onsubmit = async e => {
    e.preventDefault();
    const data = { action: "create", name: $("#gname").value.trim(), minSeg: +$("#minSeg").value, luck: $("#luck").checked };
    if (document.activeElement) document.activeElement.blur();
    S.view = "control"; await act(data);
  };
  document.querySelectorAll("[data-askremove]").forEach(b => b.onclick = () => { S.removing = b.dataset.askremove; render(); });
  document.querySelectorAll("[data-remove]").forEach(b => b.onclick = () => { const id = b.dataset.remove; S.removing = null; act({ action: "remove", team: id }); });
  const kt = $("#keepTeam"); if (kt) kt.onclick = () => { S.removing = null; render(); };
  const tr = $("#tryReveal");
  if (tr) tr.onclick = () => {
    const g = S.game, missing = g.teams.filter(id => !(S.buys[id] && rowState(S.buys[id], g.minSeg).ok));
    if (missing.length) { S.confirm = true; render(); } else act({ action: "reveal" });
  };
  const cn = $("#cancel"); if (cn) cn.onclick = () => { S.confirm = false; render(); };
}

function toast(t) {
  const el = document.createElement("div"); el.className = "banner wait"; el.textContent = t;
  el.style.cssText = "position:fixed;left:16px;right:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:9;box-shadow:0 6px 20px rgba(0,0,0,.2)";
  document.body.appendChild(el); setTimeout(() => el.remove(), 5000);
}

start();
