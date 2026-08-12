# Tonight's Menu 🍽️

A shared decision-making app for figuring out what to eat — for two.

- **Decide** — filter by mode, category, and vibe, then punch the "?" block for a random pick from your catalog.
- **Catalog** — log restaurants, delivery spots, and home meals you both like as a photo-forward Pinterest-style masonry grid; browse by category, add/edit/delete entries, attach a photo of the food.
- **Distances** — set your home & university once in Settings (gear icon, top right) and every Eat Out spot shows how far it is from each — including the nearest branch, for places with more than one location.
- **Quick Add** — paste a Google Maps share link on the Catalog screen and it pulls the restaurant's name, address, and a best-guess cuisine category into a pre-filled entry for you to check over and save.
- **Pantry filter** — list what's in your kitchen (Decide screen, "Pantry" button) and toggle "Only what I can make" to narrow Eat In suggestions to recipes you can fully cook without a shopping trip.
- **Plan** — a 7-day grid (with week navigation) to line up what you're eating each day in advance, picked from your catalog or typed freeform.
- **History** — log what you actually ate with an optional amount spent; see a day streak, monthly spend totals, and a full chronological history.
- **Installable** — has a web app manifest + icons, so "Add to Home Screen" on iOS/Android gives it a real app icon and launches full-screen, no browser chrome.
- **Hours check** — give an Eat Out/Order In entry a weekly schedule and Decide skips it while it's closed, with an override toggle for planning ahead.
- **Grocery list** — for any Eat In pick with an ingredients list, generates a shopping list (cross-referenced against your pantry) with one tap to copy.
- **Cook time tags** — tag Eat In recipes 15 min / 30 min / 45 min / 1 hr+ and filter Decide down to something quick on a tired night.

Built with Next.js (App Router) + Tailwind CSS. Data is stored as JSON files on the server (entries, settings, pantry, plan, history, and uploaded photos), so it persists across restarts and is shared by anyone who opens the app — no login required. The design (bold-primary-color, thick-outline "neubrutalism" look, Fredoka + Nunito type, drifting background clouds and coin-flip flourishes) was generated with the [`ui-ux-pro-max`](.claude/skills/ui-ux-pro-max) skill's design system reasoning engine.

## Running it

```bash
npm install
npm run dev
```

Then open http://localhost:3000 (or the same URL from your phone if it's on the same Wi-Fi as the machine running the server, e.g. `http://<your-computer's-local-ip>:3000`).

All mutable data (entries, settings, pantry, plan, history, and uploaded photos) lives under one directory, controlled by the `DATA_DIR` environment variable — defaults to `./data` for local development. The JSON files are created automatically on first run — entries seeded with a handful of example entries you can edit or delete — and `data/` is gitignored (aside from `data/seed.json`, which ships with the app), since it's your personal, evolving data rather than app code.

### Photos

Uploading a photo on an entry saves it to `DATA_DIR/uploads/` and serves it back via a small `/api/photos/[filename]` route — no third-party image host needed. Accepts JPG/PNG/WEBP/GIF up to 8MB. Removing a photo from an entry just detaches it; the original file is left on disk (there's no cleanup job, since with two people casually adding photos it's not worth the complexity).

### Distances to home & university

Addresses are geocoded with [OpenStreetMap's Nominatim](https://nominatim.org/) — free, no API key, but it **requires the server to have internet access** (works fine on a normal laptop; won't work in a fully offline/sandboxed environment). Saving an Eat Out entry or your Settings addresses makes one geocoding request per address, so adding several locations at once takes a couple of seconds (Nominatim's usage policy caps free requests at ~1/second). Distances shown are straight-line ("as the crow flies"), not driving distance — there's no routing API wired up. If an address can't be found, the entry still saves fine; it just won't show a distance until you fix the address text.

### Quick Add from Google Maps

Works by reading the restaurant name and coordinates straight out of the URL itself (Google Maps encodes them there) — no Places API key needed. Short links (`maps.app.goo.gl`, `goo.gl/maps`) get resolved first since the useful bits only show up in the expanded URL. The cuisine category is a best-effort keyword guess from the place name (e.g. "Trattoria" → Italian, "Sushi" → Japanese) — it's often right, sometimes wrong, and always editable in the review form before you save. Like distance lookups, this needs the server to have internet access; a link that can't be resolved shows a clear error instead of a bad guess.

Not built (out of scope for now, revisit if you want it): importing from a screenshot. Doing that reliably needs an AI vision model to actually read the image, not just OCR, which means wiring up a paid API key — happy to add it if you decide it's worth that tradeoff.

### Pantry filter

Give a recipe a comma-separated ingredients list when adding/editing an Eat In entry, then keep your pantry up to date from the Decide screen. "Only what I can make" only matches recipes where **every** listed ingredient is in your pantry (case-insensitive, exact word match — "tomato" won't match "tomatoes"), so it's deliberately strict: a recipe with no ingredients listed never matches, rather than being treated as "anything goes."

### Plan vs. History

These are two different directions on purpose. **Plan** is forward-looking — what you intend to eat this week — and doesn't affect anything else; assigning a day doesn't create a History entry, and nothing happens automatically when the day passes. **History** is backward-looking — what you actually ate — logged by hand via "Log a Meal" (optionally linked to a catalog entry, with a date and amount spent). The day streak counts consecutive days with at least one History entry; today doesn't break the streak until the day is over, so logging can wait until after dinner.

### Restaurant hours

Hours are entered by hand per entry (Eat Out/Order In, "Hours" section of the form) — "Same every day" for the common case, or per-day if it varies, each day with its own Closed toggle. No Google Places API key involved, on purpose, same as everything else here: it's a manual, free alternative to a live lookup. A close time at or before the open time is read as crossing midnight (e.g. 17:00–01:00). Decide checks this at the moment you load the page and hides anything currently closed — an entry with no hours set is never flagged either way, since "closed" should mean something you actually told the app, not a guess.

### Grocery list

Pulls straight from an entry's ingredients list (same one the pantry filter uses), split into "need to buy" vs. "already have" by checking against your current pantry — nothing new to maintain. Available from the Decide reveal ticket and from a cart icon on Eat In catalog cards. "Copy List" copies only the needed items as plain text, ready to paste into Notes or a chat.

## Production

```bash
npm run build
npm run start
```

## Deploying to Render (a real website, ~$7/month)

This turns the app into an always-on website with its own URL, so neither of you needs to keep a computer running. [Render](https://render.com) builds straight from this GitHub repo and gives you a small persistent disk to keep your data safe across deploys — no server administration involved.

1. **Sign up.** Go to [render.com](https://render.com) and sign up (GitHub login is easiest).
2. **New Web Service.** From the Render dashboard: **New +** → **Web Service** → connect your GitHub account → pick this repo (`project-1`).
3. **Basic settings**, when prompted:
   - **Branch**: whichever branch you want live (e.g. `main`)
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Instance Type**: the cheapest paid tier (Starter, ~$7/month). The free tier works too but spins down when idle, so the app takes ~30s to wake up on first load — fine to try before paying, upgrade if that's annoying.
4. **Add a persistent disk** (this is the step that makes your data survive redeploys):
   - In the service settings, find **Disks** → **Add Disk**
   - **Mount Path**: `/data`
   - **Size**: 1 GB is plenty (photos are the only thing that grows, and JPEGs are small)
5. **Add the environment variable** that points the app at that disk:
   - In **Environment**, add a variable: `DATA_DIR` = `/data`
6. **Deploy.** Render builds and starts the app automatically. First boot seeds `/data` with the example entries from `data/seed.json`; after that, everything you add lives on the disk and survives every future redeploy.
7. **Use it.** Render gives you a URL like `https://tonights-menu.onrender.com` — open that on both your phones (Settings → Add to Home Screen on iPhone, or the install prompt on Android, gives it a real app icon).

From then on, pushing new commits to the connected branch triggers an automatic redeploy — your data on the disk is untouched, only the app code updates.
