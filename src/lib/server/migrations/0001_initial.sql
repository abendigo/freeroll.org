-- email_hash, not email: we never persist a plaintext address. Every sign-in re-derives
-- HMAC-SHA256(email, secret) from what the player just typed and looks up by that; the
-- plaintext only ever exists in memory for the one request that sends the sign-in email.
CREATE TABLE IF NOT EXISTS users (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  email_hash TEXT NOT NULL UNIQUE,
  nickname   TEXT UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Carries user_id, not email: the find-or-create-by-email_hash happens at request time (the
-- only moment the plaintext is available), so by the time a token exists we already know
-- which user it's for. Keeps this table free of anything PII-shaped.
CREATE TABLE IF NOT EXISTS magic_link_tokens (
  token      TEXT PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  used_at    TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS magic_link_tokens_user_id ON magic_link_tokens (user_id);

CREATE TABLE IF NOT EXISTS sessions (
  id         TEXT PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS sessions_user_id ON sessions (user_id);

-- Tracks both failed verification attempts and magic-link request bursts, keyed by either
-- the target email or the requesting IP, so either angle of abuse can be throttled.
-- key_hash, not key_value: same HMAC-SHA256(value, secret) as users.email_hash, applied to
-- whichever of email or IP this row is keyed on — no plaintext of either in this table either.
CREATE TABLE IF NOT EXISTS login_attempts (
  id           INTEGER PRIMARY KEY,
  key_type     TEXT NOT NULL CHECK (key_type IN ('email', 'ip')),
  key_hash     TEXT NOT NULL,
  attempted_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS login_attempts_lookup ON login_attempts (key_type, key_hash, attempted_at);
