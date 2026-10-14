// =====================================================================
// MILLION DOLLAR MEDIA BUY: five companies, segments, yearly news, scoring
// Shared by the browser pages and the Vercel API (the server does all scoring).
//
// Hidden scoring values for each segment:
//   cap = customers you could win, k = how fast returns shrink ($K), val = yearly spending per customer ($)
// Each year's news multiplies cap (and sometimes val) for some segments.
// =====================================================================

const COLORS = ["#E9A27C", "#C9B8AC", "#4C3629", "#E26F39", "#8C6E5D", "#2E5E4E"];
const seg = (i, o) => ({ color: COLORS[i], ...o });

export const COMPANIES = [
  /* ------------------------------------------------------------ 1 */
  {
    id: "basecamp", name: "Basecamp Bouldering", industry: "Indoor climbing gym",
    line: "Indoor bouldering gym · 2 locations in the northwest suburbs · opened 2025",
    about: "Bouldering is rock climbing on short walls (about 15 feet) with no ropes. Climbers fall onto thick padded floors, so beginners can try it on day one. Basecamp has climbing walls, a small training area, a kids’ zone, and a party room.",
    owner: "We have $1 million a year for marketing. Spend it on people who will actually come back and spend money, not just people who think we look cool.",
    prices: [["Day pass", "$22"], ["Monthly membership", "$69 / mo"], ["Kids’ birthday party (10 kids)", "$395"], ["Youth climbing club", "$85 / mo"], ["Company team event (up to 25)", "$1,800"]],
    segs: [
      seg(0, { id: "hs", name: "High School Teens", short: "HS Teens", ages: "Ages 14–18", size: "31,000 in the trade area", cap: 4000, k: 250, val: 90,
        quote: "“It looks so cool on TikTok. I’d go if somebody drove me, and if my mom paid.”",
        why: "Tons of interest, but most come once with friends and a parent pays. Low spending per customer." }),
      seg(1, { id: "col", name: "College Students", short: "College", ages: "Ages 18–22", size: "9,000 in the trade area", cap: 1500, k: 200, val: 260,
        quote: "“Our campus is 25 minutes away. Maybe on a weekend if a group is going.”",
        why: "Decent interest, but distance and tight budgets keep visits low." }),
      seg(2, { id: "yp", name: "Young Professionals", short: "Young Pros", ages: "Ages 23–34", size: "42,000 in the trade area", cap: 3000, k: 230, val: 720,
        quote: "“I quit my regular gym. I climb four nights a week now. Best $69 I spend all month.”",
        why: "The core customer. They buy monthly memberships and keep coming back." }),
      seg(3, { id: "par", name: "Parents of Kids 6–12", short: "Parents", ages: "Parents of ages 6–12", size: "18,000 households", cap: 1200, k: 150, val: 650,
        quote: "“My son’s birthday party there was the easiest party I’ve ever thrown. Now he’s in the youth climbing club.”",
        why: "Birthday parties plus kids’ clubs. A smaller group, but each family spends a lot." }),
      seg(4, { id: "fit", name: "Fitness Crowd 35–50", short: "Fitness 35–50", ages: "Ages 35–50", size: "55,000 in the trade area", cap: 2000, k: 400, val: 420,
        quote: "“I’d try it, but I already pay for a gym. I’m not paying for two.”",
        why: "A big group, but most already have a gym. Hard and slow to win over." }),
      seg(5, { id: "corp", name: "Companies (Team Events)", short: "Companies", ages: "HR managers at companies with 50+ employees", size: "640 companies", cap: 120, k: 120, val: 4500,
        quote: "“Our team event was $1,800 and people still talk about it. We already booked two more.”",
        why: "Only a few hundred companies, but each one books several $1,800 events a year." })
    ],
    charts: {
      interest: { title: "“I’d like to try bouldering”", values: [78, 64, 52, 61, 33, 41], note: "Parents answered for their kids. Companies = HR managers." },
      spend: { title: "Average spending per customer, per year", note: "For companies, one “customer” is one company, which usually books 2 to 3 events a year." },
      loyal: { title: "Tried it once → came back 3+ times", values: [14, 31, 58, 47, 39, 62], note: "For companies: booked a second event within a year." },
      dive: { title: "High school visits: who pays?", rows: [["Parent pays", 71], ["Teen pays", 24], ["Split", 5]], fmt: "pct", note: "Average high school visit: 1 day pass, usually with 2 or 3 friends." }
    },
    years: [
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
    ]
  },

  /* ------------------------------------------------------------ 2 */
  {
    id: "pawprint", name: "Pawprint Pantry", industry: "Fresh dog food delivery",
    line: "Fresh-cooked dog food, delivered monthly · Chicago area · launched 2024",
    about: "Pawprint Pantry cooks dog food from real meat and vegetables, portions it for each dog’s size, and ships it frozen every month. Most customers subscribe. A medium-size dog costs about $65 a month to feed.",
    owner: "Everybody loves dogs. That’s the problem. I need the people who will actually pay for a subscription and stay with us, not just people who like dog videos.",
    prices: [["Small dog plan", "$40 / mo"], ["Medium dog plan", "$65 / mo"], ["Large dog plan", "$95 / mo"], ["Treat box add-on", "$18 / mo"], ["Vet clinic referral program", "Free to join"]],
    segs: [
      seg(0, { id: "teen", name: "Teen Dog Lovers", short: "Teens", ages: "Ages 14–18", size: "34,000 in the area", cap: 3000, k: 250, val: 40,
        quote: "“I’d literally feed my dog this every day. I’d have to ask my dad though.”",
        why: "The most excited group by far, but parents make the food decisions. Very few subscribe." }),
      seg(1, { id: "col", name: "College Students", short: "College", ages: "Ages 18–22", size: "21,000 in the area", cap: 800, k: 200, val: 180,
        quote: "“Most of us can’t have dogs in the dorms. The ones who do buy whatever’s on sale.”",
        why: "Few college students own dogs, and the ones who do buy cheap food." }),
      seg(2, { id: "yp", name: "Young Dog Owners", short: "Young Owners", ages: "Ages 25–34, own a dog", size: "26,000 dog owners", cap: 2500, k: 230, val: 620,
        quote: "“My dog is basically my kid. I’ll cut back on my own groceries before his.”",
        why: "The core customer. They treat their dog like family and subscribe for the long haul." }),
      seg(3, { id: "fam", name: "Families with Kids", short: "Families", ages: "Parents ages 30–45 with a dog", size: "31,000 households", cap: 2000, k: 300, val: 480,
        quote: "“We love it, but with three kids, the dog food budget is the first thing we look at.”",
        why: "Plenty of dogs, but busy schedules and tight budgets make them cancel more often." }),
      seg(4, { id: "emp", name: "Empty Nesters 55+", short: "Empty Nesters", ages: "Ages 55+, kids moved out", size: "14,000 dog owners", cap: 1100, k: 140, val: 900,
        quote: "“The kids are gone. The dog gets the good stuff now. We bought the large plan and the treat box.”",
        why: "A smaller group that spends the most per dog and almost never cancels." }),
      seg(5, { id: "vet", name: "Vet Clinics", short: "Vet Clinics", ages: "Veterinarians who recommend food", size: "90 clinics", cap: 60, k: 100, val: 7000,
        quote: "“When we recommend a food, owners listen. We send people to Pawprint every week now.”",
        why: "Each clinic that recommends you sends a steady stream of new subscribers." })
    ],
    charts: {
      interest: { title: "“I’d want to try fresh dog food”", values: [81, 47, 66, 52, 49, 38], note: "Vet clinics = veterinarians surveyed about recommending it." },
      spend: { title: "Average spending per customer, per year", note: "For vet clinics: yearly subscriptions that come from one clinic’s referrals." },
      loyal: { title: "Still subscribed after 6 months", values: [11, 24, 63, 41, 78, 70], note: "For vet clinics: still referring customers after 6 months." },
      dive: { title: "Teens who want it: what happened next?", rows: [["Asked a parent", 46], ["Parent said yes", 9], ["Never asked", 54]], fmt: "pct", note: "Out of every 100 teens who said they wanted it, about 4 households subscribed." }
    },
    years: [
      { title: "Launch Year", body: "Pawprint is new in town. Study who owns dogs and who pays for them before you spend.", mods: {}, notes: {} },
      { title: "The Puppy Video", body: "A video of a golden retriever “taste-testing” Pawprint gets 30 million views. Teens and college students can’t stop sharing it.",
        mods: { teen: { cap: 1.8 }, col: { cap: 1.3 }, yp: { cap: 1.05 } },
        notes: { teen: "Teens shared the video everywhere. Their parents still didn’t subscribe.", col: "More buzz, but still very few college students own dogs." } },
      { title: "Big-Brand Recall", body: "A major dog food brand recalls millions of bags after dogs get sick. Owners are looking for food they can trust, and vets are getting questions every day.",
        mods: { yp: { cap: 1.25 }, emp: { cap: 1.3 }, fam: { cap: 1.15 }, vet: { cap: 1.2 } },
        notes: { emp: "Worried owners with money to spend switched fast.", vet: "Vets fielded recall questions and recommended Pawprint more often." } },
      { title: "Grocery Prices Jump", body: "Food prices rise sharply. Families and students are cutting their budgets wherever they can.",
        mods: { fam: { cap: 0.7 }, col: { cap: 0.6 }, yp: { cap: 0.9 } },
        notes: { fam: "Families cut the dog food budget first.", emp: "Empty nesters barely noticed the price increase." } }
    ]
  },

  /* ------------------------------------------------------------ 3 */
  {
    id: "loop", name: "Loop E-Bikes", industry: "E-bike subscription",
    line: "Monthly e-bike subscription · Chicago and inner suburbs · launched 2025",
    about: "Loop rents electric bikes by the month. Repairs, insurance, and a lock are included, and Loop swaps the bike if anything breaks. Riders must be 18 or older to sign the rental agreement.",
    owner: "Our customers are the people who ride every single day. One month of riding a few times doesn’t keep the lights on.",
    prices: [["Standard e-bike", "$79 / mo"], ["Cargo e-bike (carries kids or deliveries)", "$129 / mo"], ["Weekend pass", "$35"], ["Annual plan (2 months free)", "$790 / yr"]],
    segs: [
      seg(0, { id: "teen", name: "High School Teens", short: "HS Teens", ages: "Ages 15–18", size: "40,000 in the area", cap: 3000, k: 250, val: 30,
        quote: "“An e-bike would be so much better than the bus. I’m 16 though, so I can’t sign up.”",
        why: "They love the idea, but riders must be 18 to sign. Only a few parents sign for them." }),
      seg(1, { id: "col", name: "College Students", short: "College", ages: "Ages 18–22", size: "62,000 in the city", cap: 1500, k: 180, val: 420,
        quote: "“It gets me from my apartment to class in 8 minutes. I just pause it over winter break.”",
        why: "Good riders during the school year, but many pause in summer and winter." }),
      seg(2, { id: "com", name: "City Commuters", short: "Commuters", ages: "Ages 25–40, work downtown", size: "85,000 commuters", cap: 2600, k: 260, val: 760,
        quote: "“I sold my car. Loop costs less than parking did, and I get to work faster.”",
        why: "The core customer. They ride twice a day and keep paying year round." }),
      seg(3, { id: "gig", name: "Delivery Gig Workers", short: "Gig Workers", ages: "Food and package delivery riders", size: "4,500 riders", cap: 700, k: 110, val: 950,
        quote: "“The bike is my job. I ride 8 hours a day, and when it breaks, Loop swaps it the same day.”",
        why: "A small group, but they rent the pricier cargo bike and never cancel." }),
      seg(4, { id: "sub", name: "Suburban Families", short: "Suburb Families", ages: "Parents ages 30–45", size: "48,000 households", cap: 1800, k: 350, val: 300,
        quote: "“Fun for weekend rides with the kids. We don’t really use it during the week.”",
        why: "Lots of interest in weekend fun, but they ride rarely and cancel often." }),
      seg(5, { id: "ret", name: "Active Retirees 60+", short: "Retirees", ages: "Ages 60–75", size: "22,000 in the area", cap: 900, k: 200, val: 520,
        quote: "“My knees can’t do hills anymore. With the motor, I ride to the lake every morning.”",
        why: "A surprise: steady daily riders who stay subscribed." })
    ],
    charts: {
      interest: { title: "“I’d want to ride an e-bike”", values: [74, 61, 58, 69, 44, 36], note: "Gig workers were surveyed at delivery pickup spots." },
      spend: { title: "Average spending per customer, per year", note: "Gig workers usually rent the $129 cargo bike." },
      loyal: { title: "Still subscribed after 6 months", values: [8, 42, 71, 88, 27, 66], note: "College riders often pause over breaks." },
      dive: { title: "Average rides per week", rows: [["Gig workers", 34], ["Commuters", 10], ["Retirees", 7], ["College", 6], ["Suburb families", 2]], fmt: "num", note: "Teens are not shown because few are allowed to rent." }
    },
    years: [
      { title: "Launch Year", body: "Loop is rolling out across the city. Figure out who will ride every day before you spend.", mods: {}, notes: {} },
      { title: "Gas Hits $5", body: "Gas prices jump to $5 a gallon. Drivers are looking for any cheaper way to get to work and school.",
        mods: { com: { cap: 1.3 }, sub: { cap: 1.2 }, col: { cap: 1.1 }, teen: { cap: 1.2 } },
        notes: { com: "Commuters ditched their cars in big numbers.", sub: "Families got curious, but still mostly rode on weekends." } },
      { title: "Brutal Winter", body: "It’s one of the coldest, snowiest winters in years. Most people put their bikes away. Food delivery orders, though, are at an all-time high.",
        mods: { com: { cap: 0.75 }, col: { cap: 0.6 }, sub: { cap: 0.5 }, ret: { cap: 0.75 }, teen: { cap: 0.6 }, gig: { cap: 1.25 } },
        notes: { gig: "Delivery orders boomed. Gig riders needed bikes more than ever.", sub: "Families parked their bikes until spring." } },
      { title: "New Bike Lanes, New Rival", body: "The city opens 50 miles of protected bike lanes. But a scooter company launches cheap rentals near every college campus.",
        mods: { com: { cap: 1.15 }, ret: { cap: 1.3 }, col: { cap: 0.6 } },
        notes: { ret: "Protected lanes made older riders feel safe.", col: "Cheap scooters took most of the college market." } }
    ]
  },

  /* ------------------------------------------------------------ 4 */
  {
    id: "secondspin", name: "Second Spin", industry: "Sneaker and streetwear resale app",
    line: "Buy and sell used sneakers and streetwear · app-only · launched 2024",
    about: "Second Spin is an app where people buy and sell used sneakers, hoodies, and streetwear. Every pair is checked by an expert before it ships. Second Spin earns money by keeping 12% of every sale.",
    owner: "We make money when people buy and sell, a lot. I want the customers who trade every month, not people who say they like the idea.",
    prices: [["Our fee on every sale", "12%"], ["Average sale price", "$95"], ["Authentication check", "Free"], ["Spin Plus (lower fees, early access)", "$8 / mo"]],
    segs: [
      seg(0, { id: "hs", name: "High School Sneakerheads", short: "HS Teens", ages: "Ages 14–18", size: "38,000 in the area", cap: 4000, k: 260, val: 210,
        quote: "“I flip shoes every weekend. Buy a pair, wear them a month, sell them, buy the next one.”",
        why: "This time teens ARE the core. They buy and sell constantly, so the fees add up fast." }),
      seg(1, { id: "col", name: "College Students", short: "College", ages: "Ages 18–22", size: "24,000 in the area", cap: 2500, k: 240, val: 180,
        quote: "“I sell stuff when I need money for rent. I buy when something cheap pops up.”",
        why: "Solid traders who buy and sell when money is tight." }),
      seg(2, { id: "coll", name: "Collectors 25–40", short: "Collectors", ages: "Ages 25–40, own 30+ pairs", size: "5,000 collectors", cap: 600, k: 110, val: 1400,
        quote: "“I bought a $1,100 pair last month. I only use apps that check if they’re real.”",
        why: "A small group making huge purchases. Each one brings in big fees." }),
      seg(3, { id: "par", name: "Parents Buying for Kids", short: "Parents", ages: "Parents ages 35–50", size: "29,000 households", cap: 1500, k: 250, val: 160,
        quote: "“My son outgrows shoes every six months. Buying used saves us a fortune.”",
        why: "Steady buyers when kids outgrow shoes, but they rarely sell." }),
      seg(4, { id: "eco", name: "Sustainability Shoppers", short: "Eco Shoppers", ages: "Ages 20–45, care about the planet", size: "52,000 in the area", cap: 3000, k: 400, val: 60,
        quote: "“Buying secondhand is so important for the planet. I’ve been meaning to try it.”",
        why: "They say they love secondhand. Very few actually buy." }),
      seg(5, { id: "bud", name: "Budget Shoppers 35+", short: "Budget 35+", ages: "Ages 35–60", size: "61,000 in the area", cap: 2000, k: 400, val: 70,
        quote: "“I’ll check it out if it’s cheaper than the outlet mall.”",
        why: "A huge group, but they buy rarely and only the cheapest items." })
    ],
    charts: {
      interest: { title: "“I’d buy secondhand clothes or shoes”", values: [72, 66, 58, 54, 84, 41], note: "Everyone said this before buying anything." },
      spend: { title: "Average fees we earn per customer, per year", note: "Our 12% cut of everything they bought and sold." },
      loyal: { title: "Made 3+ trades in their first year", values: [61, 44, 82, 35, 9, 12], note: "A “trade” is one purchase or one sale." },
      dive: { title: "Eco shoppers: said vs. did", rows: [["Said they’d buy secondhand", 84], ["Downloaded the app", 22], ["Bought something", 9]], fmt: "pct", note: "Saying and doing are two different things." }
    },
    years: [
      { title: "Launch Year", body: "Second Spin is new on the app store. Look closely at who actually trades, not just who likes the idea.", mods: {}, notes: {} },
      { title: "The 4-Minute Sellout", body: "A hyped sneaker release sells out in 4 minutes. Everyone who missed it is hunting for a pair on resale apps.",
        mods: { hs: { cap: 1.4 }, coll: { cap: 1.5 }, col: { cap: 1.2 } },
        notes: { coll: "Collectors paid huge prices for the sold-out pair.", hs: "Teens flipped pairs all month long." } },
      { title: "Rival Caught Selling Fakes", body: "A rival resale app is exposed for selling fake sneakers. Second Spin checks every pair, and shoppers are noticing.",
        mods: { coll: { cap: 1.35 }, par: { cap: 1.2 }, hs: { cap: 1.1 } },
        notes: { coll: "Collectors moved their big purchases to the app they could trust.", par: "Parents felt safer buying here." } },
      { title: "Tight Back-to-School Budgets", body: "Prices are up everywhere, and families are tightening their back-to-school spending. More adults are hunting for deals.",
        mods: { par: { cap: 0.75 }, hs: { cap: 0.9 }, bud: { cap: 1.3 } },
        notes: { par: "Parents cut back on extra shoe purchases.", bud: "More deal hunters showed up, but they still bought cheap items." } }
    ]
  },

  /* ------------------------------------------------------------ 5 */
  {
    id: "sidekick", name: "Sidekick", industry: "Homework help app",
    line: "Homework help and test prep app · used in 3 states · launched 2023",
    about: "Sidekick gives students step-by-step help with math, science, and writing, plus practice tests for the SAT and ACT. The basic version is free. Sidekick makes money from Premium subscriptions and from school district licenses.",
    owner: "Millions of kids use the free version. That doesn’t pay anyone’s salary. Find me the people and schools who will pay.",
    prices: [["Basic", "Free"], ["Premium (family plan)", "$15 / mo"], ["Test prep bundle", "$149 / season"], ["School district license", "$14,000 / yr"]],
    segs: [
      seg(0, { id: "fr", name: "Freshmen & Sophomores", short: "9th–10th", ages: "Ages 14–16", size: "45,000 students", cap: 4000, k: 250, val: 45,
        quote: "“I use Sidekick every night for math. The free version is honestly enough.”",
        why: "Huge usage, but they stick to the free version. Very few upgrade." }),
      seg(1, { id: "jr", name: "Juniors (Test Prep)", short: "Juniors", ages: "Ages 16–17, taking the SAT or ACT", size: "22,000 students", cap: 1500, k: 180, val: 260,
        quote: "“My parents bought the test prep bundle. I went up 140 points.”",
        why: "Parents pay for test prep, but only during test season." }),
      seg(2, { id: "par", name: "Parents of Middle Schoolers", short: "Parents (MS)", ages: "Parents of ages 11–14", size: "38,000 households", cap: 2200, k: 220, val: 520,
        quote: "“I can’t help with 7th grade math anymore. Sidekick can. We pay for the whole year.”",
        why: "The core payer. They buy the yearly family plan and keep it." }),
      seg(3, { id: "col", name: "College Students", short: "College", ages: "Ages 18–22", size: "30,000 students", cap: 1500, k: 250, val: 110,
        quote: "“It’s fine for intro classes, but my school already has free tutoring.”",
        why: "They have free campus tutoring, so few subscribe." }),
      seg(4, { id: "dist", name: "School Districts", short: "Districts", ages: "Superintendents and curriculum directors", size: "60 districts", cap: 40, k: 120, val: 14000,
        quote: "“We bought licenses for every middle school. Teachers use it for homework help every day.”",
        why: "Very few buyers, but each district license is worth $14,000 a year." }),
      seg(5, { id: "adult", name: "Adult Learners", short: "Adults", ages: "Ages 25–55, GED or English classes", size: "11,000 learners", cap: 900, k: 180, val: 380,
        quote: "“I’m finishing my GED at 34. I study on Sidekick after my kids go to bed.”",
        why: "A small, motivated group that pays and keeps paying." })
    ],
    charts: {
      interest: { title: "“I use or would use a homework help app”", values: [83, 71, 64, 52, 58, 61], note: "Districts = administrators asked about buying it for their schools." },
      spend: { title: "Average spending per customer, per year", note: "For districts, one “customer” is one district license." },
      loyal: { title: "Paid for a second year", values: [6, 22, 68, 14, 81, 57], note: "Juniors usually stop after test season." },
      dive: { title: "Free vs. paid users, 9th–10th grade", rows: [["Use free version", 94], ["Pay for Premium", 6]], fmt: "pct", note: "Most Premium accounts are paid by parents of younger students." }
    },
    years: [
      { title: "Back to School", body: "A new school year starts. Students are downloading apps. Who will actually pay?", mods: {}, notes: {} },
      { title: "New SAT Dates", body: "The SAT adds more test dates and moves fully online. Juniors and their parents are scrambling to prepare.",
        mods: { jr: { cap: 1.6 } },
        notes: { jr: "Test prep sales jumped with the new test dates." } },
      { title: "Free AI Homework Tool", body: "A free AI homework tool goes viral. High school and college students are trying it instead of paying for anything.",
        mods: { fr: { cap: 0.5 }, col: { cap: 0.5 }, jr: { cap: 0.85 }, par: { cap: 0.9 } },
        notes: { fr: "Students jumped to the free AI tool.", dist: "Districts stuck with a tool built for schools." } },
      { title: "State Tutoring Grants", body: "The state gives school districts and adult education programs grant money to buy tutoring tools.",
        mods: { dist: { cap: 1.6 }, adult: { cap: 1.2 } },
        notes: { dist: "Grant money made district licenses easy to buy.", adult: "Adult programs used grants to buy subscriptions." } }
    ]
  }
];

export const companyById = id => COMPANIES.find(c => c.id === id) || COMPANIES[0];
export const CHIPS = 10, CHIP = 100000, REPEAT = 1.10, LUCK = 0.10, YEAR_COUNT = 4;

export function segRevenue(co, i, chips, y, prevChips, luckFactor) {
  if (!chips) return 0;
  const s = co.segs[i], m = co.years[y].mods[s.id] || {};
  const base = s.cap * (m.cap || 1) * (1 - Math.exp(-chips * 100 / s.k)) * s.val * (m.val || 1);
  return base * (prevChips > 0 ? REPEAT : 1) * (luckFactor || 1);
}
export const firstChipReturn = (co, i, y) => segRevenue(co, i, 1, y, 0, 1) / CHIP;

const bestCache = {};
export function bestPlan(co, y, min) {
  const key = co.id + y + ":" + min;
  if (bestCache[key]) return bestCache[key];
  let best = null; const arr = [], n = co.segs.length;
  (function rec(i, left) {
    if (i === n - 1) {
      arr[i] = left; const used = arr.filter(x => x > 0).length;
      if (used >= min) { const r = arr.reduce((a, c, j) => a + segRevenue(co, j, c, y, 0, 1), 0); if (!best || r > best.rev) best = { rev: r, alloc: [...arr] }; }
      return;
    }
    for (let c = 0; c <= left; c++) { arr[i] = c; rec(i + 1, left - c); }
  })(0, CHIPS);
  return (bestCache[key] = best);
}
export const bestTotal = (co, min) => co.years.reduce((a, _, y) => a + bestPlan(co, y, min).rev, 0);

// Score one team's buy for one year
export function scoreOne(co, y, alloc, prevAlloc, luck) {
  const segRev = alloc.map((c, j) => segRevenue(co, j, c, y, prevAlloc ? prevAlloc[j] : 0, luck ? 1 + (Math.random() * 2 - 1) * LUCK : 1));
  return { alloc, segRev, rev: segRev.reduce((a, b) => a + b, 0) };
}

// Live mode: score every team at once. buys = { teamId: [blocks] }, prev = last year's results (or null)
export function scoreYear(game, y, buys, prev) {
  const co = companyById(game.company), teams = {};
  game.teams.forEach(id => {
    const alloc = buys[id] && rowState(buys[id], game.minSeg).ok ? buys[id].map(n => +n || 0) : null;
    if (!alloc) { teams[id] = { alloc: co.segs.map(() => 0), segRev: co.segs.map(() => 0), rev: 0, missing: true }; return; }
    const prevAlloc = prev && prev.teams[id] ? prev.teams[id].alloc : null;
    teams[id] = { ...scoreOne(co, y, alloc, prevAlloc, game.luck), missing: false };
  });
  return { year: y, teams };
}

/* ---------- helpers ---------- */
export const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
export function money(n) { const a = Math.abs(n); if (a >= 1e6) return "$" + (n / 1e6).toFixed(2) + "M"; if (a >= 1e3) return "$" + Math.round(n / 1e3) + "K"; return "$" + Math.round(n); }
export function rowState(row, min) {
  const tot = row.reduce((a, b) => a + (+b || 0), 0), n = row.filter(x => +x > 0).length;
  if (tot === 0) return { cls: "idle", txt: "Waiting", ok: false, tot, n };
  if (tot !== CHIPS) return { cls: "no", txt: (tot < CHIPS ? "Under" : "Over") + " by " + money(Math.abs(CHIPS - tot) * CHIP), ok: false, tot, n };
  if (n < min) return { cls: "no", txt: "Fund at least " + min + " segments", ok: false, tot, n };
  return { cls: "ok", txt: "Ready", ok: true, tot, n };
}
export const wordCount = s => String(s || "").trim().split(/\s+/).filter(Boolean).length;
