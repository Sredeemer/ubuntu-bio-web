/**
 * Canonical public origin of the site, without a trailing slash.
 * Set NEXT_PUBLIC_SITE_URL per deployment (e.g. the production domain); it falls back to the
 * same default the root layout's `metadataBase` uses.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://ubuntubio.org").replace(/\/+$/, "");

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
