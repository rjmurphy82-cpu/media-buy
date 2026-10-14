# Million Dollar Media Buy

A target marketing game for Hersey Intro to Business. Students make their own teams on their Chromebooks by typing their first names (no passwords, up to 15 teams), read a client brief, and split $1,000,000 a year across six customer segments for four years. There are five companies and two ways to run it:

- **Self-paced:** teams work through the companies on their own, explain each year's plan in a sentence, answer reflection questions, and send you a report. You see every team's progress live and can print the reports.
- **Live:** you run one company on the projector (`/teacher`) and reveal each year together.

## The five companies

| Company | What it is | The trap | The hidden gem |
|---|---|---|---|
| Basecamp Bouldering | Indoor climbing gym | High school teens (parents pay, they rarely return) | Companies booking team events |
| Pawprint Pantry | Fresh dog food delivery | Teen dog lovers (parents decide) | Empty nesters 55+ |
| Loop E-Bikes | E-bike subscription | High school teens (must be 18 to rent) | Delivery gig workers |
| Second Spin | Sneaker resale app | Sustainability shoppers (say yes, rarely buy) | Collectors 25–40 (and teens are the core this time) |
| Sidekick | Homework help app | 9th–10th graders (stay on the free version) | School districts |

Everything runs on Vercel: the pages, the login, and the game data. No other accounts needed.

## What's in here

| File | What it does |
|---|---|
| `index.html` | Team login and team desk (students use this) |
| `teacher.html` | Teacher console at `/teacher` (projector) |
| `js/teams.js` | Shows the student-made team names on every screen |
| `js/model.js` | The five companies, their segments, yearly news, and the scoring model |
| `js/game.js` | Screens shared by both pages (brief, results, standings) |
| `js/student.js`, `js/teacher.js`, `js/api.js` | Page logic |
| `api/` | Vercel serverless functions: join, lobby, live state, live buys, self-paced play and reports, teacher controls |
| `css/style.css` | Hersey styling |
| `vercel.json`, `package.json` | Vercel settings |

## Setup

### 1. Put the code on GitHub
Create a repository and upload everything in this folder, keeping the `api`, `js`, and `css` folders.

### 2. Create the Vercel project
1. In Vercel, click **Add New > Project** and import the repository.
2. Framework Preset: **Other**. Leave Build Command and Output Directory empty. Click **Deploy**. (The page loads, but the game won't work until step 3 is done.)

### 3. Connect storage
1. In the project, open **Storage** and click **Create Database**.
2. Pick **Upstash for Redis** (free tier is plenty) and connect it to this project.
3. Vercel adds the connection settings automatically (`KV_REST_API_URL` and `KV_REST_API_TOKEN`, or `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`; the game reads either). All game data is saved under keys starting with `mdmb:`, so you can reuse the same database as your other class games.
4. Go to **Deployments**, open the **⋯** menu on the latest one, and click **Redeploy** so the connection takes effect.

### 4. Share it
- Students: `https://<project-name>.vercel.app` (post on Schoology)
- You: `https://<project-name>.vercel.app/teacher` (no password, so keep this link to yourself and don't post it)

## Running a class

### The student start screen
Students go to the main link and pick one of two ways to play:

- **Live in Class:** joins the game you're running from `/teacher`. If no class game is running, they see "Waiting for your teacher."
- **Open Play:** always open, no setup needed. Teams make a team from their first names, work through all five companies at their own pace, and send you a report. A team can come back later, pick its name from the list, and pick up where it left off.

In the teacher console, use the **Class game / Open Play** switch at the top to see either one. Open Play's **Control** and **Reports** screens show every team's progress and reports, and the **✕** button removes junk or duplicate teams.

### A self-paced class game
On **Games**, choose **Self-paced** and the companies, then create it. It works like Open Play but only for that class period, and you can **Close** it at the end of class.

### Live (on the projector)
1. On **Games**, choose **Live**, pick the company, and create the game.
2. Teams join the same way. Click **Open Year 1 buying**; the yearly news shows on every team's screen. Teams place 10 blocks of $100,000 and submit.
3. The console shows who has submitted (splits stay hidden). Click **Close buying and reveal**. Teams that didn't submit earn $0 for the year.
4. Talk through the reveal, then open the next year. After Year 4, show the final standings and debrief.

Screens refresh every few seconds, so nobody needs to reload. For the next class period, create a new game; starting a new game sends every Chromebook back to the join screen.

## Changing the game

All content lives in `js/model.js`, one block per company:
- `segs`: segment names, survey quotes, and hidden scoring values (`cap` = customers you could win, `k` = how fast returns shrink, `val` = yearly spending per customer).
- `charts`: the survey numbers on the brief.
- `years`: the four news events and how they change each segment.

The reflection questions are at the top of `js/game.js`.
