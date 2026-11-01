import { AU_COUNTRIES, PROHIBITED_HUMAN_TAXON_ID } from "../data/auCountries";
import { BatchSampleRow, TemplateDefaults } from "./templateGenerator";

export interface DiscoveredSequenceFile {
  name: string;
  relativePath?: string | undefined;
  sizeBytes: number;
}

export interface PairedFileGroup {
  sampleRoot: string;
  forwardFile: string;
  reverseFile?: string | undefined;
}

export interface RowValidationIssue {
  field: keyof BatchSampleRow | "file_linkage";
  message: string;
  severity: "error" | "warning";
}

export type RowParityStatus = "matched" | "missing_file" | "pending_folder" | "invalid_attributes";

export interface ReconciledRow {
  row: BatchSampleRow;
  originalIndex: number;
  status: RowParityStatus;
  issues: RowValidationIssue[];
  matchedForward?: DiscoveredSequenceFile | undefined;
  matchedReverse?: DiscoveredSequenceFile | undefined;
}

export interface ReconciliationReport {
  reconciledRows: ReconciledRow[];
  totalSamples: number;
  matchedCount: number;
  missingFileCount: number;
  invalidAttributeCount: number;
  orphanFiles: DiscoveredSequenceFile[];
  canProceed: boolean;
}

const AU_CODE_SET = new Set(AU_COUNTRIES.map((c) => c.code.toUpperCase()));

const SEQUENCE_EXTENSIONS = [
  ".fastq.gz",
  ".fq.gz",
  ".fastq",
  ".fq",
  ".fasta.gz",
  ".fa.gz",
  ".fasta",
  ".fa",
  ".bam",
  ".cram",
];

export function isSequenceFilename(filename: string): boolean {
  const lower = filename.toLowerCase();
  return SEQUENCE_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export function parseReadPairFromName(filename: string): { sampleRoot: string; readNumber: 1 | 2 | null } {
  const cleanName = filename.replace(/^.*[\\/]/, "");
  const lower = cleanName.toLowerCase();

  const r1Pattern = /^(.*?)(?:[._-](?:r1|1))(?:[._-](?:001|[0-9]+))?\.(?:fastq|fq|fasta|fa)(?:\.gz)?$/i;
  const r2Pattern = /^(.*?)(?:[._-](?:r2|2))(?:[._-](?:001|[0-9]+))?\.(?:fastq|fq|fasta|fa)(?:\.gz)?$/i;

  const m1 = cleanName.match(r1Pattern);
  if (m1 && m1[1]) {
    return { sampleRoot: m1[1], readNumber: 1 };
  }

  const m2 = cleanName.match(r2Pattern);
  if (m2 && m2[1]) {
    return { sampleRoot: m2[1], readNumber: 2 };
  }

  for (const ext of SEQUENCE_EXTENSIONS) {
    if (lower.endsWith(ext)) {
      const root = cleanName.slice(0, cleanName.length - ext.length);
      return { sampleRoot: root, readNumber: null };
    }
  }

  return { sampleRoot: cleanName, readNumber: null };
}

export function autoGroupSequenceFiles(files: DiscoveredSequenceFile[]): PairedFileGroup[] {
  const groupsByRoot = new Map<string, { fwd?: string; rev?: string }>();

  for (const f of files) {
    if (!isSequenceFilename(f.name)) continue;

    const parsed = parseReadPairFromName(f.name);
    const root = parsed.sampleRoot;
    const existing = groupsByRoot.get(root) || {};

    if (parsed.readNumber === 1) {
      existing.fwd = f.name;
    } else if (parsed.readNumber === 2) {
      existing.rev = f.name;
    } else {
      if (!existing.fwd) {
        existing.fwd = f.name;
      } else if (!existing.rev) {
        existing.rev = f.name;
      }
    }

    groupsByRoot.set(root, existing);
  }

  const result: PairedFileGroup[] = [];
  for (const [root, pair] of groupsByRoot.entries()) {
    if (pair.fwd) {
      result.push({
        sampleRoot: root,
        forwardFile: pair.fwd,
        reverseFile: pair.rev,
      });
    }
  }

  return result;
}

export function validateRowAttributes(
  row: BatchSampleRow,
  seenSampleIds: Map<string, number>,
  isPaired: boolean
): RowValidationIssue[] {
  const issues: RowValidationIssue[] = [];

  const trimmedId = row.sample_id.trim();
  if (!trimmedId) {
    issues.push({ field: "sample_id", message: "Sample ID is required.", severity: "error" });
  } else {
    const count = seenSampleIds.get(trimmedId.toLowerCase()) || 0;
    if (count > 1) {
      issues.push({
        field: "sample_id",
        message: `Duplicate sample ID: ${trimmedId} is declared multiple times.`,
        severity: "error",
      });
    }
  }

  const taxIdNum = typeof row.taxon_id === "number" ? row.taxon_id : parseInt(String(row.taxon_id).trim(), 10);
  if (!taxIdNum || isNaN(taxIdNum) || taxIdNum <= 0) {
    issues.push({ field: "taxon_id", message: "Valid non-zero NCBI Taxon ID is required.", severity: "error" });
  } else if (taxIdNum === PROHIBITED_HUMAN_TAXON_ID) {
    issues.push({
      field: "taxon_id",
      message: "Human genomic data (Taxon ID 9606) is prohibited under AU Sovereign Invariants.",
      severity: "error",
    });
  }

  const countryClean = row.country.trim().toUpperCase();
  if (!countryClean) {
    issues.push({ field: "country", message: "AU Member State country code is required.", severity: "error" });
  } else if (!AU_CODE_SET.has(countryClean)) {
    issues.push({
      field: "country",
      message: `Invalid country code: ${countryClean} is not one of the 54 African Union member states.`,
      severity: "error",
    });
  }

  const dateClean = row.collection_date.trim();
  if (!dateClean) {
    issues.push({ field: "collection_date", message: "Collection date is required.", severity: "error" });
  } else {
    const isoDatePattern = /^\d{4}(?:-(?:0[1-9]|1[0-2])(?:-(?:0[1-9]|[12]\d|3[01]))?)?$/;
    if (!isoDatePattern.test(dateClean)) {
      issues.push({
        field: "collection_date",
        message: "Collection date must strictly adhere to ISO-8601 (YYYY-MM-DD or YYYY-MM).",
        severity: "error",
      });
    }
  }

  if (!row.forward_read.trim()) {
    issues.push({ field: "forward_read", message: "Forward sequence read file is required.", severity: "error" });
  }

  if (isPaired && !row.reverse_read?.trim()) {
    issues.push({
      field: "reverse_read",
      message: "Reverse sequence read file is required for paired-end sequencing libraries.",
      severity: "error",
    });
  }

  return issues;
}

export function reconcileBatchWithDiscoveredFiles(
  rows: BatchSampleRow[],
  discoveredFiles: DiscoveredSequenceFile[],
  isPaired: boolean
): ReconciliationReport {
  const seenSampleIds = new Map<string, number>();
  for (const r of rows) {
    const key = r.sample_id.trim().toLowerCase();
    if (key) {
      seenSampleIds.set(key, (seenSampleIds.get(key) || 0) + 1);
    }
  }

  const fileMapByName = new Map<string, DiscoveredSequenceFile>();
  for (const f of discoveredFiles) {
    const basename = f.name.replace(/^.*[\\/]/, "");
    fileMapByName.set(f.name, f);
    fileMapByName.set(basename, f);
    if (f.relativePath) {
      fileMapByName.set(f.relativePath, f);
    }
  }

  const usedFiles = new Set<string>();
  const reconciledRows: ReconciledRow[] = [];

  let matchedCount = 0;
  let missingFileCount = 0;
  let invalidAttributeCount = 0;

  rows.forEach((row, idx) => {
    const attributeIssues = validateRowAttributes(row, seenSampleIds, isPaired);
    const linkageIssues: RowValidationIssue[] = [];

    const fwdName = row.forward_read.trim().replace(/^.*[\\/]/, "");
    const revName = row.reverse_read?.trim().replace(/^.*[\\/]/, "");

    let matchedForward: DiscoveredSequenceFile | undefined;
    let matchedReverse: DiscoveredSequenceFile | undefined;

    if (discoveredFiles.length > 0) {
      if (fwdName) {
        matchedForward = fileMapByName.get(row.forward_read.trim()) || fileMapByName.get(fwdName);
        if (!matchedForward) {
          linkageIssues.push({
            field: "forward_read",
            message: `Declared file ${row.forward_read} was not found in the dropped sequence folder.`,
            severity: "error",
          });
        } else {
          usedFiles.add(matchedForward.name);
        }
      }

      if (isPaired && revName) {
        matchedReverse = fileMapByName.get(row.reverse_read!.trim()) || fileMapByName.get(revName);
        if (!matchedReverse) {
          linkageIssues.push({
            field: "reverse_read",
            message: `Declared reverse file ${row.reverse_read} was not found in the dropped sequence folder.`,
            severity: "error",
          });
        } else {
          usedFiles.add(matchedReverse.name);
        }
      }
    }

    const hasAttrErrors = attributeIssues.some((i) => i.severity === "error");
    const hasFileErrors = linkageIssues.some((i) => i.severity === "error");

    let status: RowParityStatus = "matched";
    if (hasAttrErrors) {
      status = "invalid_attributes";
      invalidAttributeCount++;
    } else if (discoveredFiles.length === 0) {
      status = "pending_folder";
      linkageIssues.push({
        field: "forward_read",
        message: "No folder scanned yet. Drop local sequencing directory to verify reads on disk.",
        severity: "warning",
      });
    } else if (hasFileErrors) {
      status = "missing_file";
      missingFileCount++;
    } else {
      status = "matched";
      matchedCount++;
    }

    const allIssues = [...attributeIssues, ...linkageIssues];

    reconciledRows.push({
      row,
      originalIndex: idx,
      status,
      issues: allIssues,
      matchedForward,
      matchedReverse,
    });
  });

  const orphanFiles = discoveredFiles.filter(
    (f) => isSequenceFilename(f.name) && !usedFiles.has(f.name)
  );

  const canProceed =
    rows.length > 0 &&
    discoveredFiles.length > 0 &&
    invalidAttributeCount === 0 &&
    missingFileCount === 0;

  return {
    reconciledRows,
    totalSamples: rows.length,
    matchedCount,
    missingFileCount,
    invalidAttributeCount,
    orphanFiles,
    canProceed,
  };
}

export function generateRowsFromOrphanFiles(
  orphanFiles: DiscoveredSequenceFile[],
  defaults: TemplateDefaults = {},
  isPaired: boolean
): BatchSampleRow[] {
  const pairedGroups = autoGroupSequenceFiles(orphanFiles);
  const fallbackDate = new Date().toISOString().split("T")[0] ?? "2026-01-01";
  const dateStr = defaults.collectionDate || fallbackDate;

  return pairedGroups.map((g, idx) => ({
    sample_id: g.sampleRoot || `SAMPLE_${String(idx + 1).padStart(3, "0")}`,
    taxon_id: defaults.taxonId || 5833,
    country: defaults.countryCode || "NG",
    collection_date: dateStr,
    host: defaults.hostSpecies || "Homo sapiens",
    isolation_source: defaults.sampleType || "clinical specimen",
    forward_read: `reads/${g.forwardFile}`,
    reverse_read: isPaired && g.reverseFile ? `reads/${g.reverseFile}` : undefined,
  }));
}
