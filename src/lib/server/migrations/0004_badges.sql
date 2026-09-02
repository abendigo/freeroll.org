-- Persistent badge collection — see src/lib/server/game/badges.ts for the catalog and award
-- logic. Deliberately separate from `deals`: a deal row only tells you what happened *today*,
-- this is what a user has *ever* earned, across every day they've played. badge_id is a plain
-- TEXT foreign key into the in-code catalog (not a badges table) since the catalog is static and
-- versioned with the app, not data — same reasoning as hand_rank on `deals` being a plain string
-- rather than a lookup table.
CREATE TABLE IF NOT EXISTS user_badges (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id           INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id          TEXT NOT NULL,
  first_earned_date TEXT NOT NULL, -- YYYY-MM-DD `deals.date` this badge was first earned on
  created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Backstop against double-earning the same badge, mirroring deals_user_date's role for deals:
-- the award code already checks before inserting, this is the actual enforcement.
CREATE UNIQUE INDEX IF NOT EXISTS user_badges_user_badge ON user_badges (user_id, badge_id);
