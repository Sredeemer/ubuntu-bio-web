import type { DatasetItem } from "../data/datasets";
import { SITE_URL, absoluteUrl } from "./siteUrl";

/** Public pages that belong in the sitemap and are allowed in robots.txt. */
export const PUBLIC_STATIC_PATHS = [
  "/",
  "/datasets",
  "/docs",
  "/docs/submission",
  "/docs/cli",
  "/docs/api",
  "/docs/governance",
  "/founding-charter",
  "/technical-handover",
] as const;

/** Areas crawlers must skip: auth, account and submission flows and the API. */
export const DISALLOWED_PATHS = ["/login", "/settings", "/device", "/auth", "/submit", "/api/"] as const;

const WACCBIP = {
  "@type": "Organization",
  name: "West African Centre for Cell Biology of Infectious Pathogens (WACCBIP)",
  alternateName: "WACCBIP",
  url: "https://waccbip.org",
  parentOrganization: { "@type": "CollegeOrUniversity", name: "University of Ghana" },
} as const;

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "UbuntuBio",
    alternateName: "UbuntuBio Initiative",
    url: SITE_URL,
    logo: absoluteUrl("/icon-512.png"),
    description:
      "Open-source data hub for African pathogen surveillance, veterinary genomics, and crop biodiversity under African Union data sovereignty.",
    foundingLocation: { "@type": "Place", name: "University of Ghana, Legon, Ghana" },
    parentOrganization: WACCBIP,
    knowsAbout: ["Bioinformatics", "Genomics", "Pathogen Surveillance", "African Union data sovereignty"],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: "UbuntuBio",
    url: SITE_URL,
    inLanguage: "en",
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

const LICENSE_URLS: Record<string, string> = {
  "CC-BY-4.0": "https://creativecommons.org/licenses/by/4.0/",
  "CC0-1.0": "https://creativecommons.org/publicdomain/zero/1.0/",
  "CC-BY-SA-4.0": "https://creativecommons.org/licenses/by-sa/4.0/",
};

/** SPDX-style ids become their canonical URL; anything else is kept as the plain text it is. */
export function licenseValue(license: string): string {
  return LICENSE_URLS[license] ?? license;
}

const MAX_DISTRIBUTIONS = 50;

/**
 * schema.org/Dataset for a dataset detail page (what Google Dataset Search reads).
 * Only built from data we actually hold: file download links are the hub's real raw-file URLs.
 */
export function datasetJsonLd(dataset: DatasetItem) {
  const pageUrl = absoluteUrl(`/datasets/${dataset.namespace}/${dataset.datasetId}`);
  const description = (dataset.longDescription || dataset.description || dataset.name).trim();

  const distribution = dataset.files.slice(0, MAX_DISTRIBUTIONS).map((f) => ({
    "@type": "DataDownload",
    name: f.name,
    encodingFormat: f.format,
    contentSize: `${f.sizeBytes} B`,
    contentUrl: absoluteUrl(
      `/api/repos/${dataset.namespace}/${dataset.datasetId}/raw/HEAD/${f.path
        .split("/")
        .map(encodeURIComponent)
        .join("/")}`
    ),
  }));

  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "@id": `${pageUrl}#dataset`,
    name: dataset.name,
    description,
    url: pageUrl,
    identifier: dataset.id,
    creator: { "@type": "Organization", name: dataset.leadInstitution },
    publisher: { "@id": `${SITE_URL}/#organization` },
    license: licenseValue(dataset.license),
    isAccessibleForFree: true,
    spatialCoverage: {
      "@type": "Place",
      name: `${dataset.countryName} (${dataset.countryCode})`,
      address: { "@type": "PostalAddress", addressCountry: dataset.countryCode },
    },
    keywords: [dataset.taxonName, dataset.pathogenType, "genomics", "African Union"].filter(Boolean),
    ...(dataset.seqPlatforms.length > 0 ? { measurementTechnique: dataset.seqPlatforms.join(", ") } : {}),
    ...(dataset.citation ? { citation: dataset.citation } : {}),
    ...(Number.isNaN(Date.parse(dataset.updatedAt)) ? {} : { dateModified: dataset.updatedAt }),
    includedInDataCatalog: { "@type": "DataCatalog", name: "UbuntuBio", url: SITE_URL },
    ...(distribution.length > 0 ? { distribution } : {}),
  };
}

/** Only openly accessible datasets are advertised to search engines. */
export function isIndexableDataset(dataset: Pick<DatasetItem, "accessGate">): boolean {
  return dataset.accessGate === "public";
}
