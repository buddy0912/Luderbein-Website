CREATE TABLE IF NOT EXISTS pinboard_posts (
  id TEXT PRIMARY KEY,
  visibility TEXT NOT NULL CHECK (visibility IN ('public', 'internal')),
  status TEXT NOT NULL CHECK (status IN ('published', 'pending_public', 'internal')),
  nickname TEXT,
  email TEXT,
  message TEXT NOT NULL,
  reply_author TEXT,
  reply_message TEXT,
  created_at TEXT NOT NULL,
  published_at TEXT,
  notified_at TEXT,
  notification_error TEXT
);

CREATE INDEX IF NOT EXISTS idx_pinboard_posts_status_created_at
  ON pinboard_posts(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_pinboard_posts_visibility_created_at
  ON pinboard_posts(visibility, created_at DESC);
