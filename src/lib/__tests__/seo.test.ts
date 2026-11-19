import { describe, it, expect, vi, beforeEach } from "vitest";
import { DATASETS } from "../../data/datasets";
import {
  datasetJsonLd,
  organizationJsonLd,
  websiteJsonLd,
  licenseValue,
  isIndexableDataset,
  PUBLIC_STATIC_PATHS,
  DISALLOWED_PATHS,
} from "../seo";
import { SITE_URL } from "../siteUrl";

vi.mock("../api", () => ({ fetchRepositories: vi.fn() }));
import { fetchRepositories } from "../api";
import robots from "../../app/robots";
import sitemap from "../../app/sitemap";

describe("robots.txt", () => {
  it("allows public routes, blocks private/auth/API routes and points at the sitemap", () => {
    const r = robots();
    const rule = (Array.isArray(r.rules) ? r.rules[0] : r.rules)!;
    expect(rule.userAgent).toBe("*");
    expect(rule.allow).toEqual(["/", "/datasets", "/docs", "/founding-charter", "/technical-handover"]);
    expect(rule.disallow).toEqual(["/login", "/settings", "/device", "/auth", "/submit", "/api/"]);
    expect(r.sitemap).toBe(`${SITE_URL}/sitemap.xml`);
  });
});

describe("sitemap.xml", () => {
  beforeEach(() => {
    // Braces matter: returning the mock would make vitest call it as a teardown hook.
    vi.mocked(fetchRepositories).mockReset();
  });

  it("lists every static public page", async () => {
    vi.mocked(fetchRepositories).mockResolvedValue([]);
    const urls = (await sitemap()).map((e) => e.url);
    for (const p of PUBLIC_STATIC_PATHS) expect(urls).toContain(p === "/" ? `${SITE_URL}/` : `${SITE_URL}${p}`);
    expect(urls).toHaveLength(9);
  });

  it("never lists private routes", async () => {
    vi.mocked(fetchRepositories).mockResolvedValue([]);
    const urls = (await sitemap()).map((e) => e.url);
    for (const p of DISALLOWED_PATHS) expect(urls.some((u) => u.includes(p))).toBe(false);
  });

  it("adds public datasets with lastModified, and skips gated ones", async () => {
    const pub = { ...DATASETS[0]!, accessGate: "public" as const, updatedAt: "2026-03-05" };
    const gated = { ...DATASETS[0]!, namespace: "x", datasetId: "secret", accessGate: "gated" as const };
    vi.mocked(fetchRepositories).mockResolvedValue([pub, gated]);
    const entries = await sitemap();
    const hit = entries.find((e) => e.url === `${SITE_URL}/datasets/${pub.namespace}/${pub.datasetId}`);
    expect(hit).toBeDefined();
    expect(hit!.lastModified).toEqual(new Date("2026-03-05"));
    expect(entries.some((e) => e.url.includes("/secret"))).toBe(false);
  });

  it("omits lastModified for an unparseable date rather than emitting an invalid one", async () => {
    vi.mocked(fetchRepositories).mockResolvedValue([{ ...DATASETS[0]!, accessGate: "public", updatedAt: "n/a" }]);
    const hit = (await sitemap()).find((e) => e.url.includes("/datasets/") && e.url.split("/").length > 5);
    expect(hit?.lastModified).toBeUndefined();
  });

  it("still returns the static pages when the hub is unreachable", async () => {
    vi.mocked(fetchRepositories).mockRejectedValue(new Error("hub down"));
    expect(await sitemap()).toHaveLength(9);
  });
});

describe("Organization / WebSite JSON-LD", () => {
  it("links UbuntuBio, its URL, logo and WACCBIP", () => {
    const org = organizationJsonLd();
    expect(org["@type"]).toBe("Organization");
    expect(org.url).toBe(SITE_URL);
    expect(org.logo).toBe(`${SITE_URL}/icon-512.png`);
    expect(org.parentOrganization.alternateName).toBe("WACCBIP");
    const site = websiteJsonLd();
    expect(site["@type"]).toBe("WebSite");
    expect(site.publisher["@id"]).toBe(org["@id"]);
  });
});

describe("Dataset JSON-LD", () => {
  const ds = DATASETS.find((d) => d.accessGate === "public")!;
  const ld = datasetJsonLd(ds) as Record<string, any>;

  it("carries the fields Google Dataset Search needs", () => {
    expect(ld["@type"]).toBe("Dataset");
    expect(ld.name).toBe(ds.name);
    expect(ld.description.length).toBeGreaterThan(0);
    expect(ld.url).toBe(`${SITE_URL}/datasets/${ds.namespace}/${ds.datasetId}`);
    expect(ld.creator).toEqual({ "@type": "Organization", name: ds.leadInstitution });
    expect(ld.license).toBe(licenseValue(ds.license));
    expect(ld.spatialCoverage.address.addressCountry).toBe(ds.countryCode);
    expect(ld.spatialCoverage.name).toContain(ds.countryName);
  });

  it("uses real, absolute file download URLs for distribution", () => {
    expect(ld.distribution.length).toBe(ds.files.length);
    for (const d of ld.distribution) {
      expect(d["@type"]).toBe("DataDownload");
      expect(d.contentUrl).toMatch(new RegExp(`^${SITE_URL}/api/repos/${ds.namespace}/${ds.datasetId}/raw/HEAD/`));
    }
  });

  it("maps SPDX licence ids to URLs and leaves other licences as text", () => {
    expect(licenseValue("CC-BY-4.0")).toBe("https://creativecommons.org/licenses/by/4.0/");
    expect(licenseValue("Nagoya Protocol Data Access Agreement")).toBe("Nagoya Protocol Data Access Agreement");
  });

  it("only treats public datasets as indexable", () => {
    expect(isIndexableDataset({ accessGate: "public" })).toBe(true);
    expect(isIndexableDataset({ accessGate: "gated" })).toBe(false);
  });

  it("omits distribution when there are no files and dateModified when the date is invalid", () => {
    const bare = datasetJsonLd({ ...ds, files: [], updatedAt: "unknown" }) as Record<string, unknown>;
    expect(bare.distribution).toBeUndefined();
    expect(bare.dateModified).toBeUndefined();
  });
});
