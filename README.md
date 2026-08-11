# Tonight's Menu 🍽️

A shared decision-making app for figuring out what to eat — for two.

- **Decide** — filter by mode, category, and vibe, then punch the "?" block for a random pick from your catalog.
- **Catalog** — log restaurants, delivery spots, and home meals you both like, Pinterest-style; browse by category, add/edit/delete entries.
- **Distances** — set your home & university once in Settings (gear icon, top right) and every Eat Out spot shows how far it is from each — including the nearest branch, for places with more than one location.

Built with Next.js (App Router) + Tailwind CSS. Data is stored in `data/entries.json` on the server, so it persists across restarts and is shared by anyone who opens the app — no login required. The design (bold-primary-color, thick-outline "neubrutalism" look, Fredoka + Nunito type) was generated with the [`ui-ux-pro-max`](.claude/skills/ui-ux-pro-max) skill's design system reasoning engine.

## Running it

```bash
npm install
npm run dev
```

Then open http://localhost:3000 (or the same URL from your phone if it's on the same Wi-Fi as the machine running the server, e.g. `http://<your-computer's-local-ip>:3000`).

`data/entries.json` and `data/settings.json` are created automatically on first run (entries seeded with a handful of example entries you can edit or delete) and are gitignored, since they're your personal, evolving data rather than app code.

### Distances to home & university

Addresses are geocoded with [OpenStreetMap's Nominatim](https://nominatim.org/) — free, no API key, but it **requires the server to have internet access** (works fine on a normal laptop; won't work in a fully offline/sandboxed environment). Saving an Eat Out entry or your Settings addresses makes one geocoding request per address, so adding several locations at once takes a couple of seconds (Nominatim's usage policy caps free requests at ~1/second). Distances shown are straight-line ("as the crow flies"), not driving distance — there's no routing API wired up. If an address can't be found, the entry still saves fine; it just won't show a distance until you fix the address text.

## Production

```bash
npm run build
npm run start
```
