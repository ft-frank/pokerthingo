# Poker Night

A minimalist home-game tracker: log each player's buy-in and cash-out, then get
the net results and the fewest payments needed to settle up. Runs as a
responsive website on desktop and mobile, and is installable as an app (PWA —
"Add to Home Screen").

Refactored from a single static `poker_home_game_app.html` mockup into a
**Next.js (App Router) + TypeScript** application.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build    # production build
npm run start    # serve the production build
```

## How it works

- **Games list** (`/`) — all your games; tap **+** to create one.
- **New game** (`/new`) — pick stakes (with presets) and a date.
- **Game detail** (`/game/[id]`) — add/rename/remove players and adjust each
  one's buy-in and cash-out with steppers.
- **Settlement** (`/game/[id]/settle`) — net result per player plus a
  minimal "who pays who" list.

Games are stored in the browser's `localStorage`, so your data persists between
visits on the same device. Seed data is loaded on first run.

## Project structure

```
app/
  layout.tsx              Root layout, PWA metadata, responsive app shell
  page.tsx                Games list
  new/page.tsx            New-game form
  game/[id]/page.tsx      Game detail (buy-ins / cash-outs)
  game/[id]/settle/page.tsx  Settlement results
  globals.css             Black-and-white theme, responsive styles
components/
  Icon.tsx                Inline-SVG icon set (no icon dependency)
  Stepper.tsx             +/- amount control
lib/
  types.ts                Game / Player / settlement types
  settlement.ts           Net + minimal-transaction logic (framework-agnostic)
  format.ts               Money and date formatting
  store.tsx               React context store, persisted to localStorage
public/
  manifest.webmanifest    PWA manifest
  icon.svg                App icon
```

The `lib/` logic is plain TypeScript with no web dependencies, so the core
(settlement math, types, store shape) can be reused if a native **React
Native / Expo** target is added later to ship real iOS/Android apps.
