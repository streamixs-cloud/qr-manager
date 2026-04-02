-- Purge scan_events older than the specified number of months.
-- Call from a scheduled job: SELECT purge_old_scan_events(12);
CREATE OR REPLACE FUNCTION purge_old_scan_events(retention_months integer DEFAULT 12)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM scan_events
  WHERE scanned_at < now() - (retention_months || ' months')::interval;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;
