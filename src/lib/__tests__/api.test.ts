import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  repoToDatasetItem,
  checkBackendHealth,
  searchDatasets,
  fetchRepositories,
  fetchRepository,
  fetchRepoTree,
  createRepository,
  RepoResponse,
} from "../api";
import { DATASETS } from "../../data/datasets";

describe("UbuntuBio API Client (FastAPI Integration)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("repoToDatasetItem", () => {
    it("converts a FastAPI RepoResponse to a rich DatasetItem", () => {
      const repo: RepoResponse = {
        id: "test-uuid",
        slug: "noguchi/cholera-ghana-2026",
        name: "Vibrio cholerae surveillance",
        owner_type: "org",
        owner_id: "noguchi",
        description: "Surveillance of cholera strains in Accra",
        domain: "bacteria",
        access: "public",
        license: "CC-BY-4.0",
        is_verified_african: true,
        created_at: "2026-10-18T12:00:00Z",
        updated_at: "2026-10-18T12:00:00Z",
      };

      const item = repoToDatasetItem(repo);
      expect(item.id).toBe("noguchi/cholera-ghana-2026");
      expect(item.namespace).toBe("noguchi");
      expect(item.datasetId).toBe("cholera-ghana-2026");
      expect(item.pathogenType).toBe("Bacteria");
      expect(item.accessGate).toBe("public");
      expect(item.license).toBe("CC-BY-4.0");
    });

    it("prefers rich curated metadata when available in local registry", () => {
      const repo: RepoResponse = {
        id: "uuid-1",
        slug: "pasteur-dakar/lassa-surveillance-2026",
        name: "Lassa surveillance",
        owner_type: "org",
        owner_id: "pasteur-dakar",
        description: "Lassa virus isolates",
        domain: "virus",
        access: "public",
        license: "CC-BY-4.0",
        is_verified_african: true,
        created_at: "2026-10-18T12:00:00Z",
        updated_at: "2026-10-18T12:00:00Z",
      };

      const item = repoToDatasetItem(repo);
      expect(item.taxonId).toBe(11620);
      expect(item.countryCode).toBe("SN");
      expect(item.countryName).toBe("Senegal");
      expect(item.biocontainment).toBe("BSL-4");
    });
  });

  describe("checkBackendHealth", () => {
    it("returns HealthResponse when backend responds 200 OK", async () => {
      vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: "ok", version: "0.1.0" }),
      } as Response);

      const health = await checkBackendHealth();
      expect(health).toEqual({ status: "ok", version: "0.1.0" });
    });

    it("returns null when backend is unreachable or errors", async () => {
      vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("Connection refused"));

      const health = await checkBackendHealth();
      expect(health).toBeNull();
    });
  });

  describe("searchDatasets", () => {
    it("returns live search results when FastAPI Hub responds", async () => {
      vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          hits: [
            {
              id: "kemri/cholera-outbreak-kisumu",
              slug: "kemri/cholera-outbreak-kisumu",
              name: "Vibrio cholerae O1",
              domain: "bacteria",
              access: "public",
              countries: ["KE"],
              samples_count: 380,
            },
          ],
          total: 1,
          limit: 20,
          offset: 0,
        }),
      } as Response);

      const result = await searchDatasets("cholera");
      expect(result.isLive).toBe(true);
      expect(result.items.length).toBeGreaterThanOrEqual(1);
      expect(result.items[0]?.countryCode).toBe("KE");
    });

    it("falls back to local curated data when search endpoint fails", async () => {
      vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("Search server error"));

      const result = await searchDatasets("lassa");
      expect(result.isLive).toBe(false);
      expect(result.items.length).toBeGreaterThan(0);
      expect(result.items[0]?.id).toContain("lassa");
    });
  });

  describe("fetchRepositories", () => {
    it("returns mapped repositories from FastAPI Hub", async () => {
      vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: "repo-1",
            slug: "test-org/ebola-study",
            name: "Ebola study",
            owner_type: "org",
            owner_id: "test-org",
            description: "Ebola outbreak samples",
            domain: "virus",
            access: "public",
            license: "cc-by-4.0",
            is_verified_african: true,
            created_at: "2026-10-18T10:00:00Z",
            updated_at: "2026-10-18T10:00:00Z",
          },
        ],
      } as Response);

      const repos = await fetchRepositories();
      expect(repos.length).toBe(1);
      expect(repos[0]?.id).toBe("test-org/ebola-study");
    });

    it("falls back to default curated list on network failure", async () => {
      vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("Network error"));

      const repos = await fetchRepositories();
      expect(repos).toEqual(DATASETS);
    });
  });

  describe("fetchRepository", () => {
    it("fetches single repo from backend or falls back to local record", async () => {
      const repo = await fetchRepository("pasteur-dakar", "lassa-surveillance-2026");
      expect(repo).toBeDefined();
      expect(repo?.countryCode).toBe("SN");
    });
  });

  describe("fetchRepoTree", () => {
    it("fetches directory tree items from FastAPI Git ls-tree endpoint", async () => {
      vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ref: "main",
          items: [
            {
              mode: "100644",
              type: "blob",
              oid: "abc123456789",
              size: 4096,
              path: "README.md",
            },
          ],
        }),
      } as Response);

      const items = await fetchRepoTree("test-org", "test-repo", "main");
      expect(items.length).toBe(1);
      expect(items[0]?.path).toBe("README.md");
    });
  });

  describe("createRepository", () => {
    it("calls FastAPI POST /api/repos with dev login and payload", async () => {
      // 1. Mock dev-login
      vi.spyOn(global, "fetch")
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ raw_token: "ubp_test_token" }),
        } as Response)
        // 2. Mock create repo
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            id: "new-repo-id",
            slug: "inrb/mpox-isolate-2026",
            name: "mpox-isolate-2026",
            owner_type: "user",
            owner_id: "user-1",
            description: "Mpox isolate",
            domain: "virus",
            access: "public",
            license: "cc-by-4.0",
            is_verified_african: false,
            created_at: "2026-10-18T12:00:00Z",
            updated_at: "2026-10-18T12:00:00Z",
          }),
        } as Response);

      const res = await createRepository({
        owner_slug: "inrb",
        name: "mpox-isolate-2026",
        description: "Mpox isolate",
        domain: "virus",
      });

      expect(res.success).toBe(true);
      expect(res.data?.slug).toBe("inrb/mpox-isolate-2026");
    });
  });
});
