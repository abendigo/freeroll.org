-- Bot accounts for simulated daily-deal traffic, so the leaderboard/homepage don't read as
-- empty during quiet stretches — see src/lib/server/bots/. Purely additive: no existing query
-- selects is_bot, so real users' rows and every existing code path are unaffected either way.
ALTER TABLE users ADD COLUMN is_bot INTEGER NOT NULL DEFAULT 0;

-- Partial index: only bot rows are ever looked up by this column (tick.ts's "pick an eligible
-- bot" query), so indexing just is_bot = 1 keeps it small instead of indexing every real user.
CREATE INDEX IF NOT EXISTS users_is_bot ON users (is_bot) WHERE is_bot = 1;
