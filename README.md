# Tonight's Menu 🍽️

A shared decision-making app for figuring out what to eat — for two.

- **Decide** — filter by mode, category, and vibe, then hit "Decide For Us" for a random pick from your catalog.
- **Catalog** — log restaurants, delivery spots, and home meals you both like; browse by category, add/edit/delete entries.

Built with Next.js (App Router) + Tailwind CSS. Data is stored in `data/entries.json` on the server, so it persists across restarts and is shared by anyone who opens the app — no login required. The design (palette, typography, index-card/diner-ticket motifs) was generated with the [`ui-ux-pro-max`](.claude/skills/ui-ux-pro-max) skill's design system reasoning engine.

## Running it

```bash
npm install
npm run dev
```

Then open http://localhost:3000 (or the same URL from your phone if it's on the same Wi-Fi as the machine running the server, e.g. `http://<your-computer's-local-ip>:3000`).

`data/entries.json` is created automatically on first run (seeded with a handful of example entries you can edit or delete) and is gitignored, since it's your personal, evolving data rather than app code.

## Production

```bash
npm run build
npm run start
```
