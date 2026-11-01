import { describe, it, expect } from "vitest";
import {
  parseReadPairFromName,
  autoGroupSequenceFiles,
  validateRowAttributes,
  reconcileBatchWithDiscoveredFiles,
  generateRowsFromOrphanFiles,
  DiscoveredSequenceFile,
} from "../parityMatcher";
import { BatchSampleRow } from "../templateGenerator";

describe("parityMatcher", () => {
  it("extracts root sample identifiers and paired read directions from filenames", () => {
    const pair1 = parseReadPairFromName("SAMPLE_001_R1_001.fastq.gz");
    expect(pair1.sampleRoot).toBe("SAMPLE_001");
    expect(pair1.readNumber).toBe(1);

    const pair2 = parseReadPairFromName("SAMPLE_001_R2_001.fastq.gz");
    expect(pair2.sampleRoot).toBe("SAMPLE_001");
    expect(pair2.readNumber).toBe(2);

    const shortPair1 = parseReadPairFromName("isolate_x_1.fq.gz");
    expect(shortPair1.sampleRoot).toBe("isolate_x");
    expect(shortPair1.readNumber).toBe(1);

    const singleEnd = parseReadPairFromName("nanopore_run.fastq.gz");
    expect(singleEnd.sampleRoot).toBe("nanopore_run");
    expect(singleEnd.readNumber).toBeNull();
  });

  it("automatically groups forward and reverse read pairs from a file list", () => {
    const files: DiscoveredSequenceFile[] = [
      { name: "ERR1001_1.fastq.gz", sizeBytes: 1000 },
      { name: "ERR1001_2.fastq.gz", sizeBytes: 1000 },
      { name: "ERR1002_1.fastq.gz", sizeBytes: 1000 },
      { name: "ERR1002_2.fastq.gz", sizeBytes: 1000 },
      { name: "orphan_isolate.fastq.gz", sizeBytes: 500 },
    ];

    const groups = autoGroupSequenceFiles(files);
    expect(groups.length).toBe(3);

    const g1 = groups.find((g) => g.sampleRoot === "ERR1001");
    expect(g1).toBeDefined();
    expect(g1?.forwardFile).toBe("ERR1001_1.fastq.gz");
    expect(g1?.reverseFile).toBe("ERR1001_2.fastq.gz");
  });

  it("detects human taxon 9606 invariant violation in row attributes", () => {
    const row: BatchSampleRow = {
      sample_id: "HUMAN_01",
      taxon_id: 9606,
      country: "NG",
      collection_date: "2026-03-01",
      host: "Homo sapiens",
      isolation_source: "blood",
      forward_read: "reads/h1.fq.gz",
    };

    const issues = validateRowAttributes(row, new Map(), false);
    const humanIssue = issues.find((i) => i.field === "taxon_id");
    expect(humanIssue).toBeDefined();
    expect(humanIssue?.message).toContain("Taxon ID 9606");
  });

  it("detects non-AU member state country code violation", () => {
    const row: BatchSampleRow = {
      sample_id: "TEST_01",
      taxon_id: 5833,
      country: "FR", // France - not AU
      collection_date: "2026-03-01",
      host: "Homo sapiens",
      isolation_source: "blood",
      forward_read: "reads/t1.fq.gz",
    };

    const issues = validateRowAttributes(row, new Map(), false);
    const countryIssue = issues.find((i) => i.field === "country");
    expect(countryIssue).toBeDefined();
    expect(countryIssue?.message).toContain("54 African Union");
  });

  it("detects malformed non-ISO dates", () => {
    const row: BatchSampleRow = {
      sample_id: "TEST_01",
      taxon_id: 5833,
      country: "KE",
      collection_date: "14/05/2026", // Bad format
      host: "Homo sapiens",
      isolation_source: "blood",
      forward_read: "reads/t1.fq.gz",
    };

    const issues = validateRowAttributes(row, new Map(), false);
    const dateIssue = issues.find((i) => i.field === "collection_date");
    expect(dateIssue).toBeDefined();
    expect(dateIssue?.message).toContain("ISO-8601");
  });

  it("reconciles batch rows against discovered files and identifies missing files and orphan files", () => {
    const rows: BatchSampleRow[] = [
      {
        sample_id: "SAM_001",
        taxon_id: 5833,
        country: "NG",
        collection_date: "2026-01-01",
        host: "Homo sapiens",
        isolation_source: "blood",
        forward_read: "reads/SAM_001_R1.fq.gz",
        reverse_read: "reads/SAM_001_R2.fq.gz",
      },
      {
        sample_id: "SAM_002",
        taxon_id: 5833,
        country: "NG",
        collection_date: "2026-01-02",
        host: "Homo sapiens",
        isolation_source: "blood",
        forward_read: "reads/GHOST_R1.fq.gz",
        reverse_read: "reads/GHOST_R2.fq.gz",
      },
    ];

    const discoveredFiles: DiscoveredSequenceFile[] = [
      { name: "SAM_001_R1.fq.gz", sizeBytes: 1024 },
      { name: "SAM_001_R2.fq.gz", sizeBytes: 1024 },
      { name: "UNLINKED_R1.fq.gz", sizeBytes: 2048 },
    ];

    const report = reconcileBatchWithDiscoveredFiles(rows, discoveredFiles, true);

    expect(report.totalSamples).toBe(2);
    expect(report.matchedCount).toBe(1);
    expect(report.missingFileCount).toBe(1);
    expect(report.orphanFiles.length).toBe(1);
    expect(report.orphanFiles[0]?.name).toBe("UNLINKED_R1.fq.gz");
    expect(report.canProceed).toBe(false); // blocked due to missing files
  });

  it("generates new batch rows from orphan files", () => {
    const orphanFiles: DiscoveredSequenceFile[] = [
      { name: "PF_ACCRA_1.fastq.gz", sizeBytes: 5000 },
      { name: "PF_ACCRA_2.fastq.gz", sizeBytes: 5000 },
    ];

    const generated = generateRowsFromOrphanFiles(
      orphanFiles,
      { taxonId: 5833, countryCode: "GH", hostSpecies: "Homo sapiens" },
      true
    );

    expect(generated.length).toBe(1);
    expect(generated[0]?.sample_id).toBe("PF_ACCRA");
    expect(generated[0]?.taxon_id).toBe(5833);
    expect(generated[0]?.country).toBe("GH");
    expect(generated[0]?.forward_read).toBe("reads/PF_ACCRA_1.fastq.gz");
    expect(generated[0]?.reverse_read).toBe("reads/PF_ACCRA_2.fastq.gz");
  });
});
