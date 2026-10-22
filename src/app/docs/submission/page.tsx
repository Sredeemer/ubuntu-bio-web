import React from "react";
import type { Metadata } from "next";
import { DocsLayout } from "../../../components/docs/DocsLayout";
import { DocsCopyButton } from "../../../components/docs/DocsCopyButton";
import { DocsCallout } from "../../../components/docs/DocsCallout";
import { DocsCodeBlock } from "../../../components/docs/DocsCodeBlock";
import { type TocItem } from "../../../components/docs/DocsRightRail";
import {
  UploadCloud,
  FileCheck2,
  ShieldCheck,
  ShieldAlert,
  Dna,
  Terminal,
  Check,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Dataset Submission & Schema Specification — UbuntuBio Docs",
  description:
    "Complete specification for submitting African genomic datasets to UbuntuBio via the 5-step Web UI Wizard or the ubio CLI.",
};

const TOC_ITEMS: TocItem[] = [
  { id: "overview", label: "Submission Overview", level: 2 },
  { id: "pathways", label: "Submission Pathways", level: 2 },
  { id: "schema-spec", label: "README.md YAML Schema", level: 2 },
  { id: "sequencing-block", label: "The sequencing: Block", level: 3 },
  { id: "two-way-parity", label: "Two-Way File Parity", level: 2 },
  { id: "sequence-sniffer", label: "Sequence Sniffer & Screening", level: 2 },
  { id: "sovereign-invariants", label: "Sovereign Invariants", level: 2 },
  { id: "cli-workflow", label: "CLI Step-by-Step Guide", level: 2 },
];

export default function DocsSubmissionPage() {
  return (
    <DocsLayout currentPath="/docs/submission" tocItems={TOC_ITEMS}>
      <div className="docs-content-body">
        {/* Breadcrumb Navigation */}
        <nav className="docs-breadcrumb" aria-label="Breadcrumb">
          <a href="/docs">Docs Home</a>
          <span>/</span>
          <span>Dataset Submission</span>
        </nav>

        {/* Title Header */}
        <div className="docs-header-title-row" id="overview">
          <div>
            <div className="docs-badge">Specification &amp; Guide</div>
            <h1 className="docs-page-title">Dataset Submission &amp; Schema Specification</h1>
          </div>
          <DocsCopyButton pageTitle="UbuntuBio Dataset Submission & Schema Specification" />
        </div>

        <p className="docs-page-lead">
          UbuntuBio uses a single source of truth for dataset metadata: canonical{" "}
          <code>README.md</code> YAML frontmatter versioned directly alongside sequence read files in
          Git and OpenXet content-addressed storage.
        </p>

        {/* Submission Pathways */}
        <section className="docs-section" id="pathways">
          <h2>Submission Pathways</h2>
          <p>
            Researchers and bioinformatics teams can submit and synchronize datasets through two
            standard pathways:
          </p>

          <div className="docs-pillars-grid">
            <div className="docs-pillar-item">
              <div className="docs-pillar-header">
                <UploadCloud size={16} className="docs-pillar-icon" />
                <h3 className="docs-pillar-title">Web UI Guided Wizard</h3>
              </div>
              <p className="docs-pillar-desc">
                An interactive 5-step visual wizard at{" "}
                <a href="/submit" className="text-green font-medium">
                  <code>/submit</code>
                </a>{" "}
                featuring real-time validation, client-side FASTQ sniffing, live frontmatter preview,
                and one-click repository creation.
              </p>
            </div>

            <div className="docs-pillar-item">
              <div className="docs-pillar-header">
                <Terminal size={16} className="docs-pillar-icon" />
                <h3 className="docs-pillar-title">Command-Line Interface</h3>
              </div>
              <p className="docs-pillar-desc">
                Automated terminal tools (<code>ubio init</code>, <code>ubio check</code>,{" "}
                <code>ubio push</code>) for scripting, cluster job pipelines, and headless laboratory
                sequencer integration.
              </p>
            </div>
          </div>
        </section>

        {/* Canonical README.md YAML Schema */}
        <section className="docs-section" id="schema-spec">
          <h2>Canonical README.md Frontmatter Specification</h2>
          <p>
            Every dataset repository must contain a root <code>README.md</code> whose YAML
            frontmatter conforms to the UbuntuBio schema. Disparate configuration files (such as
            separate <code>ubuntubio.json</code> manifests) are not used.
          </p>

          <DocsCodeBlock
            title="README.md (Canonical Template)"
            language="yaml"
            code={`---
title: "Mpox Clade IIb Genomic Surveillance in Rivers State"
domain: virus
accession: ""
version: "1.0.0"
date_created: "2026-10-22"
license: CC-BY-4.0
authors:
  - name: "Dr. Amara Okafor"
    affiliation: "ACEGID, Redeemer's University"
    orcid: "0000-0002-1825-0097"
provenance:
  country: "NG"
  collecting_institution: "Rivers State Ministry of Health"
  collection_date: "2026-03-15"
  sample_type: "Lesion swab"
  host_tax_id: 10090
  host_species: "Mastomys natalensis"
  isolate: "MPXV-NG-2026-001"
taxonomy:
  tax_id: 10244
  scientific_name: "Monkeypox virus"
  lineage: "Clade IIb"
sequencing:
  platform: "ILLUMINA"
  instrument_model: "Illumina NovaSeq 6000"
  library_strategy: "WGS"
  library_source: "VIRAL_RNA"
  library_selection: "PCR"
  library_layout: "PAIRED"
  runs:
    - run_id: "RUN001"
      experiment_id: "EXP001"
      flowcell_id: "H7VNWDRXX"
      lane: 1
      forward_read: "reads/sample1_R1.fastq.gz"
      reverse_read: "reads/sample1_R2.fastq.gz"
      read_count: 1450000
      base_count: 217500000
      checksum_sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
---

# Mpox Clade IIb Genomic Surveillance in Rivers State

Surveillance cohort investigating genomic epidemiology and transmission dynamics.

## Biological Context
- **Pathogen**: Monkeypox virus (NCBI Taxon ID: 10244)
- **Geographic Provenance**: Nigeria (NG) — African Union Member State
- **Collection Date**: 2026-03-15
- **Specimen Source**: Lesion swab`}
          />
        </section>

        {/* The sequencing: Block */}
        <section className="docs-section" id="sequencing-block">
          <h3>The sequencing: Block Breakdown</h3>
          <p>
            The <code>sequencing:</code> block structures instrument, library, and run metadata
            analogous to NCBI SRA / ENA specifications:
          </p>

          <table className="docs-table">
            <thead>
              <tr>
                <th>Field</th>
                <th>Type</th>
                <th>Controlled Values</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>platform</code></td>
                <td>String</td>
                <td><code>ILLUMINA</code>, <code>OXFORD_NANOPORE</code>, <code>PACBIO</code>, <code>MGI</code>, <code>ION_TORRENT</code></td>
                <td>Sequencing hardware technology family.</td>
              </tr>
              <tr>
                <td><code>instrument_model</code></td>
                <td>String</td>
                <td>e.g. <code>Illumina NovaSeq 6000</code>, <code>GridION</code>, <code>PacBio Revio</code></td>
                <td>Exact instrument hardware model.</td>
              </tr>
              <tr>
                <td><code>library_strategy</code></td>
                <td>String</td>
                <td><code>WGS</code>, <code>AMPLICON</code>, <code>TARGETED-CAPTURE</code>, <code>RNA-SEQ</code>, <code>METAGENOMIC</code></td>
                <td>Sequencing assay methodology.</td>
              </tr>
              <tr>
                <td><code>library_source</code></td>
                <td>String</td>
                <td><code>VIRAL_RNA</code>, <code>GENOMIC</code>, <code>METAGENOMIC</code>, <code>TRANSCRIPTOMIC</code></td>
                <td>Source biological material type.</td>
              </tr>
              <tr>
                <td><code>library_selection</code></td>
                <td>String</td>
                <td><code>PCR</code>, <code>RANDOM</code>, <code>HYBRID_SELECTION</code>, <code>UNSELECTED</code></td>
                <td>Enrichment or selection method.</td>
              </tr>
              <tr>
                <td><code>library_layout</code></td>
                <td>String</td>
                <td><code>PAIRED</code>, <code>SINGLE</code></td>
                <td>Specifies whether runs require reverse reads (R2).</td>
              </tr>
              <tr>
                <td><code>runs</code></td>
                <td>List</td>
                <td>List of run mapping records</td>
                <td>Declared sequencing runs and file paths.</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Two-Way File Parity */}
        <section className="docs-section" id="two-way-parity">
          <h2>Two-Way File Parity Invariant</h2>
          <p>
            To prevent orphaned files and broken references, UbuntuBio enforces strict two-way parity
            between frontmatter declarations and the physical file tree:
          </p>

          <div className="docs-rules-grid">
            <div className="docs-rule-card">
              <span className="rule-badge rule-req">Invariant 1</span>
              <h4>Declared Files Must Exist</h4>
              <p>
                Every <code>forward_read</code> and <code>reverse_read</code> declared in the{" "}
                <code>sequencing.runs</code> list must exist on disk and possess a non-zero byte size.
              </p>
            </div>

            <div className="docs-rule-card">
              <span className="rule-badge rule-req">Invariant 2</span>
              <h4>Disk Files Must Be Declared</h4>
              <p>
                Every sequence read file (<code>.fastq</code>, <code>.fq</code>, <code>.fastq.gz</code>,{" "}
                <code>.fasta</code>, <code>.bam</code>) located in the repository must be explicitly
                declared in <code>sequencing.runs</code>.
              </p>
            </div>
          </div>
        </section>

        {/* Sequence Sniffer & Screening */}
        <section className="docs-section" id="sequence-sniffer">
          <h2>Sequence Sniffer &amp; Biological Sanity Screening</h2>
          <p>
            Metadata validation alone is insufficient. Both the <code>ubio</code> CLI (during{" "}
            <code>ubio check</code>) and server pre-receive git hooks run the streaming sequence
            sniffer to verify data integrity:
          </p>

          <ul className="docs-checklist">
            <li>
              <strong>Magic Byte Verification</strong>: Verifies Gzip headers (<code>0x1F 0x8B</code>),
              BAM (<code>BAM\1</code>), and CRAM files before decompression.
            </li>
            <li>
              <strong>4-Line FASTQ Synchronization</strong>: Inspects records to ensure sequence length
              and quality string length match exactly.
            </li>
            <li>
              <strong>Phred Encoding Detection</strong>: Inspects ASCII quality character ranges to
              distinguish standard <strong>Phred+33</strong> (Sanger / Illumina 1.8+) from legacy{" "}
              <strong>Phred+64</strong> (Illumina 1.3/1.5).
            </li>
            <li>
              <strong>Biological Quality Profiling</strong>: Computes mean read length, GC content
              percentage, and unknown base degradation (<code>N%</code>).
            </li>
            <li>
              <strong>Strict Non-Human Screening</strong>: Screens sequence contig headers and evaluates
              canonical human 25-mer rRNA and mtDNA signatures to alert researchers of accidental host
              clinical contamination before network transfer.
            </li>
          </ul>
        </section>

        {/* Sovereign Invariants */}
        <section className="docs-section" id="sovereign-invariants">
          <h2>Sovereign Invariants</h2>

          <DocsCallout type="warning" title="Strict Prohibition: NCBI Taxon ID 9606">
            <p>
              Human genomic data (Taxon ID 9606 / <em>Homo sapiens</em>) is strictly prohibited in
              UbuntuBio v1. Any dataset declaring human taxonomy or containing human genomic sequences
              is automatically rejected at commit time.
            </p>
          </DocsCallout>

          <DocsCallout type="tip" title="African Union 54 Member States">
            <p>
              Datasets must declare geographical origin from one of the 54 recognized African Union
              member states (ISO-3166-1 alpha-2). The repository must conform to the Nagoya Protocol
              on Access and Benefit Sharing (ABS).
            </p>
          </DocsCallout>
        </section>

        {/* CLI Step-by-Step Guide */}
        <section className="docs-section" id="cli-workflow">
          <h2>CLI Step-by-Step Submission Guide</h2>

          <h3 className="docs-step-heading">
            <span className="docs-step-number">1</span>
            <span>Initialize &amp; Scaffold Dataset</span>
          </h3>
          <p>
            Run <code>ubio init</code> in your sequencing directory. The CLI will detect local FASTQ
            files and interactively scaffold a valid <code>README.md</code>:
          </p>
          <DocsCodeBlock
            title="Terminal"
            language="bash"
            code={`ubio init pasteur-dakar/cholera-2026 --domain bacteria --country SN`}
          />

          <h3 className="docs-step-heading">
            <span className="docs-step-number">2</span>
            <span>Verify Locally With ubio check</span>
          </h3>
          <p>
            Run <code>ubio check</code> to inspect YAML frontmatter schema, two-way file parity, and
            stream sequence files through the biological sniffer:
          </p>
          <DocsCodeBlock
            title="Terminal"
            language="bash"
            code={`ubio check .`}
          />

          <h3 className="docs-step-heading">
            <span className="docs-step-number">3</span>
            <span>Push Dataset to UbuntuBio Hub</span>
          </h3>
          <p>
            Once validation passes with zero errors, push the dataset to OpenXet CAS:
          </p>
          <DocsCodeBlock
            title="Terminal"
            language="bash"
            code={`ubio push pasteur-dakar/cholera-2026 . --message "Initial verified release"`}
          />
        </section>
      </div>
    </DocsLayout>
  );
}
