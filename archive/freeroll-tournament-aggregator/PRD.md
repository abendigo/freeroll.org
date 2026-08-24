# Freeroll.org — Product Requirements Document

**Version:** 1.0
**Date:** 2026-04-02
**Status:** Draft

---

## Overview

Freeroll.org is a poker freeroll tournament aggregator targeting casual players who want to build a bankroll without spending money. The V1 product is a minimal, mobile-first, SEO-first site that aggregates publicly available freeroll data and provides enough editorial content to establish topical authority in search.

---

## Problem

Casual poker players who want to play for free have no good place to find tournaments. Existing aggregators are SEO content farms with poor UX, no mobile optimization, stale data, and no community layer. The domain freeroll.org has strong inherent SEO value as an exact-match keyword domain with 15+ years of history.

---

## Goals

- Validate SEO potential of the domain within 1 week of launch
- Establish organic search impressions on freeroll-related queries via Google Search Console
- Build a foundation that can be extended with community features post-validation

---

## Non-Goals (V1)

- User accounts
- User-submitted freerolls
- Comments or voting
- Affiliate links (add once traffic is validated)
- Freeroll passwords (cannot be automated; don't fake it)
- Non-PokerStars rooms (expand after V1)

---

## Target User

**Casual poker player** — someone discovering freerolls for the first time, or a recreational player who wants to find free tournaments without navigating a poker client. Not a serious grinder.

---

## Branding

| Element | Decision |
|---|---|
| Domain | freeroll.org |
| Tagline | "Play free. Win real." |
| Logo | Clean wordmark + spark icon (radiating lines + circle) |
| Palette | Dark charcoal (`#0f1923`) + fresh green (`#22c55e`) accent |
| Modes | Light and dark, user-toggled |
| Tone | Honest, straightforward, casual-friendly. No poker clichés. |
| Explainer | "A freeroll is a poker tournament that's free to enter but has real prizes." — shown prominently for new visitors |

### Color System

| Token | Light | Dark |
|---|---|---|
| Background | `#f9fafb` | `#0f1923` |
| Surface (cards) | `#ffffff` | `#162230` |
| Border | `#e5e7eb` | `#1e2d3d` |
| Accent | `#16a34a` | `#22c55e` |
| Open badge | Blue (`#1d4ed8` / `#93c5fd`) | |
| Password badge | Amber | |
| Starting soon | Red | |
| Starting later | Green (accent) | |
| Room badge | Room's own brand color (e.g. PokerStars: `#e20613`) | |

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Astro (static output, zero JS by default, best SEO) |
| Styling | Tailwind CSS (mobile-first) |
| Data | SQLite (file-based, no server needed) |
| Scraper | GitHub Actions cron job |
| Hosting | Cloudflare Pages (free tier, zero lock-in) |
| Analytics | Umami (self-hosted, existing instance) |
| Blog | MDX files in repo |

### Data Flow

1. GitHub Actions runs scraper on a cron schedule (every 6 hours)
2. Scraper polls PokerStars XML feed, writes to `data/freerolls.db`
3. Commits updated SQLite file back to repo
4. Cloudflare Pages detects commit, triggers rebuild
5. Astro reads SQLite at build time → pure static HTML
6. Zero servers, zero runtime, zero ops

---

## Data Sources (V1)

| Source | Data Available | Method |
|---|---|---|
| PokerStars XML feed | Tournament name, start time, buy-in, player count | Poll public endpoint |
| PokerStars promo pages | Open freeroll schedules | Scrape public HTML |

Only open freerolls (no password required) are shown in V1. Password-protected freerolls are deferred until community features are built.

---

## Pages & Routes

| Route | Description |
|---|---|
| `/` | Homepage — hero, filter pills, freeroll listing, blog strip |
| `/tournaments` | Full freeroll listing with filters |
| `/tournaments/[slug]` | Individual freeroll detail page |
| `/blog` | Blog index |
| `/blog/[slug]` | Individual blog post |

---

## Homepage

### Hero
- Tagline: "Play free. Win real."
- Subtext: "Free poker tournaments updated daily. No sign-up required to browse."
- Explainer pill: "A freeroll is a poker tournament that's free to enter but has real prizes."

### Filter Pills
- All / Starting Soon / PokerStars / No Password
- Client-side JS filtering (no server round-trip)

### Freeroll Cards
Each card shows:
- Room badge (room brand color)
- Prize pool (prominent)
- Date/time (UTC)
- Registered player count
- Time until start ("Starts in 42 min" / "Starts in 2h 12m")
- Status badge: Open (blue) or Password Required (amber)

### Blog Strip
- 3 blog post links at the bottom
- "New to freerolls?" heading

---

## Freeroll Detail Page

- Full tournament info
- Room name + link to room's site
- Date, time, prize pool, player count
- Open / password status
- "How to enter" instructions (generic per room)
- Social share buttons (Twitter/X, Facebook, WhatsApp)

---

## Blog Posts (V1)

Five posts targeting high-value long-tail keywords:

1. "What is a poker freeroll?" — foundational explainer, targets new players
2. "Best freerolls for beginners" — curated picks, links to listings
3. "PokerStars freeroll schedule [year]" — evergreen, updated annually
4. "How to find poker freeroll passwords" — addresses the #1 user question
5. "Freeroll vs real money poker — what's the difference" — top-of-funnel, broad audience

---

## Social Sharing

- Share buttons on every freeroll listing and blog post
- Platforms: Twitter/X, Facebook, WhatsApp
- No third-party JS widgets — plain links using share URL schemes
- Share text: "[Tournament name] — free poker tournament with $[X] prize pool. freeroll.org"

---

## Analytics

- Umami tracking script in `<head>` on all pages
- Goals to track:
  - Pageviews by route
  - Filter pill clicks
  - Social share clicks
  - Blog post reads

---

## SEO Requirements

- Every freeroll listing is a unique indexable page with a descriptive slug
- Page titles follow pattern: "[Tournament Name] — Free Poker Tournament | Freeroll.org"
- Meta descriptions generated from tournament data
- Sitemap auto-generated by Astro
- `robots.txt` allowing full crawl
- Core Web Vitals: target LCP < 2.5s, CLS = 0 (static HTML, no layout shift)
- Structured data (JSON-LD) on tournament pages: `Event` schema

---

## Success Metrics (1-week validation)

| Metric | Target |
|---|---|
| Google Search Console impressions | > 0 on freeroll-related queries |
| Pages indexed | All tournament + blog pages |
| Core Web Vitals | Pass on mobile |
| Umami pageviews | Baseline established |

If Search Console shows impressions within 1 week, proceed to V2 (community features, affiliate links, more rooms).

---

## V2 Preview (post-validation)

- User accounts
- User-submitted freerolls and passwords
- Voting ("still works" / "expired")
- Comments (scoped to freeroll, no links allowed)
- Affiliate links (CPA/RevShare per room)
- Additional rooms: GGPoker, 888poker, ACR, partypoker
- Push notifications / calendar sync
- Community trust and moderation system
