import { describe, it, expect } from "vitest";
import { generateDatasetReadme } from "../readmeGenerator";

describe("generateDatasetReadme", () => {
  it("generates valid YAML frontmatter with complete sequencing block", () => {
    const readme = generateDatasetReadme({
      title: "Lassa Virus Genomic Surveillance",
      domain: "virus",
      authorName: "Dr. Redeemer",
      authorAffiliation: "ACEGID",
      countryCode: "NG",
      countryName: "Nigeria",
      institution: "ACEGID Redeemer's University",
      collectionDate: "2026-03-15",
      sampleType: "Blood plasma swab",
      hostTaxonId: 10090,
      hostSpecies: "Mastomys natalensis",
      taxonId: 11620,
      scientificName: "Lassa mammarenavirus",
      platform: "ILLUMINA",
      instrumentModel: "Illumina NovaSeq 6000",
      libraryStrategy: "WGS",
      librarySource: "VIRAL_RNA",
      librarySelection: "PCR",
      libraryLayout: "PAIRED",
      runs: [
        {
          run_id: "RUN001",
          experiment_id: "EXP001",
          flowcell_id: "H7VNWDRXX",
          lane: 1,
          forward_read: "reads/sample1_R1.fastq.gz",
          reverse_read: "reads/sample1_R2.fastq.gz",
          read_count: 1450000,
          base_count: 217500000,
        },
      ],
      description: "Surveillance cohort across West Africa.",
    });

    expect(readme).toContain('title: "Lassa Virus Genomic Surveillance"');
    expect(readme).toContain("domain: virus");
    expect(readme).toContain('country: "NG"');
    expect(readme).toContain("tax_id: 11620");
    expect(readme).toContain('platform: "ILLUMINA"');
    expect(readme).toContain('instrument_model: "Illumina NovaSeq 6000"');
    expect(readme).toContain('library_layout: "PAIRED"');
    expect(readme).toContain('run_id: "RUN001"');
    expect(readme).toContain('forward_read: "reads/sample1_R1.fastq.gz"');
    expect(readme).toContain('reverse_read: "reads/sample1_R2.fastq.gz"');
    expect(readme).toContain("## Biological Context");
    expect(readme).toContain("## Sequencing Protocols");
    expect(readme).toContain("## Sovereign Data Governance & Ethics");
  });
});
