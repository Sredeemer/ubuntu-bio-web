import type { MetadataRoute } from "next";
import { absoluteUrl } from "../lib/siteUrl";
import { PUBLIC_STATIC_PATHS, isIndexableDataset } from "../lib/seo";
import { fetchRepositories } from "../lib/api";

// Regenerate at most hourly; the dataset list is fetched live from the hub.
export const revalidate = 3600;

function toDate(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = PUBLIC_STATIC_PATHS.map((path) => ({
    url: absoluteUrl(path),
    changeFrequency: path === "/datasets" ? "daily" : "weekly",
    priority: path === "/" ? 1 : path === "/datasets" ? 0.9 : 0.7,
  }));

  // A hub outage must never take the static pages out of the sitemap.
  let datasetEntries: MetadataRoute.Sitemap = [];
  try {
    const datasets = await fetchRepositories();
    datasetEntries = datasets.filter(isIndexableDataset).map((d) => ({
      url: absoluteUrl(`/datasets/${d.namespace}/${d.datasetId}`),
      lastModified: toDate(d.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    datasetEntries = [];
  }

  return [...staticEntries, ...datasetEntries];
}
