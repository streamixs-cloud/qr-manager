CREATE TABLE links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  destination TEXT NOT NULL,
  label TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  scan_count INTEGER DEFAULT 0
);
