// Team desk: students make a team from their first names (or join one), then play.
import { api, poll, getToken, setToken } from "./api.js";
import { teamName, setTeamNames } from "./teams.js";
import { CHIPS, CHIP, YEAR_COUNT, COMPANIES, companyById, esc, money, rowState, wordCount, bestPlan, briefHTML, rulesHTML, newsHTML, resultsHTML, standingsHTML, finalHTML, yearBar, revealPanel, bestPanel, legend, coStats, coReportHTML, progressSummary, reportHTML, REFLECT } from "./game.js";

const $ = s => document.querySelector(s);
const S = { team: null, game: null, myBuy: null, prog: null, roster: [], draft: null, draftKey: null, view: "desk", saving: false,
  co: null, seenRules: false, showResult: null, seenBrief: {}, why: {}, reflect: {}, confirmSend: false };
let poller = null;

/* ---------- start: Live in Class or Open Play ---------- */
let lobbyTimer = null, lobbyGame = null, channel = null;
function resetToLogin() {
  if (poller) { poller.stop(); poller = null; }
  setToken(null); S.team = null; S.co = null; S.showResult = null; S.view = "desk";
  $("#tabs").hidden = true; $("#who").hidden = true; $("#yearbar").innerHTML = "";
  clearTimeout(lobbyTimer);
}

// The first screen: two ways to play
async function showLogin(err = "") {
  resetToLogin(); channel = null;
  let info = null;
  try { info = await api("lobby"); } catch (e) { err = err || e.message; }
  const cg = info && info.classGame;
  $("#app").innerHTML = `<div class="stack" style="max-width:860px;margin:28px auto;gap:18px">
    <div><span class="eyebrow">Million Dollar Media Buy</span><h2 style="margin:0">How are you playing today?</h2></div>
    <div class="grid2">
      <div class="panel stack" style="gap:10px;border-top:6px solid var(--brown)"><span class="eyebrow">With your class</span><h3 style="margin:0">Live in Class</h3>
        <p style="margin:0">Join the game your teacher is running right now.</p>
        <p class="muted" style="margin:0;font-size:15px">${cg ? `Running now: <b>${esc(cg.name)}</b>` : "No class game is running right now."}</p>
        <div style="margin-top:auto"><button class="btn ${cg ? "" : "ghost"}" data-channel="class">Join class game</button></div></div>
      <div class="panel stack" style="gap:10px;border-top:6px solid var(--orange)"><span class="eyebrow">On your own</span><h3 style="margin:0">Open Play</h3>
        <p style="margin:0">Work through five companies at your own pace. When you’re done, send your report to your teacher.</p>
        <p class="muted" style="margin:0;font-size:15px">Always open. No need to wait for anyone.</p>
        <div style="margin-top:auto"><button class="btn" data-channel="open">Start Open Play</button></div></div>
    </div>
    ${err ? `<p class="err">${esc(err)}</p>` : ""}
  </div>`;
  document.querySelectorAll("[data-channel]").forEach(b => b.onclick = () => showJoin(b.dataset.channel));
  lobbyTimer = setTimeout(() => { if (!channel && !poller) showLogin(); }, 8000);
}

// Make a team from first names, or join one, in the chosen channel
async function showJoin(ch, err = "") {
  resetToLogin(); channel = ch;
  let lobby = null;
  try { lobby = await api("lobby?channel=" + ch); } catch (e) { err = err || e.message; }
  const back = `<button class="btn ghost small" id="backStart">← Back</button>`;
  if (!lobby || !lobby.game) {
    lobbyGame = null;
    $("#app").innerHTML = `<div class="login">${back}<span class="eyebrow">Live in Class</span><h2 style="margin:0">Waiting for your teacher</h2><p>No class game is running yet. This page opens the join screen as soon as your teacher starts one. Want to play now? Go back and pick Open Play.</p>${err ? `<p class="err">${esc(err)}</p>` : ""}</div>`;
    $("#backStart").onclick = () => showLogin();
    lobbyTimer = setTimeout(() => { if (channel === ch) showJoin(ch); }, 4000);
    return;
  }
  lobbyGame = lobby.game.id;
  const full = lobby.teams.length >= lobby.max, open = ch === "open";
  // Open Play can have lots of teams across periods, so show the newest first
  const list = open ? [...lobby.teams].reverse() : lobby.teams;
  $("#app").innerHTML = `<div class="stack" style="max-width:520px;margin:28px auto;gap:16px">
    <div>${back}</div>
    <div><span class="eyebrow">${open ? "Open Play · on your own" : "Live in Class · " + esc(lobby.game.name)}</span><h2 style="margin:0">Make your team</h2>
      <p class="muted" style="margin:4px 0 0" id="count">${open ? "" : `${lobby.teams.length} of ${lobby.max} teams made`}</p></div>
    <form class="login" id="newForm" style="margin:0" ${full ? "hidden" : ""}>
      <span class="eyebrow">New team</span>
      <p style="margin:0">Type the <b>first name</b> of everyone at this computer. Your names become your team name.</p>
      ${[1, 2, 3, 4].map(i => `<input type="text" id="nm${i}" placeholder="${i === 1 ? "First name" : "Teammate’s first name (optional)"}" maxlength="14" autocomplete="off" aria-label="First name ${i}">`).join("")}
      <p class="muted" id="preview" style="margin:0;font-size:15px"></p>
      <button class="btn" type="submit" id="goNew">Create team</button>
    </form>
    <form class="login" id="joinForm" style="margin:0" ${lobby.teams.length ? "" : "hidden"}>
      <span class="eyebrow">${full ? `All ${lobby.max} teams are made` : open ? "Already started? Pick up where you left off" : "Teammate already made it?"}</span>
      <p style="margin:0">${open ? "Pick your team to keep going, or to join from a different computer." : "Join a team on a different computer."}</p>
      <label for="team">Team<select id="team"><option value="">Pick your team</option>${list.map(t => `<option value="${t.id}">${esc(t.name)}</option>`).join("")}</select></label>
      <label for="jn">Your first name<input type="text" id="jn" maxlength="14" autocomplete="off"></label>
      <button class="btn ghost" type="submit" id="goJoin">Join team</button>
    </form>
    <p class="err" id="err">${esc(err)}</p>
  </div>`;
  $("#backStart").onclick = () => showLogin();
  const label = () => {
    const n = [1, 2, 3, 4].map(i => $("#nm" + i).value.trim().split(/\s+/)[0]).filter(Boolean).map(w => w[0].toUpperCase() + w.slice(1).toLowerCase());
    $("#preview").textContent = n.length ? "Team name: " + (n.length === 1 ? n[0] : n.length === 2 ? n.join(" & ") : n.slice(0, -1).join(", ") + " & " + n[n.length - 1]) : "";
  };
  [1, 2, 3, 4].forEach(i => $("#nm" + i).addEventListener("input", label));
  $("#newForm").addEventListener("submit", async e => {
    e.preventDefault();
    const names = [1, 2, 3, 4].map(i => $("#nm" + i).value.trim()).filter(Boolean);
    if (!names.length) { $("#err").textContent = "Type at least one first name."; return; }
    $("#goNew").disabled = true; $("#err").textContent = "Creating your team…";
    try { const r = await api("login", { channel: ch, mode: "new", names }); setToken(r.token); start(); }
    catch (er) { $("#err").textContent = er.message; $("#goNew").disabled = false; }
  });
  $("#joinForm").addEventListener("submit", async e => {
    e.preventDefault();
    const team = $("#team").value, name = $("#jn").value.trim();
    if (!team) { $("#err").textContent = "Pick your team."; return; }
    if (!name) { $("#err").textContent = "Type your first name."; return; }
    $("#goJoin").disabled = true; $("#err").textContent = "Joining…";
    try { const r = await api("login", { channel: ch, mode: "join", team, name }); setToken(r.token); start(); }
    catch (er) { $("#err").textContent = er.message; $("#goJoin").disabled = false; }
  });
  lobbyTimer = setTimeout(refreshLobby, 4000);
}

// Keep the team list fresh while students type, without wiping what they typed
async function refreshLobby() {
  if (poller || !$("#joinForm") || !channel) return;
  try {
    const lobby = await api("lobby?channel=" + channel);
    if (!lobby.game || lobby.game.id !== lobbyGame) { showJoin(channel); return; }
    const list = channel === "open" ? [...lobby.teams].reverse() : lobby.teams;
    const sel = $("#team"), keep = sel.value;
    sel.innerHTML = `<option value="">Pick your team</option>` + list.map(t => `<option value="${t.id}">${esc(t.name)}</option>`).join("");
    sel.value = keep;
    $("#joinForm").hidden = !lobby.teams.length;
    $("#newForm").hidden = lobby.teams.length >= lobby.max;
    if (channel !== "open") $("#count").textContent = `${lobby.teams.length} of ${lobby.max} teams made`;
  } catch {}
  lobbyTimer = setTimeout(refreshLobby, 4000);
}

function start() {
  clearTimeout(lobbyTimer);
  $("#tabs").hidden = false; $("#who").hidden = false;
  $("#app").innerHTML = `<p class="muted">Connecting…</p>`;
  poller = poll(onState, () => showLogin("Your teacher started a new game or removed your team. Pick how you want to play."));
}

function onState(s) {
  if (s.role !== "team") { showLogin(); return; }
  S.team = s.team; S.game = s.game; S.myBuy = s.myBuy || null; S.prog = s.prog || null; S.roster = s.roster || [];
  setTeamNames(S.game ? S.game.teamNames : {});
  $("#who").innerHTML = `<span>${S.game && S.game.id === "openplay" ? "Open Play \u00b7 " : ""}Team <b>${esc(teamName(S.team))}</b></span><button id="logout">Switch</button>`;
  $("#logout").onclick = () => showLogin();
  const self = S.game && S.game.mode === "self";
  document.querySelector('#tabs [data-view="standings"]').textContent = self ? "My Report" : "Standings";
  if (!self) {
    const key = S.game ? S.game.id + ":" + S.game.year : null;
    if (key !== S.draftKey) { S.draft = S.myBuy ? [...S.myBuy] : liveCo().segs.map(() => 0); S.draftKey = key; }
  }
  render();
}
const liveCo = () => companyById(S.game && S.game.company);
const entryOf = id => (S.prog && S.prog.companies && S.prog.companies[id]) || { years: [], reflect: null };

/* ---------- screens ---------- */
function render() {
  // keep typing position if the screen redraws while someone is writing
  const ae = document.activeElement, keepId = ae && ae.id && (ae.tagName === "TEXTAREA" || ae.tagName === "INPUT") ? ae.id : null;
  const caret = keepId ? ae.selectionStart : 0;
  document.querySelectorAll("#tabs button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.view === S.view)));
  $("#yearbar").innerHTML = S.game ? yearBar(S.game) : "";
  const app = $("#app"), self = S.game && S.game.mode === "self";
  if (S.view === "brief") app.innerHTML = self ? selfBriefHTML() : briefHTML(liveCo());
  else if (S.view === "standings") app.innerHTML = self ? myReportHTML() : `<div class="stack"><div><span class="eyebrow">Live</span><h2>Standings</h2></div><div class="panel">${S.game ? standingsHTML(S.game, S.game.results || [], S.team) : `<p class="muted">No game yet.</p>`}</div></div>`;
  else app.innerHTML = self ? selfDeskHTML() : deskHTML();
  bind();
  if (keepId) { const el = document.getElementById(keepId); if (el) { el.focus(); try { el.setSelectionRange(caret, caret); } catch {} } }
}

/* ---------- live (teacher-paced) mode ---------- */
function deskHTML() {
  const g = S.game;
  if (!g) return `<div class="stack"><div class="banner wait">No game is running yet. Hang tight.</div><div class="panel"><h3>How it works</h3>${rulesHTML(3)}</div></div>`;
  const results = g.results || [], co = liveCo();
  if (g.phase === "lobby") return `<div class="stack"><div class="banner wait">Your teacher will open Year 1 soon. Read the brief while you wait.</div>
    <div class="grid2"><div class="panel"><h3>How it works</h3>${rulesHTML(g.minSeg)}</div><div class="panel stack" style="gap:10px"><h3>Your client</h3><p>You are the marketing team for <b>${esc(co.name)}</b> (${esc(co.industry.toLowerCase())}). Study who its customers are before you spend a dollar.</p><button class="btn" data-view="brief">Read the brief</button></div></div></div>`;
  if (g.phase === "final") return finalHTML(g, results, S.team);
  if (g.phase === "revealed" && results[g.year]) return myResultHTML(g, results[g.year]) + resultsHTML(g, results[g.year], S.team);
  return buyHTML(g);
}

function stepperHTML(co, d, prev, min) {
  const st = rowState(d, min), left = CHIPS - st.tot;
  return `<div class="row" style="justify-content:space-between"><div><p class="muted" style="margin:0">1 block = $100,000. Use all 10 blocks and fund at least ${min} segments.${prev ? " Highlighted segments were funded last year (+10% brand bonus)." : ""}</p></div>
      <div style="text-align:right"><div class="num" style="font-size:28px">${money(st.tot * CHIP)}</div><div class="muted" style="font-size:14px">${left > 0 ? money(left * CHIP) + " left" : "Budget used"}</div></div></div>
    <div class="meter"><span style="width:${Math.min(100, st.tot * 10)}%"></span></div>
    <div class="buy">${co.segs.map((s, j) => `<div class="buyrow ${prev && prev[j] > 0 ? "on" : ""}">
      <div><div class="nm">${esc(s.name)}</div><div class="sub">${esc(s.ages)}${prev && prev[j] > 0 ? " · funded last year" : ""}</div></div>
      <div class="step"><button data-minus="${j}" aria-label="Remove a block from ${esc(s.name)}" ${d[j] <= 0 ? "disabled" : ""}>&minus;</button><output>${d[j]}</output><button data-plus="${j}" aria-label="Add a block to ${esc(s.name)}" ${st.tot >= CHIPS ? "disabled" : ""}>+</button></div>
      <div class="amt">${money(d[j] * CHIP)}</div></div>`).join("")}</div>`;
}

function buyHTML(g) {
  const co = liveCo(), y = g.year, d = S.draft, st = rowState(d, g.minSeg);
  const prevRes = (g.results || [])[y - 1];
  const prev = prevRes && prevRes.teams[S.team] ? prevRes.teams[S.team].alloc : null;
  const same = S.myBuy && S.myBuy.every((v, i) => v === d[i]);
  let banner = "";
  if (S.myBuy && same) banner = `<div class="banner ok">Buy submitted. You can still change it until your teacher closes buying.</div>`;
  else if (S.myBuy) banner = `<div class="banner wait">You changed your plan. Submit again to save the new version.</div>`;
  return `<div class="stack">${newsHTML(co, y)}${banner}
    <div class="panel stack" style="gap:12px"><h3 style="margin:0">Year ${y + 1} media buy</h3>
      ${stepperHTML(co, d, prev, g.minSeg)}
      <div class="row"><button class="btn" id="submitBuy" ${st.ok && !S.saving && !same ? "" : "disabled"}>${S.saving ? "Saving…" : S.myBuy ? "Submit new plan" : "Submit our buy"}</button>
        <span class="pill ${st.cls}">${st.txt}</span></div>
    </div>
    <div class="panel"><h3>Rules</h3>${rulesHTML(g.minSeg)}</div></div>`;
}

function myResultHTML(g, res) {
  const co = liveCo(), mine = res.teams[S.team]; if (!mine) return "";
  const order = g.teams.map(id => ({ id, rev: res.teams[id] ? res.teams[id].rev : 0 })).sort((a, b) => b.rev - a.rev);
  const rank = order.findIndex(t => t.id === S.team) + 1;
  return `<div class="panel reveal" style="border-top:6px solid var(--orange);margin-bottom:18px"><span class="eyebrow">Your Year ${res.year + 1} result</span>
    <div class="row" style="gap:28px;margin:6px 0 10px"><div><div class="big">${money(mine.rev)}</div><div class="muted">revenue from $1,000,000</div></div><div><div class="big">#${rank}</div><div class="muted">of ${order.length} teams</div></div></div>
    ${mine.missing ? `<p class="err">No complete buy was submitted, so your team earned $0 this year.</p>` : spendTable(co, mine)}
  </div>`;
}
const spendTable = (co, r) => `<div class="tablewrap"><table><thead><tr><th>Segment</th><th class="r">You spent</th><th class="r">It earned</th><th class="r">Per $1</th></tr></thead><tbody>${co.segs.map((s, j) => r.alloc[j] ? `<tr><td>${esc(s.name)}</td><td class="r num">${money(r.alloc[j] * CHIP)}</td><td class="r num">${money(r.segRev[j])}</td><td class="r num">$${(r.segRev[j] / (r.alloc[j] * CHIP)).toFixed(2)}</td></tr>` : "").join("")}</tbody></table></div>`;

/* ---------- self-paced mode ---------- */
function selfDeskHTML() {
  const g = S.game;
  if (g.phase === "final") return `<div class="stack"><div class="banner wait">Your teacher closed this activity. Here is your report.</div>${reportHTML(g, S.team, S.prog, S.roster)}</div>`;
  if (!S.co) return (S.seenRules ? "" : rulesIntroHTML()) + pickerHTML();
  const co = companyById(S.co), entry = entryOf(co.id), y = entry.years.length;
  if (S.showResult !== null && entry.years[S.showResult]) return yearResultHTML(co, entry, S.showResult);
  if (y === 0 && !S.seenBrief[co.id]) return `<div class="stack">${backBar()}${briefHTML(co)}<div class="row"><button class="btn" data-startco="${co.id}">Start Year 1</button></div></div>`;
  if (y < YEAR_COUNT) return selfBuyHTML(co, entry, y);
  if (!Array.isArray(entry.reflect)) return reflectHTML(co, entry);
  return `<div class="stack">${backBar()}<div class="banner ok">${esc(co.name)} is finished.</div>${coReportHTML(co, entry, g.minSeg)}<div class="row"><button class="btn" data-back>Back to companies</button></div></div>`;
}

const backBar = () => `<div><button class="btn ghost small" data-back>← All companies</button></div>`;

// First screen a team sees: the rules, so nobody needs the teacher to explain them
function rulesIntroHTML() {
  return `<div class="panel stack" style="gap:10px;margin-bottom:18px;border-top:6px solid var(--orange)"><span class="eyebrow">How to play</span>
    <h3 style="margin:0">You\u2019re the marketing team</h3>
    <p style="margin:0">Each company below hired you. You get <b>$1,000,000 a year for four years</b> to spend on the customers most likely to buy. Read the brief, spend the money, explain why, and see how you did.</p>
    ${rulesHTML(S.game.minSeg)}
    <div><button class="btn small" id="gotRules">Got it</button></div></div>`;
}

function pickerHTML() {
  const g = S.game, sum = progressSummary(g, S.prog), sent = S.prog && S.prog.sentAt;
  return `<div class="stack">
    <div><span class="eyebrow">${esc(g.name)} · Work at your own pace</span><h2>Your clients</h2>
      <p class="lede">Each company gives you $1,000,000 a year for four years. Read the brief, spend it on the right customers, and explain your thinking. Finish them all, then send your report.</p></div>
    <div class="grid3">${sum.stats.map((st, i) => {
      const status = st.finished ? `<span class="pill ok">Finished · ${st.pct}%</span>` : st.doneYears ? `<span class="pill idle">Year ${Math.min(st.doneYears + 1, YEAR_COUNT)} of ${YEAR_COUNT}</span>` : `<span class="pill idle">Not started</span>`;
      return `<div class="segcard"><span class="tag">Client ${i + 1} · ${esc(st.co.industry)}</span><h4>${esc(st.co.name)}</h4><span class="facts">${esc(st.co.line)}</span>
        <div class="row" style="justify-content:space-between;margin-top:auto;padding-top:8px">${status}<button class="btn small ${st.finished ? "ghost" : ""}" data-openco="${st.co.id}">${st.finished ? "Review" : st.doneYears || entryOf(st.co.id).years.length ? "Continue" : "Start"}</button></div></div>`; }).join("")}</div>
    <div class="panel stack" style="gap:10px"><h3 style="margin:0">Your report</h3>
      <p style="margin:0">${sum.finishedCount} of ${sum.total} companies finished${sum.avg !== null ? ` · average ${sum.avg}% of the best possible` : ""}.${sent ? " Sent to your teacher. If you finish more, send it again to update it." : ""}</p>
      ${S.confirmSend ? `<div class="confirm"><span>You’ve finished ${sum.finishedCount} of ${sum.total}. Send the report anyway?</span><button class="btn small" id="sendNow">Send it</button><button class="btn ghost small" id="cancelSend">Keep working</button></div>` : ""}
      <div class="row"><button class="btn" id="sendReport" ${S.saving ? "disabled" : ""}>${sent ? "Send updated report" : "Send report to teacher"}</button><button class="btn ghost small" data-view="standings">Preview report</button></div>
    </div>
  </div>`;
}

function selfBuyHTML(co, entry, y) {
  const key = co.id + ":" + y;
  if (S.draftKey !== key) { S.draft = co.segs.map(() => 0); S.draftKey = key; }
  const d = S.draft, st = rowState(d, S.game.minSeg), prev = y > 0 ? entry.years[y - 1].alloc : null;
  const why = S.why[key] || "", wc = wordCount(why), ready = st.ok && wc >= 8;
  const soFar = entry.years.reduce((a, r) => a + r.rev, 0);
  return `<div class="stack">${backBar()}
    ${newsHTML(co, y)}
    ${y ? `<p class="muted" style="margin:0">${esc(co.name)} so far: <b>${money(soFar)}</b> from ${y} year${y > 1 ? "s" : ""}. <button class="btn ghost small" data-view="brief">Re-read the brief</button></p>` : `<p class="muted" style="margin:0"><button class="btn ghost small" data-view="brief">Re-read the brief</button></p>`}
    <div class="panel stack" style="gap:12px"><h3 style="margin:0">Year ${y + 1} media buy</h3>
      ${stepperHTML(co, d, prev, S.game.minSeg)}
      <label for="why" class="stack" style="gap:6px"><b>Why this plan?</b><span class="muted" style="font-size:15px">Point to something in the brief or the news. At least one full sentence.</span>
        <textarea id="why" rows="3" maxlength="600" style="font-family:var(--body);font-size:17px;padding:10px;border:1.5px solid var(--line);border-radius:3px;resize:vertical" placeholder="We put the most money into ___ because the brief shows ___.">${esc(why)}</textarea>
        <span class="muted" id="wc" style="font-size:14px">${wc} word${wc === 1 ? "" : "s"}${wc < 8 ? " · need 8+" : ""}</span></label>
      <div class="row"><button class="btn" id="selfBuy" ${ready && !S.saving ? "" : "disabled"}>${S.saving ? "Running the numbers…" : "Lock in Year " + (y + 1)}</button>
        <span class="pill ${st.ok ? (wc >= 8 ? "ok" : "no") : st.cls}" id="readyPill">${st.ok ? (wc >= 8 ? "Ready" : "Explain your plan") : st.txt}</span></div>
      <p class="muted" style="margin:0;font-size:14px">Once you lock it in, you can’t change it.</p>
    </div></div>`;
}

function yearResultHTML(co, entry, y) {
  const r = entry.years[y], best = bestPlan(co, y, S.game.minSeg), pct = Math.min(100, Math.round(r.rev / best.rev * 100));
  const last = y === YEAR_COUNT - 1, bi = r.segRev.indexOf(Math.max(...r.segRev));
  return `<div class="stack">
    <div class="panel reveal" style="border-top:6px solid var(--orange)"><span class="eyebrow">${esc(co.name)} · Year ${y + 1} result</span>
      <div class="row" style="gap:28px;margin:6px 0 10px"><div><div class="big">${money(r.rev)}</div><div class="muted">revenue from $1,000,000</div></div><div><div class="big">${pct}%</div><div class="muted">of the best possible plan</div></div><div><div class="big" style="font-size:clamp(22px,3vw,30px)">${esc(co.segs[bi].short)}</div><div class="muted">your best segment</div></div></div>
      ${spendTable(co, r)}
    </div>
    <div class="grid2">${revealPanel(co, y)}<div class="stack">${bestPanel(co, y, S.game.minSeg)}<div class="panel"><span class="eyebrow">Your plan</span><p style="margin:6px 0 0">${esc(r.why)}</p></div></div></div>
    <div class="row"><button class="btn" id="nextStep">${last ? "Finish: reflection questions" : "Go to Year " + (y + 2)}</button></div>
  </div>`;
}

function reflectHTML(co, entry) {
  const st = coStats(co, entry, S.game.minSeg), ans = S.reflect[co.id] || ["", "", ""];
  const ok = ans.every(a => wordCount(a) >= 5);
  return `<div class="stack">${backBar()}
    <div class="panel" style="border-top:6px solid var(--orange)"><span class="eyebrow">${esc(co.name)} · Four years done</span>
      <div class="row" style="gap:28px;margin:6px 0 4px"><div><div class="big">${money(st.total)}</div><div class="muted">total revenue from $4,000,000</div></div><div><div class="big">${st.pct}%</div><div class="muted">of the best possible</div></div></div></div>
    <div class="panel stack" style="gap:14px"><h3 style="margin:0">Reflection</h3><p class="muted" style="margin:0">Answer all three to finish this company. These go in your report.</p>
      ${REFLECT.map((q, i) => `<label for="rf${i}" class="stack" style="gap:6px"><b>${i + 1}. ${esc(q)}</b>
        <textarea id="rf${i}" data-rf="${i}" rows="3" maxlength="800" style="font-family:var(--body);font-size:17px;padding:10px;border:1.5px solid var(--line);border-radius:3px;resize:vertical">${esc(ans[i])}</textarea></label>`).join("")}
      <div class="row"><button class="btn" id="saveReflect" ${ok && !S.saving ? "" : "disabled"}>Finish ${esc(co.name)}</button><span class="muted" id="rfHint" style="font-size:14px">${ok ? "" : "5+ words for each answer"}</span></div>
    </div>
    <div class="panel"><h3>Your four years</h3>${coReportHTML(co, entry, S.game.minSeg)}</div>
  </div>`;
}

function selfBriefHTML() {
  if (S.co) return `<div class="stack"><div><button class="btn ghost small" data-view="desk">← Back to my desk</button></div>${briefHTML(companyById(S.co))}</div>`;
  return `<div class="stack"><p class="lede">Pick a company on <b>My Desk</b> to read its brief.</p><div><button class="btn" data-view="desk">Go to My Desk</button></div></div>`;
}
function myReportHTML() {
  return `<div class="stack"><div class="row" style="justify-content:space-between"><h2 style="margin:0">My report</h2><button class="btn ghost small" data-view="desk">Back to my desk</button></div>${reportHTML(S.game, S.team, S.prog, S.roster)}</div>`;
}

/* ---------- events ---------- */
async function play(data) {
  S.saving = true; render();
  try { const r = await api("play", data); S.prog = r.prog; return r; }
  catch (e) { toast(e.status === 401 ? "Your teacher started a new game. Join again." : e.message); return null; }
  finally { S.saving = false; render(); }
}

function bind() {
  document.querySelectorAll("[data-view]").forEach(b => b.onclick = () => { S.view = b.dataset.view; render(); window.scrollTo(0, 0); });
  document.querySelectorAll("[data-plus]").forEach(b => b.onclick = () => { if (rowState(S.draft, 1).tot < CHIPS) { S.draft[+b.dataset.plus]++; render(); } });
  document.querySelectorAll("[data-minus]").forEach(b => b.onclick = () => { const j = +b.dataset.minus; if (S.draft[j] > 0) { S.draft[j]--; render(); } });
  document.querySelectorAll("[data-back]").forEach(b => b.onclick = () => { S.co = null; S.showResult = null; S.view = "desk"; render(); window.scrollTo(0, 0); });
  document.querySelectorAll("[data-openco]").forEach(b => b.onclick = () => { S.co = b.dataset.openco; S.showResult = null; render(); window.scrollTo(0, 0); });
  document.querySelectorAll("[data-startco]").forEach(b => b.onclick = () => { S.seenBrief[b.dataset.startco] = true; render(); window.scrollTo(0, 0); });

  const sb = $("#submitBuy");
  if (sb) sb.onclick = async () => {
    S.saving = true; render();
    try { const r = await api("buy", { alloc: S.draft.map(n => +n) }); S.myBuy = r.alloc; }
    catch (e) { toast(e.status === 401 ? "Your login expired. Join again." : e.message); }
    S.saving = false; render();
    if (poller) poller.now();
  };

  const why = $("#why");
  if (why) why.oninput = () => {
    const co = companyById(S.co), y = entryOf(co.id).years.length, key = co.id + ":" + y;
    S.why[key] = why.value;
    const wc = wordCount(why.value), st = rowState(S.draft, S.game.minSeg);
    $("#wc").textContent = `${wc} word${wc === 1 ? "" : "s"}${wc < 8 ? " · need 8+" : ""}`;
    $("#selfBuy").disabled = !(st.ok && wc >= 8) || S.saving;
    const pill = $("#readyPill"); pill.className = "pill " + (st.ok ? (wc >= 8 ? "ok" : "no") : st.cls); pill.textContent = st.ok ? (wc >= 8 ? "Ready" : "Explain your plan") : st.txt;
  };
  const selfBuy = $("#selfBuy");
  if (selfBuy) selfBuy.onclick = async () => {
    const co = companyById(S.co), y = entryOf(co.id).years.length, key = co.id + ":" + y;
    const r = await play({ action: "buy", company: co.id, alloc: S.draft.map(n => +n), why: S.why[key] || "" });
    if (r) { S.showResult = r.year; delete S.why[key]; S.draftKey = null; window.scrollTo(0, 0); render(); }
  };
  const next = $("#nextStep");
  if (next) next.onclick = () => { S.showResult = null; render(); window.scrollTo(0, 0); };

  document.querySelectorAll("[data-rf]").forEach(t => t.oninput = () => {
    const a = S.reflect[S.co] || (S.reflect[S.co] = ["", "", ""]); a[+t.dataset.rf] = t.value;
    const ok = a.every(x => wordCount(x) >= 5);
    $("#saveReflect").disabled = !ok || S.saving; $("#rfHint").textContent = ok ? "" : "5+ words for each answer";
  });
  const gr = $("#gotRules"); if (gr) gr.onclick = () => { S.seenRules = true; render(); };
  const sr = $("#saveReflect");
  if (sr) sr.onclick = async () => {
    const r = await play({ action: "reflect", company: S.co, answers: S.reflect[S.co] || [] });
    if (r) { delete S.reflect[S.co]; window.scrollTo(0, 0); render(); }
  };

  const send = $("#sendReport");
  if (send) send.onclick = async () => {
    const sum = progressSummary(S.game, S.prog);
    if (sum.finishedCount < sum.total && !S.confirmSend) { S.confirmSend = true; render(); return; }
    S.confirmSend = false; const r = await play({ action: "send" }); if (r) toast("Report sent to your teacher.");
  };
  const sn = $("#sendNow"); if (sn) sn.onclick = async () => { S.confirmSend = false; const r = await play({ action: "send" }); if (r) toast("Report sent to your teacher."); };
  const cs = $("#cancelSend"); if (cs) cs.onclick = () => { S.confirmSend = false; render(); };
}
function toast(t) {
  const el = document.createElement("div"); el.className = "banner wait"; el.textContent = t;
  el.style.cssText = "position:fixed;left:16px;right:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:9;box-shadow:0 6px 20px rgba(0,0,0,.2)";
  document.body.appendChild(el); setTimeout(() => el.remove(), 5000);
}

getToken() ? start() : showLogin();
