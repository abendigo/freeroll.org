-- The daily deal: server-committed once per (identity, day), never rerolled. owner is either
-- a signed-in user or an anonymous cookie id, never both — anonymous play is the default (see
-- DLE.md), a deal only gets attached to a user_id if they're already signed in at deal time.
CREATE TABLE IF NOT EXISTS deals (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       INTEGER REFERENCES users(id) ON DELETE CASCADE,
  anon_id       TEXT,
  date          TEXT NOT NULL, -- YYYY-MM-DD, UTC daily reset
  hole_cards    TEXT NOT NULL, -- JSON array of 2 card codes, e.g. ["As","Kd"]
  board         TEXT NOT NULL, -- JSON array of 5 card codes: flop x3, turn, river, in order
  per_street_ep TEXT NOT NULL, -- JSON: { preflop, flop, turn, river } -> { category, ep }
  total_ep      REAL NOT NULL,
  hand_rank     TEXT NOT NULL, -- final best 5-card category, e.g. "Full House"
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK ((user_id IS NULL) <> (anon_id IS NULL))
);

-- Partial unique indexes (SQLite supports WHERE on indexes): a plain UNIQUE(user_id, date)
-- wouldn't work here since NULLs never collide with each other, which is exactly wrong for the
-- anon_id column (every anonymous player's user_id is NULL). One deal per identity per day,
-- enforced at the database, is the anti-cheat backstop DLE.md calls for.
CREATE UNIQUE INDEX IF NOT EXISTS deals_user_date ON deals (user_id, date) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS deals_anon_date ON deals (anon_id, date) WHERE anon_id IS NOT NULL;
