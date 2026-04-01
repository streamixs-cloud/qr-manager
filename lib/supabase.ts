import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Lazily initialise the client so module evaluation during `next build`
// doesn't throw when env vars are absent.
let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _client;
}

export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop: string | symbol) {
    const client = getClient();
    const val = (client as unknown as Record<string | symbol, unknown>)[prop];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    return typeof val === "function" ? (val as Function).bind(client) : val;
  },
});

export interface Link {
  id: string;
  slug: string;
  destination: string;
  label: string | null;
  created_at: string;
  scan_count: number;
}
