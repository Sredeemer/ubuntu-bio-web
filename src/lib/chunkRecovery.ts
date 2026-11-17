/**
 * Recovery helpers for the "Application error: a client-side exception has occurred" page.
 *
 * After a deployment, a tab that is still running the previous build can request JS chunks or
 * RSC payloads that no longer exist. That surfaces as a ChunkLoadError and shows Next.js'
 * generic crash page until the user refreshes. Reloading once fetches the current build.
 */

const RELOAD_STAMP_KEY = "ubio_chunk_reload_at";
const RELOAD_COOLDOWN_MS = 30_000;

const CHUNK_ERROR_PATTERN =
  /ChunkLoadError|Loading chunk [\w-]+ failed|Loading CSS chunk|Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i;

export function isChunkLoadError(error: unknown): boolean {
  if (!error) return false;
  const e = error as { name?: unknown; message?: unknown };
  return CHUNK_ERROR_PATTERN.test(`${String(e.name ?? "")} ${String(e.message ?? error)}`);
}

/**
 * Reload the page once per cooldown window for a chunk-load failure.
 * Returns true if a reload was triggered. The cooldown prevents an infinite reload loop
 * when the failure is not caused by a stale build.
 */
export function reloadOnceForChunkError(error: unknown): boolean {
  if (typeof window === "undefined" || !isChunkLoadError(error)) return false;
  try {
    const last = Number(window.sessionStorage.getItem(RELOAD_STAMP_KEY) ?? 0);
    if (Date.now() - last < RELOAD_COOLDOWN_MS) return false;
    window.sessionStorage.setItem(RELOAD_STAMP_KEY, String(Date.now()));
  } catch {
    // Storage blocked: still safe to try one reload, but we cannot guard against a loop.
    return false;
  }
  window.location.reload();
  return true;
}
