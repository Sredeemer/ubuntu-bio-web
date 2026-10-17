import React from "react";
import type { Metadata } from "next";
import { DocsLayout } from "../../components/docs/DocsLayout";
import { Terminal, Database, ShieldCheck, Cpu, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Documentation Overview & Quickstart — UbuntuBio",
  description:
    "Get started with UbuntuBio: sovereign pathogen surveillance, OpenXet CAS deduplication, and African genomics federated storage.",
};

export default function DocsOverviewPage() {
  return (
    <DocsLayout currentPath="/docs">
      <div className="docs-content-body">
        <div className="docs-badge">Documentation</div>
        <h1 className="docs-page-title">UbuntuBio Overview & Quickstart</h1>
        <p className="docs-page-lead">
          UbuntuBio is an open-source decentralized genomic data hub built to give African institutions,
          research centers, and public health surveillance networks sovereign ownership over biological sequence data.
        </p>

        <section className="docs-section">
          <h2>Core Architectural Pillars</h2>
          <div className="docs-cards-grid">
            <div className="docs-feature-card">
              <Database size={24} className="feature-icon text-green" />
              <h3>OpenXet Content-Addressing (CAS)</h3>
              <p>
                Genomic FASTQ and BAM files undergo sliding-window deduplication with cryptographic SHA-256 chunk
                hashing, reducing bandwidth and storage costs by up to 78% across related pathogen isolates.
              </p>
            </div>

            <div className="docs-feature-card">
              <Cpu size={24} className="feature-icon text-green" />
              <h3>Sub-50ms Discovery Engine</h3>
              <p>
                Powered by Meilisearch and Valkey caching, search across taxon IDs, sequencing platforms,
                and geographic origins in milliseconds without cloud vendor lock-in.
              </p>
            </div>

            <div className="docs-feature-card">
              <ShieldCheck size={24} className="feature-icon text-green" />
              <h3>African Union Sovereignty & Nagoya Protocol</h3>
              <p>
                Guarantees African institutions maintain legal and provenance ownership of biological materials
                and digital sequence information (DSI), strictly prohibiting unauthorized commercial exploitation.
              </p>
            </div>
          </div>
        </section>

        <section className="docs-section">
          <h2>Quickstart: Ingesting & Pulling Datasets</h2>
          <p>
            You can interact with UbuntuBio either via the web catalog, the Python SDK, or the native CLI tool.
          </p>

          <div className="docs-code-block">
            <div className="code-block-header">
              <span>Install UbuntuBio CLI</span>
              <span className="code-lang">bash</span>
            </div>
            <pre>
{`# Install via cargo or package manager
curl -sSf https://ubuntubio.org/install.sh | sh

# Verify installation
ubio --version`}
            </pre>
          </div>

          <h3>1. Pulling a Sovereign Pathogen Dataset</h3>
          <p>
            Stream or clone an entire dataset directly to your local workstation or high-performance compute (HPC) cluster:
          </p>

          <div className="docs-code-block">
            <div className="code-block-header">
              <span>Pull Lassa Mammarenavirus Dataset</span>
              <span className="code-lang">bash</span>
            </div>
            <pre>
{`# Pull Lassa virus surveillance dataset from Institut Pasteur de Dakar
ubio pull pasteur-dakar/lassa-surveillance-2026

# Inspect file contents on the fly without downloading entire BAMs
ubio cat pasteur-dakar/lassa-surveillance-2026/consensus/Lassa_SN01_consensus.fasta | head -n 10`}
            </pre>
          </div>

          <h3>2. Publishing an African Pathogen Study</h3>
          <p>
            Submit your laboratory sequencing run to the federated registry:
          </p>

          <div className="docs-code-block">
            <div className="code-block-header">
              <span>Push Genomic Data</span>
              <span className="code-lang">bash</span>
            </div>
            <pre>
{`# Publish study from Nigeria (NG) tracking Vibrio cholerae (Taxon 666)
ubio push acegid/cholera-lagos-2026 \\
  --country NG \\
  --taxon 666 \\
  --platform "Illumina NovaSeq" \\
  --bsl BSL-2`}
            </pre>
          </div>
        </section>

        <section className="docs-section">
          <h2>Next Steps</h2>
          <div className="docs-next-links">
            <a href="/docs/cli" className="docs-next-card">
              <span className="next-card-title">CLI Command Reference</span>
              <span className="next-card-desc">Detailed syntax for ubio pull, push, cat, and verify</span>
              <ArrowRight size={16} className="next-card-arrow" />
            </a>
            <a href="/docs/api" className="docs-next-card">
              <span className="next-card-title">REST & CAS API Reference</span>
              <span className="next-card-desc">Endpoints for building custom pipelines and integrations</span>
              <ArrowRight size={16} className="next-card-arrow" />
            </a>
            <a href="/docs/governance" className="docs-next-card">
              <span className="next-card-title">AU Data Sovereignty</span>
              <span className="next-card-desc">Nagoya Protocol compliance and human exclusion policy</span>
              <ArrowRight size={16} className="next-card-arrow" />
            </a>
          </div>
        </section>
      </div>
    </DocsLayout>
  );
}
