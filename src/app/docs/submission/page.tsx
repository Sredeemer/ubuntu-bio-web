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
  ExternalLink,
  FolderTree,
  FileText,
  Sparkles,
  Database,
  Layers,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Dataset Submission & Schema Specification — UbuntuBio Docs",
  description:
    "Complete walkthrough tutorial and specification for submitting African genomic datasets via the 5-step Web UI Wizard or the ubio CLI.",
};

const TOC_ITEMS: TocItem[] = [
  { id: "overview", label: "Submission Overview", level: 2 },
  { id: "pathways", label: "Submission Pathways", level: 2 },
  { id: "walkthrough-ui", label: "Tutorial: Web UI Wizard", level: 2 },
  { id: "walkthrough-cli", label: "Tutorial: Terminal CLI", level: 2 },
  { id: "schema-spec", label: "README.md YAML Schema", level: 2 },
  { id: "sequencing-block", label: "The sequencing: Block", level: 3 },
  { id: "two-way-parity", label: "Two-Way File Parity", level: 2 },
  { id: "sequence-sniffer", label: "Sequence Sniffer & Screening", level: 2 },
  { id: "sovereign-invariants", label: "Sovereign Invariants", level: 2 },
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
            <div className="docs-badge">Step-by-Step Tutorials &amp; Schema</div>
            <h1 className="docs-page-title">Dataset Submission &amp; Schema Specification</h1>
          </div>
          <DocsCopyButton pageTitle="UbuntuBio Dataset Submission & Schema Specification" />
        </div>

        <p className="docs-page-lead">
          UbuntuBio provides two official submission pathways to publish sovereign African genomic
          datasets: an interactive <strong>5-step Web UI Wizard</strong> for bench scientists and a{" "}
          <strong>Terminal CLI (<code>ubio</code>)</strong> for automated sequencer pipelines.
        </p>

        {/* Submission Pathways Fast-Jumper */}
        <section className="docs-section" id="pathways">
          <h2>Choose Your Submission Pathway</h2>
          <p>
            Both pathways enforce identical schema validation, non-human safety checks, and two-way
            file parity invariants:
          </p>

          <div className="docs-walkthrough-nav">
            <a href="#walkthrough-ui" className="docs-pathway-card">
              <div>
                <span className="docs-pathway-badge">
                  <UploadCloud size={14} /> Pathway A &bull; Browser
                </span>
                <h3 className="docs-pathway-title">5-Step Web UI Wizard</h3>
                <p className="docs-pathway-desc">
                  Zero local installation required. Drag-and-drop raw reads with client-side FASTQ
                  sniffing, instant frontmatter generation, and 1-click publishing at <code>/submit</code>.
                </p>
              </div>
              <span className="docs-pathway-action">
                Start Web UI Tutorial <ArrowRight size={14} />
              </span>
            </a>

            <a href="#walkthrough-cli" className="docs-pathway-card">
              <div>
                <span className="docs-pathway-badge">
                  <Terminal size={14} /> Pathway B &bull; Terminal
                </span>
                <h3 className="docs-pathway-title">Terminal CLI Workflow (<code>ubio</code>)</h3>
                <p className="docs-pathway-desc">
                  Scriptable Python CLI for cluster pipelines (Nextflow/Snakemake), headless lab
                  nodes, and automated high-throughput data sync directly from sequencer outputs.
                </p>
              </div>
              <span className="docs-pathway-action">
                Start CLI Tutorial <ArrowRight size={14} />
              </span>
            </a>
          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* TUTORIAL A: WEB UI 5-STEP WIZARD */}
        {/* ------------------------------------------------------------- */}
        <section className="docs-section" id="walkthrough-ui">
          <div className="docs-badge">Walkthrough Tutorial A</div>
          <h2>Step-by-Step Guide: Submitting via the Web UI Wizard</h2>
          <p>
            The Web UI submission wizard at{" "}
            <a href="/submit" className="text-green font-medium">
              <code>/submit</code>
            </a>{" "}
            walks you through five visual steps to register your dataset. It performs zero-upload
            client-side biological sequence inspection in your browser before transmitting any data.
          </p>

          {/* Wizard Step 1 */}
          <div className="docs-walkthrough-card">
            <div className="docs-walkthrough-header">
              <div className="docs-walkthrough-title-wrap">
                <span className="docs-step-pill green">Step 01</span>
                <h4>Identification &amp; Project Metadata</h4>
              </div>
              <span className="docs-tag">Project Scaffolding</span>
            </div>
            <p>
              Define your repository namespace, machine-readable dataset identifier (slug), human-readable title,
              and research institute context:
            </p>
            <table className="docs-fields-table">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Description</th>
                  <th>Example Input</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>Namespace</code></td>
                  <td>Your personal username or registered African laboratory team slug.</td>
                  <td><code>pasteur-dakar</code> or <code>amara-okafor</code></td>
                </tr>
                <tr>
                  <td><code>Dataset Slug</code></td>
                  <td>URL-safe identifier using lowercase alphanumeric characters and hyphens.</td>
                  <td><code>malawi-amr-ecoli</code></td>
                </tr>
                <tr>
                  <td><code>Dataset Title</code></td>
                  <td>Full descriptive research title displayed on the hub and search index.</td>
                  <td><code>Whole Genome AMR Surveillance of Clinical E. coli in Lilongwe</code></td>
                </tr>
                <tr>
                  <td><code>Lead Institution</code></td>
                  <td>Primary African research organization or university conducting the study.</td>
                  <td><code>Malawi-Liverpool-Wellcome Trust / KUHeS</code></td>
                </tr>
                <tr>
                  <td><code>Description</code></td>
                  <td>Surveillance abstract detailing study aims, pathogen epidemiology, and context.</td>
                  <td><code>Genomic epidemiology investigating ESBL plasmid transfer...</code></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Wizard Step 2 */}
          <div className="docs-walkthrough-card">
            <div className="docs-walkthrough-header">
              <div className="docs-walkthrough-title-wrap">
                <span className="docs-step-pill green">Step 02</span>
                <h4>Taxonomy &amp; Non-Human Biological Verification</h4>
              </div>
              <span className="docs-tag">Safety Screening</span>
            </div>
            <p>
              Specify the target biological organism. UbuntuBio enforces strict sovereignty and safety controls:
            </p>
            <table className="docs-fields-table">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Description</th>
                  <th>Example Input</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>Pathogen Type</code></td>
                  <td>Select Virus, Bacteria, Fungus, or Vector.</td>
                  <td><code>Bacteria</code></td>
                </tr>
                <tr>
                  <td><code>NCBI Taxon ID</code></td>
                  <td>Standard NCBI taxonomy numerical identifier.</td>
                  <td><code>562</code> (for <em>Escherichia coli</em>)</td>
                </tr>
                <tr>
                  <td><code>Scientific Name</code></td>
                  <td>Canonical scientific species name.</td>
                  <td><code>Escherichia coli</code></td>
                </tr>
                <tr>
                  <td><code>Host Species &amp; ID</code></td>
                  <td>Source host from which the sample was isolated (optional host provenance).</td>
                  <td><code>Homo sapiens</code> (Taxon <code>9606</code>) or <code>Mastomys natalensis</code></td>
                </tr>
                <tr>
                  <td><code>Sample Type</code></td>
                  <td>Clinical specimen or environmental isolate source.</td>
                  <td><code>Urine specimen</code> or <code>Blood culture</code></td>
                </tr>
              </tbody>
            </table>

            <DocsCallout type="warning" title="Non-Negotiable Rule: Prohibited Human Taxon ID (9606)">
              <p>
                Human genomic sequencing data (NCBI Taxon ID <code>9606</code>) as the target dataset
                is strictly prohibited in UbuntuBio v1. The wizard actively validates this and will block
                progression if <code>9606</code> is entered as the target organism taxon ID.
              </p>
            </DocsCallout>
          </div>

          {/* Wizard Step 3 */}
          <div className="docs-walkthrough-card">
            <div className="docs-walkthrough-header">
              <div className="docs-walkthrough-title-wrap">
                <span className="docs-step-pill green">Step 03</span>
                <h4>Sequencing Technology &amp; Sovereign Specifications</h4>
              </div>
              <span className="docs-tag">Hardware &amp; AU Governance</span>
            </div>
            <p>
              Declare the sequencing hardware, library preparation assay, and geographic origin under the
              Nagoya Protocol on Access and Benefit Sharing (ABS):
            </p>
            <table className="docs-fields-table">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Options</th>
                  <th>Example Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>AU Member State</code></td>
                  <td>1 of the 54 recognized African Union member states (ISO-3166-1 alpha-2).</td>
                  <td><code>MW</code> (Malawi) or <code>NG</code> (Nigeria)</td>
                </tr>
                <tr>
                  <td><code>Platform</code></td>
                  <td><code>ILLUMINA</code>, <code>OXFORD_NANOPORE</code>, <code>PACBIO</code>, <code>MGI</code></td>
                  <td><code>ILLUMINA</code></td>
                </tr>
                <tr>
                  <td><code>Instrument Model</code></td>
                  <td>Exact sequencer model name.</td>
                  <td><code>Illumina NovaSeq 6000</code></td>
                </tr>
                <tr>
                  <td><code>Library Layout</code></td>
                  <td><code>PAIRED</code> (forward and reverse reads) or <code>SINGLE</code>.</td>
                  <td><code>PAIRED</code></td>
                </tr>
                <tr>
                  <td><code>Library Strategy</code></td>
                  <td><code>WGS</code>, <code>AMPLICON</code>, <code>TARGETED-CAPTURE</code>, <code>RNA-SEQ</code></td>
                  <td><code>WGS</code></td>
                </tr>
                <tr>
                  <td><code>Biosafety Level</code></td>
                  <td>Biocontainment rating (<code>BSL-1</code>, <code>BSL-2</code>, <code>BSL-3</code>).</td>
                  <td><code>BSL-2</code></td>
                </tr>
              </tbody>
            </table>
            <p className="text-sm text-slate-500">
              You must also check the <strong>Nagoya Protocol ABS Acknowledgment</strong> confirming
              prior informed consent and legal compliance with national sovereign biodata policies.
            </p>
          </div>

          {/* Wizard Step 4 */}
          <div className="docs-walkthrough-card">
            <div className="docs-walkthrough-header">
              <div className="docs-walkthrough-title-wrap">
                <span className="docs-step-pill green">Step 04</span>
                <h4>Sequencing Runs &amp; In-Browser File Sniffing</h4>
              </div>
              <span className="docs-tag">Zero-Network Client Sniffer</span>
            </div>
            <p>
              In Step 4, declare your run records (Run ID, Flowcell ID, Lane) and drag your raw reads
              (<code>.fastq.gz</code> or <code>.fasta.gz</code>) directly into the interactive dropzone.
            </p>
            <DocsCallout type="tip" title="How Client-Side Sniffing Protects Your Bandwidth">
              <p>
                Before transmitting large gigabyte files, the browser uses a Web Streams decompression
                pipeline to read the first 64 KB locally. It parses the four-line FASTQ structure, verifies
                Phred+33 ASCII quality score integrity, samples read lengths, computes SHA-256 checksums,
                and validates that R1 and R2 filenames match your declared run layout.
              </p>
            </DocsCallout>
          </div>

          {/* Wizard Step 5 */}
          <div className="docs-walkthrough-card">
            <div className="docs-walkthrough-header">
              <div className="docs-walkthrough-title-wrap">
                <span className="docs-step-pill green">Step 05</span>
                <h4>Review, Ingestion &amp; Live Repository Publication</h4>
              </div>
              <span className="docs-tag">One-Click Publish</span>
            </div>
            <p>
              Review the live generated <code>README.md</code> YAML frontmatter and <code>samples.tsv</code>{" "}
              manifest side-by-side. When ready, click <strong>Ingest Dataset</strong>:
            </p>
            <ul className="docs-check-list">
              <li className="docs-check-item">
                <Check size={16} className="docs-check-icon" />
                <span>
                  The backend registers the repository in the Git tree and OpenXet content-addressed CAS store.
                </span>
              </li>
              <li className="docs-check-item">
                <Check size={16} className="docs-check-icon" />
                <span>
                  Meilisearch indexes biological taxonomy, country tags, and gene references in under 50ms.
                </span>
              </li>
              <li className="docs-check-item">
                <Check size={16} className="docs-check-icon" />
                <span>
                  You are instantly redirected to your live dataset repository page (e.g.{" "}
                  <code>/datasets/pasteur-dakar/malawi-amr-ecoli</code>) where your interactive file tree
                  and direct download buttons are immediately accessible.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* TUTORIAL B: TERMINAL CLI (ubio) */}
        {/* ------------------------------------------------------------- */}
        <section className="docs-section" id="walkthrough-cli">
          <div className="docs-badge">Walkthrough Tutorial B</div>
          <h2>Step-by-Step Guide: Submitting via the Terminal CLI (<code>ubio</code>)</h2>
          <p>
            The official <code>ubio</code> CLI tool is optimized for command-line users, HPC compute nodes,
            and automated lab sequencer drops. Follow this complete end-to-end tutorial to submit your
            first dataset from your terminal.
          </p>

          {/* CLI Step 1 */}
          <div className="docs-walkthrough-card">
            <div className="docs-walkthrough-header">
              <div className="docs-walkthrough-title-wrap">
                <span className="docs-step-pill green">Step 01</span>
                <h4>Install &amp; Authenticate the CLI</h4>
              </div>
              <span className="docs-tag">Setup &amp; Keys</span>
            </div>
            <p>
              Install <code>ubuntu-bio</code> via <code>pip</code> and authenticate with your user or
              machine token:
            </p>
            <DocsCodeBlock
              title="Terminal — Installation & Authentication"
              language="bash"
              code={`# 1. Install the official Python package
pip install ubuntu-bio

# 2. Authenticate using your interactive browser or API token
ubio login

# Alternatively, set your token via environment variable:
export UBIO_TOKEN="ubio_live_abcdef1234567890"

# 3. Confirm your authenticated profile
ubio whoami`}
            />
            <div className="docs-terminal-output">
              <span className="term-dim">$ ubio whoami</span>
              <br />
              <span className="term-ok">✓ Authenticated as:</span> Dr. Amara Okafor (<code>amara-okafor</code>)
              <br />
              <span className="term-info">Affiliation:</span> ACEGID, Redeemer&apos;s University
              <br />
              <span className="term-info">Namespaces:</span> amara-okafor, acegid, pasteur-dakar
            </div>
          </div>

          {/* CLI Step 2 */}
          <div className="docs-walkthrough-card">
            <div className="docs-walkthrough-header">
              <div className="docs-walkthrough-title-wrap">
                <span className="docs-step-pill green">Step 02</span>
                <h4>Organize Your Local Sequencing Directory</h4>
              </div>
              <span className="docs-tag">File System Layout</span>
            </div>
            <p>
              Place your paired or single-end sequencing reads under a local directory. We recommend placing
              raw read files in a <code>reads/</code> subdirectory:
            </p>
            <DocsCodeBlock
              title="Directory Hierarchy"
              language="text"
              code={`malawi-amr-ecoli/
└── reads/
    ├── sample01_R1.fastq.gz
    └── sample01_R2.fastq.gz`}
            />
            <p className="text-sm text-slate-500">
              Raw sequencing files must be compressed (<code>.fastq.gz</code> or <code>.fasta.gz</code>).
              Do not decompress files before upload; content-addressed chunking handles compressed files directly.
            </p>
          </div>

          {/* CLI Step 3 */}
          <div className="docs-walkthrough-card">
            <div className="docs-walkthrough-header">
              <div className="docs-walkthrough-title-wrap">
                <span className="docs-step-pill green">Step 03</span>
                <h4>Scaffold Metadata with <code>ubio init</code></h4>
              </div>
              <span className="docs-tag">README Scaffolding</span>
            </div>
            <p>
              Run <code>ubio init</code> inside your dataset directory. The CLI will inspect your local files,
              pair <code>_R1</code> and <code>_R2</code> reads, and generate a valid <code>README.md</code>:
            </p>
            <DocsCodeBlock
              title="Terminal — Scaffolding"
              language="bash"
              code={`# Change into your dataset directory
cd malawi-amr-ecoli

# Scaffold README.md with sovereign metadata flags
ubio init pasteur-dakar/malawi-amr-ecoli \\
  --domain bacteria \\
  --taxon-id 562 \\
  --organism "Escherichia coli" \\
  --country MW \\
  --platform ILLUMINA \\
  --instrument "Illumina NovaSeq 6000" \\
  --layout PAIRED`}
            />
            <p>
              <code>ubio init</code> scans <code>reads/</code>, pairs the FASTQ files, writes the YAML
              frontmatter, and generates a markdown template ready for study context.
            </p>
          </div>

          {/* CLI Step 4 */}
          <div className="docs-walkthrough-card">
            <div className="docs-walkthrough-header">
              <div className="docs-walkthrough-title-wrap">
                <span className="docs-step-pill green">Step 04</span>
                <h4>Run Local Pre-Flight Check with <code>ubio check</code></h4>
              </div>
              <span className="docs-tag">Pre-Flight Invariants</span>
            </div>
            <p>
              Before uploading any data, run <code>ubio check</code>. This executes all server-side validation
              rules on your local machine:
            </p>
            <DocsCodeBlock
              title="Terminal — Local Pre-Flight Check"
              language="bash"
              code={`ubio check .`}
            />
            <div className="docs-terminal-output">
              <span className="term-dim">$ ubio check .</span>
              <br />
              <span className="term-ok">[✓]</span> Validating README.md YAML schema... <span className="term-ok">OK</span>
              <br />
              <span className="term-ok">[✓]</span> Checking AU Member State (&apos;MW&apos;)... <span className="term-ok">OK (Malawi)</span>
              <br />
              <span className="term-ok">[✓]</span> Human Genomic Exclusion Check (Taxon 562 != 9606)... <span className="term-ok">OK</span>
              <br />
              <span className="term-ok">[✓]</span> Checking Two-Way File Parity (2 declared, 2 on disk)... <span className="term-ok">OK</span>
              <br />
              <span className="term-ok">[✓]</span> Streaming Biological Sniffer (reads/sample01_R1.fastq.gz)... <span className="term-ok">FASTQ (Phred+33, 150bp)</span>
              <br />
              <span className="term-ok">[✓]</span> Streaming Biological Sniffer (reads/sample01_R2.fastq.gz)... <span className="term-ok">FASTQ (Phred+33, 150bp)</span>
              <br />
              <span className="term-ok">Pre-flight verification passed! Ready for push to UbuntuBio Hub.</span>
            </div>
          </div>

          {/* CLI Step 5 */}
          <div className="docs-walkthrough-card">
            <div className="docs-walkthrough-header">
              <div className="docs-walkthrough-title-wrap">
                <span className="docs-step-pill green">Step 05</span>
                <h4>Push &amp; Ingest to UbuntuBio Hub with <code>ubio push</code></h4>
              </div>
              <span className="docs-tag">CAS Push &amp; Ingestion</span>
            </div>
            <p>
              Push your dataset to the Hub. <code>ubio push</code> splits files into content-addressed chunks,
              deduplicates data, and creates an immutable Git commit:
            </p>
            <DocsCodeBlock
              title="Terminal — Uploading & Ingesting"
              language="bash"
              code={`ubio push pasteur-dakar/malawi-amr-ecoli . --message "Initial African E. coli AMR surveillance cohort"`}
            />
            <div className="docs-terminal-output">
              <span className="term-dim">$ ubio push pasteur-dakar/malawi-amr-ecoli . --message &quot;Initial African E. coli AMR cohort&quot;</span>
              <br />
              <span className="term-info">Scanning repository tree:</span> 3 files detected (1 README.md, 2 reads)
              <br />
              <span className="term-info">Chunking with OpenXet CAS:</span> [====================] 100% (2 chunks)
              <br />
              <span className="term-ok">✓ Upload complete:</span> 2 chunks pushed to OpenXet CAS
              <br />
              <span className="term-ok">✓ Commit created:</span> 7e3f892 &quot;Initial African E. coli AMR surveillance cohort&quot;
              <br />
              <span className="term-ok">✓ Repository live at:</span> https://ubuntu-bio-web.vercel.app/datasets/pasteur-dakar/malawi-amr-ecoli
            </div>
          </div>

          {/* CLI Step 6 */}
          <div className="docs-walkthrough-card">
            <div className="docs-walkthrough-header">
              <div className="docs-walkthrough-title-wrap">
                <span className="docs-step-pill green">Step 06</span>
                <h4>Verify on the Hub &amp; Explore in Browser</h4>
              </div>
              <span className="docs-tag">Search &amp; Access</span>
            </div>
            <p>
              Your dataset is now immediately queryable via full-text search and browseable in the web portal:
            </p>
            <DocsCodeBlock
              title="Terminal — Verification & Search"
              language="bash"
              code={`# Search for your newly indexed dataset
ubio search "Malawi AMR E. coli"`}
            />
            <p>
              Or open{" "}
              <a
                href="/datasets/pasteur-dakar/malawi-amr-ecoli"
                target="_blank"
                rel="noreferrer"
                className="text-green font-medium"
              >
                <code>https://ubuntu-bio-web.vercel.app/datasets/pasteur-dakar/malawi-amr-ecoli</code>
              </a>{" "}
              in your browser to view the interactive file tree, download files, and explore genomic annotations.
            </p>
          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* CANONICAL README.md YAML SCHEMA SPECIFICATION */}
        {/* ------------------------------------------------------------- */}
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
                <td><span className="docs-type-badge">String</span></td>
                <td>
                  <div className="docs-table-chip-list">
                    <code>ILLUMINA</code>
                    <code>OXFORD_NANOPORE</code>
                    <code>PACBIO</code>
                    <code>MGI</code>
                    <code>ION_TORRENT</code>
                  </div>
                </td>
                <td>Sequencing hardware technology family.</td>
              </tr>
              <tr>
                <td><code>instrument_model</code></td>
                <td><span className="docs-type-badge">String</span></td>
                <td>
                  <div className="docs-table-chip-list">
                    <code>Illumina NovaSeq 6000</code>
                    <code>GridION</code>
                    <code>PacBio Revio</code>
                    <code>DNBSEQ-T7</code>
                  </div>
                </td>
                <td>Exact instrument hardware model.</td>
              </tr>
              <tr>
                <td><code>library_strategy</code></td>
                <td><span className="docs-type-badge">String</span></td>
                <td>
                  <div className="docs-table-chip-list">
                    <code>WGS</code>
                    <code>AMPLICON</code>
                    <code>TARGETED-CAPTURE</code>
                    <code>RNA-SEQ</code>
                    <code>METAGENOMIC</code>
                  </div>
                </td>
                <td>Sequencing assay methodology.</td>
              </tr>
              <tr>
                <td><code>library_source</code></td>
                <td><span className="docs-type-badge">String</span></td>
                <td>
                  <div className="docs-table-chip-list">
                    <code>VIRAL_RNA</code>
                    <code>GENOMIC</code>
                    <code>METAGENOMIC</code>
                    <code>TRANSCRIPTOMIC</code>
                  </div>
                </td>
                <td>Source biological material type.</td>
              </tr>
              <tr>
                <td><code>library_selection</code></td>
                <td><span className="docs-type-badge">String</span></td>
                <td>
                  <div className="docs-table-chip-list">
                    <code>PCR</code>
                    <code>RANDOM</code>
                    <code>HYBRID_SELECTION</code>
                    <code>UNSELECTED</code>
                  </div>
                </td>
                <td>Enrichment or selection method.</td>
              </tr>
              <tr>
                <td><code>library_layout</code></td>
                <td><span className="docs-type-badge">String</span></td>
                <td>
                  <div className="docs-table-chip-list">
                    <code>PAIRED</code>
                    <code>SINGLE</code>
                  </div>
                </td>
                <td>Specifies whether runs require reverse reads (R2).</td>
              </tr>
              <tr>
                <td><code>runs</code></td>
                <td><span className="docs-type-badge">List</span></td>
                <td>List of declared run mapping records</td>
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

        {/* Next Steps & Related Documentation */}
        <section className="docs-section" id="next-steps">
          <h2>Next Steps &amp; Related Documentation</h2>
          <div className="docs-next-links">
            <a href="/docs/cli" className="docs-next-card">
              <span className="next-label">Reference</span>
              <span className="next-title">CLI Command Reference &rarr;</span>
              <span className="next-desc">
                Detailed flag options and machine-readable JSON flags for all <code>ubio</code> subcommands.
              </span>
            </a>

            <a href="/docs/api" className="docs-next-card">
              <span className="next-label">Architecture</span>
              <span className="next-title">REST &amp; CAS API Reference &rarr;</span>
              <span className="next-desc">
                Learn how Git and OpenXet content-addressed storage coordinate underlying file distribution.
              </span>
            </a>
          </div>
        </section>
      </div>
    </DocsLayout>
  );
}
