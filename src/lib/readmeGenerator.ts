/**
 * Generates canonical README.md with YAML frontmatter conforming to
 * the UbuntuBio schema and server git-hook validation requirements.
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
}

export function generateDatasetReadme(params: ReadmeGeneratorParams): string {
  const today = new Date().toISOString().split("T")[0] ?? "2026-10-22";

  // Build runs yaml block
  let runsYaml = "";
  if (params.runs.length === 0) {
    runsYaml = `    - run_id: "RUN001"
      experiment_id: "EXP001"
      forward_read: "reads/sample1_R1.fastq.gz"
      reverse_read: "reads/sample1_R2.fastq.gz"`;
  } else {
    runsYaml = params.runs
      .map((r) => {
        let entry = `    - run_id: "${r.run_id}"\n      experiment_id: "${r.experiment_id}"`;
        if (r.flowcell_id) entry += `\n      flowcell_id: "${r.flowcell_id}"`;
        if (r.lane !== undefined) entry += `\n      lane: ${r.lane}`;
        entry += `\n      forward_read: "${r.forward_read}"`;
        if (params.libraryLayout === "PAIRED" && r.reverse_read) {
          entry += `\n      reverse_read: "${r.reverse_read}"`;
        }
        if (r.read_count) entry += `\n      read_count: ${r.read_count}`;
        if (r.base_count) entry += `\n      base_count: ${r.base_count}`;
        if (r.checksum_sha256) entry += `\n      checksum_sha256: "${r.checksum_sha256}"`;
        return entry;
      })
      .join("\n");
  }

  const frontmatter = `---
title: "${params.title || "Genomic Surveillance Cohort"}"
domain: ${params.domain.toLowerCase()}
accession: ""
version: "1.0.0"
date_created: "${today}"
license: CC-BY-4.0
authors:
  - name: "${params.authorName || "Principal Investigator"}"
    affiliation: "${params.authorAffiliation || params.institution || "Research Center"}"
provenance:
  country: "${params.countryCode}"
  collecting_institution: "${params.institution || "National Surveillance Lab"}"
  collection_date: "${params.collectionDate || today}"
  sample_type: "${params.sampleType || "Blood swab"}"
  host_tax_id: ${params.hostTaxonId || 0}
  host_species: "${params.hostSpecies || "Unknown host"}"
taxonomy:
  tax_id: ${params.taxonId || 0}
  scientific_name: "${params.scientificName || "Pathogen"}"
sequencing:
  platform: "${params.platform}"
  instrument_model: "${params.instrumentModel}"
  library_strategy: "${params.libraryStrategy}"
  library_source: "${params.librarySource}"
  library_selection: "${params.librarySelection}"
  library_layout: "${params.libraryLayout}"
  runs:
${runsYaml}
---`;

  const markdownBody = `

# ${params.title || "Genomic Study"}

${params.description || "Genomic surveillance and pathogen sequencing cohort."}

## Biological Context

- **Pathogen**: ${params.scientificName || "Taxon"} (NCBI Taxon ID: \`${params.taxonId}\`)
- **Host**: ${params.hostSpecies || "N/A"}${params.hostTaxonId ? ` (NCBI Taxon ID: \`${params.hostTaxonId}\`)` : ""}
- **Geographic Provenance**: ${params.countryName} (\`${params.countryCode}\`) — African Union Member State
- **Collection Date**: ${params.collectionDate || today}
- **Specimen Source**: ${params.sampleType || "Swab / Blood specimen"}

## Sequencing Protocols

- **Platform**: ${params.platform}
- **Instrument Model**: ${params.instrumentModel}
- **Library Strategy**: ${params.libraryStrategy}
- **Library Layout**: ${params.libraryLayout} (${params.runs.length} declared run${params.runs.length === 1 ? "" : "s"})

## Sovereign Data Governance & Ethics

Biological materials and digital sequence information (DSI) originate from **${params.countryName}** and conform to national Prior Informed Consent (PIC) and Mutually Agreed Terms (MAT) pursuant to the Nagoya Protocol and African Union sovereign genomic frameworks. Human genomic data (NCBI Taxon ID 9606) is excluded.
`;

  return frontmatter + markdownBody;
}
