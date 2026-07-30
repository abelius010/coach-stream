import { createClient } from "@supabase/supabase-js";

// These come from the .env file (VITE_ prefix is required so Vite exposes
// them to the browser). Never put the service_role key here — only the
// anon/public key, which is safe to ship to the client.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  // Don't throw at import time (would break the demo/marketing pages, which
  // don't need Supabase at all) — just warn so it's obvious in the console
  // when the "account" mode tries to talk to a misconfigured backend.
  console.warn(
    "[supabase] Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en el .env",
  );
}

export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "");
