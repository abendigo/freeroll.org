# Opening checklist

Working list for taking Freeroll from "coming soon" to actually open. Grouped, not ordered —
nothing here is started yet.

## Product — from today's conversation

- [x] **Require a nickname on signup.** `hooks.server.ts` now bounces any signed-in user with
      no nickname to `/account` on every route except `/account` itself and `/logout` — same
      form as before (`src/lib/server/auth/nickname.ts` already had the validation + profanity
      check), just no longer skippable.
- [ ] **More badges.** Only the 169 hole-card badges + 3 collector meta-badges are built
      (PR #26). DLE.md already speces two more categories that haven't been built yet:
      - Hand-rank badges (Pair, Two Pair, Trips, Straight, Flush, Full House, Quads, Straight
        Flush, Royal Flush), with "flopped it" variants scoring higher.
      - Board-texture badges (Monotone board, Rainbow flop, Paired board).
      - Also still-missing meme badges called out in DLE.md: Dead Man's Hand (aces & eights),
        suited connectors.
- [ ] **Clean up the dealing animation.** (`src/lib/client/reveal.svelte.ts`,
      `src/routes/dev/reveal`.) No specific issues written down yet — needs a pass to decide
      what "clean up" means (timing, sound sync, mobile perf?).
- [ ] **Remove the account page; fold it into the profile page.** `/account` currently does
      nickname set/update + sign out (`src/routes/account/`). Move that into `/u/[username]`
      (`src/routes/u/[username]/`), shown only when `locals.user` is viewing their own profile.
      Redirect `/account` → own profile (or drop it) once moved.
- [ ] **Clean up the about page.** `src/routes/about/+page.svelte` — the badge-grid section
      shows sample badges (Full House, Broadway, Monotone Board, Royal Flush, etc.) that aren't
      real badges yet, so it'll need reconciling once "more badges" above ships. Otherwise no
      specific complaint recorded — needs a pass.
- [ ] **More EPs (bonus surprisal categories).** Today EP only comes from best-hand-category
      improvement per street (`src/lib/server/game/ep-tables.ts`, `deal.ts`). Add board/street
      conditional bonuses, e.g.:
      - Suited flop
      - Ace on the river
      - Nuts on the flop / turn / river (the literal best possible hand given the board at that
        point)
      - (grab-bag, refine later) rainbow flop, backdoor draws that got there, etc.
- [ ] **Share to social media (Twitter/X, etc.).** The about page mocks up a Wordle-style
      "copy result" button (`src/routes/about/+page.svelte`) but nothing on the actual deal page
      is wired up yet — no copy-to-clipboard, no share intent links. Build the real thing:
      generate the spoiler-free result string (deal #, hole cards, hand reached, tier, EP),
      wire the copy button, and add direct share links/intents (X, at minimum) rather than
      relying on paste-after-copy only. Pairs with the favicon/OG-tags item below — a shared
      link should unfurl decently.

## Other things worth deciding before opening

- [ ] **Anonymous → account merge on first login.** Anon play is real and already implemented
      (`ANON_COOKIE_NAME` in `src/lib/server/game/identity.ts`, used by `/deal` and the homepage
      load when there's no session) — you can deal today with zero login. But
      `login/verify/[token]/+page.server.ts` just sets a session cookie; it doesn't fold the
      anon cookie's deal history/badges into the new account. Right now, signing up after
      playing anonymously silently orphans that history. Worth fixing before opening, since
      DLE.md's whole rationale for logging in later is "save your result / claim a streak."
- [ ] **Streaks don't actually exist yet.** DLE.md lists "claim a streak" as a reason to log in
      (Auth section) and a session-renewal comment references it
      (`src/lib/server/auth/sessions.ts:45`), but there's no streak field or logic anywhere in
      the schema or game code. Decide if streak tracking ships for opening or gets cut from the
      pitch.
- [ ] **No rate limiting anywhere.** Broader than just magic-link requests below — there's no
      throttling on `/deal` or any other endpoint at all (a repo-wide search for
      `rateLimit`/`throttle` turns up nothing). `/deal` is idempotent per identity+day so spam
      there is cheap to ignore, but unlimited magic-link sends and unlimited anon-cookie minting
      are both worth at least a basic per-IP limit before opening publicly.
- [ ] **No `robots.txt` / `sitemap.xml`.** Nothing under `static/` today. Minor, but easy to
      knock out alongside the favicon/OG-tag item.
- [ ] **No product analytics.** Separate from the error-tracking/uptime item below — some way to
      know how many people actually show up on opening day and what they do (dealt vs. bounced,
      signed up vs. stayed anonymous) is worth having in place before, not after, launch.
- [ ] **Cookie consent.** Both the anon identity cookie and the session cookie are set with no
      consent banner (`/privacy` exists but there's no cookie notice). Worth a legal gut-check
      depending on who's expected to show up (EU visitors especially).
- [ ] **Turn off the coming-soon gate.** It's live on production now (see
      `coming-soon-gate.md` memory) — flipping it off is the actual "open" moment, so it belongs
      on this list explicitly, last.
- [ ] **Bot-traffic cron is still broken.** PR #25's Cloudflare Cron Trigger registers but isn't
      firing (open item per `bot-traffic-simulation.md` memory) — needs the Cloudflare dashboard
      to diagnose. Opening with dead/no simulated traffic makes the leaderboard look emptier
      than intended.
- [ ] **No favicon, no Open Graph tags.** `src/app.html` has no favicon and no `og:title` /
      `og:image` / `og:description`. Worth having before people start sharing result strings
      (the about page's "share" feature implies people will paste a link).
- [ ] **No Terms of Service page.** Only `/privacy` exists today — decide if a ToS is needed
      before opening to the public.
- [ ] **Magic-link email deliverability.** Sent via Resend (`src/lib/server/email/send.ts`).
      Worth a check that the sending domain has SPF/DKIM set up so links don't land in spam —
      first impressions matter for a passwordless flow.
- [ ] **Rate limiting / abuse on magic-link requests.** Confirm there's a limit on how often one
      email/IP can request a sign-in link before opening publicly.
- [ ] **Mobile/cross-browser pass.** Hasn't been explicitly QA'd across devices; the deal
      animation and badge grid are the most layout-sensitive surfaces.
- [ ] **Error tracking / uptime monitoring.** Nothing mentioned so far — decide if it's needed
      before real traffic arrives, or if Cloudflare's own dashboards are enough for launch.
- [ ] **Database backup plan for Turso.** Worth confirming before real user data accumulates.
- [ ] **A way for users to report a problem.** No visible feedback/contact link in the app.
