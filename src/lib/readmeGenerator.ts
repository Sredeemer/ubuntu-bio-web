/**
 * Generates canonical README.md and samples.tsv with YAML frontmatter conforming to
 * the UbuntuBio schema, client-py validator, and server git-hook validation requirements.
 */

export interface SequencingRunEntry {
  run_id: string;
  experiment_id: string;
  flowcell_id?: string | undefined;
  lane?: number | undefined;
  forward_read: string;
  reverse_read?: string | undefined;
  read_count?: number | undefined;
  base_count?: number | undefined;
  checksum_sha256?: string | undefined;
}

export interface ReadmeGeneratorParams {
  title: string;
  domain: string;
  authorName: string;
  authorAffiliation: string;
  countryCode: string;
  countryName: string;
  institution: string;
  collectionDate: string;
  sampleType: string;
  hostTaxonId?: number | undefined;
  hostSpecies?: string | undefined;
  taxonId: number;
  scientificName: string;
  platform: string;
  instrumentModel: string;
  libraryStrategy: string;
  librarySource: string;
  librarySelection: string;
  libraryLayout: "PAIRED" | "SINGLE";
  runs: SequencingRunEntry[];
  description: string;
  access?: "public" | "gated" | "private";
  license?: string;
  nominalLength?: number;
}

export function generateDatasetReadme(params: ReadmeGeneratorParams): string {
  const today = new Date().toISOString().split("T")[0] ?? "2026-10-22";
  const layoutLower = params.libraryLayout.toLowerCase() as "paired" | "single";
  const nominalLen = params.nominalLength || 500;
  const accessTier = params.access || "public";
  const licenseStr = params.license || "cc-by-4.0";

  // Build canonical sequencing libraries block conforming to DatasetCard and client-py validator
  const defaultRuns: SequencingRunEntry[] =
    params.runs.length > 0
      ? params.runs
      : [
          {
            run_id: "RUN001",
            experiment_id: "EXP001",
            forward_read: "reads/sample1_R1.fastq.gz",
            reverse_read: layoutLower === "paired" ? "reads/sample1_R2.fastq.gz" : undefined,
          },
        ];

  const librariesYaml = defaultRuns
    .map((r) => {
      const sampleName = r.experiment_id || r.run_id;
      const fileList =
        layoutLower === "paired" && r.reverse_read
          ? `        - "${r.forward_read}"\n        - "${r.reverse_read}"`
          : `        - "${r.forward_read}"`;

      return `    - library_id: "${r.run_id}"
      sample_name: "${sampleName}"
      title: "${params.libraryStrategy} sequencing library for ${sampleName}"
      file_type: "FASTQ"
      filenames:
${fileList}`;
    })
    .join("\n");

  const nominalLengthLine = layoutLower === "paired" ? `  nominal_length: ${nominalLen}\n` : "";

  const frontmatter = `---
title: "${params.title || "Genomic Surveillance Cohort"}"
domain: ${params.domain.toLowerCase()}
access: ${accessTier}
license: "${licenseStr.toLowerCase()}"
countries:
  - "${params.countryCode.toUpperCase()}"
taxon_ids:
  - ${params.taxonId || 0}
date_created: "${today}"
authors:
  - name: "${params.authorName || "Principal Investigator"}"
    affiliation: "${params.authorAffiliation || params.institution || "Research Center"}"
provenance:
  country: "${params.countryCode.toUpperCase()}"
  collecting_institution: "${params.institution || "National Surveillance Lab"}"
  collection_date: "${params.collectionDate || today}"
  sample_type: "${params.sampleType || "Blood swab"}"
  host_tax_id: ${params.hostTaxonId || 0}
  host_species: "${params.hostSpecies || "Unknown host"}"
taxonomy:
  tax_id: ${params.taxonId || 0}
  scientific_name: "${params.scientificName || "Pathogen"}"
sequencing:
  platform: "${params.platform.toUpperCase()}"
  instrument_model: "${params.instrumentModel}"
  library_strategy: "${params.libraryStrategy.toUpperCase()}"
  library_source: "${params.librarySource.toUpperCase()}"
  library_selection: "${params.librarySelection.toUpperCase()}"
  library_layout: "${layoutLower}"
${nominalLengthLine}  demultiplexed: true
  libraries:
${librariesYaml}
---`;

  const markdownBody = `

# ${params.title || "Genomic Study"}

${params.description || "Genomic surveillance and pathogen sequencing cohort."}

## Biological Context

- **Pathogen**: ${params.scientificName || "Taxon"} (NCBI Taxon ID: \`${params.taxonId}\`)
- **Host**: ${params.hostSpecies || "N/A"}${params.hostTaxonId ? ` (NCBI Taxon ID: \`${params.hostTaxonId}\`)` : ""}
- **Geographic Provenance**: ${params.countryName} (\`${params.countryCode.toUpperCase()}\`) — African Union Member State
- **Collection Date**: ${params.collectionDate || today}
- **Specimen Source**: ${params.sampleType || "Swab / Blood specimen"}

## Sequencing Protocols

- **Platform**: ${params.platform}
- **Instrument Model**: ${params.instrumentModel}
- **Library Strategy**: ${params.libraryStrategy}
- **Library Layout**: ${params.libraryLayout} (${defaultRuns.length} declared run${defaultRuns.length === 1 ? "" : "s"})

## Sovereign Data Governance & Ethics

Biological materials and digital sequence information (DSI) originate from **${params.countryName}** and conform to national Prior Informed Consent (PIC) and Mutually Agreed Terms (MAT) pursuant to the Nagoya Protocol and African Union sovereign genomic frameworks. Human genomic data (NCBI Taxon ID 9606) is excluded.
`;

  return frontmatter + markdownBody;
}

/**
 * Generates canonical samples.tsv adhering strictly to the MIxS African schema.
 * Header: sample_id\ttaxon_id\tcountry\tcollection_date\tlat\tlon\tadmin1\thost\tisolation_source
 */
export function generateDatasetSamplesTsv(params: ReadmeGeneratorParams): string {
  const today = new Date().toISOString().split("T")[0] ?? "2026-10-22";
  const header = "sample_id\ttaxon_id\tcountry\tcollection_date\tlat\tlon\tadmin1\thost\tisolation_source";

  const defaultRuns =
    params.runs.length > 0
      ? params.runs
      : [
          {
            run_id: "RUN001",
            experiment_id: "EXP001",
            forward_read: "reads/sample1_R1.fastq.gz",
          },
        ];

  const uniqueSamples = new Map<string, SequencingRunEntry>();
  for (const r of defaultRuns) {
    const sid = r.experiment_id || r.run_id;
    if (!uniqueSamples.has(sid)) {
      uniqueSamples.set(sid, r);
    }
  }

  const rows = [header];
  for (const [sid] of uniqueSamples) {
    const cDate = params.collectionDate || today;
    const host = params.hostSpecies || "Homo sapiens";
    const source = params.sampleType || "clinical specimen";
    rows.push(`${sid}\t${params.taxonId}\t${params.countryCode.toUpperCase()}\t${cDate}\t\t\t\t${host}\t${source}`);
  }

  return rows.join("\n") + "\n";
}
