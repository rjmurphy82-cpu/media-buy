# Million Dollar Media Buy

A target marketing game for Hersey Intro to Business. Students make their own teams on their Chromebooks by typing their first names (no passwords, up to 15 teams), read a client brief for **Basecamp Bouldering**, and split $1,000,000 a year across six customer segments for four years. The teacher console (`/teacher`) runs the game on the projector and reveals results after each year.

Everything runs on Vercel: the pages, the login, and the game data. No other accounts needed.

## What's in here

| File | What it does |
|---|---|
| `index.html` | Team login and team desk (students use this) |
| `teacher.html` | Teacher console at `/teacher` (projector) |
| `js/teams.js` | Shows the student-made team names on every screen |
| `js/model.js` | Business, segments, yearly news, scoring model |
| `js/game.js` | Screens shared by both pages (brief, results, standings) |
| `js/student.js`, `js/teacher.js`, `js/api.js` | Page logic |
| `api/` | Vercel serverless functions: join/login, lobby, live state, team buys, teacher controls |
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

1. Open `/teacher`. On **Games**, create a game for the period (for example "Period 8") and set the minimum segments (default 3). Creating it makes it the active game.
2. Students go to the main link and type the first names of everyone at their computer. Those names become the team name ("Ava, Marcus & Jordan"). A teammate on another computer can pick that team and add their name. Up to 15 teams per game. If a group makes a duplicate team by mistake, click **Remove** on it in the console. Teams read **The Brief** while they wait.
3. Click **Open Year 1 buying**. The yearly news shows on every team's screen. Teams use the + and − buttons to place 10 blocks of $100,000 and submit. They can change their buy until you close it.
4. The console shows who has submitted (splits stay hidden). Click **Close buying and reveal**. Teams that didn't submit earn $0 for the year.
5. Talk through the reveal, then open the next year. After Year 4, show the final standings and debrief.

Screens refresh every 2 to 3 seconds, so teams see each change without reloading.

For the next class period, create a new game. Starting a new game sends every Chromebook back to the join screen, so the next class starts fresh. Old games stay saved under **Games**, and you can make any of them active again.

## Changing the game

All content lives in `js/model.js`:
- `SEGS`: segment names, survey quotes, and hidden scoring values (`cap` = customers you could win, `k` = how fast returns shrink, `val` = yearly spending per customer).
- `YEARS`: the four news events and how they change each segment.

The survey charts on the brief are in `briefHTML()` in `js/game.js`.
