// src/supabase.ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "cloudflare:workers";

/**
 * Lightweight env reader that works in both:
 * - Cloudflare Workers (via `cloudflare:workers` bindings)
 * - Local dev (via process.env)
 */
function readEnv(name: string): string | undefined {
  // `env` is provided by Modules Workers. Cast to indexable.
  const fromWorker =
    (env as unknown as Record<string, string | undefined>)[name];
  return fromWorker ?? (typeof process !== "undefined" ? process.env?.[name] : undefined);
}

/** Parse a comma-separated whitelist into a normalized array */
function parseWhitelist(raw: string | undefined): string[] {
  return (raw ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Keep a single Supabase client per isolate */
let client: SupabaseClient | null = null;

/** Default timeout for outbound fetches to Supabase (ms) */
let FETCH_TIMEOUT_MS = 10_000;

/**
 * Wrap global fetch with a timeout so a slow query doesn’t hang the Worker.
 * You can tune timeout via `setSupabaseFetchTimeout(ms)`.
 */
async function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort("supabase fetch timeout"), FETCH_TIMEOUT_MS);
  try {
    return await fetch(input as any, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

/** Cached whitelist (evaluated at module init) */
const TABLE_WHITELIST = parseWhitelist(readEnv("SUPABASE_TABLE_WHITELIST"));

/**
 * Public helpers
 */
export function isTableAllowed(table: string): boolean {
  if (TABLE_WHITELIST.length === 0) return true; // empty means "allow all"
  return TABLE_WHITELIST.includes(table);
}

export function getSupabase(): SupabaseClient {
  if (client) return client;

  const url = readEnv("SUPABASE_URL");
  const anonKey = readEnv("SUPABASE_ANON_KEY");

  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured. Missing SUPABASE_URL or SUPABASE_ANON_KEY."
    );
  }

  // Important: use Worker global fetch (with our timeout wrapper)
  client = createClient(url, anonKey, {
    global: { fetch: fetchWithTimeout as unknown as typeof fetch },
    auth: {
      // We’re in a stateless Worker — don’t persist/refresh sessions.
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return client;
}

/**
 * Optional: let callers tune the timeout (e.g., for long-running analytics)
 */
export function setSupabaseFetchTimeout(ms: number) {
  if (Number.isFinite(ms) && ms > 0) {
    FETCH_TIMEOUT_MS = Math.floor(ms);
  }
}

/**
 * (Optional) Expose the current whitelist for diagnostics or to power a
 * “describe schema” tool.
 */
export function getWhitelistedTables(): readonly string[] {
  return TABLE_WHITELIST;
}
