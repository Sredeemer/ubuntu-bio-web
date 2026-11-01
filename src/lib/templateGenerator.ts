import { AU_COUNTRIES } from "../data/auCountries";

export interface BatchSampleRow {
  sample_id: string;
  taxon_id: number | string;
  country: string;
  collection_date: string;
  lat?: string | undefined;
  lon?: string | undefined;
  admin1?: string | undefined;
  host: string;
  isolation_source: string;
  forward_read: string;
  reverse_read?: string | undefined;
}

export interface TemplateDefaults {
  taxonId?: number | string | undefined;
  scientificName?: string | undefined;
  countryCode?: string | undefined;
  hostSpecies?: string | undefined;
  sampleType?: string | undefined;
  collectionDate?: string | undefined;
  layout?: "PAIRED" | "SINGLE" | undefined;
}

export const CANONICAL_HEADERS: readonly string[] = [
  "sample_id",
  "taxon_id",
  "country",
  "collection_date",
  "lat",
  "lon",
  "admin1",
  "host",
  "isolation_source",
  "forward_read",
  "reverse_read",
] as const;

export function generateSampleTemplateTsv(defaults: TemplateDefaults = {}): string {
  const headerLine = CANONICAL_HEADERS.join("\t");

  const sampleTaxon = defaults.taxonId || 5833;
  const sampleCountry = defaults.countryCode || "NG";
  const sampleHost = defaults.hostSpecies || "Homo sapiens";
  const sampleSource = defaults.sampleType || "Blood swab specimen";
  const sampleDate = defaults.collectionDate || new Date().toISOString().split("T")[0];
  const isPaired = defaults.layout !== "SINGLE";

  const exampleRow1 = [
    "SAMPLE_001",
    String(sampleTaxon),
    sampleCountry,
    sampleDate,
    "6.5244",
    "3.3792",
    "Lagos State",
    sampleHost,
    sampleSource,
    "reads/SAMPLE_001_R1.fastq.gz",
    isPaired ? "reads/SAMPLE_001_R2.fastq.gz" : "",
  ].join("\t");

  const exampleRow2 = [
    "SAMPLE_002",
    String(sampleTaxon),
    sampleCountry,
    sampleDate,
    "7.3775",
    "3.9470",
    "Oyo State",
    sampleHost,
    sampleSource,
    "reads/SAMPLE_002_R1.fastq.gz",
    isPaired ? "reads/SAMPLE_002_R2.fastq.gz" : "",
  ].join("\t");

  return [headerLine, exampleRow1, exampleRow2].join("\n") + "\n";
}

export function generateSampleTemplateCsv(defaults: TemplateDefaults = {}): string {
  const tsv = generateSampleTemplateTsv(defaults);
  return tsv
    .split("\n")
    .map((line) => {
      if (!line.trim()) return "";
      return line
        .split("\t")
        .map((val) => {
          if (val.includes(",") || val.includes('"') || val.includes("\n")) {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        })
        .join(",");
    })
    .join("\n");
}

export function parseBatchSheet(content: string): BatchSampleRow[] {
  const trimmed = content.trim();
  if (!trimmed) return [];

  const lines = trimmed.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const firstLine = lines[0];
  if (!firstLine) return [];

  const delimiter = firstLine.includes("\t") ? "\t" : ",";

  const rawHeaders = splitSheetRow(firstLine, delimiter).map((h) =>
    h.trim().toLowerCase().replace(/[\s-]+/g, "_")
  );

  const headerIndexMap = new Map<string, number>();
  rawHeaders.forEach((h, idx) => {
    headerIndexMap.set(h, idx);
  });

  const getCol = (tokens: string[], keys: string[]): string => {
    for (const key of keys) {
      const idx = headerIndexMap.get(key);
      if (idx !== undefined && tokens[idx] !== undefined) {
        return (tokens[idx] ?? "").trim();
      }
    }
    return "";
  };

  const rows: BatchSampleRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const currentLine = lines[i];
    if (!currentLine) continue;
    const tokens = splitSheetRow(currentLine, delimiter);
    if (tokens.every((t) => t.trim().length === 0)) continue;

    const sampleId = getCol(tokens, ["sample_id", "sample", "sample_name", "id"]);
    const taxonIdStr = getCol(tokens, ["taxon_id", "tax_id", "taxon", "ncbi_taxon_id"]);
    const country = getCol(tokens, ["country", "country_code", "au_country"]);
    const collectionDate = getCol(tokens, ["collection_date", "date", "sample_date"]);
    const lat = getCol(tokens, ["lat", "latitude"]);
    const lon = getCol(tokens, ["lon", "long", "longitude"]);
    const admin1 = getCol(tokens, ["admin1", "state", "province", "region"]);
    const host = getCol(tokens, ["host", "host_species", "host_organism"]);
    const isolationSource = getCol(tokens, ["isolation_source", "source", "sample_type"]);
    const forwardRead = getCol(tokens, [
      "forward_read",
      "r1",
      "r1_file",
      "read1",
      "forward",
      "filename",
      "file_1",
    ]);
    const reverseRead = getCol(tokens, ["reverse_read", "r2", "r2_file", "read2", "reverse", "file_2"]);

    if (!sampleId && !forwardRead) continue;

    rows.push({
      sample_id: sampleId || `SAMPLE_${String(rows.length + 1).padStart(3, "0")}`,
      taxon_id: taxonIdStr ? parseInt(taxonIdStr, 10) || taxonIdStr : "",
      country: country.toUpperCase(),
      collection_date: collectionDate,
      lat: lat || undefined,
      lon: lon || undefined,
      admin1: admin1 || undefined,
      host: host || "Homo sapiens",
      isolation_source: isolationSource || "specimen",
      forward_read: forwardRead,
      reverse_read: reverseRead || undefined,
    });
  }

  return rows;
}

export function exportBatchRowsToTsv(rows: BatchSampleRow[]): string {
  const headerLine = CANONICAL_HEADERS.join("\t");
  const dataLines = rows.map((r) =>
    [
      r.sample_id,
      String(r.taxon_id || ""),
      r.country || "",
      r.collection_date || "",
      r.lat || "",
      r.lon || "",
      r.admin1 || "",
      r.host || "",
      r.isolation_source || "",
      r.forward_read || "",
      r.reverse_read || "",
    ].join("\t")
  );

  return [headerLine, ...dataLines].join("\n") + "\n";
}

function splitSheetRow(line: string, delimiter: string): string[] {
  if (delimiter === "\t") {
    return line.split("\t");
  }

  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}
