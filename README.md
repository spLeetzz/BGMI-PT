# BGMI Points Table

Tournament scoreboard manager for BGMI. No accounts required.

---

## Features

- Create a tournament → get a unique shareable URL
- Upload team rosters via CSV
- Add matches, enter per-team positions and per-player kills
- Live standings auto-calculated (placement points + kill points)
- View match results as a public read-only scoreboard
- Export standings and player kill stats as CSV
- **Creator auth** — the person who creates a tournament gets a passcode. Only they can edit it. Share the URL with anyone to view.

---

## How to Run

```bash
git clone <repo-url>
cd bgmi-points
pnpm install
cp .env.example .env        # add DATABASE_URL
pnpm db:push                # push schema
pnpm db:seed                # seed default points systems
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Neon works great) |

---

## CSV Roster Format

```
Slot Number, Team ID, Team Name, Player 1 IGN, Player 2 IGN, Player 3 IGN, Player 4 IGN, Player 5 IGN
```

- **Team ID** is optional
- Download the template from the Upload Roster page
- Up to 10 players per team (add extras inline on the match page)

---

## Stack

Next.js · TypeScript · Drizzle ORM · PostgreSQL · Tailwind CSS · papaparse · nanoid
