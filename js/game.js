// =====================================================================
// MILLION DOLLAR MEDIA BUY: shared screens for the team desk and teacher console
// Every screen takes the company (co) it is showing.
// =====================================================================
import { teamName } from "./teams.js";
import { COMPANIES, companyById, CHIPS, CHIP, YEAR_COUNT, firstChipReturn, bestPlan, bestTotal, esc, money } from "./model.js";
export * from "./model.js";

export const REFLECT = [
  "Which segment turned out to be the best use of your money, and what clue in the brief pointed to it?",
  "Which segment looked good at first but didn’t pay off? Why do you think that happened?",
  "If you ran this company again, what would you do differently?"
];

export const allocBar = (co, row) => `<div class="alloc">${row.map((c, j) => c > 0 ? `<span style="width:${c * 10}%;background:${co.segs[j].color}" title="${esc(co.segs[j].short)}: ${money(c * CHIP)}"></span>` : "").join("")}</div>`;
export const legend = co => `<div class="legend">${co.segs.map(s => `<span><i style="background:${s.color}"></i>${esc(s.short)}</span>`).join("")}</div>`;
export function bars(rows, max, fmt, note) {
  return `<div class="chart">${rows.map(r => `<div class="bar"><span>${esc(r[0])}</span><div class="track"><div class="fill" style="width:${Math.max(2, r[1] / max * 100)}%"></div></div><span class="val">${fmt(r[1])}</span></div>`).join("")}${note ? `<div class="note">${esc(note)}</div>` : ""}</div>`;
}
const fmtOf = f => f === "usd" ? v => "$" + v.toLocaleString() : f === "num" ? v => String(v) : v => v + "%";

export function yearBar(game) {
  if (!game || game.mode === "self") return "";
  return Array.from({ length: YEAR_COUNT }, (_, y) => {
    const done = game.phase === "final" || y < game.year || (y === game.year && game.phase === "revealed");
    const on = game.phase === "open" && game.year === y;
    return `<i class="${on ? "on" : done ? "done" : ""}">Year ${y + 1}</i>`;
  }).join("");
}

/* ---------- the client brief ---------- */
export function briefHTML(co) {
  const c = co.charts, maxVal = Math.max(...co.segs.map(s => s.val));
  return `<div class="stack">
  <div class="hero">
    <div class="stack" style="gap:10px">
      <span class="eyebrow">Client brief · ${esc(co.industry)}</span>
      <h2 style="font-size:clamp(30px,4.4vw,46px)">${esc(co.name)}</h2>
      <p class="muted" style="font-family:var(--data);font-size:17px;letter-spacing:.04em">${esc(co.line)}</p>
      <p class="lede">${esc(co.about)}</p>
    </div>
    <div class="stack" style="gap:12px">
      <div class="owner"><span class="eyebrow">From the owner</span><p>“${esc(co.owner)}”</p></div>
      <div class="panel"><h3>What we sell</h3><div class="prices">${co.prices.map(p => `<span>${esc(p[0])}</span><b>${esc(p[1])}</b>`).join("")}</div></div>
    </div>
  </div>
  <div class="grid2">
    <div class="panel"><span class="eyebrow">Survey · people in our area</span><h3>${esc(c.interest.title)}</h3>
      ${bars(co.segs.map((s, i) => [s.short, c.interest.values[i]]), 100, v => v + "%", c.interest.note)}</div>
    <div class="panel"><span class="eyebrow">Our first-year customers</span><h3>${esc(c.spend.title)}</h3>
      ${bars(co.segs.map(s => [s.short, s.val]), maxVal, v => "$" + v.toLocaleString(), c.spend.note)}</div>
    <div class="panel"><span class="eyebrow">Data dive</span><h3>${esc(c.loyal.title)}</h3>
      ${bars(co.segs.map((s, i) => [s.short, c.loyal.values[i]]), 100, v => v + "%", c.loyal.note)}</div>
    <div class="panel"><span class="eyebrow">Data dive</span><h3>${esc(c.dive.title)}</h3>
      ${bars(c.dive.rows, Math.max(...c.dive.rows.map(r => r[1]), c.dive.fmt === "pct" ? 100 : 0), fmtOf(c.dive.fmt), c.dive.note)}</div>
  </div>
  <div><span class="eyebrow">The six segments</span><h2>Who could we target?</h2></div>
  <div class="grid3">${co.segs.map(s => `<div class="segcard"><span class="tag">${esc(s.ages)}</span><h4>${esc(s.name)}</h4><span class="facts">${esc(s.size)}</span><p class="quote">${esc(s.quote)}</p></div>`).join("")}</div>
  </div>`;
}

export function rulesHTML(min) {
  return `<ol class="rules">
    <li><span>Each year your team has <b>$1,000,000</b>, spent in <b>$100,000 blocks</b> (10 blocks).</span></li>
    <li><span>You must fund <b>at least ${min} different segments</b> every year.</span></li>
    <li><span>Money that reaches the right customers turns into revenue. Your score is the revenue your marketing brings in.</span></li>
    <li><span>Returns shrink as you pile money onto one group. The first ads reach the easy customers. Later ads chase people who were never that interested.</span></li>
    <li><span>Fund the same segment two years in a row and your brand builds: <b>+10%</b> from that segment.</span></li>
    <li><span>News drops at the start of every year. Read it before you spend.</span></li>
  </ol>`;
}

export const newsHTML = (co, y) => `<div class="news reveal"><div class="stamp">Year<b>${y + 1}</b></div><div><span class="eyebrow">${esc(co.name)} · Market news</span><h3>${esc(co.years[y].title)}</h3><p style="margin:0">${esc(co.years[y].body)}</p></div></div>`;

// What the first $100K earned in each segment, with the reason
export function revealPanel(co, y) {
  const fc = co.segs.map((_, j) => firstChipReturn(co, j, y)), maxFc = Math.max(...fc);
  return `<div class="panel segret reveal"><span class="eyebrow">The reveal</span><h3>What the first $100K earned in each segment</h3>
    ${co.segs.map((s, j) => `<div class="bar"><span><b>${esc(s.short)}</b></span><div class="track"><div class="fill ${fc[j] < 2 ? "low" : ""}" style="width:${fc[j] / maxFc * 100}%"></div></div><span class="val">${money(fc[j] * CHIP)}</span><span class="why">${esc(co.years[y].notes[s.id] || s.why)}</span></div>`).join("")}
    <p class="muted" style="font-size:15px;margin-top:10px">Each extra $100K in the same segment earns less than the one before it.</p></div>`;
}
export function bestPanel(co, y, min) {
  const best = bestPlan(co, y, min);
  return `<div class="panel"><span class="eyebrow">Best possible plan this year</span><h3>${money(best.rev)} with no luck</h3>
    ${allocBar(co, best.alloc)}<p style="margin:10px 0 0;font-size:15px">${best.alloc.map((c, j) => c ? `${esc(co.segs[j].short)} ${money(c * CHIP)}` : "").filter(Boolean).join(" · ")}</p></div>`;
}

/* ---------- live mode screens ---------- */
export function resultsHTML(game, res, me) {
  const co = companyById(game.company), y = res.year;
  const order = game.teams.map(id => ({ id, ...res.teams[id] })).filter(t => t.alloc).sort((a, b) => b.rev - a.rev);
  const classSpend = co.segs.map((_, j) => order.reduce((a, t) => a + (t.alloc[j] || 0), 0));
  const totalBlocks = classSpend.reduce((a, b) => a + b, 0);
  return `<div class="stack">
  <div><span class="eyebrow">Year ${y + 1} results · ${esc(co.years[y].title)}</span><h2>Who spent it best?</h2></div>
  <div class="panel tablewrap reveal"><table class="lb"><thead><tr><th></th><th>Team</th><th>Their split</th><th class="r">Revenue</th><th class="r">Return per $1</th><th>Best segment</th></tr></thead><tbody>
  ${order.map((t, k) => { const bi = t.segRev.indexOf(Math.max(...t.segRev));
    return `<tr class="${t.id === me ? "me" : k === 0 ? "top" : ""}"><td class="rank">${k + 1}</td><td><b>${esc(teamName(t.id))}</b>${t.missing ? ' <span class="pill no">No buy</span>' : ""}</td><td>${allocBar(co, t.alloc)}</td><td class="r num" style="font-size:21px">${money(t.rev)}</td><td class="r num">$${(t.rev / (CHIPS * CHIP)).toFixed(2)}</td><td>${t.missing ? "—" : esc(co.segs[bi].short)}</td></tr>`; }).join("")}
  </tbody></table><div style="margin-top:10px">${legend(co)}</div></div>
  <div class="grid2">${revealPanel(co, y)}
    <div class="stack">
      <div class="panel"><span class="eyebrow">Where the class spent</span><h3>${money(totalBlocks * CHIP)} across all teams</h3>
        ${bars(co.segs.map((s, j) => [s.short, totalBlocks ? Math.round(classSpend[j] / totalBlocks * 100) : 0]), 100, v => v + "%")}</div>
      ${bestPanel(co, y, game.minSeg)}
    </div>
  </div></div>`;
}

export function totals(game, results) {
  return game.teams.map(id => {
    let total = 0, spent = 0;
    results.forEach(r => { if (r && r.teams[id]) { total += r.teams[id].rev; spent += CHIPS * CHIP; } });
    return { id, total, spent };
  }).sort((a, b) => b.total - a.total);
}

export function standingsHTML(game, results, me) {
  const done = results.filter(Boolean);
  if (!done.length) return `<p class="muted">No years played yet. Standings appear after Year 1.</p>`;
  return `<div class="tablewrap"><table class="lb"><thead><tr><th></th><th>Team</th>${done.map(r => `<th class="r">Year ${r.year + 1}</th>`).join("")}<th class="r">Total revenue</th><th class="r">Return per $1</th></tr></thead><tbody>
  ${totals(game, done).map((t, k) => `<tr class="${t.id === me ? "me" : k === 0 ? "top" : ""}"><td class="rank">${k + 1}</td><td><b>${esc(teamName(t.id))}</b></td>${done.map(r => `<td class="r num">${r.teams[t.id] ? money(r.teams[t.id].rev) : "—"}</td>`).join("")}<td class="r num" style="font-size:21px">${money(t.total)}</td><td class="r num">$${t.spent ? (t.total / t.spent).toFixed(2) : "0.00"}</td></tr>`).join("")}
  </tbody></table></div>`;
}

export function finalHTML(game, results, me) {
  const co = companyById(game.company), done = results.filter(Boolean), c = totals(game, done);
  const best = bestTotal(co, game.minSeg);
  return `<div class="stack">
  <div><span class="eyebrow">${esc(co.name)} · Four years · $4,000,000 spent per team</span><h2>Final standings</h2></div>
  <div class="podium">${c.slice(0, 3).map((t, k) => `<div class="p ${k === 0 ? "first" : ""} reveal"><span class="eyebrow">${["1st place", "2nd place", "3rd place"][k]}</span><div style="font-family:var(--display);font-size:24px;text-transform:uppercase;color:var(--brown);margin:4px 0">${esc(teamName(t.id))}</div><div class="big">${money(t.total)}</div><p class="muted" style="margin:6px 0 0">$${t.spent ? (t.total / t.spent).toFixed(2) : "0.00"} back for every $1 spent</p></div>`).join("")}</div>
  <div class="panel">${standingsHTML(game, results, me)}</div>
  <div class="grid2">
    <div class="panel"><span class="eyebrow">The benchmark</span><h3>Best possible 4 years: ${money(best)}</h3><p>The winner reached <b>${c.length ? Math.round(c[0].total / best * 100) : 0}%</b> of the best possible score (before luck and brand bonuses).</p>
      ${co.years.map((Y, y) => `<div style="margin:10px 0"><span class="muted" style="font-size:14px">Year ${y + 1} · ${esc(Y.title)}</span>${allocBar(co, bestPlan(co, y, game.minSeg).alloc)}</div>`).join("")}${legend(co)}</div>
    <div class="panel"><span class="eyebrow">Talk it over</span><h3>Debrief</h3><ol class="rules">
      <li><span>Which segment looked best in the survey but paid the least? Why?</span></li>
      <li><span>Which number in the brief was the best clue for where to spend?</span></li>
      <li><span>Why did spreading money evenly across all six segments lose to focusing on a few?</span></li>
      <li><span>Which year’s news should have changed your plan the most? Did it change yours?</span></li>
    </ol></div>
  </div></div>`;
}

/* ---------- self-paced: progress, scores, and the report ---------- */
// prog = { companies: { [companyId]: { years: [{ alloc, why, segRev, rev }], reflect: [a1, a2, a3] } }, sentAt }
export function coStats(co, entry, min) {
  const years = (entry && entry.years) || [];
  const total = years.reduce((a, y) => a + y.rev, 0);
  const best = bestTotal(co, min);
  const doneYears = years.length;
  const bestSoFar = co.years.slice(0, doneYears).reduce((a, _, y) => a + bestPlan(co, y, min).rev, 0);
  const finished = doneYears >= YEAR_COUNT && entry && Array.isArray(entry.reflect);
  // Brand bonuses and luck can push a strong team past the no-luck best plan, so cap at 100%
  return { total, best, pct: bestSoFar ? Math.min(100, Math.round(total / bestSoFar * 100)) : 0, doneYears, finished };
}
export function progressSummary(game, prog) {
  const list = (game.companies || []).map(companyById);
  const stats = list.map(co => ({ co, ...coStats(co, prog && prog.companies && prog.companies[co.id], game.minSeg) }));
  const finished = stats.filter(s => s.finished);
  const avg = finished.length ? Math.round(finished.reduce((a, s) => a + s.pct, 0) / finished.length) : null;
  return { stats, finishedCount: finished.length, total: list.length, avg };
}

// The full report: used on the student's screen and in the teacher console
export function reportHTML(game, teamId, prog, members) {
  const sum = progressSummary(game, prog);
  const sent = prog && prog.sentAt ? new Date(prog.sentAt).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : null;
  return `<div class="report stack">
    <div class="panel" style="border-top:6px solid var(--orange)">
      <span class="eyebrow">Marketing report · ${esc(game.name)}</span>
      <h2 style="margin:4px 0">${esc(teamName(teamId))}</h2>
      ${members && members.length ? `<p class="muted" style="margin:0">Team: ${esc(members.join(", "))}</p>` : ""}
      <div class="row" style="gap:28px;margin-top:12px">
        <div><div class="big">${sum.finishedCount}/${sum.total}</div><div class="muted">companies finished</div></div>
        <div><div class="big">${sum.avg === null ? "—" : sum.avg + "%"}</div><div class="muted">average of best possible</div></div>
        <div><div class="big" style="font-size:clamp(20px,3vw,28px)">${sent ? "Sent" : "Not sent"}</div><div class="muted">${sent ? esc(sent) : "to the teacher yet"}</div></div>
      </div>
    </div>
    ${sum.stats.map(s => coReportHTML(s.co, prog && prog.companies && prog.companies[s.co.id], game.minSeg)).join("")}
  </div>`;
}

export function coReportHTML(co, entry, min) {
  const st = coStats(co, entry, min), years = (entry && entry.years) || [];
  if (!years.length) return `<div class="panel"><span class="eyebrow">${esc(co.industry)}</span><h3>${esc(co.name)}</h3><p class="muted" style="margin:0">Not started.</p></div>`;
  return `<div class="panel stack" style="gap:10px">
    <div class="row" style="justify-content:space-between"><div><span class="eyebrow">${esc(co.industry)}</span><h3 style="margin:0">${esc(co.name)}</h3></div>
      <div style="text-align:right"><div class="num" style="font-size:24px">${money(st.total)}</div><div class="muted" style="font-size:14px">${st.pct}% of best possible${st.finished ? "" : ` · ${st.doneYears} of ${YEAR_COUNT} years`}</div></div></div>
    <div class="tablewrap"><table><thead><tr><th>Year</th><th>Split</th><th class="r">Revenue</th><th class="r">Best</th><th>Their reasoning</th></tr></thead><tbody>
      ${years.map((yr, y) => `<tr><td><b>${y + 1}</b><div class="muted" style="font-size:13px">${esc(co.years[y].title)}</div></td><td style="min-width:150px">${allocBar(co, yr.alloc)}<div class="muted" style="font-size:12px;margin-top:4px">${yr.alloc.map((c, j) => c ? esc(co.segs[j].short) + " " + c : "").filter(Boolean).join(", ")}</div></td><td class="r num">${money(yr.rev)}</td><td class="r num muted">${money(bestPlan(co, y, min).rev)}</td><td style="min-width:220px;font-size:15px">${esc(yr.why)}</td></tr>`).join("")}
    </tbody></table></div>
    ${legend(co)}
    ${entry && Array.isArray(entry.reflect) ? `<div class="stack" style="gap:8px">${REFLECT.map((q, i) => `<div><b style="font-size:15px">${esc(q)}</b><p style="margin:2px 0 0">${esc(entry.reflect[i] || "")}</p></div>`).join("")}</div>` : ""}
  </div>`;
}
