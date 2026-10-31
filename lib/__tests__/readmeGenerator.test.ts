import { describe, it, expect } from "vitest";
import { generateDatasetReadme, generateDatasetSamplesTsv } from "../readmeGenerator";

describe("readmeGenerator", () => {
  const sampleParams = {
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
    libraryLayout: "PAIRED" as const,
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
  };

  it("generates valid YAML frontmatter with canonical sequencing and countries block", () => {
    const readme = generateDatasetReadme(sampleParams);

    expect(readme).toContain('title: "Lassa Virus Genomic Surveillance"');
    expect(readme).toContain("domain: virus");
    expect(readme).toContain('access: public');
    expect(readme).toContain('countries:\n  - "NG"');
    expect(readme).toContain("taxon_ids:\n  - 11620");
    expect(readme).toContain('platform: "ILLUMINA"');
    expect(readme).toContain('instrument_model: "Illumina NovaSeq 6000"');
    expect(readme).toContain('library_layout: "paired"');
    expect(readme).toContain('library_id: "RUN001"');
    expect(readme).toContain('sample_name: "EXP001"');
    expect(readme).toContain('"reads/sample1_R1.fastq.gz"');
    expect(readme).toContain('"reads/sample1_R2.fastq.gz"');
    expect(readme).toContain("## Biological Context");
    expect(readme).toContain("## Sequencing Protocols");
    expect(readme).toContain("## Sovereign Data Governance & Ethics");
  });

  it("generates valid MIxS samples.tsv matching declared runs", () => {
    const tsv = generateDatasetSamplesTsv(sampleParams);

    expect(tsv).toContain("sample_id\ttaxon_id\tcountry\tcollection_date\tlat\tlon\tadmin1\thost\tisolation_source");
    expect(tsv).toContain("EXP001\t11620\tNG\t2026-03-15\t\t\t\tMastomys natalensis\tBlood plasma swab");
  });
});
