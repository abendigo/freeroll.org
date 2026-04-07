# Freeroll.org — Idle Game Design Document

## Concept

An idle/incremental game with a poker theme. The player builds a poker career from nothing — starting at the free tables and grinding up through the stakes ladder to nosebleed high roller events.

The "freeroll" framing is core: you start with zero investment and build purely through skill and time. This mirrors the real poker concept of a career as one giant freeroll.

The real-world parallel is Chris Ferguson's documented $0→$10k challenge (built entirely from freerolls, 2006–2007), which is the narrative this game essentially simulates.

---

## Format: Active Idle

The game is an active-idle hybrid. Each cycle has a short burst of active play (the action window), followed by an idle phase where tournaments resolve and winnings accumulate. The player checks back, collects results, spends upgrades, and repeats.

This mirrors real poker: you sit down, play a session, earn, and come back later.

---

## Core Game Loop

### The Action Window

Each cycle follows this structure:

1. **Lobby phase** — a list of tournaments is displayed, each with a name, duration, and value
2. **Clock starts on first entry** — the timer is dormant until the player taps their first tournament
3. **60-second window** — player taps/swipes to enter as many tournaments as possible before time runs out (starting value; tune during playtesting)
4. **Tournaments resolve** — each runs for its own real-time duration (e.g. 1s, 5s) and returns a result
5. **Upgrade screen** — player spends winnings, then a new lobby cycle begins

### Lobby Interaction (mobile-first)

The lobby uses a **swipe-to-enter** mechanic — swipe right on a tournament card to register, swipe left to skip. Show 5–6 large cards at a time rather than a dense list. Natural, fast, readable on mobile.

This is the core active moment of the game. **Prototype this interaction before committing to the full game structure.**

### Constraints & Unlocks

- **Default:** one tournament at a time — next entry only available after current one finishes
- **Multi-tabling (upgrade):** run 2, then 3, etc. simultaneously — core throughput upgrade, dramatically increases window efficiency
- **Re-entry (upgrade):** if you bust a tournament while late reg is still open, immediately re-enter rather than losing the slot
- **Late reg** is shown per-tournament; it closes independently of the 60s window

### Design Notes

- Clock-starts-on-first-entry means new players can read the lobby without penalty; pre-scanning before starting the clock becomes a skill
- Tournament duration variance (1s vs 5s) creates a decision: chain many short low-value events, or commit to fewer longer high-value ones
- Multi-tabling is the single most impactful early upgrade

---

## Progression

### Tiers (8 total)

| # | Tier | Stakes | Notes |
|---|------|--------|-------|
| 1 | Play Chips | Worthless | Tutorial phase, no real value |
| 2 | Freeroll T$ | Tiny tournament dollars | First real earnings from free-entry events |
| 3 | Micro Stakes | $0.01/$0.02 cash | First real money |
| 4 | Low Stakes | $0.10/$0.25, small MTTs/SNGs | |
| 5 | Mid Stakes | $1/$2, $10–$50 buy-in tournaments | |
| 6 | High Stakes | $5/$10+, major online MTTs | |
| 7 | Live Poker | Card rooms, casinos | New venue layer |
| 8 | Nosebleed / High Roller | $10k+ buy-ins, private games, Macau | |

Each tier requires a bankroll threshold to unlock. Hitting a tier for the first time is a milestone moment.

### Currency Progression

**Play chips → T$ → pennies → dollars → live casino chips → WSOP bracelets (prestige)**

WSOP bracelets are the prestige currency — earned at the top, persist through resets, grant permanent multipliers.

### Game Type Unlocks

Each game type has a different earn rate and variance profile:

- **Cash game** — steady, low variance, always available
- **Sit & Go (SNG)** — unlocks at Tier 2, fixed buy-in, quick sessions
- **MTT (Multi-Table Tournament)** — unlocks at Tier 3, long sessions, high upside
- **Live cash** — unlocks at Tier 7, slower but higher earn rate
- **Staking** — unlocks at Tier 6–7; back other grinders for passive income with risk

### Venue Unlocks

- Online poker site (Tiers 1–6)
- Local card room (Tier 5+)
- Vegas casino (Tier 7)
- Macau (Tier 8)

Venues are primarily cosmetic/narrative progression but could carry small multipliers.

---

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

---

## Late-Game Progression: From Player to Operation

As the player advances, the core mechanic shifts from tapping individual tournaments to higher-level strategic decisions. The texture of the action window changes each tier.

### Progression Arc

| Phase | What you do | Action window feel |
|-------|-------------|-------------------|
| Early | Tap individual freerolls | Manual, reactive |
| Mid | Multi-tabling + re-entry, chaining events | Fast, optimised tapping |
| Late | Staking/backing other players | Allocate bankroll across risk profiles |
| Endgame | Running a stable/operation | Portfolio allocation, long cycles |

### Late-Game Mechanics (to be designed)

**Staking / Backing**
Stop playing yourself; back other grinders. Pick players by risk profile, take a % of winnings. Action window becomes: review available players, allocate bankroll across them.

**Tournament Series**
Enter a series (WSOP, WPT, EPT) instead of individual events. One decision covers dozens of events. Results trickle over multiple cycles rather than resolving instantly.

**Poker Stable / Team**
Recruit and manage a team of grinders, each with a speciality (MTT, cash, live). Set their schedules; they generate income passively. Action window becomes assigning tables/series to each player before the cycle runs.

**Bankroll Allocation Screen**
Late game collapses tapping into a capital allocation problem — slide X% to high-stakes cash, Y% to MTTs, Z% to staking. Longer cycles (minutes instead of seconds).

### Design Notes

- Mirrors real high-stakes poker career arcs: grinder → backed player → backer → team owner
- Decisions never disappear — they change shape
- Cycle length grows with tier: 60s early game, 5–10 minutes endgame
- The shift from "player" to "operation" is itself a milestone moment

---

## Prestige Mechanic: "Going Broke"

### Framing

Going broke is a badge of honour, not a failure state. Real poker culture supports this — every serious player has a broke story (Chris Ferguson, Stu Ungar, countless others).

Prestige screen copy: *"Every pro has a broke story. This is yours."* — followed by what the player earned before the next run begins.

### What Triggers a Reset

Not forced by random variance. Two natural triggers:

1. **Ceiling reached** — upgrades maxed, income plateaued, cycles feel routine. The game signals there's nothing left to optimise on this run.
2. **Taking a shot** — player voluntarily moves up stakes before their bankroll supports it. High bust risk, framed as going for glory. Success = break through to a new tier. Failure = go broke, prestige, start the next run stronger.

The prestige becomes the only remaining interesting decision at the end of a run, not a menu option clicked out of boredom.

### On Reset

- Bankroll resets to zero
- Start again from Tier 1 (freerolls)
- **Keep:** WSOP bracelets, permanent skill multipliers, unlocked venues

### WSOP Bracelets (prestige currency)

- Earned at the top of a run
- Persist through all resets
- Grant permanent multipliers that compound across runs
- Each run is meaningfully faster and stronger than the last

---

## Monetization

**Paid to unlock — no ads, no affiliate links, no pay-to-win.**

### Free / Demo Limits (consistent across all platforms)

1. **1 prestige cap** — after going broke once and earning the first bracelet, the game prompts to buy. Natural conversion moment: the player has completed a full loop, understands what they're buying, and is motivated because they just unlocked something.
2. **Tier cap at Tier 5** — free play locks out Tiers 6–8. Players who don't prestige still hit a wall; players who do prestige hit the prompt at the right moment.

Both limits catch the player at natural stopping points rather than interrupting mid-run.

### Model by Platform

| Platform | Model |
|----------|-------|
| Web | Free, capped (1 prestige + Tier 5) |
| Mobile (iOS/Android) | Free download, single IAP to unlock full game |
| Steam | Free demo listing (same caps) + separate paid full game |

One codebase. The cap logic is a single flag. Steam's free demo is a first-class native feature — links directly to the paid listing.

### Pricing (to be decided)
- Mobile IAP: typically $0.99–$4.99
- Steam: typically $4.99–$9.99

### Notes
- No consumables, no loot boxes, no subscriptions — single unlock purchase
- Clean App Store approval story: no real-money links, no gambling mechanics
- Free tier drives organic discovery on all platforms; all three reinforce each other

---

## Tech Stack

- **Vite** — build tool, zero config, fast, outputs static bundle
- **TypeScript** — all game logic
- **HTML/CSS** — rendering, no canvas
- **localStorage** — save state for web/demo version

### Platform Wrappers

| Platform | Wrapper |
|----------|---------|
| Web | None |
| iOS / Android (primary) | Capacitor |
| Steam | Electron + Greenworks |

**Mobile is the primary target.** The mechanic fits naturally — 60s burst of activity, then idle. That's a mobile session. Idle games skew mobile; that's where the audience is. Mobile-first design constraints (big tap targets, simple gestures) improve the desktop version too.

**Greenworks** provides Steamworks bindings for Electron: achievements, leaderboards, Steam Cloud save sync (replaces localStorage for the Steam build).

No custom server, no database, no hosting costs ever.

---

## Competitive Landscape

### Existing Poker Idle Games

**Poker: The Idle Game** (browser, free)
- Core loop: deal cards → earn currency → buy multipliers → ascend cards
- Rating: 3.8/5 from 13 ratings — tiny audience
- **Gap: poker is purely cosmetic. No bankroll, no stakes, no career arc.**

**This Ain't Even Poker, Ya Joker** (Steam, $5.99, Dec 2025)
- Balatro-meets-Cookie-Clicker, fantasy framing, card-builder
- **Gap: card-builder fantasy, not a player-perspective grind-up story.**

**Idle Poker** (Steam — discontinued Oct 2024)
- Dead end.

### Casino/Gambling Idle Games

All existing examples (Casino Clicker, Idle Casino Empire, Idle Casino Manager) are **owner/manager perspective**. The angle of "you are the poker player grinding up from nothing" is absent across the entire category.

### Structural Analogs

- **AdVenture Capitalist** — career arc idle, lemonade stand → empire. Primary design reference.
- **Melvor Idle** — skill tree progression, excellent offline mechanics. Reference for upgrade structure.
- **Universal Paperclips** — hidden milestone reveals, game transforms mid-run. Reference for prestige design.
- **Balatro** (2024) — poker roguelike, 5M+ copies, swept GOTY. Proved poker has mass mainstream appeal.

### Verdict

**No direct competitor exists for this specific combination:**
- Poker player perspective (not owner/manager)
- Career arc from freerolls → nosebleeds
- Bankroll as the core idle resource
- Pre-qualified domain audience (actual poker players)

---

## Open Questions

- Does offline progress accrue while the app is closed? (Standard idle mechanic — probably yes, capped at e.g. 8 hours. Needs deciding.)
- What is the retention mechanic? (Daily bonus, push notifications, login streak — nothing designed yet.)
- What is the "one interaction" button, if any? Hero call? All-in shove?
- How much real poker knowledge should be required? (Probably none — should be approachable to non-players.)
- Tie-in with freeroll aggregator if that project ever resumes?
