// =====================================================================
// MILLION DOLLAR MEDIA BUY: business, segments, yearly news, scoring model
// Shared by the browser pages and the Vercel API (the server scores each year).
// =====================================================================

export const BIZ = {
  name: "Basecamp Bouldering",
  line: "Indoor bouldering gym · 2 locations in the northwest suburbs · opened 2025",
  about: "Bouldering is rock climbing on short walls (about 15 feet) with no ropes. Climbers fall onto thick padded floors, so beginners can try it on day one. Basecamp has climbing walls, a small training area, a kids’ zone, and a party room."
};

// cap = customers you could win, k = how fast returns shrink ($K), val = yearly spending per customer ($)
export const SEGS = [
  { id: "hs", name: "High School Teens", short: "HS Teens", ages: "Ages 14–18", size: "31,000 in the trade area",
    cap: 4000, k: 250, val: 90, color: "#E9A27C",
    quote: "“It looks so cool on TikTok. I’d go if somebody drove me, and if my mom paid.”",
    why: "Tons of interest, but most come once with friends and a parent pays. Low spending per customer." },
  { id: "col", name: "College Students", short: "College", ages: "Ages 18–22", size: "9,000 in the trade area",
    cap: 1500, k: 200, val: 260, color: "#C9B8AC",
    quote: "“Our campus is 25 minutes away. Maybe on a weekend if a group is going.”",
    why: "Decent interest, but distance and tight budgets keep visits low." },
  { id: "yp", name: "Young Professionals", short: "Young Pros", ages: "Ages 23–34", size: "42,000 in the trade area",
    cap: 3000, k: 230, val: 720, color: "#4C3629",
    quote: "“I quit my regular gym. I climb four nights a week now. Best $69 I spend all month.”",
    why: "The core customer. They buy monthly memberships and keep coming back." },
  { id: "par", name: "Parents of Kids 6–12", short: "Parents", ages: "Parents of ages 6–12", size: "18,000 households",
    cap: 1200, k: 150, val: 650, color: "#E26F39",
    quote: "“My son’s birthday party there was the easiest party I’ve ever thrown. Now he’s in the youth climbing club.”",
    why: "Birthday parties plus kids’ clubs. A smaller group, but each family spends a lot." },
  { id: "fit", name: "Fitness Crowd 35–50", short: "Fitness 35–50", ages: "Ages 35–50", size: "55,000 in the trade area",
    cap: 2000, k: 400, val: 420, color: "#8C6E5D",
    quote: "“I’d try it, but I already pay for a gym. I’m not paying for two.”",
    why: "A big group, but most already have a gym. Hard and slow to win over." },
  { id: "corp", name: "Companies (Team Events)", short: "Companies", ages: "HR managers at companies with 50+ employees", size: "640 companies",
    cap: 120, k: 120, val: 4500, color: "#2E5E4E",
    quote: "“Our team event was $1,800 and people still talk about it. We already booked two more.”",
    why: "Only a few hundred companies, but each one books several $1,800 events a year." }
];

export const YEARS = [
  { title: "Grand Opening Year", body: "No surprises this year. Read the brief, study the data, and place your bets.", mods: {}, notes: {} },
  { title: "Bouldering Goes Viral", body: "Climbing videos are all over TikTok and Instagram. Teens and college students are talking about it more than ever, and some young professionals are curious too.",
    mods: { hs: { cap: 1.6 }, col: { cap: 1.3 }, yp: { cap: 1.1 } },
    notes: { hs: "The trend grew the audience 60%, but teens still spend about $90 a year.", col: "More college buzz this year, but the 25-minute drive still holds them back." } },
  { title: "Belt Tightening", body: "Worries about an economic slowdown have companies cutting event budgets. Some families are cutting back on extras like birthday parties.",
    mods: { corp: { cap: 0.45 }, par: { cap: 0.85 }, fit: { cap: 0.9 } },
    notes: { corp: "Companies cut event budgets by more than half this year.", par: "Some families cut back on parties, but kids’ clubs held up." } },
  { title: "Youth Boom, New Rival", body: "After a big TV moment for climbing, youth climbing clubs have waiting lists. But a rival gym just opened right next to the college campus.",
    mods: { par: { cap: 1.35 }, col: { cap: 0.55 }, hs: { cap: 1.1 } },
    notes: { par: "Youth clubs filled up. Parents were the place to be this year.", col: "The new rival near campus took most of the college crowd." } }
];

export const CHIPS = 10, CHIP = 100000, REPEAT = 1.10, LUCK = 0.10;

export function segRevenue(i, chips, y, prevChips, luckFactor) {
  if (!chips) return 0;
  const s = SEGS[i], m = YEARS[y].mods[s.id] || {};
  const base = s.cap * (m.cap || 1) * (1 - Math.exp(-chips * 100 / s.k)) * s.val * (m.val || 1);
  return base * (prevChips > 0 ? REPEAT : 1) * (luckFactor || 1);
}
export const firstChipReturn = (i, y) => segRevenue(i, 1, y, 0, 1) / CHIP;

export function bestPlan(y, min) {
  let best = null; const arr = [];
  (function rec(i, left) {
    if (i === SEGS.length - 1) {
      arr[i] = left; const n = arr.filter(x => x > 0).length;
      if (n >= min) { const r = arr.reduce((a, c, j) => a + segRevenue(j, c, y, 0, 1), 0); if (!best || r > best.rev) best = { rev: r, alloc: [...arr] }; }
      return;
    }
    for (let c = 0; c <= left; c++) { arr[i] = c; rec(i + 1, left - c); }
  })(0, CHIPS);
  return best;
}

// Score one year for every team. buys = { teamId: [6 blocks] }, prev = last year's results doc (or null)
export function scoreYear(game, y, buys, prev) {
  const teams = {};
  game.teams.forEach(id => {
    const alloc = buys[id] && rowState(buys[id], game.minSeg).ok ? buys[id].map(n => +n || 0) : null;
    const prevAlloc = prev && prev.teams[id] ? prev.teams[id].alloc : null;
    if (!alloc) { teams[id] = { alloc: SEGS.map(() => 0), segRev: SEGS.map(() => 0), rev: 0, missing: true }; return; }
    const segRev = alloc.map((c, j) => segRevenue(j, c, y, prevAlloc ? prevAlloc[j] : 0, game.luck ? 1 + (Math.random() * 2 - 1) * LUCK : 1));
    teams[id] = { alloc, segRev, rev: segRev.reduce((a, b) => a + b, 0), missing: false };
  });
  return { year: y, teams };
}

/* ---------- helpers ---------- */
export const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
export function money(n) { const a = Math.abs(n); if (a >= 1e6) return "$" + (n / 1e6).toFixed(2) + "M"; if (a >= 1e3) return "$" + Math.round(n / 1e3) + "K"; return "$" + Math.round(n); }
export function rowState(row, min) {
  const tot = row.reduce((a, b) => a + (+b || 0), 0), n = row.filter(x => +x > 0).length;
  if (tot === 0) return { cls: "idle", txt: "Waiting", ok: false, tot, n };
  if (tot !== CHIPS) return { cls: "no", txt: (tot < CHIPS ? "Under" : "Over") + " by " + money(Math.abs(CHIPS - tot) * CHIP), ok: false, tot, n };
  if (n < min) return { cls: "no", txt: "Fund at least " + min + " segments", ok: false, tot, n };
  return { cls: "ok", txt: "Ready", ok: true, tot, n };
}
