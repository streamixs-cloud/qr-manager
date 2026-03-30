CREATE TABLE scan_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID REFERENCES links(id) ON DELETE CASCADE,
  scanned_at TIMESTAMPTZ DEFAULT now(),
  user_agent TEXT,
  referer TEXT
);
