// Team desk: students log in with their team name and team password.
import { api, poll, getToken, setToken } from "./api.js";
import { teamName } from "./teams.js";
import { SEGS, CHIPS, CHIP, esc, money, rowState, briefHTML, rulesHTML, newsHTML, resultsHTML, standingsHTML, finalHTML, yearBar } from "./game.js";

const $ = s => document.querySelector(s);
const S = { team: null, game: null, myBuy: null, draft: null, draftKey: null, view: "desk", saving: false };
let poller = null;

/* ---------- login: pick your team, type your names ---------- */
let lobbyTimer = null;
async function showLogin(err = "") {
  if (poller) { poller.stop(); poller = null; }
  setToken(null); S.team = null;
  $("#tabs").hidden = true; $("#who").hidden = true; $("#yearbar").innerHTML = "";
  let lobby = null;
  try { lobby = (await api("lobby")).game; } catch (e) { err = err || e.message; }
  clearTimeout(lobbyTimer);
  if (!lobby) {
    $("#app").innerHTML = `<div class="login"><span class="eyebrow">Million Dollar Media Buy</span><h2 style="margin:0">Waiting for your teacher</h2><p>No game is running yet. This page will open the login as soon as your teacher starts one.</p>${err ? `<p class="err">${esc(err)}</p>` : ""}</div>`;
    lobbyTimer = setTimeout(() => showLogin(), 4000);
    return;
  }
  $("#app").innerHTML = `<form class="login" id="loginForm">
    <span class="eyebrow">${esc(lobby.name)}</span>
    <h2 style="margin:0">Join your team</h2>
    <label for="team">Team<select id="team" required><option value="">Pick your team</option>${lobby.teams.map(id => `<option value="${id}">${esc(teamName(id))}</option>`).join("")}</select></label>
    <div class="stack" style="gap:8px"><span class="eyebrow" style="font-size:14px;color:var(--muted)">Names of everyone at this computer</span>
      ${[1, 2, 3, 4].map(i => `<input type="text" id="nm${i}" placeholder="${i === 1 ? "Your first and last name" : "Teammate (optional)"}" maxlength="30" autocomplete="off" ${i === 1 ? "required" : ""} aria-label="Name ${i}">`).join("")}
    </div>
    <p class="err" id="err">${esc(err)}</p>
    <button class="btn" type="submit" id="go">Join</button>
  </form>`;
  $("#loginForm").addEventListener("submit", async e => {
    e.preventDefault();
    const team = $("#team").value;
    const names = [1, 2, 3, 4].map(i => $("#nm" + i).value.trim()).filter(Boolean);
    if (!team) { $("#err").textContent = "Pick your team first."; return; }
    if (!names.length) { $("#err").textContent = "Type your name."; return; }
    $("#go").disabled = true; $("#err").textContent = "Joining\u2026";
    try { const r = await api("login", { role: "team", team, names }); setToken(r.token); start(); }
    catch (er) { $("#err").textContent = er.message; $("#go").disabled = false; }
  });
}

function start() {
  clearTimeout(lobbyTimer);
  $("#tabs").hidden = false; $("#who").hidden = false;
  $("#app").innerHTML = `<p class="muted">Connecting\u2026</p>`;
  poller = poll(onState, () => showLogin("Log in again to keep playing."));
}

function onState(s) {
  if (s.role !== "team") { showLogin("Log in with your team."); return; }
  S.team = s.team; S.game = s.game; S.myBuy = s.myBuy;
  const roster = (s.roster && s.roster.length ? s.roster : s.names || []);
  $("#who").innerHTML = `<span>Team <b>${esc(teamName(S.team))}</b>${roster.length ? `<br><span style="text-transform:none;letter-spacing:0;font-family:var(--body);font-size:14px;opacity:.85">${esc(roster.join(", "))}</span>` : ""}</span><button id="logout">Switch team</button>`;
  $("#logout").onclick = () => showLogin();
  const key = S.game ? S.game.id + ":" + S.game.year : null;
  if (key !== S.draftKey) { S.draft = S.myBuy ? [...S.myBuy] : SEGS.map(() => 0); S.draftKey = key; }
  render();
}

/* ---------- screens ---------- */
function render() {
  document.querySelectorAll("#tabs button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.view === S.view)));
  $("#yearbar").innerHTML = S.game ? yearBar(S.game) : "";
  const app = $("#app");
  if (S.view === "brief") app.innerHTML = briefHTML();
  else if (S.view === "standings") app.innerHTML = `<div class="stack"><div><span class="eyebrow">Live</span><h2>Standings</h2></div><div class="panel">${S.game ? standingsHTML(S.game, S.game.results || [], S.team) : `<p class="muted">No game yet.</p>`}</div></div>`;
  else app.innerHTML = deskHTML();
  bind();
}

function deskHTML() {
  const g = S.game;
  if (!g) return `<div class="stack"><div class="banner wait">No game is running yet. Hang tight.</div><div class="panel"><h3>How it works</h3>${rulesHTML(3)}</div></div>`;
  if (!g.teams.includes(S.team)) return `<div class="banner wait">Team ${esc(teamName(S.team))} isn’t in this class period’s game. Check with your teacher.</div>`;
  const results = g.results || [];
  if (g.phase === "lobby") return `<div class="stack"><div class="banner wait">Your teacher will open Year 1 soon. Read the brief while you wait.</div>
    <div class="grid2"><div class="panel"><h3>How it works</h3>${rulesHTML(g.minSeg)}</div><div class="panel stack" style="gap:10px"><h3>Your client</h3><p>You are the marketing team for <b>Basecamp Bouldering</b>, an indoor climbing gym. Study who its customers are before you spend a dollar.</p><button class="btn" data-view="brief">Read the brief</button></div></div></div>`;
  if (g.phase === "final") return finalHTML(g, results, S.team);
  if (g.phase === "revealed" && results[g.year]) return myResultHTML(g, results[g.year]) + resultsHTML(g, results[g.year], S.team);
  return buyHTML(g);
}

function buyHTML(g) {
  const y = g.year, d = S.draft, st = rowState(d, g.minSeg);
  const prevRes = (g.results || [])[y - 1];
  const prev = prevRes && prevRes.teams[S.team] ? prevRes.teams[S.team].alloc : null;
  const same = S.myBuy && S.myBuy.every((v, i) => v === d[i]);
  const left = CHIPS - st.tot;
  let banner = "";
  if (S.myBuy && same) banner = `<div class="banner ok">Buy submitted. You can still change it until your teacher closes buying.</div>`;
  else if (S.myBuy) banner = `<div class="banner wait">You changed your plan. Submit again to save the new version.</div>`;
  return `<div class="stack">${newsHTML(y)}
    ${banner}
    <div class="panel stack" style="gap:12px">
      <div class="row" style="justify-content:space-between"><div><h3 style="margin:0">Year ${y + 1} media buy</h3><p class="muted" style="margin:0">1 block = $100,000. Use all 10 blocks and fund at least ${g.minSeg} segments.${prev ? " Highlighted segments were funded last year (+10% brand bonus)." : ""}</p></div>
        <div style="text-align:right"><div class="num" style="font-size:28px">${money(st.tot * CHIP)}</div><div class="muted" style="font-size:14px">${left > 0 ? money(left * CHIP) + " left" : "Budget used"}</div></div></div>
      <div class="meter"><span style="width:${Math.min(100, st.tot * 10)}%"></span></div>
      <div class="buy">${SEGS.map((s, j) => `<div class="buyrow ${prev && prev[j] > 0 ? "on" : ""}">
        <div><div class="nm">${esc(s.name)}</div><div class="sub">${esc(s.ages)}${prev && prev[j] > 0 ? " · funded last year" : ""}</div></div>
        <div class="step"><button data-minus="${j}" aria-label="Remove a block from ${esc(s.name)}" ${d[j] <= 0 ? "disabled" : ""}>&minus;</button><output>${d[j]}</output><button data-plus="${j}" aria-label="Add a block to ${esc(s.name)}" ${st.tot >= CHIPS ? "disabled" : ""}>+</button></div>
        <div class="amt">${money(d[j] * CHIP)}</div></div>`).join("")}</div>
      <div class="row"><button class="btn" id="submitBuy" ${st.ok && !S.saving && !same ? "" : "disabled"}>${S.saving ? "Saving…" : S.myBuy ? "Submit new plan" : "Submit our buy"}</button>
        <span class="pill ${st.cls}">${st.txt}</span></div>
    </div>
    <div class="panel"><h3>Rules</h3>${rulesHTML(g.minSeg)}</div></div>`;
}

function myResultHTML(g, res) {
  const mine = res.teams[S.team]; if (!mine) return "";
  const order = g.teams.map(id => ({ id, rev: res.teams[id] ? res.teams[id].rev : 0 })).sort((a, b) => b.rev - a.rev);
  const rank = order.findIndex(t => t.id === S.team) + 1;
  return `<div class="panel reveal" style="border-top:6px solid var(--orange);margin-bottom:18px"><span class="eyebrow">Your Year ${res.year + 1} result</span>
    <div class="row" style="gap:28px;margin:6px 0 10px"><div><div class="big">${money(mine.rev)}</div><div class="muted">revenue from $1,000,000</div></div><div><div class="big">#${rank}</div><div class="muted">of ${order.length} teams</div></div></div>
    ${mine.missing ? `<p class="err">No complete buy was submitted, so your team earned $0 this year.</p>` :
    `<div class="tablewrap"><table><thead><tr><th>Segment</th><th class="r">You spent</th><th class="r">It earned</th></tr></thead><tbody>${SEGS.map((s, j) => mine.alloc[j] ? `<tr><td>${esc(s.name)}</td><td class="r num">${money(mine.alloc[j] * CHIP)}</td><td class="r num">${money(mine.segRev[j])}</td></tr>` : "").join("")}</tbody></table></div>`}
  </div>`;
}

/* ---------- events ---------- */
function bind() {
  document.querySelectorAll("[data-view]").forEach(b => b.onclick = () => { S.view = b.dataset.view; render(); window.scrollTo(0, 0); });
  document.querySelectorAll("[data-plus]").forEach(b => b.onclick = () => { if (rowState(S.draft, 1).tot < CHIPS) { S.draft[+b.dataset.plus]++; render(); } });
  document.querySelectorAll("[data-minus]").forEach(b => b.onclick = () => { const j = +b.dataset.minus; if (S.draft[j] > 0) { S.draft[j]--; render(); } });
  const sb = $("#submitBuy");
  if (sb) sb.onclick = async () => {
    S.saving = true; render();
    try { const r = await api("buy", { alloc: S.draft.map(n => +n) }); S.myBuy = r.alloc; }
    catch (e) { toast(e.status === 401 ? "Your login expired. Log in again." : e.message); }
    S.saving = false; render();
    if (poller) poller.now();
  };
}
function toast(t) {
  const el = document.createElement("div"); el.className = "banner wait"; el.textContent = t;
  el.style.cssText = "position:fixed;left:16px;right:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:9;box-shadow:0 6px 20px rgba(0,0,0,.2)";
  document.body.appendChild(el); setTimeout(() => el.remove(), 5000);
}

getToken() ? start() : showLogin();
