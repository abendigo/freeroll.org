# Freeroll.org — Market Research

## Concept
A poker freeroll tournament aggregator — listing free-to-enter poker tournaments (with passwords) across major online poker rooms, monetized via affiliate marketing.

---

## Competitive Landscape

**Moderately competitive, but the UX is stuck in 2015.** No dominant, well-designed, mobile-first aggregator exists.

### Tier 1 — Large Poker Media (freerolls as a feature, not core product)
| Site | Notes |
|---|---|
| PokerNews.com | Global rank ~36,600; has exclusive branded freerolls negotiated directly with 888poker, PartyPoker, PokerStars |
| PokerListings.com | Dedicated `/free-rolls` page, schedules and passwords across major rooms |
| CardPlayer.com | Freeroll guide section, ~684K monthly visits |
| Casino.org | US-focused freeroll page with live password updates |

### Tier 2 — Dedicated Password Aggregators (thin SEO content farms)
| Site | Coverage |
|---|---|
| FreerollPasswords.com | 20+ rooms (888poker, PokerStars, WPT Global, partypoker, Unibet, etc.) |
| FreerollPass.com | 5–6 major rooms; per-room pages |
| Freeroll-password.com | Similar coverage |
| FreerollPasswordsUSA.com | US market, strong on ACR/Americas Cardroom |
| Cardmates.co.uk | UK-focused; exclusive tournaments in partnership with rooms |

### Tier 3 — Super-Affiliates (they *own* exclusive freerolls)
| Site | Notes |
|---|---|
| VIP-Grinders.com | Claims $11K+/mo in private freerolls; 22+ exclusive across GGPoker, 888poker, Natural8, partypoker; passwords via Telegram/Discord |
| YourPokerDream.com | Exclusive VIP deals; e.g. $2,000 GGPoker Welcome Freeroll for signups |
| WorldPokerDeals.com | Exclusive WPD Freerolling campaign; passwords via Telegram/WhatsApp |
| GipsyTeam.com | Eastern European / CIS market, Russian language |
| ProfessionalRakeback.com | Freerolls listed alongside rakeback deals |

### Telegram Channels
A significant competing distribution channel. Channels post passwords 5–15 minutes before tournaments start, bypassing web aggregators entirely. (e.g. `@freerollpassword`, `@Poker_Freeroll_Passwords`)

---

## Data Strategy — Hybrid Scraping + Community

### Tier 1: Legal Automated Sources (scrape these)

| Source | What's available | Notes |
|---|---|---|
| PokerStars XML feed | Tournament schedule, buy-ins, player counts | Public-facing, no auth required; no passwords but open freerolls are listed |
| Poker room promo pages | Freeroll announcements, recurring schedules | Publicly accessible HTML; no ToS issue for reading public pages |
| Official poker room social accounts (Twitter/X, Facebook) | Password announcements, event promos | Public posts; can monitor via RSS or official APIs |
| Public Telegram channels | Passwords posted by rooms/affiliates | Telegram has a public API; channels with public join links are fair game |
| Reddit (r/poker, r/freeroll, etc.) | User-shared passwords and announcements | Public; Reddit API available (rate limited) |
| 2+2 forums | Password threads, freeroll announcements | Public HTML, scrapeable |

**What scraping gets you:** Open freeroll schedules (no password needed), recurring freeroll patterns, social media password announcements. This covers a meaningful slice of the market — many rooms run open freerolls daily.

**What scraping doesn't get you:** Private/exclusive freeroll passwords distributed only via affiliate channels. That's the community's job.

### Tier 2: Community Submissions (users provide the rest)
- Password-protected freerolls from affiliate channels
- Smaller/niche room freerolls not covered by automated sources
- Corrections and updates to scraped data (wrong time, cancelled, geo-restricted)

### Scraping Legal Considerations
- Reading publicly accessible web pages is generally legal (hiQ v. LinkedIn, 2022)
- Poker room ToS may prohibit scraping — this affects your ability to maintain affiliate relationships with that room, not legal liability
- PokerStars XML feed: undocumented but intentionally public-facing; low risk
- Social media: use official APIs where available (X API, Telegram MTProto API) to stay clean
- Don't scrape anything behind a login wall

---

## Business Model

**Affiliate marketing.** The freeroll seeker finds a free tournament, signs up to a poker room via your affiliate link to play it — that's the conversion event.

| Model | Rate |
|---|---|
| CPA (Cost Per Acquisition) | $50–$500+ per new depositing player; typical $100–$250 |
| Revenue Share | 20–60% of the room's net revenue from referred players, ongoing |
| Hybrid | CPA upfront + ongoing RevShare |

GGPoker (GGPartners), 888poker, partypoker, ACR all have affiliate programs.

---

## Gaps Worth Exploiting

| Gap | Notes |
|---|---|
| Real-time push notifications | Nobody does this well; players rely on fragmented Telegram channels |
| Calendar sync | No aggregator lets you add freerolls to Google/Apple Calendar with reminders |
| Community password verification | No site lets users confirm or report stale/expired passwords |
| Better filtering | Filter by geo-eligibility, timezone, prize pool, "starting within X hours" |
| Mobile-first UX | Everything that exists looks like 2012 |
| Public API | No aggregator exposes an API; no mobile app or browser extension ecosystem possible |
| Crypto/smaller networks | CoinPoker, Blockchain Poker, iPoker skins, Chico Network poorly covered |
| Non-English markets | LatAm, Asia-Pacific underserved by English-language aggregators |

---

## Key Challenges

- **Passwords can't be fully automated** — requires manual editorial work, community contributions, or direct affiliate relationships with rooms
- SEO is competitive for "freeroll password [room name]" terms — dominated by Tier 1 sites
- Telegram has partially eroded the web aggregator model — some players never visit a website

---

## Community Features (Product Direction)

The core insight: **passwords can't be fully automated, so make the community the data source.**

### User-Submitted Freerolls
- Any registered user can submit a freeroll (room, date/time, prize pool, password if applicable)
- Solves the password sourcing problem organically — the players who know about freerolls submit them
- Submissions go into a queue; community voting/flagging surfaces quality ones fast
- Incentivize submissions: reputation points, badges, leaderboard for top contributors

### Voting
- Upvote/downvote on freerolls — surfaces the best ones, buries low-quality or expired listings
- "Still works" / "Password expired" quick-vote buttons — replaces the need for manual editorial verification
- Sort by: Most Voted, Starting Soon, Highest Prize Pool, Newest
- Votes decay over time so stale freerolls naturally sink

### Comments
- Per-freeroll comment threads — players can report "password didn't work", "event was cancelled", "prize pool is actually X"
- Creates a real-time correction layer that no existing aggregator has
- Good comments get upvoted, bad/spam get buried
- Anchors users on-site longer (good for SEO dwell time)
- **Deprioritize for v1** — launch with submissions + voting only; add comments once there's a user base and the real moderation load is understood

### Moderation Strategy

**Minimize the attack surface**
- Comments scoped tightly to a specific freeroll listing — not a general forum; less surface area, more context for what's on-topic
- Flat comments only, no threaded replies — threads become cesspools, flat sections stay manageable
- Character limits — kills essay-length spam and arguments
- **No links in comments, ever** — affiliate spammers have no reason to show up if they can't drop links

**Make spam not worth it**
- New accounts cannot comment immediately — short time delay or karma threshold before commenting unlocks
- Rate limiting per account and per IP

**Community does the heavy lifting**
- Downvote-to-hide threshold — comments below -3 votes collapse automatically, no mod action needed
- Flag button triggers auto-hide after N flags; mods review the hidden queue, not the firehose
- Verified submitter badge — the person who submitted the freeroll has a visual marker on their comments; earns contextual trust

**Keep the focus narrow**
- Comments have one job: *"does this freeroll still work, and is there anything players should know?"*
- UI framing matters: prompt "Leave a note for other players" sets a different tone than an open comment box

### Trust & Moderation (Submissions)
- New user submissions are lower-trust; high-reputation users' submissions go live faster
- Flag system for spam, expired, or incorrect listings
- Mods can lock/remove listings; community flags auto-hide after threshold

### Why This Works
- Directly solves the #1 operational challenge (password sourcing) without needing affiliate relationships
- Creates a content moat — the community data can't be easily replicated by a solo operator
- Gives users a reason to return and engage beyond just grabbing a password
- Differentiates clearly from every existing aggregator, all of which are read-only

---

## V1 Strategy — SEO-First MVP

### Core Hypothesis
The domain `freeroll.org` has strong inherent SEO value — exact-match keyword, 15-year-old domain, clean history. Build the minimum viable site to test whether that translates to organic traffic before investing in community features.

### V1 Scope
- **Mobile-first, minimal UI** — fast load times matter for SEO; no bloat
- **Automated data only** — scrape PokerStars XML feed + public sources; no community features yet
- **5 blog posts** — target high-value long-tail keywords:
  - "what is a poker freeroll"
  - "best freerolls for beginners"
  - "PokerStars freeroll schedule [current year]"
  - "how to find poker freeroll passwords"
  - "freeroll vs real money poker — what's the difference"
- **Social sharing buttons** on every freeroll listing and blog post — low effort, potential for organic viral spread if a good freeroll gets shared
- **Analytics from day one** — Google Analytics + Search Console; watch for impressions even before clicks come in

### Success Metric
Run for one week. If Search Console shows impressions on freeroll-related queries, the domain has SEO pull and it's worth building further. If nothing, reassess.

### What V1 Deliberately Excludes
- User accounts
- Submissions
- Comments / voting
- Affiliate links (add these once there's traffic to monetize)
- Passwords (can't automate these; don't fake it)

### SEO Notes
- `freeroll.org` is the exact-match keyword domain — this is a significant head start
- Existing competitors are content farms with weak UX; a fast, clean, mobile-first site can outrank on UX signals (Core Web Vitals)
- Each freeroll listing is a indexable page — recurring freerolls generate evergreen content automatically
- Blog posts establish topical authority, which lifts the whole domain

---

## Branding

### Audience
Primary user: **casual players** — people discovering freerolls for the first time, not serious grinders.

### Tone
- Honest and straightforward — no overpromising
- Approachable, not poker-cliché
- Avoid: card suits, green felt, chips — casuals don't identify with that imagery yet
- Think more Duolingo than PokerStars

### Tagline
**"Play free. Win real."**

- Honest (you *can* win real, not *will*)
- No jargon
- Casual-friendly
- Has rhythm

Other considered options:
- "Free poker tournaments, in one place."
- "Bootstrap your bankroll."
- "Start with nothing. Win something."
- "No buy-in. Real winnings."
- "Free entry. Real money."
- "From zero. For real."

### Explain the term
"Freeroll" needs a one-liner on the page for newcomers: *"A freeroll is a poker tournament that's free to enter but has real prizes."*

### Colors
TBD — leaning clean/modern with one bold accent color. Avoiding poker green clichés.

### Logo
TBD — clean typography preferred over poker imagery.

### Regulatory note
Avoid "risk-free" language — can trip gambling advertising regulations in some jurisdictions.

---

## Tech Stack

| Layer | Pick | Notes |
|---|---|---|
| Framework | **Astro** | Static HTML output, zero JS by default, best-in-class SEO |
| Data | **SQLite** | Single file, no server, queryable at build time |
| Scraper | **GitHub Actions cron** | Free, runs on schedule, commits updated SQLite to repo, triggers rebuild |
| Hosting | **Cloudflare Pages** | Free tier, global CDN, zero lock-in, rebuilds on git push |
| Blog | **MDX files in repo** | Just markdown files, no CMS needed |
| Analytics | **Umami** (self-hosted) | Drop in the tracking script |
| Styling | **Tailwind CSS** | Mobile-first by default, fast to build with |

### Data Flow
1. GitHub Actions polls PokerStars XML feed every 6 hours
2. Scraper writes results to `data/freerolls.db` (SQLite)
3. Commits updated db back to repo
4. Cloudflare Pages detects the commit and rebuilds
5. Astro reads SQLite at build time → pure static HTML out
6. Zero servers, zero runtime, zero ops

---

## Summary

The space is real, the affiliate revenue potential is real, and the existing products are genuinely weak. The main moat for a new entrant would be: **community-driven submissions + voting + comments** to solve the password sourcing problem, combined with better UX and push notifications. The technical build is straightforward; the operational challenge is seeding the community early.
