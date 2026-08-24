# Freeroll — a poker-themed daily luck game (rngdle clone)

## Context

The user owns **freeroll.org** and wants a daily game modeled on **rngdle.com**, poker-themed.
"Freeroll" is itself a poker term (a no-buy-in tournament), so the name fits.

**What rngdle.com is** (confirmed via its about page): a daily *luck* game, not a guessing game.
Once per day you tap once and get a random number 0–1,000,000; it's scanned for patterns; each
pattern awards a **badge**; badges give **EP (entropy points)**; your roll gets a **rarity tier**
(Trash → Mythic). It has **magic-link email accounts** and **leaderboards** (daily/weekly/all-time)
plus **sharing**.

**Freeroll** ports this to poker with a "sit at a table" twist. All structural decisions below are
**confirmed by the user**.

---

## Game design spec (v1) — AGREED

### Core loop
1. Player logs in (passwordless **magic-link email**).
2. Once per day they tap to get their **own** daily deal (2 hole cards + a 5-card board).
3. A ~**30-second theatrical reveal** plays out, scoring at each street:
   **hole cards → score → flop → score → turn → score → river → score.**
4. Total **EP** and a **rarity tier** are computed; badges are awarded and added to the player's
   collection; the result is posted to the **global** leaderboards.
5. Player copies a shareable result and returns tomorrow.

### The daily deal — personal, server-authoritative
- Each player gets a **unique random deal**: their own 2 hole cards + their own 5-card board,
  dealt from a freshly shuffled deck (server-side).
- **Server-authoritative & immutable:** the deck is committed and stored at deal time, one per
  (user, day); the client only animates the pre-committed reveal — no rerolls, no cheating.
- **Ranked globally by absolute EP** ("who got the luckiest deal today"). Works from a single
  player, scales infinitely.

### Deferred to v2 — shared "tables"
Grouping players who share a community board into 9-handed "tables" (ranked within-table as well
as globally) is a strong social layer but adds seating/deck-commit/matchmaking complexity. Kept
out of v1 by decision; the absolute-EP scoring below is designed so tables can be layered on later
without reworking the core.

### Scoring — EP = surprisal (entropy), per street
- At each reveal (preflop / flop / turn / river) compute the player's current **best-hand category**.
- Whenever the category **improves**, add EP = the **surprisal** of first reaching that category at
  that street: `EP += -log2( P(reach category C for the first time at street S) )`.
- Because completing a big hand early is far less probable, **flopped royal ≫ rivered royal** falls
  out automatically — no hand-tuning. Preflop uses a 2-card starting-hand rarity table.
- Plus **bonus EP** from special/meme badges. Probabilities/EP tables are **precomputed offline**
  (combinatorics or Monte Carlo) and shipped as static data.

### Rarity tiers (poker-flavored, bottom → top)
`The Fish → Calling Station → Grinder → Shark → High Roller → The Nuts` (names/thresholds tunable).

### Badges
- **Hand-rank badges:** Pair, Two Pair, Trips, Straight, Flush, Full House, Quads, Straight Flush,
  Royal Flush (Mythic). "Flopped it" variants score higher via the per-street surprisal.
- **Meme / poker-culture badges** (hole-card aware): Pocket Rockets (AA), Cowboys (KK), Ladies (QQ),
  Big Slick (AK), suited connectors, The Hammer (7-2o), Dead Man's Hand (aces & eights),
  Broadway (A-K-Q-J-T), The Wheel (A-2-3-4-5).
- **Board-texture badges:** Monotone board, Rainbow flop, Paired board.
- Badges accumulate into a persistent **collection** on the profile.

### Auth
- **Anonymous play by default:** no login required to take the daily deal and watch the reveal.
  Login is only prompted afterward, if the player wants to save their result / claim a streak /
  appear on the leaderboard. (rngdle itself requires login upfront; deliberately deviating here to
  cut first-play friction.)
- Passwordless magic-link email login (when the player opts in); player picks a **nickname** shown
  on leaderboards.
- **Nickname moderation:** check against a maintained profanity/slur blocklist at nickname-set time
  (client + server), reject and prompt for another. Not trying to catch leetspeak/evasion — a
  blocklist catching the obvious cases is enough for a low-stakes leaderboard. Backstop with a
  simple "report nickname" action on the leaderboard (even just a mailto: or a flag into a review
  queue); build this only if it becomes a real problem post-launch. (Could not confirm how rngdle
  itself handles this — site blocks fetches, no public FAQ/terms found — so this is an independent
  design decision, not a port of theirs.)
- Multi-accounting (one player, many emails, many leaderboard shots) is a known gap, accepted as
  not worth solving for v1 — no stakes involved, just a leaderboard flex.

### Sharing
- Copyable Wordle-style result, e.g.
  `Freeroll #123 — 🂱🂾 | flopped Full House | 🦈 Shark | 8,420 EP` + a freeroll.org link.

### Anti-cheat
- All randomness, deck commitment, and hand evaluation happen **server-side**; the deal is
  immutable once created; **one deal per (user, day)** enforced by a unique constraint. The client
  only animates the pre-committed reveal.

### Data model (rough)
- `users(id, email, nickname, created_at)`
- `auth_tokens(token, user_id, expires_at, used_at)` (or a hosted auth provider)
- `deals(id, user_id, date, hole_cards[2], board[5], per_street_ep jsonb, total_ep, hand_rank,
  tier, badges[], created_at)` with `unique(user_id, date)`
- Leaderboards (daily / weekly / all-time) and collection are queries over `deals`.

---

## Tech stack — DECIDED

- **Database: Turso (libSQL) + Kysely.** Turso chosen as "D1 without vendor lock-in" — libSQL is an
  open-source, Apache-licensed SQLite fork that is **self-hostable** and reachable over a portable
  HTTP protocol from any runtime, so neither the database nor the web framework is tied to one
  vendor. Fits the workload perfectly: tiny write volume (one deal/user/day), simple relational
  schema, read-heavy leaderboards, near-free cost. Worst-case exit is a portable SQLite dump.
  **Kysely** over an ORM (deliberate, given prior Knex experience and no love for ORM magic): a
  pure typed SQL query builder, not an ORM — no Active Record, no relation-loading magic, queries
  map ~1:1 to SQL. Same imperative feel as Knex, but fully type-checked at compile time (column
  refs, join shapes) instead of Knex's partial/bolted-on typing. Migrations are hand-written plain
  files (no schema-as-code auto-diffing to trust). libSQL/Turso dialect (`@libsql/kysely-libsql`)
  is maintained by the libSQL/Turso org itself.
- **Web framework / hosting: SvelteKit + Cloudflare Workers** (`adapter-cloudflare`). Chosen over
  the earlier Next.js/Vercel suggestion because the user actually prefers Cloudflare (that earlier
  pick was this doc's own assumption, never actually chosen). SvelteKit-on-Workers is the mature,
  well-trodden pairing with Turso specifically (Turso's own docs use this combo), versus Next.js on
  Workers via OpenNext, whose adapter API only stabilized in March 2026 — boring/proven beats
  newer for a v1. Also matches precedent already in this repo (the cancelled aggregator pivot had
  locked Astro + Cloudflare Pages). Deploy to freeroll.org.
- **Auth:** passwordless magic-link email against Turso — provider TBD, discussing separately.
- **Poker evaluation:** server-side, via a compact custom 7-card evaluator or `pokersolver`.
- **EP/probability tables:** precomputed offline (combinatorics or Monte Carlo), shipped as static data.

## Build approach — vertical slice first
Scaffold app + Turso/Kysely schema, build the hand evaluator, one daily deal, the ~30s per-street
reveal, and EP scoring end-to-end for a logged-in player. Then layer on badges, tiers, leaderboards,
sharing, and deploy config.

**Progress:** SvelteKit app scaffolded, magic-link auth (request → Resend email → verify → session
→ logout) and the initial `users`/`magic_link_tokens`/`sessions`/`login_attempts` schema are built
and tested locally — not deployed yet. Hand evaluator, daily deal, and scoring are still ahead.

## Assumptions (stated, not blocking)
- **One deal per player per day**, with a fixed daily reset time (default 00:00 UTC).
- No betting/fold decisions in v1 (pure luck reveal, faithful to rngdle). Optional "play or muck"
  skill layer and staged-across-the-day reveal are v2 ideas.

## Verification (once built)
- **Testing framework: Vitest + `@abendigo/vitest-living-docs`** (own library, `/workspace/dev/vitest-bdd`).
  Unit and integration tests are written as `given / when / then` scenarios rather than bare
  `it()` blocks; `npm run test:report` turns the results into a browsable living-docs HTML page, so
  the behavior spec above and the actual test suite can be checked against each other directly.
  Optional ESLint plugin (`@abendigo/vitest-living-docs/eslint`) enforces named setup/assertion
  factories so scenario labels stay meaningful. Real-world usage pattern to follow:
  `/workspace/dev/myfriendsboat/myfriendsboat` (same author, same SvelteKit + Kysely stack).
- **Test database:** in-memory SQLite per test, not the real Turso network — matches
  `myfriendsboat`'s `createTestDb()` pattern: `better-sqlite3` (`:memory:`) + Kysely's
  `SqliteDialect`, replaying the same hand-written `.sql` migration files production uses (works
  because libSQL is SQLite-wire-compatible, same schema/types either side). Fixtures compose as
  `given` setup factories threaded through a `fixture` object (`withDb`, `withUser`, `withDeal`,
  ...), mirroring `myfriendsboat/src/test/helpers/fixtures.ts`.
- Unit-test the evaluator against known 7-card category frequencies (deal N hands, confirm the
  distribution matches within tolerance) and the per-street surprisal tables.
- Unit-test badge detection with forced hands (AA hole, forced royal, 7-2o, etc.).
- Integration, as a `given/when/then` scenario: *given* a deal already committed for (user, date),
  *when* a second daily deal is attempted for the same pair, *then* it's rejected by the unique
  constraint. Also: a deal never contains duplicate cards.
- **E2E: Playwright** (`npm run test:e2e`, matching `myfriendsboat`'s convention) against a local
  dev server: magic-link login → deal → watch the ~30s per-street reveal → confirm the global
  leaderboard entry and the shareable string.

