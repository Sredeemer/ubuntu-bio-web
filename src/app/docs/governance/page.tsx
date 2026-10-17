import React from "react";
import type { Metadata } from "next";
import { DocsLayout } from "../../../components/docs/DocsLayout";
import { ShieldCheck, ShieldAlert, Scale, Globe2 } from "lucide-react";

export const metadata: Metadata = {
  title: "AU Sovereignty & Governance — UbuntuBio Docs",
  description:
    "Governance framework, Nagoya protocol compliance, and strict human exclusion invariants for UbuntuBio.",
};

export default function DocsGovernancePage() {
  return (
    <DocsLayout currentPath="/docs/governance">
      <div className="docs-content-body">
        <div className="docs-badge">Governance & Policy</div>
        <h1 className="docs-page-title">African Union Data Sovereignty & Nagoya Protocol</h1>
        <p className="docs-page-lead">
          UbuntuBio is architected around foundational data sovereignty principles established by the
          African Union, Africa CDC, and the United Nations Convention on Biological Diversity.
        </p>

        {/* Section 1: Non-Negotiable Invariants */}
        <section className="docs-section">
          <h2>Non-Negotiable System Invariants</h2>
          <div className="docs-alert-box alert-error">
            <ShieldAlert size={20} className="alert-icon" />
            <div>
              <strong>Strict Prohibition: NCBI Taxon ID 9606 (Homo sapiens)</strong>
              <p>
                In v1, UbuntuBio strictly prohibits human genomic data. Submissions containing human DNA,
                RNA, or variant calls (Taxon 9606) are blocked at the validator layer and will fail ingest.
                The platform is dedicated exclusively to pathogen surveillance, veterinary genomics, and crop biodiversity.
              </p>
            </div>
          </div>

          <div className="docs-alert-box alert-success mt-4">
            <ShieldCheck size={20} className="alert-icon" />
            <div>
              <strong>54 African Union Member States Enforced</strong>
              <p>
                Datasets must declare provenance from one of the 54 recognized AU member states
                (ISO 3166-1 alpha-2). Non-AU geographical origins cannot be registered as primary provenance hosts.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Nagoya Protocol Harmonization */}
        <section className="docs-section">
          <h2>Nagoya Protocol Harmonization (Access & Benefit Sharing)</h2>
          <p>
            The Nagoya Protocol on Access to Genetic Resources and the Fair and Equitable Sharing of Benefits
            Arising from their Utilization guides UbuntuBio’s Digital Sequence Information (DSI) architecture:
          </p>
          <ul className="docs-list">
            <li>
              <strong>Prior Informed Consent (PIC):</strong> Submitting laboratories certify that field collection
              and biological sampling conformed to host-nation environmental and health ministry permits.
            </li>
            <li>
              <strong>Mutually Agreed Terms (MAT):</strong> Global researchers accessing sequence data are bound
              by open public health research licensing that protects African research institutions from predatory commercial patenting.
            </li>
            <li>
              <strong>Attribution Transparency:</strong> Every CAS chunk and sequence manifest retains cryptographic
              traceability to the originating institution (e.g. Pasteur Dakar, ACEGID, INRB, KEMRI).
            </li>
          </ul>
        </section>

        {/* Section 3: Open-Source Guarantee */}
        <section className="docs-section">
          <h2>Open-Source & Anti-Lock-In Invariants</h2>
          <p>
            To protect African scientific infrastructure against commercial cloud lock-in or service termination:
          </p>
          <div className="docs-cards-grid">
            <div className="docs-feature-card">
              <Scale size={20} className="feature-icon text-green" />
              <h3>Open-Source Stack Only</h3>
              <p>
                Zero proprietary software dependencies. OpenXet CAS deduplication, PostgreSQL, Valkey, Meilisearch,
                and self-hosted PMTiles for cartography.
              </p>
            </div>
            <div className="docs-feature-card">
              <Globe2 size={20} className="feature-icon text-green" />
              <h3>Single-Folder Architecture</h3>
              <p>
                All repository state resides under <code>/srv/afrihub/data/</code>, allowing simple rsync-based
                backup and cold-storage portability across regional African data centers.
              </p>
            </div>
          </div>
        </section>
      </div>
    </DocsLayout>
  );
}
