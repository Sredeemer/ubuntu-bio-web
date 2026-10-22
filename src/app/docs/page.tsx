import React from "react";
import type { Metadata } from "next";
import { DocsLayout } from "../../components/docs/DocsLayout";
import { DocsCopyButton } from "../../components/docs/DocsCopyButton";
import { DocsCallout } from "../../components/docs/DocsCallout";
import { DocsCodeBlock } from "../../components/docs/DocsCodeBlock";
import { type TocItem } from "../../components/docs/DocsRightRail";
import { Database, Search, ShieldCheck, ArrowRight, Bot } from "lucide-react";

export const metadata: Metadata = {
  title: "Documentation Overview & Quickstart — UbuntuBio",
  description:
    "Get started with UbuntuBio: sovereign African genomic data management with Git versioning and content-addressed storage.",
};

const TOC_ITEMS: TocItem[] = [
  { id: "overview", label: "Overview", level: 2 },
  { id: "architecture", label: "Core Architecture", level: 2 },
  { id: "quickstart", label: "Quickstart", level: 2 },
  { id: "step-install", label: "Install CLI", level: 3 },
  { id: "step-init", label: "Init & Scaffold", level: 3 },
  { id: "step-check", label: "Validate & Screen", level: 3 },
  { id: "step-push", label: "Push to Hub", level: 3 },
  { id: "guides", label: "Developer Guides", level: 2 },
];

export default function DocsOverviewPage() {
  return (
    <DocsLayout currentPath="/docs" tocItems={TOC_ITEMS}>
      <div className="docs-content-body">
        {/* Breadcrumb */}
        <nav className="docs-breadcrumb" aria-label="Breadcrumb">
          <a href="/docs">Docs</a>
          <span>/</span>
          <span>Overview</span>
        </nav>

        {/* Title Row */}
        <div className="docs-header-title-row" id="overview">
          <h1 className="docs-page-title">UbuntuBio Documentation</h1>
          <DocsCopyButton pageTitle="UbuntuBio Documentation Overview" />
        </div>

        <p className="docs-page-lead">
          The sovereign data hub for African pathogen surveillance, AMR tracking, and biodiversity genomics.
          Provides Git versioning, content-addressed deduplication, and sub-50ms catalog discovery.
        </p>

        {/* Clean Neutral AI Agent Notice (Zero colored edges) */}
        <DocsCallout title="AI Coding Agents & Automation">
          <p>
            Machine-readable specifications for LLM coding agents (Cursor, Claude, Copilot) are published at{" "}
            <a href="/llms.txt" target="_blank" rel="noreferrer" className="text-green font-medium">
              <code>/llms.txt</code>
            </a>
            . Fetch terminal commands and SDK signatures directly with <code>curl https://ubuntubio.org/llms.txt</code>.
          </p>
        </DocsCallout>

        {/* Re-imagined Core Architectural Highlights: Crisp, concise, right font sizes */}
        <section className="docs-section" id="architecture">
          <h2>Core Architecture</h2>
          <div className="docs-pillars-grid">
            <div className="docs-pillar-item">
              <div className="docs-pillar-header">
                <Database size={16} className="docs-pillar-icon" />
                <h3 className="docs-pillar-title">OpenXet Deduplication</h3>
              </div>
              <p className="docs-pillar-desc">
                Cryptographic SHA-256 chunk hashing reduces bandwidth and storage costs up to 78% across related pathogen isolates.
              </p>
            </div>

            <div className="docs-pillar-item">
              <div className="docs-pillar-header">
                <Search size={16} className="docs-pillar-icon" />
                <h3 className="docs-pillar-title">Sub-50ms Discovery</h3>
              </div>
              <p className="docs-pillar-desc">
                Meilisearch &amp; Valkey engine enables instant filtering across 54 AU member states, biosafety levels, and taxon IDs.
              </p>
            </div>

            <div className="docs-pillar-item">
              <div className="docs-pillar-header">
                <ShieldCheck size={16} className="docs-pillar-icon" />
                <h3 className="docs-pillar-title">AU Data Sovereignty</h3>
              </div>
              <p className="docs-pillar-desc">
                Guarantees African institutional provenance under Nagoya Protocol. Strictly excludes human genomic data (Taxon ID 9606).
              </p>
            </div>
          </div>
        </section>

        {/* Streamlined Quickstart */}
        <section className="docs-section" id="quickstart">
          <h2>Publishing &amp; Submission Quickstart</h2>
          <p>
            Install the official <code>ubio</code> CLI to scaffold, validate, and publish sovereign genomic datasets directly from your terminal or sequencing instrument cluster.
          </p>

          <h3 className="docs-step-heading" id="step-install">
            <span className="docs-step-number">1</span>
            <span>Install CLI</span>
          </h3>
          <DocsCodeBlock
            title="Terminal"
            language="bash"
            code={`pip install ubuntu-bio
# Or with uv:
uv add ubuntu-bio`}
          />

          <h3 className="docs-step-heading" id="step-init">
            <span className="docs-step-number">2</span>
            <span>Initialize &amp; Scaffold Dataset</span>
          </h3>
          <DocsCodeBlock
            title="Terminal"
            language="bash"
            code={`# Auto-detects local FASTQ files and interactively scaffolds README.md
ubio init pasteur-dakar/cholera-2026 --domain bacteria --country SN`}
          />

          <h3 className="docs-step-heading" id="step-check">
            <span className="docs-step-number">3</span>
            <span>Validate &amp; Screen Biological Reads</span>
          </h3>
          <DocsCodeBlock
            title="Terminal"
            language="bash"
            code={`# Inspects YAML frontmatter schema, two-way file parity, and streams sequence files
ubio check .`}
          />

          <h3 className="docs-step-heading" id="step-push">
            <span className="docs-step-number">4</span>
            <span>Push to Sovereign Hub</span>
          </h3>
          <DocsCodeBlock
            title="Terminal"
            language="bash"
            code={`# Deduplicates and pushes verified sequence chunks to OpenXet CAS
ubio push pasteur-dakar/cholera-2026 . --message "Initial verified release"`}
          />
        </section>

        {/* Developer Guides Navigation */}
        <section className="docs-section" id="guides">
          <h2>Developer &amp; Researcher Guides</h2>
          <div className="docs-next-links">
            <a href="/docs/submission" className="docs-next-card">
              <span className="next-card-title">Dataset Submission &amp; Schema Guide</span>
              <span className="next-card-desc">Canonical README.md schema, sequencing: block, two-way parity, and sequence sniffer</span>
              <ArrowRight size={14} className="next-card-arrow" />
            </a>
            <a href="/docs/cli" className="docs-next-card">
              <span className="next-card-title">CLI Command Reference</span>
              <span className="next-card-desc">Complete syntax for login, init, check, push, search, and download</span>
              <ArrowRight size={14} className="next-card-arrow" />
            </a>
            <a href="/docs/api" className="docs-next-card">
              <span className="next-card-title">REST &amp; CAS API</span>
              <span className="next-card-desc">HTTP endpoints for pipeline automation and CAS chunk streaming</span>
              <ArrowRight size={14} className="next-card-arrow" />
            </a>
            <a href="/docs/governance" className="docs-next-card">
              <span className="next-card-title">AU Governance &amp; Nagoya Protocol</span>
              <span className="next-card-desc">African Union sovereignty invariants, strict human exclusion, and WACCBIP origin</span>
              <ArrowRight size={14} className="next-card-arrow" />
            </a>
            <a href="/llms.txt" target="_blank" rel="noreferrer" className="docs-next-card">
              <span className="next-card-title">llms.txt for AI Coding Agents</span>
              <span className="next-card-desc">Machine-readable interface specifications for agentic workflows</span>
              <ArrowRight size={14} className="next-card-arrow" />
            </a>
          </div>
        </section>
      </div>
    </DocsLayout>
  );
}
