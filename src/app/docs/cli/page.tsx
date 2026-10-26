import React from "react";
import type { Metadata } from "next";
import { DocsLayout } from "../../../components/docs/DocsLayout";
import { DocsCopyButton } from "../../../components/docs/DocsCopyButton";
import { DocsCallout } from "../../../components/docs/DocsCallout";
import { DocsCodeBlock } from "../../../components/docs/DocsCodeBlock";
import { type TocItem } from "../../../components/docs/DocsRightRail";

export const metadata: Metadata = {
  title: "CLI Command Reference — UbuntuBio Docs",
  description: "Complete command-line interface documentation for the official UbuntuBio CLI (ubio).",
};

const TOC_ITEMS: TocItem[] = [
  { id: "install", label: "Installation", level: 2 },
  { id: "flags", label: "Global Flags & Env", level: 2 },
  { id: "cmd-login", label: "ubio login", level: 2 },
  { id: "cmd-whoami", label: "ubio whoami", level: 2 },
  { id: "cmd-create", label: "ubio create", level: 2 },
  { id: "cmd-init", label: "ubio init", level: 2 },
  { id: "cmd-check", label: "ubio check", level: 2 },
  { id: "cmd-push", label: "ubio push (upload)", level: 2 },
  { id: "cmd-search", label: "ubio search", level: 2 },
  { id: "cmd-download", label: "ubio download", level: 2 },
];

export default function DocsCliPage() {
  return (
    <DocsLayout currentPath="/docs/cli" tocItems={TOC_ITEMS}>
      <div className="docs-content-body">
        {/* Breadcrumb Navigation */}
        <nav className="docs-breadcrumb" aria-label="Breadcrumb">
          <a href="/docs">Docs Home</a>
          <span>/</span>
          <span>CLI Reference</span>
        </nav>

        {/* Title Header with Copy Page Dropdown */}
        <div className="docs-header-title-row">
          <div>
            <div className="docs-badge">CLI Reference</div>
            <h1 className="docs-page-title">UbuntuBio CLI (<code>ubio</code>)</h1>
          </div>
          <DocsCopyButton pageTitle="UbuntuBio CLI Command Reference" />
        </div>

        <p className="docs-page-lead">
          The <code>ubio</code> CLI tool connects researchers and HPC pipelines to the UbuntuBio Hub,
          providing authentication, dataset versioning, full-text catalog search, and content-addressed downloads.
        </p>

        {/* Callout */}
        <DocsCallout type="note" title="AI Agent Integration">
          <p>
            For agents parsing command results programmatically, all CLI commands accept <code>--json</code> to output machine-readable payloads.
            Full specifications are published at <a href="/llms.txt" target="_blank" rel="noreferrer" className="text-green"><code>/llms.txt</code></a>.
          </p>
        </DocsCallout>

        {/* Installation */}
        <section className="docs-section" id="install">
          <h2>Installation</h2>
          <DocsCodeBlock
            title="Install via PyPI"
            language="bash"
            code={`pip install ubuntu-bio
# Or with uv:
uv add ubuntu-bio

# Both 'ubio' and 'ubuntu-bio' entrypoints are installed`}
          />
        </section>

        {/* Global Flags */}
        <section className="docs-section" id="flags">
          <h2>Global Flags &amp; Environment Variables</h2>
          <DocsCodeBlock
            title="CLI Options & Environment"
            language="bash"
            code={`ubio [OPTIONS] <COMMAND>

GLOBAL OPTIONS:
  --server <URL>      Override Hub API server [default: https://hub.ubuntubio.org]
  --help              Show help menu and exit

ENVIRONMENT VARIABLES:
  UBUNTUBIO_SERVER_URL   Override Hub API server URL
  UBUNTUBIO_API_TOKEN    Personal Access Token for non-interactive / CI pipelines
  UBUNTUBIO_CONFIG_DIR   Config directory [default: ~/.config/ubuntubio]`}
          />
        </section>

        {/* Command: ubio login */}
        <section className="docs-section" id="cmd-login">
          <h2><code>ubio login</code></h2>
          <p>
            Authenticates your session with ORCID. Opens a 1-step browser authorization loopback or falls back to an RFC 8628 device verification code.
          </p>
          <DocsCodeBlock
            title="ubio login"
            language="bash"
            code={`# Interactive browser authorization
ubio login

# Non-interactive / headless CI authentication
ubio login --token ubp_your_personal_access_token`}
          />
        </section>

        {/* Command: ubio whoami */}
        <section className="docs-section" id="cmd-whoami">
          <h2><code>ubio whoami</code></h2>
          <p>
            Displays your active researcher identity, ORCID iD, and verified personal namespace handle.
          </p>
          <DocsCodeBlock
            title="ubio whoami"
            language="bash"
            code={`ubio whoami

# Output in JSON format for automated scripting
ubio whoami --json`}
          />
        </section>

        {/* Command: ubio create */}
        <section className="docs-section" id="cmd-create">
          <h2><code>ubio create</code></h2>
          <p>
            Creates a new dataset repository. If a bare slug is passed, <code>ubio</code> automatically prefixes your verified personal handle.
          </p>
          <DocsCodeBlock
            title="ubio create"
            language="bash"
            code={`# Creates @your-username/lassa-surveillance-2026
ubio create lassa-surveillance-2026 --domain virus --access public

# Creates under an organization namespace
ubio create pasteur-dakar/cholera-2026 --domain bacteria --access public --description "Vibrio cholerae surveillance"`}
          />
          <h4>Options:</h4>
          <ul>
            <li><code>--domain</code>, <code>-d</code> (Required): Biological domain (<code>bacteria</code>, <code>virus</code>, <code>parasite</code>, <code>fungus</code>, <code>plant</code>, <code>animal</code>, <code>vector</code>, <code>metagenome</code>, <code>environmental</code>)</li>
            <li><code>--access</code>, <code>-a</code>: Access tier (<code>public</code>, <code>gated</code>, <code>private</code>) [default: public]</li>
            <li><code>--description</code>: Human-readable study description</li>
            <li><code>--license</code>: Data license SPDX identifier [default: cc-by-4.0]</li>
            <li><code>--exist-ok</code>: Do not error if repository already exists on Hub (recommended for idempotent pipelines and scripts following web wizard manifest registration)</li>
          </ul>
        </section>

        {/* Command: ubio init */}
        <section className="docs-section" id="cmd-init">
          <h2><code>ubio init</code></h2>
          <p>
            Scaffolds a compliant dataset directory, automatically scans for local FASTQ reads in <code>reads/</code> or the working directory, and interactively builds a canonical <code>README.md</code> with full sequencing experiment metadata.
          </p>
          <DocsCodeBlock
            title="ubio init"
            language="bash"
            code={`# Interactive initialization wizard (prompts for title, taxon, platform)
ubio init pasteur-dakar/cholera-2026

# Non-interactive scaffolding with CLI flags
ubio init inrb-kinshasa/ebola-drc-2026 \\
  --title "Ebola Surveillance in Equateur Province" \\
  --domain virus \\
  --country CD \\
  --taxon-id 186538 \\
  --scientific-name "Zaire ebolavirus" \\
  --platform ILLUMINA \\
  --layout PAIRED \\
  --non-interactive`}
          />
          <h4>Options:</h4>
          <ul>
            <li><code>--title</code>, <code>-t</code>: Formal publication / study title</li>
            <li><code>--domain</code>, <code>-d</code>: Biological domain (<code>virus</code>, <code>bacteria</code>, <code>vector</code>, etc.)</li>
            <li><code>--country</code>, <code>-c</code>: ISO-3166-1 alpha-2 code of African Union member state</li>
            <li><code>--taxon-id</code>: NCBI Taxonomy numeric ID of target organism (Taxon <code>9606</code> is prohibited)</li>
            <li><code>--scientific-name</code>: Target organism binomial nomenclature</li>
            <li><code>--host</code>: Specimen source host (e.g. <code>"Homo sapiens"</code> for clinical isolates, <code>"Mastomys natalensis"</code>)</li>
            <li><code>--host-taxon-id</code>: NCBI Taxon ID of specimen host (e.g. <code>9606</code> for human clinical patients)</li>
            <li><code>--platform</code>: Sequencing platform (<code>ILLUMINA</code>, <code>OXFORD_NANOPORE</code>, <code>PACBIO</code>, <code>MGI</code>)</li>
            <li><code>--layout</code>: <code>PAIRED</code> or <code>SINGLE</code></li>
            <li><code>--non-interactive</code>: Skip prompts and use defaults/flags</li>
          </ul>
        </section>

        {/* Command: ubio check */}
        <section className="docs-section" id="cmd-check">
          <h2><code>ubio check</code></h2>
          <p>
            Local offline diagnostic and biological quality validator. Validates <code>README.md</code> frontmatter schema, checks two-way file parity (ensuring declared reads exist and unmapped disk reads are flagged), and streams sequences through the biological sniffer.
          </p>
          <DocsCodeBlock
            title="ubio check"
            language="bash"
            code={`# Validate current directory dataset
ubio check .

# Enable strict mode (treats warnings as errors)
ubio check ./my-dataset --strict

# Machine-readable output for CI/CD test runners
ubio check . --json`}
          />
          <h4>Diagnostics Performed:</h4>
          <ul>
            <li><strong>YAML Frontmatter Schema</strong>: Verifies mandatory fields, ISO AU country codes, and non-human target taxon ID.</li>
            <li><strong>Target vs. Host Provenance</strong>: Confirms target pathogen organism is non-human while validating clinical patient host provenance (<code>host: Homo sapiens</code> / <code>9606</code>).</li>
            <li><strong>Two-Way Read File Parity</strong>: Ensures declared forward/reverse reads exist on disk and all local FASTQ files are declared.</li>
            <li><strong>Sequence Format Sniffing</strong>: Checks Gzip, BAM, and FASTQ magic bytes and verifies 4-line record structural synchronization.</li>
            <li><strong>Phred Quality Scale</strong>: Classifies Phred+33 vs legacy Phred+64 encoding.</li>
            <li><strong>Human Host Contamination Screening</strong>: Screens headers and 25-mer markers for accidental human clinical sequence.</li>
          </ul>
        </section>

        {/* Command: ubio push (upload) */}
        <section className="docs-section" id="cmd-push">
          <h2><code>ubio push</code> (alias: <code>ubio upload</code>)</h2>
          <p>
            Runs pre-push validation and synchronizes dataset sequence reads, BAM alignments, and metadata to OpenXet Content-Addressed Storage (CAS) on the UbuntuBio Hub.
          </p>

          <DocsCallout type="note" title="Recommended Pathway for Large Cohorts (> 500 MB)">
            <p>
              While small runs (&le; 500 MB) can be ingested directly through the 5-step web UI wizard, <code>ubio push</code>
              is the mandatory and recommended pathway for larger cohorts, whole-genome datasets, and HPC compute nodes.
              It leverages Gearhash CDC chunking (64 KiB), Blake3 deduplication, and automatic resume over unstable network links.
            </p>
          </DocsCallout>

          <DocsCallout type="warning" title="Strict Non-Human Invariant">
            <p>
              In compliance with UbuntuBio v1 sovereign genomic privacy invariants, human genomic data (NCBI Taxon ID 9606 / <em>Homo sapiens</em>) is strictly prohibited. Submissions with Taxon ID 9606 or containing human chromosomal reference contigs are blocked at pre-validation.
            </p>
          </DocsCallout>

          <DocsCodeBlock
            title="ubio push"
            language="bash"
            code={`# Push dataset directory to remote repository
ubio push pasteur-dakar/cholera-2026 . --message "Initial release of consensus assemblies"

# Dry run pre-validation without network transfer
ubio push pasteur-dakar/cholera-2026 . --dry-run`}
          />
          <h4>Options:</h4>
          <ul>
            <li><code>--message</code>, <code>-m</code>: Git commit message [default: "Upload dataset"]</li>
            <li><code>--branch</code>, <code>-b</code>: Destination branch [default: "main"]</li>
            <li><code>--dry-run</code>: Validate locally and inspect chunk hashes without pushing</li>
          </ul>
        </section>

        {/* Command: ubio search */}
        <section className="docs-section" id="cmd-search">
          <h2><code>ubio search</code></h2>
          <p>
            Performs full-text search across pathogen titles, descriptions, and African Union member states.
          </p>
          <DocsCodeBlock
            title="ubio search"
            language="bash"
            code={`# Search by pathogen keyword
ubio search "Marburg"

# Filter by AU member state code and biological domain
ubio search "cholera" -c NG -d bacteria`}
          />
        </section>

        {/* Command: ubio download */}
        <section className="docs-section" id="cmd-download">
          <h2><code>ubio download</code></h2>
          <p>
            Downloads dataset snapshot with OpenXet content-addressed chunk caching.
          </p>
          <DocsCodeBlock
            title="ubio download"
            language="bash"
            code={`ubio download pasteur-dakar/lassa-surveillance-2026 --output-dir ./lassa-local`}
          />
        </section>
      </div>
    </DocsLayout>
  );
}
