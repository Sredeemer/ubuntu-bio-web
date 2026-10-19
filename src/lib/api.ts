/**
 * UbuntuBio Hub API Client
 * Connects the Next.js frontend to the FastAPI backend service.
 * Standardizes repository fetching, search queries, tree exploration, and dataset ingestion.
 */

import { DatasetItem, DatasetFile, DATASETS, getDataset as getLocalDataset } from "../data/datasets";
import { AU_COUNTRIES } from "../data/auCountries";

/**
 * UbuntuBio Hub API Base URL
 *
 * In the browser, we use relative paths (empty string) to route through Next.js rewrites proxy.
 * This guarantees:
 * 1. Zero Mixed Content security errors (browser always connects to https://...)
 * 2. Zero CORS errors
 *
 * On the server (SSR / Node / Vitest), we use the configured environment variable or live backend fallback.
 */
function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    // Browser context: always use relative paths to eliminate Mixed Content violations
    return "";
  }
  return (
    process.env.INTERNAL_API_URL ||
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://52.19.144.208"
  );
}

export const API_BASE_URL = getApiBaseUrl();

function getApiOrigin(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return (
    process.env.INTERNAL_API_URL ||
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://52.19.144.208"
  );
}

export interface RepoResponse {
  id: string;
  slug: string;
  name: string;
  owner_type: string;
  owner_id: string;
  description: string | null;
  domain: string;
  access: "public" | "gated" | "private";
  license: string;
  is_verified_african: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommitLogItem {
  commit_hash: string;
  author: string;
  date: string;
  message: string;
}

export interface TreeItem {
  mode: string;
  type: "blob" | "tree";
  oid: string;
  size: number | null;
  path: string;
}

export interface TreeResponse {
  ref: string;
  items: TreeItem[];
}

export interface SearchHit {
  id: string;
  slug: string;
  name: string;
  owner_slug?: string;
  owner_type?: string;
  owner_id?: string;
  description?: string;
  domain?: string;
  access?: string;
  countries?: string[];
  taxon_ids?: number[];
  genus?: string;
  family?: string;
  samples_count?: number;
  total_size_bytes?: number;
  is_verified_african?: boolean;
}

export interface SearchResponse {
  hits: SearchHit[];
  total: number;
  limit: number;
  offset: number;
  facet_distribution?: Record<string, Record<string, number>>;
}

export interface HealthResponse {
  status: string;
  version: string;
}

export interface CreateRepoPayload {
  owner_slug: string;
  name: string;
  owner_type?: "user" | "org";
  description?: string;
  domain: string;
  access?: "public" | "gated" | "private";
  license?: string;
}

/**
 * Maps a FastAPI RepoResponse or SearchHit into a rich frontend DatasetItem.
 */
export function repoToDatasetItem(repo: RepoResponse | SearchHit): DatasetItem {
  const slug = repo.slug || repo.id;
  const parts = slug.split("/");
  const namespace = parts[0] || "ubuntubio";
  const datasetId = parts[1] || repo.name || "dataset";

  // Check if we have richer curated metadata in the local registry
  const curated = getLocalDataset(namespace, datasetId);
  if (curated) {
    return {
      ...curated,
      name: repo.name || curated.name,
      description: repo.description || curated.description,
      accessGate: (repo.access as "public" | "gated") || curated.accessGate,
      license: ("license" in repo && repo.license) ? repo.license : curated.license,
    };
  }

  // Derive domain / pathogen classification
  const domain = ("domain" in repo ? repo.domain : "virus") || "virus";
  let pathogenType: "Virus" | "Bacteria" | "Vector" | "Fungus" = "Virus";
  const dLower = domain.toLowerCase();
  if (dLower.includes("bacteri") || dLower.includes("tb") || dLower.includes("cholera")) {
    pathogenType = "Bacteria";
  } else if (dLower.includes("vector") || dLower.includes("anopheles") || dLower.includes("mosquito")) {
    pathogenType = "Vector";
  } else if (dLower.includes("fung") || dLower.includes("myco")) {
    pathogenType = "Fungus";
  }

  // Determine country
  let countryCode = "NG";
  if ("countries" in repo && Array.isArray(repo.countries)) {
    const c0 = repo.countries[0];
    if (c0) {
      countryCode = c0.toUpperCase();
    }
  }
  const countryMatch = AU_COUNTRIES.find((c) => c.code === countryCode);
  const countryName = countryMatch?.name || "African Union Sovereign Node";

  let taxonId = 0;
  if ("taxon_ids" in repo && Array.isArray(repo.taxon_ids)) {
    const t0 = repo.taxon_ids[0];
    if (typeof t0 === "number") {
      taxonId = t0;
    }
  }

  const totalBytes = ("total_size_bytes" in repo && typeof repo.total_size_bytes === "number")
    ? repo.total_size_bytes
    : 104857600;

  return {
    id: slug,
    namespace,
    datasetId,
    name: repo.name || slug,
    countryCode,
    countryName,
    taxonId,
    taxonName: repo.name,
    pathogenType,
    samplesCount: ("samples_count" in repo && typeof repo.samples_count === "number") ? repo.samples_count : 1,
    totalSizeMb: Math.round(totalBytes / (1024 * 1024)),
    biocontainment: "BSL-3",
    accessGate: (repo.access === "gated" ? "gated" : "public"),
    description: repo.description || "African Union sovereign genomic dataset hosted on UbuntuBio Hub.",
    longDescription:
      repo.description ||
      "Sovereign genomic data collection conforming to African Union data governance and OpenXet content-addressable storage standards.",
    leadInstitution: namespace.toUpperCase(),
    updatedAt: (("updated_at" in repo && repo.updated_at) ? repo.updated_at.split("T")[0] : null) ??
      (new Date().toISOString().split("T")[0] ?? "2026-10-18"),
    license: ("license" in repo && repo.license) ? repo.license : "CC-BY-4.0",
    seqPlatforms: ["Oxford Nanopore", "Illumina NovaSeq"],
    citation: `${namespace}. (2026). ${repo.name}. UbuntuBio Data Hub.`,
    files: [],
  };
}

/**
 * Check if the FastAPI Hub backend is reachable.
 */
export async function checkBackendHealth(): Promise<HealthResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/healthz`, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as HealthResponse;
  } catch {
    return null;
  }
}

/**
 * List all dataset repositories from the live FastAPI hub.
 * Falls back to the curated dataset registry if the backend is unreachable.
 */
export async function fetchRepositories(domain?: string): Promise<DatasetItem[]> {
  try {
    const url = new URL(`${API_BASE_URL}/api/repos`, getApiOrigin());
    if (domain) {
      url.searchParams.set("domain", domain);
    }
    const res = await fetch(url.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
      next: { revalidate: 30 },
    });
    if (!res.ok) {
      return DATASETS;
    }
    const repos: RepoResponse[] = await res.json();
    if (!Array.isArray(repos) || repos.length === 0) {
      return DATASETS;
    }
    return repos.map(repoToDatasetItem);
  } catch {
    return DATASETS;
  }
}

/**
 * Fetch a single repository by owner and name.
 */
export async function fetchRepository(
  owner: string,
  name: string
): Promise<DatasetItem | null> {
  // First check local curated records
  const local = getLocalDataset(owner, name);

  try {
    const res = await fetch(`${API_BASE_URL}/api/repos/${owner}/${name}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      next: { revalidate: 30 },
    });
    if (!res.ok) {
      return local || null;
    }
    const repo: RepoResponse = await res.json();
    return repoToDatasetItem(repo);
  } catch {
    return local || null;
  }
}

/**
 * Query the search index across datasets with keyword and facet filters.
 */
export async function searchDatasets(
  query: string = "",
  filters?: {
    domain?: string | undefined;
    country?: string | undefined;
    taxonId?: number | undefined;
    access?: string | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
  }
): Promise<{ items: DatasetItem[]; total: number; isLive: boolean }> {
  try {
    const url = new URL(`${API_BASE_URL}/api/search/datasets`, getApiOrigin());
    if (query) url.searchParams.set("q", query);
    if (filters?.domain) url.searchParams.set("domain", filters.domain);
    if (filters?.country) url.searchParams.set("country", filters.country);
    if (filters?.taxonId) url.searchParams.set("taxon_id", filters.taxonId.toString());
    if (filters?.access) url.searchParams.set("access", filters.access);
    if (filters?.limit) url.searchParams.set("limit", filters.limit.toString());
    if (filters?.offset) url.searchParams.set("offset", filters.offset.toString());

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error("Search backend non-200");
    const data: SearchResponse = await res.json();
    const items = data.hits.map(repoToDatasetItem);
    return {
      items: items.length > 0 ? items : DATASETS,
      total: data.total || items.length,
      isLive: true,
    };
  } catch {
    // Graceful offline fallback to local dataset filtering
    let filtered = DATASETS;
    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          d.taxonName.toLowerCase().includes(q) ||
          d.countryName.toLowerCase().includes(q)
      );
    }
    if (filters?.country) {
      filtered = filtered.filter((d) => d.countryCode === filters.country);
    }
    return {
      items: filtered,
      total: filtered.length,
      isLive: false,
    };
  }
}

/**
 * Fetch Git directory tree listing at ref (default: HEAD / main).
 */
export async function fetchRepoTree(
  owner: string,
  name: string,
  ref: string = "HEAD"
): Promise<TreeItem[]> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/repos/${owner}/${name}/tree/${encodeURIComponent(ref)}`,
      {
        method: "GET",
        headers: { Accept: "application/json" },
      }
    );
    if (!res.ok) return [];
    const data: TreeResponse = await res.json();
    return data.items || [];
  } catch {
    return [];
  }
}

/**
 * Fetch Git commit history for a repository.
 */
export async function fetchCommitHistory(
  owner: string,
  name: string,
  ref: string = "HEAD"
): Promise<CommitLogItem[]> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/repos/${owner}/${name}/commits?ref=${encodeURIComponent(ref)}`,
      {
        method: "GET",
        headers: { Accept: "application/json" },
      }
    );
    if (!res.ok) return [];
    return (await res.json()) as CommitLogItem[];
  } catch {
    return [];
  }
}

/**
 * Create a new dataset repository on the FastAPI hub.
 */
export async function createRepository(
  payload: CreateRepoPayload,
  token?: string
): Promise<{ success: boolean; data?: RepoResponse; error?: string }> {
  try {
    // If no token is provided, obtain a quick developer login token
    let authToken = token;
    if (!authToken) {
      const devLoginRes = await fetch(`${API_BASE_URL}/api/auth/dev-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orcid_id: "0000-0002-1825-0097",
          name: "UbuntuBio Researcher",
          email: "researcher@ubuntubio.org",
        }),
      });
      if (devLoginRes.ok) {
        const loginData = await devLoginRes.json();
        authToken = loginData.raw_token;
      }
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const res = await fetch(`${API_BASE_URL}/api/repos`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        owner_slug: payload.owner_slug,
        name: payload.name,
        owner_type: payload.owner_type || "user",
        description: payload.description || "",
        domain: payload.domain || "virus",
        access: payload.access || "public",
        license: payload.license || "cc-by-4.0",
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Request failed" }));
      return { success: false, error: err.detail || `Server error (${res.status})` };
    }

    const data: RepoResponse = await res.json();
    return { success: true, data };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to connect to UbuntuBio Hub API";
    return { success: false, error: msg };
  }
}

export interface UserProfile {
  id: string;
  name: string;
  orcid_id: string;
  email?: string;
  avatar?: string;
}

export interface PersonalAccessToken {
  id: string;
  name: string;
  scope: string;
  created_at: string;
  expires_at: string | null;
}

/**
 * Fetch the authenticated user's profile from the hub.
 */
export async function fetchUserProfile(token: string): Promise<UserProfile | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/whoami`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    if (!res.ok) return null;
    return (await res.json()) as UserProfile;
  } catch {
    return null;
  }
}

/**
 * List the user's active personal access tokens.
 */
export async function fetchUserTokens(token: string): Promise<PersonalAccessToken[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/tokens`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    if (!res.ok) return [];
    return (await res.json()) as PersonalAccessToken[];
  } catch {
    return [];
  }
}

/**
 * Create a new personal access token for CLI or programmatic access.
 */
export async function createPersonalAccessToken(
  name: string,
  scope: "read" | "write" | "admin",
  token: string
): Promise<{ success: boolean; raw_token?: string; token_record?: PersonalAccessToken; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/tokens`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: JSON.stringify({ name, scope, expires_in_days: 90 }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Failed to create token" }));
      return { success: false, error: err.detail };
    }
    const data = await res.json();
    return { success: true, raw_token: data.raw_token, token_record: data };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create token";
    return { success: false, error: msg };
  }
}

/**
 * Revoke an existing personal access token.
 */
export async function revokePersonalAccessToken(tokenId: string, token: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/tokens/${tokenId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.ok || res.status === 204;
  } catch {
    return false;
  }
}

/**
 * Development login helper to generate a session token without ORCID redirect.
 */
export async function devLogin(orcidId?: string, name?: string): Promise<{ success: boolean; raw_token?: string; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/dev-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orcid_id: orcidId || "0000-0002-1825-0097",
        name: name || "UbuntuBio Researcher",
        email: "researcher@ubuntubio.org",
      }),
    });
    if (!res.ok) {
      return { success: false, error: "Dev login is unavailable or disabled in this environment." };
    }
    const data = await res.json();
    return { success: true, raw_token: data.raw_token };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to connect to dev login";
    return { success: false, error: msg };
  }
}

/**
 * Verify and approve a terminal device code (RFC 8628).
 */
export async function verifyDeviceCode(
  userCode: string,
  token: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/device/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: JSON.stringify({ user_code: userCode }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Failed to verify device code" }));
      return { success: false, error: err.detail || "Verification failed." };
    }
    const data = await res.json();
    return { success: true, message: data.message };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to connect to verification service";
    return { success: false, error: msg };
  }
}


