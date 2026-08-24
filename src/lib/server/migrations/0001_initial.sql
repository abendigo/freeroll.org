CREATE TABLE IF NOT EXISTS users (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  email      TEXT NOT NULL UNIQUE,
  nickname   TEXT UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS magic_link_tokens (
  token      TEXT PRIMARY KEY,
  email      TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used_at    TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS magic_link_tokens_email ON magic_link_tokens (email);

CREATE TABLE IF NOT EXISTS sessions (
  id         TEXT PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS sessions_user_id ON sessions (user_id);

-- Tracks both failed verification attempts and magic-link request bursts, keyed by
-- either the target email or the requesting IP, so either angle of abuse can be throttled.
CREATE TABLE IF NOT EXISTS login_attempts (
  id           INTEGER PRIMARY KEY,
  key_type     TEXT NOT NULL CHECK (key_type IN ('email', 'ip')),
  key_value    TEXT NOT NULL,
  attempted_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS login_attempts_lookup ON login_attempts (key_type, key_value, attempted_at);
