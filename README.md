# freeroll.org

A poker-themed daily luck game (see `DLE.md` for the full design spec).

## Status

The static marketing site (`site/`) is what's actually live at freeroll.org today, deployed via
Cloudflare Pages — see the `.github/workflows/` for that pipeline.

The SvelteKit app under `src/` is the real app being built alongside it: magic-link sign-in and
the database model are in place; the actual game (deals, scoring, badges, leaderboard) isn't
built yet. It is **not deployed anywhere yet** — the live site keeps being served by `site/`
until this is ready to cut over.

## Dev setup

```
npm install
npm run migrate   # applies src/lib/server/migrations/*.sql to a local SQLite file
npm run dev
```

No Turso account needed to develop — with `TURSO_DATABASE_URL` unset, the app talks to a plain
SQLite file at `./data/app.db`. Only a real deploy needs a real Turso database.

Copy `.env.example` to `.env` and fill in `RESEND_API_KEY` / `FROM_ADDRESS` to actually send
magic-link emails. Without a key set, `npm run dev` logs the email to the console instead of
sending it, so the sign-in flow is fully testable without a Resend account.

## Stack

SvelteKit + `@sveltejs/adapter-cloudflare` (Cloudflare Workers, once deployed) · Turso (libSQL) +
Kysely, hand-written SQL migrations · Resend for transactional email. Full rationale in `DLE.md`.
