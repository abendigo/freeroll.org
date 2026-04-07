# Freeroll.org — Idle Game Design Document

## Concept

An idle/incremental game with a poker theme. The player builds a poker career from nothing — starting at the free tables and grinding up through the stakes ladder to nosebleed high roller events.

The "freeroll" framing is core: you start with zero investment and build purely through skill and time. This mirrors the real poker concept of a career as one giant freeroll.

## Format: Idle (not clicker)

Clicking mechanics don't map naturally to poker — there's no satisfying "click the felt" equivalent. Poker is sessions: you sit down, play for hours, earn. The idle format mirrors this naturally.

- Sessions run automatically in compressed time
- Player checks back, collects winnings, buys upgrades
- Optional: a single cooldown-based interaction button (e.g. "Hero Call" or "Run It Twice") for a one-time spike — feels like a decision, not spam-clicking

## Progression Tiers (8 tiers)

| # | Tier | Stakes | Notes |
|---|------|--------|-------|
| 1 | Play Chips | Worthless | Tutorial phase, no real value |
| 2 | Freeroll T$ | Tiny tournament dollars | First real earnings from free-entry events |
| 3 | Micro Stakes | $0.01/$0.02 cash | First real money, fractions of a cent |
| 4 | Low Stakes | $0.10/$0.25, small MTTs/SNGs | |
| 5 | Mid Stakes | $1/$2, $10–$50 buy-in tournaments | |
| 6 | High Stakes | $5/$10+, major online MTTs | |
| 7 | Live Poker | Card rooms, casinos | New venue layer — not just bigger numbers |
| 8 | Nosebleed / High Roller | $10k+ buy-ins, private games, Macau | |

Each tier requires a bankroll threshold to unlock. Hitting a tier for the first time is a milestone moment.

## Currency Progression

Runs parallel to stakes tiers:

**Play chips → T$ → pennies → dollars → live casino chips → WSOP bracelets (prestige)**

WSOP bracelets are the prestige currency — earned at the top, persist through resets, grant permanent multipliers.

## Game Type Unlocks (across tiers)

Each game type has a different earn rate and variance profile:

- **Cash game** — steady, low variance, always available
- **Sit & Go (SNG)** — unlocks at Tier 2, fixed buy-in, quick sessions
- **MTT (Multi-Table Tournament)** — unlocks at Tier 3, long sessions, high upside
- **Live cash** — unlocks at Tier 7, slower but higher earn rate
- **Staking** — unlocks at Tier 6–7; you back other grinders for passive income with risk

## Venue Unlocks (across tiers)

- Online poker site (Tiers 1–6)
- Local card room (Tier 5+)
- Vegas casino (Tier 7)
- Macau (Tier 8)

Venues are primarily cosmetic/narrative progression, but could carry small multipliers.

## Upgrade Tree (illustrative, not exhaustive)

**Skills / multipliers**
- Pot odds calculation → earn rate +X%
- Position awareness → cash game multiplier
- ICM knowledge → tournament multiplier
- HUD software → unlock at Tier 3, auto-tracks stats
- Bankroll management → reduces bust risk

**Grinders (idle workers)**
- Hire grinders to earn while offline
- Each grinder has a stake level and game type
- Back a fish → loss mechanic / variance event

**Passive income**
- Staking a player → percentage of their winnings
- Coaching → generates T$ passively
- Writing a strategy blog → small ad revenue trickle

## Prestige Mechanic: "Going Broke"

### Framing

Going broke is a badge of honour, not a failure state. Real poker culture supports this — every serious player has a broke story (Chris Ferguson, Stu Ungar, countless others). The game leans into it explicitly.

Prestige screen copy: *"Every pro has a broke story. This is yours."* — followed by what the player earned before the next run begins.

### What triggers a reset

Not forced by random variance — that would feel arbitrary and punishing. Instead, two natural triggers:

1. **Ceiling reached** — upgrades maxed, income plateaued, cycles feel routine. The game signals there's nothing left to optimise on this run.
2. **Taking a shot** — player voluntarily moves up stakes before their bankroll supports it. High bust risk, explicitly framed as going for glory. Success = break through to a new tier. Failure = go broke, prestige, start the next run stronger.

The prestige becomes the only remaining interesting decision at the end of a run, not a menu option you click out of boredom.

### On reset

- Bankroll resets to zero
- Start again from Tier 1 (freerolls)
- **Keep:** WSOP bracelets, permanent skill multipliers, unlocked venues

### WSOP Bracelets (prestige currency)

- Earned at the top of a run
- Persist through all resets
- Grant permanent multipliers that compound across runs
- Each run is meaningfully faster and stronger than the last

### Design Notes

- The reframe is critical: prestige = graduation, not punishment
- "Taking a shot" gives players agency over when they go broke — it's a decision, not something that happens to them
- Compounding multipliers mean late-game players are running very fast early tiers — satisfying rather than tedious

## Monetization

**Paid app — no ads, no affiliate links, no pay-to-win.**

- Single upfront purchase on App Store, Play Store, and Steam
- No in-app purchases
- No real-money poker site links (avoids App Store gambling-adjacency issues)

### Pricing (to be decided)
- Mobile: typically $0.99–$4.99
- Steam: typically $4.99–$9.99 (audience expects higher price point)

### Free / Demo Limits (consistent across all platforms)

**Limits on free play (belt and braces):**
1. **1 prestige cap** — after going broke once and earning the first bracelet, the game prompts to buy. The natural conversion moment: the player has completed a full loop, understands what they're buying, and is motivated to continue because they just unlocked something.
2. **Tier cap at Tier 5** — free play locks out Tiers 6–8. Players who don't prestige still hit a wall; players who do prestige hit the prompt at the right moment.

Both limits catch the player at natural stopping points rather than interrupting mid-run, which would feel punishing.

### Model by Platform

| Platform | Model |
|----------|-------|
| Web | Free, capped (1 prestige + Tier 5) |
| Mobile (iOS/Android) | Free download, single IAP to unlock full game |
| Steam | Free demo listing (same caps) + separate paid full game |

One codebase. The cap logic is a single flag. Steam's free demo is a first-class native feature — links directly to the paid listing.

### Implications
- Free tier drives organic discovery on all platforms
- Freemium on mobile maximises downloads; IAP converts at the natural prestige moment
- No consumables, no loot boxes, no subscriptions — single unlock purchase, clean App Store story
- Approval story is straightforward — no real-money links, no gambling mechanics
- Web app drives discovery for Steam and mobile; all three reinforce each other

## Tech Stack

- **Vite** — build tool, zero config, fast, outputs static bundle
- **TypeScript** — all game logic
- **HTML/CSS** — rendering, no canvas
- **localStorage** — save state for web version
- No backend required at any stage

### Platform Strategy: Mobile First

Mobile is the primary target. The mechanic fits naturally — 60s burst of activity, then idle while tournaments run. That's a mobile session. Idle games skew mobile; that's where the audience is.

Mobile-first also forces better design: big tap targets, simple gestures, readable at a glance. Those constraints improve the desktop version too.

**Platform priority:**
| Priority | Platform | Wrapper |
|----------|----------|---------|
| 1 | iOS / Android | Capacitor |
| 2 | Browser / PWA | None (free bonus) |
| 3 | Steam | Electron + Greenworks |

### Lobby Interaction (mobile-first design)

The 60s click-frenzy mechanic needs a mobile-native gesture. Leading candidate: **swipe to enter** — swipe right on a tournament card to register, swipe left to skip. Natural, fast, satisfying. Show 5-6 large cards at a time rather than a dense list.

This is the core active moment of the game. Prototype this interaction early before committing to the full game structure.

### Steam Path

When ready for Steam, wrap the same codebase:

- **Electron** — desktop shell
- **Greenworks** — Node.js Steamworks bindings; provides achievements, leaderboards, Steam Cloud save sync (replaces localStorage)
- Steam handles everything a custom backend would: leaderboards, achievements, cloud saves

No custom server, no database, no hosting costs ever.

## Competitive Landscape

### Existing poker idle games

**Poker: The Idle Game** (browser, itch.io / Vercel, free)
- Built by solo dev (Atovange); inspired by Idle Dice
- Core loop: deal cards → earn currency → buy multipliers → ascend cards
- The 52 cards each have their own ascension track; poker hand rankings are progression milestones
- Has auto-deal passive income
- Rating: 3.8/5 from 13 ratings — tiny audience
- **Gap: poker is purely cosmetic. No bankroll, no stakes, no career arc.**

**This Ain't Even Poker, Ya Joker** (Steam, $5.99, Dec 2025)
- Balatro-meets-Cookie-Clicker: flip cards, merge, unlock jokers, build deck combos
- Fantasy/narrative framing (escaping a Jester's domain), not a career sim
- Active/idle hybrid, well-reviewed at launch
- **Gap: card-builder fantasy, not a player-perspective grind-up story.**

**Idle Poker** (Steam — discontinued Oct 2024)
- Automated poker hands, fever mode, High & Low challenge
- No longer available for sale
- **Dead end.**

### Casino/gambling idle games

All existing examples (**Casino Clicker**, **Idle Casino Empire**, **Idle Casino Manager**) are **owner/manager perspective** — you exploit players, not play yourself. The angle of "you are the poker player grinding up from nothing" is absent across the entire category.

### Closest structural analogs

- **AdVenture Capitalist** — lemonade stand → oil empire → moon → Mars. The template for career arc idle games. Primary design reference.
- **Melvor Idle** — RuneScape skill tree, starts at level 1 in all skills, excellent offline progress. Reference for skill upgrade structure.
- **Universal Paperclips** — masterclass in hidden milestone reveals (game transforms twice mid-run). Reference for prestige/reveal design.
- **Balatro** (2024) — poker roguelike, 5M+ copies sold, swept GOTY awards. Proved poker mechanics have mass mainstream appeal. Market is primed.

### Verdict

**The specific combination we're building has no direct competitor:**
- Poker player perspective (not owner/manager)
- Career arc from freerolls → nosebleeds
- Bankroll as the core idle resource
- Pre-qualified domain audience (actual poker players)

The closest game structurally is AdVenture Capitalist; the closest thematically is Poker: The Idle Game — but neither is what this is. The real-world parallel is Chris Ferguson's documented $0→$10k challenge (built entirely from freerolls, 2006–2007), which is the narrative this game essentially simulates.

---

## Core Game Loop

### The Action Window

Each cycle follows this structure:

1. **Lobby phase** — a list of tournaments is displayed, each with a name, duration, and value
2. **Clock starts on first entry** — the timer is dormant until the player clicks their first tournament
3. **60-second window** — player clicks to enter as many tournaments as possible before time runs out (starting value; tune during playtesting)
4. **Tournaments resolve** — each runs for its own real-time duration (e.g. 1s, 5s) and returns a result
5. **Upgrade screen** — player spends winnings, then a new lobby cycle begins

### Constraints & Unlocks

- **Default:** one tournament at a time — next entry only available after current one finishes
- **Multi-tabling (upgrade):** run 2, then 3, etc. simultaneously — core throughput upgrade
- **Re-entry (upgrade):** if you bust a tournament while late reg is still open, you can immediately re-enter it rather than losing the slot
- **Late reg** is shown per-tournament; it closes independently of the 60s window

### Design Notes

- 60s gives enough time to read the lobby and make deliberate picks; tune down if it feels slow
- Clock-starts-on-first-entry means new players can read without penalty; experienced players can pre-scan the lobby before committing, which becomes a skill
- Tournament duration variance (1s vs 5s) creates decisions: chain many short low-value events, or commit to fewer longer high-value ones
- Multi-tabling dramatically increases throughput within the window — the single most impactful early upgrade

---

## Late-Game Progression: From Player to Operation

As the player advances, the core mechanic shifts from clicking individual tournaments to higher-level strategic decisions. The texture of the action window changes each tier.

### Progression Arc

| Phase | What you do | Action window feel |
|-------|-------------|-------------------|
| Early | Click individual freerolls | Manual, reactive |
| Mid | Multi-tabling + re-entry, chaining events | Fast, optimised clicking |
| Late | Staking/backing other players | Allocate bankroll across risk profiles |
| Endgame | Running a stable/operation | Portfolio allocation, long cycles |

### Late-Game Mechanics (to be designed)

**Staking / Backing**
Stop playing yourself; back other grinders. Pick players by risk profile, take a % of winnings. Action window becomes: review available players, allocate bankroll across them.

**Tournament Series**
Instead of individual events, enter a series (WSOP, WPT, EPT). One decision covers dozens of events. Pick which series, allocate schedule across overlapping ones. Results trickle over multiple cycles rather than resolving instantly.

**Poker Stable / Team**
Recruit and manage a team of grinders, each with a speciality (MTT, cash, live). Set their schedules; they generate income passively. Action window becomes assigning tables/series to each player before the cycle runs.

**Bankroll Allocation Screen**
Late game collapses clicking into a capital allocation problem — like a portfolio. Slide X% to high-stakes cash, Y% to MTTs, Z% to staking. Longer cycles (minutes instead of seconds).

### Design Notes

- Mirrors real high-stakes poker career arcs: grinder → backed player → backer → team owner → poker school/brand
- Solves the scaling problem: decisions never disappear, they change shape
- Cycle length should grow with tier — early game is 60s, endgame could be 5–10 minutes
- The shift from "player" to "operation" is itself a prestige-like milestone moment

---

## Open Questions

- Does offline progress accrue while the tab is closed? (Standard idle mechanic — probably yes, capped at e.g. 8 hours)
- What is the "one interaction" button, if any? Hero call? All-in shove?
- How much real poker knowledge should be required to play? (Probably none — it should be approachable)
- Tie-in with freeroll aggregator if that project ever resumes?
