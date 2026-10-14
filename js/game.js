// =====================================================================
// MILLION DOLLAR MEDIA BUY: shared screens for the team desk and teacher console
// =====================================================================
import { teamName } from "./teams.js";
import { BIZ, SEGS, YEARS, CHIPS, CHIP, firstChipReturn, bestPlan, esc, money } from "./model.js";
export * from "./model.js";

export const allocBar = row => `<div class="alloc">${row.map((c, j) => c > 0 ? `<span style="width:${c * 10}%;background:${SEGS[j].color}" title="${esc(SEGS[j].short)}: ${money(c * CHIP)}"></span>` : "").join("")}</div>`;
export const legend = () => `<div class="legend">${SEGS.map(s => `<span><i style="background:${s.color}"></i>${esc(s.short)}</span>`).join("")}</div>`;
export function bars(rows, max, fmt, note) {
  return `<div class="chart">${rows.map(r => `<div class="bar"><span>${esc(r[0])}</span><div class="track"><div class="fill" style="width:${Math.max(2, r[1] / max * 100)}%"></div></div><span class="val">${fmt(r[1])}</span></div>`).join("")}${note ? `<div class="note">${note}</div>` : ""}</div>`;
}
export function yearBar(game) {
  return YEARS.map((_, y) => {
    const done = game && (game.phase === "final" || y < game.year || (y === game.year && game.phase === "revealed"));
    const on = game && game.phase === "open" && game.year === y;
    return `<i class="${on ? "on" : done ? "done" : ""}">Year ${y + 1}</i>`;
  }).join("");
}

/* ---------- shared screens ---------- */
export function briefHTML() {
  const interest = [78, 64, 52, 61, 33, 41], back = [14, 31, 58, 47, 39, 62];
  return `<div class="stack">
  <div class="hero">
    <div class="stack" style="gap:10px">
      <span class="eyebrow">Client brief</span>
      <h2 style="font-size:clamp(30px,4.4vw,46px)">${BIZ.name}</h2>
      <p class="muted" style="font-family:var(--data);font-size:17px;letter-spacing:.04em">${BIZ.line}</p>
      <p class="lede">${BIZ.about}</p>
    </div>
    <div class="stack" style="gap:12px">
      <div class="owner"><span class="eyebrow">From the owner</span><p>“We have $1 million a year for marketing. Spend it on people who will actually come back and spend money, not just people who think we look cool.”</p></div>
      <div class="panel"><h3>What we sell</h3><div class="prices">
        <span>Day pass</span><b>$22</b><span>Monthly membership</span><b>$69 / mo</b>
        <span>Kids’ birthday party (10 kids)</span><b>$395</b><span>Youth climbing club</span><b>$85 / mo</b>
        <span>Company team event (up to 25)</span><b>$1,800</b></div></div>
    </div>
  </div>
  <div class="grid2">
    <div class="panel"><span class="eyebrow">Survey · 1,100 people in our area</span><h3>“I’d like to try bouldering”</h3>
      ${bars(SEGS.map((s, i) => [s.short, interest[i]]), 100, v => v + "%", "Parents answered for their kids. Companies = HR managers.")}</div>
    <div class="panel"><span class="eyebrow">Our first-year customers</span><h3>Average spending per customer, per year</h3>
      ${bars(SEGS.map(s => [s.short, s.val]), 4500, v => "$" + v.toLocaleString(), "For companies, one “customer” is one company, which usually books 2 to 3 events a year.")}</div>
    <div class="panel"><span class="eyebrow">Data dive</span><h3>Tried it once → came back 3+ times</h3>
      ${bars(SEGS.map((s, i) => [s.short, back[i]]), 100, v => v + "%", "For companies: booked a second event within a year.")}</div>
    <div class="panel"><span class="eyebrow">Data dive</span><h3>High school visits: who pays?</h3>
      ${bars([["Parent pays", 71], ["Teen pays", 24], ["Split", 5]], 100, v => v + "%", "Average high school visit: 1 day pass, usually with 2 or 3 friends.")}</div>
  </div>
  <div><span class="eyebrow">The six segments</span><h2>Who could we target?</h2></div>
  <div class="grid3">${SEGS.map(s => `<div class="segcard"><span class="tag">${esc(s.ages)}</span><h4>${esc(s.name)}</h4><span class="facts">${esc(s.size)}</span><p class="quote">${esc(s.quote)}</p></div>`).join("")}</div>
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

export const newsHTML = y => `<div class="news reveal"><div class="stamp">Year<b>${y + 1}</b></div><div><span class="eyebrow">Market news</span><h3>${esc(YEARS[y].title)}</h3><p style="margin:0">${esc(YEARS[y].body)}</p></div></div>`;

export function resultsHTML(game, res, me) {
  const y = res.year, ids = game.teams;
  const order = ids.map(id => ({ id, ...res.teams[id] })).filter(t => t.alloc).sort((a, b) => b.rev - a.rev);
  const fc = SEGS.map((_, j) => firstChipReturn(j, y)), maxFc = Math.max(...fc);
  const classSpend = SEGS.map((_, j) => order.reduce((a, t) => a + (t.alloc[j] || 0), 0));
  const totalBlocks = classSpend.reduce((a, b) => a + b, 0);
  const best = bestPlan(y, game.minSeg);
  return `<div class="stack">
  <div><span class="eyebrow">Year ${y + 1} results · ${esc(YEARS[y].title)}</span><h2>Who spent it best?</h2></div>
  <div class="panel tablewrap reveal"><table class="lb"><thead><tr><th></th><th>Team</th><th>Their split</th><th class="r">Revenue</th><th class="r">Return per $1</th><th>Best segment</th></tr></thead><tbody>
  ${order.map((t, k) => { const bi = t.segRev.indexOf(Math.max(...t.segRev));
    return `<tr class="${t.id === me ? "me" : k === 0 ? "top" : ""}"><td class="rank">${k + 1}</td><td><b>${esc(teamName(t.id))}</b>${t.missing ? ' <span class="pill no">No buy</span>' : ""}</td><td>${allocBar(t.alloc)}</td><td class="r num" style="font-size:21px">${money(t.rev)}</td><td class="r num">$${(t.rev / (CHIPS * CHIP)).toFixed(2)}</td><td>${t.missing ? "—" : esc(SEGS[bi].short)}</td></tr>`; }).join("")}
  </tbody></table><div style="margin-top:10px">${legend()}</div></div>
  <div class="grid2">
    <div class="panel segret reveal"><span class="eyebrow">The reveal</span><h3>What the first $100K earned in each segment</h3>
      ${SEGS.map((s, j) => `<div class="bar"><span><b>${esc(s.short)}</b></span><div class="track"><div class="fill ${fc[j] < 2 ? "low" : ""}" style="width:${fc[j] / maxFc * 100}%"></div></div><span class="val">${money(fc[j] * CHIP)}</span><span class="why">${esc(YEARS[y].notes[s.id] || s.why)}</span></div>`).join("")}
      <p class="muted" style="font-size:15px;margin-top:10px">Each extra $100K in the same segment earns less than the one before it.</p></div>
    <div class="stack">
      <div class="panel"><span class="eyebrow">Where the class spent</span><h3>${money(totalBlocks * CHIP)} across all teams</h3>
        ${bars(SEGS.map((s, j) => [s.short, totalBlocks ? Math.round(classSpend[j] / totalBlocks * 100) : 0]), 100, v => v + "%")}</div>
      <div class="panel"><span class="eyebrow">Best possible plan this year</span><h3>${money(best.rev)} with no luck</h3>
        ${allocBar(best.alloc)}<p style="margin:10px 0 0;font-size:15px">${best.alloc.map((c, j) => c ? `${esc(SEGS[j].short)} ${money(c * CHIP)}` : "").filter(Boolean).join(" · ")}</p></div>
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
  const done = results.filter(Boolean), c = totals(game, done);
  const bestTotal = YEARS.reduce((a, _, y) => a + bestPlan(y, game.minSeg).rev, 0);
  return `<div class="stack">
  <div><span class="eyebrow">Four years · $4,000,000 spent per team</span><h2>Final standings</h2></div>
  <div class="podium">${c.slice(0, 3).map((t, k) => `<div class="p ${k === 0 ? "first" : ""} reveal"><span class="eyebrow">${["1st place", "2nd place", "3rd place"][k]}</span><div style="font-family:var(--display);font-size:24px;text-transform:uppercase;color:var(--brown);margin:4px 0">${esc(teamName(t.id))}</div><div class="big">${money(t.total)}</div><p class="muted" style="margin:6px 0 0">$${t.spent ? (t.total / t.spent).toFixed(2) : "0.00"} back for every $1 spent</p></div>`).join("")}</div>
  <div class="panel">${standingsHTML(game, results, me)}</div>
  <div class="grid2">
    <div class="panel"><span class="eyebrow">The benchmark</span><h3>Best possible 4 years: ${money(bestTotal)}</h3><p>The winner reached <b>${c.length ? Math.round(c[0].total / bestTotal * 100) : 0}%</b> of the best possible score (before luck and brand bonuses).</p>
      ${YEARS.map((Y, y) => `<div style="margin:10px 0"><span class="muted" style="font-size:14px">Year ${y + 1} · ${esc(Y.title)}</span>${allocBar(bestPlan(y, game.minSeg).alloc)}</div>`).join("")}${legend()}</div>
    <div class="panel"><span class="eyebrow">Talk it over</span><h3>Debrief</h3><ol class="rules">
      <li><span>Which segment looked best in the survey but paid the least? Why?</span></li>
      <li><span>Which number in the brief was the best clue for where to spend?</span></li>
      <li><span>Why did spreading money evenly across all six segments lose to focusing on a few?</span></li>
      <li><span>Which year’s news should have changed your plan the most? Did it change yours?</span></li>
    </ol></div>
  </div></div>`;
}
