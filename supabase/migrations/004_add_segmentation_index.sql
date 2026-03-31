CREATE INDEX IF NOT EXISTS idx_scan_events_link_id_scanned_at
  ON scan_events (link_id, scanned_at);
