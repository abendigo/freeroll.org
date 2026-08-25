# freeroll.org

A poker-themed daily luck game (see `DLE.md` for the full design spec).

## Status

This SvelteKit app **is** the live site — freeroll.org and www.freeroll.org are served by the
`freeroll-app` Cloudflare Worker. Right now that's the marketing pages only (home, about,
leaderboard, privacy); the actual game (deals, scoring, badges) isn't built yet.

Production is currently sitting behind a "coming soon" gate (`COMING_SOON=true`, set as a repo
secret — see `src/hooks.server.ts`), so none of the above is publicly reachable yet. Visiting
`/?preview=<PREVIEW_SECRET>` once bypasses it for that browser via a cookie. To launch for real,
set the `COMING_SOON` repo secret to `false` (or delete it) and redeploy.

## Dev setup

```
npm install
npm run dev
```

## Deploy

- Push to `main` → production deploy (`.github/workflows/deploy-app.yml`)
- Every PR → preview deploy to `freeroll-app-pr-<number>.pokerdiary.workers.dev`, commented on
  the PR (`.github/workflows/pr-preview-app.yml`)
- PR closed → that preview worker is torn down (`.github/workflows/pr-preview-app-cleanup.yml`)

## Stack

SvelteKit + `@sveltejs/adapter-cloudflare` (Cloudflare Workers) · Turso (libSQL) + Kysely, once the
database model lands · Resend for transactional email, once auth lands. Full rationale in `DLE.md`.
