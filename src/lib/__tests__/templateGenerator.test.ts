import { describe, it, expect } from "vitest";
import {
  generateSampleTemplateTsv,
  generateSampleTemplateCsv,
  parseBatchSheet,
  exportBatchRowsToTsv,
  CANONICAL_HEADERS,
} from "../templateGenerator";

describe("templateGenerator", () => {
  it("generates a canonical TSV template containing all mandatory MIxS headers", () => {
    const tsv = generateSampleTemplateTsv({
      taxonId: 5833,
      countryCode: "NG",
      hostSpecies: "Homo sapiens",
      layout: "PAIRED",
    });

    const lines = tsv.trim().split("\n");
    expect(lines.length).toBeGreaterThanOrEqual(3);

    const headers = (lines[0] ?? "").split("\t");
    for (const expectedHeader of CANONICAL_HEADERS) {
      expect(headers).toContain(expectedHeader);
    }

    expect(tsv).toContain("5833");
    expect(tsv).toContain("NG");
    expect(tsv).toContain("reads/SAMPLE_001_R1.fastq.gz");
    expect(tsv).toContain("reads/SAMPLE_001_R2.fastq.gz");
  });

  it("generates single-end template when layout is SINGLE", () => {
    const tsv = generateSampleTemplateTsv({
      layout: "SINGLE",
    });

    const lines = tsv.trim().split("\n");
    const row1Tokens = (lines[1] ?? "").split("\t");
    expect(row1Tokens[10]).toBe("");
  });

  it("generates CSV template with proper comma formatting", () => {
    const csv = generateSampleTemplateCsv({
      countryCode: "GH",
    });
    expect(csv).toContain("sample_id,taxon_id,country");
    expect(csv).toContain("GH");
  });

  it("parses valid TSV batch sheets with custom whitespace and columns", () => {
    const input = [
      "sample_id\ttaxon_id\tcountry\tcollection_date\thost\tisolation_source\tforward_read\treverse_read",
      "SAMPLE_A\t1773\tZA\t2026-04-10\tHomo sapiens\tsputum\treads/A_1.fq.gz\treads/A_2.fq.gz",
      "SAMPLE_B\t1773\tZA\t2026-04-11\tHomo sapiens\tsputum\treads/B_1.fq.gz\treads/B_2.fq.gz",
    ].join("\n");

    const rows = parseBatchSheet(input);
    expect(rows.length).toBe(2);
    expect(rows[0]?.sample_id).toBe("SAMPLE_A");
    expect(rows[0]?.taxon_id).toBe(1773);
    expect(rows[0]?.country).toBe("ZA");
    expect(rows[0]?.forward_read).toBe("reads/A_1.fq.gz");
    expect(rows[0]?.reverse_read).toBe("reads/A_2.fq.gz");
  });

  it("parses CSV with quoted commas", () => {
    const input = [
      'sample_id,taxon_id,country,collection_date,host,isolation_source,forward_read',
      'SAM_01,5833,NG,2026-01-15,"Homo sapiens, Patient",blood swab,reads/s1.fq.gz',
    ].join("\n");

    const rows = parseBatchSheet(input);
    expect(rows.length).toBe(1);
    expect(rows[0]?.host).toBe("Homo sapiens, Patient");
    expect(rows[0]?.forward_read).toBe("reads/s1.fq.gz");
  });

  it("exports batch rows cleanly to canonical TSV format", () => {
    const rows = [
      {
        sample_id: "PF_01",
        taxon_id: 5833,
        country: "NG",
        collection_date: "2026-02-01",
        host: "Homo sapiens",
        isolation_source: "blood",
        forward_read: "reads/pf01_1.fq.gz",
        reverse_read: "reads/pf01_2.fq.gz",
      },
    ];

    const tsv = exportBatchRowsToTsv(rows);
    expect(tsv.startsWith("sample_id\ttaxon_id")).toBe(true);
    expect(tsv).toContain("PF_01\t5833\tNG\t2026-02-01");
  });
});
