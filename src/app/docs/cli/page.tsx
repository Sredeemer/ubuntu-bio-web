import React from "react";
import type { Metadata } from "next";
import { DocsLayout } from "../../../components/docs/DocsLayout";
import { Terminal, ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "CLI Command Reference — UbuntuBio Docs",
  description: "Complete command-line interface documentation for the UbuntuBio CLI (ubio).",
};

export default function DocsCliPage() {
  return (
    <DocsLayout currentPath="/docs/cli">
      <div className="docs-content-body">
        <div className="docs-badge">CLI Reference</div>
        <h1 className="docs-page-title">UbuntuBio CLI (<code>ubio</code>)</h1>
        <p className="docs-page-lead">
          The <code>ubio</code> CLI tool provides local and cluster-level synchronization with the UbuntuBio
          decentralized storage network, utilizing OpenXet CAS deduplication for high-speed transfer.
        </p>

        {/* Global Options */}
        <section className="docs-section">
          <h2>Global Flags & Configuration</h2>
          <div className="docs-code-block">
            <pre>
{`ubio [OPTIONS] <COMMAND>

OPTIONS:
  -v, --verbose       Enable debug and verbose trace logging
  -q, --quiet         Suppress non-error output
  --endpoint <URL>    Override default UbuntuBio Hub endpoint [default: https://hub.ubuntubio.org]
  -h, --help          Print help information
  -V, --version       Print version information`}
            </pre>
          </div>
        </section>

        {/* Command: ubio pull */}
        <section className="docs-section">
          <h2><code>ubio pull</code></h2>
          <p>
            Downloads or streams a dataset from the sovereign hub to your local directory or pipeline.
          </p>
          <div className="docs-code-block">
            <div className="code-block-header">
              <span>Usage</span>
              <span className="code-lang">bash</span>
            </div>
            <pre>
{`ubio pull [OPTIONS] <NAMESPACE/DATASET_ID> [DESTINATION]

ARGUMENTS:
  <NAMESPACE/DATASET_ID>   Target dataset identifier (e.g. pasteur-dakar/lassa-surveillance-2026)
  [DESTINATION]            Target local path [default: ./<DATASET_ID>]

OPTIONS:
  --shallow                Download manifest only, hydrate chunks on demand
  --include <PATTERN>      Glob pattern for filtering files (e.g. "*.fasta")
  --workers <N>            Concurrent CAS chunk download threads [default: 8]`}
            </pre>
          </div>

          <h4>Example:</h4>
          <div className="docs-code-block">
            <pre>
{`# Pull only consensus FASTA files
ubio pull acegid/cholera-lagos-2026 ./cholera_data --include "*.fasta"`}
            </pre>
          </div>
        </section>

        {/* Command: ubio push */}
        <section className="docs-section">
          <h2><code>ubio push</code></h2>
          <p>
            Chunks local genomic files into OpenXet content-addressable blocks and publishes the study to the AU federation.
          </p>

          <div className="docs-alert-box alert-warning">
            <ShieldAlert size={18} className="alert-icon" />
            <div>
              <strong>Strict Human Exclusion Invariant:</strong>
              <p>
                <code>ubio push</code> automatically performs client-side inspection. If NCBI Taxon ID 9606 is detected
                or human sequence markers are identified, the operation aborts immediately.
              </p>
            </div>
          </div>

          <div className="docs-code-block">
            <div className="code-block-header">
              <span>Usage</span>
              <span className="code-lang">bash</span>
            </div>
            <pre>
{`ubio push [OPTIONS] <NAMESPACE/DATASET_ID> [SOURCE_DIR]

ARGUMENTS:
  <NAMESPACE/DATASET_ID>   Target dataset repository
  [SOURCE_DIR]             Directory containing genomic files [default: .]

OPTIONS:
  --country <ISO2>         Origin AU Member State ISO 3166-1 alpha-2 code [required]
  --taxon <ID>             NCBI Taxonomy ID (Taxon 9606 prohibited) [required]
  --platform <NAME>        Sequencing platform (e.g. "Illumina NovaSeq", "Oxford Nanopore")
  --bsl <TIER>             Biosafety level [default: BSL-2]
  --license <NAME>         Data license [default: "Nagoya Protocol Data Access Agreement"]`}
            </pre>
          </div>

          <h4>Example:</h4>
          <div className="docs-code-block">
            <pre>
{`# Push Ebola surveillance run from DRC
ubio push inrb-kinshasa/ebola-zaire-drc-2026 ./ebola_runs \\
  --country CD \\
  --taxon 186538 \\
  --platform "Oxford Nanopore GridION" \\
  --bsl BSL-4`}
            </pre>
          </div>
        </section>

        {/* Command: ubio cat */}
        <section className="docs-section">
          <h2><code>ubio cat</code></h2>
          <p>
            Streams file contents directly from CAS chunks without writing the entire file to disk. Ideal for piped analysis:
          </p>
          <div className="docs-code-block">
            <pre>
{`# Pipe FASTA stream directly into samtools or blast
ubio cat pasteur-dakar/lassa-surveillance-2026/consensus/Lassa_SN01_consensus.fasta | grep "^>"`}
            </pre>
          </div>
        </section>

        {/* Command: ubio verify */}
        <section className="docs-section">
          <h2><code>ubio verify</code></h2>
          <p>
            Validates local files against remote OpenXet cryptographic hashes to ensure data integrity:
          </p>
          <div className="docs-code-block">
            <pre>
{`ubio verify ./cholera_data
# Output:
# [OK] All 28 CAS chunks verified against sha256 checksums.`}
            </pre>
          </div>
        </section>
      </div>
    </DocsLayout>
  );
}
