import React from "react";
import type { Metadata } from "next";
import { DocsLayout } from "../../../components/docs/DocsLayout";
import { DocsCopyButton } from "../../../components/docs/DocsCopyButton";
import { DocsCallout } from "../../../components/docs/DocsCallout";
import { type TocItem } from "../../../components/docs/DocsRightRail";

export const metadata: Metadata = {
  title: "AU Sovereignty & Governance — UbuntuBio Docs",
  description:
    "Governance framework, Nagoya protocol compliance, and strict human exclusion invariants for UbuntuBio.",
};

const TOC_ITEMS: TocItem[] = [
  { id: "invariants", label: "Non-Negotiable Invariants", level: 2 },
  { id: "nagoya", label: "Nagoya Protocol (ABS)", level: 2 },
  { id: "licensing", label: "Open Sovereign Licensing", level: 2 },
];

export default function DocsGovernancePage() {
  return (
    <DocsLayout currentPath="/docs/governance" tocItems={TOC_ITEMS}>
      <div className="docs-content-body">
        {/* Breadcrumb Navigation */}
        <nav className="docs-breadcrumb" aria-label="Breadcrumb">
          <a href="/docs">Docs Home</a>
          <span>/</span>
          <span>Governance &amp; Sovereignty</span>
        </nav>

        {/* Title Header with Copy Page Dropdown */}
        <div className="docs-header-title-row">
          <div>
            <div className="docs-badge">Governance &amp; Policy</div>
            <h1 className="docs-page-title">African Union Data Sovereignty &amp; Nagoya Protocol</h1>
          </div>
          <DocsCopyButton pageTitle="UbuntuBio AU Sovereignty & Governance" />
        </div>

        <p className="docs-page-lead">
          UbuntuBio is architected around foundational data sovereignty principles established by the
          African Union, Africa CDC, and the United Nations Convention on Biological Diversity.
        </p>

        {/* Section 1: Non-Negotiable Invariants */}
        <section className="docs-section" id="invariants">
          <h2>Non-Negotiable System Invariants</h2>

          <DocsCallout type="warning" title="Strict Prohibition: NCBI Taxon ID 9606 (Homo sapiens)">
            <p>
              In v1, UbuntuBio strictly prohibits human genomic data. Submissions containing human DNA,
              RNA, or variant calls (Taxon 9606) are blocked at the validator layer and will fail ingest.
              The platform is dedicated exclusively to pathogen surveillance, veterinary genomics, and crop biodiversity.
            </p>
          </DocsCallout>

          <DocsCallout type="tip" title="54 African Union Member States Enforced">
            <p>
              Datasets must declare provenance from one of the 54 recognized AU member states
              (ISO 3166-1 alpha-2). Non-AU geographical origins cannot be registered as primary provenance hosts.
            </p>
          </DocsCallout>
        </section>

        {/* Section 2: Nagoya Protocol Harmonization */}
        <section className="docs-section" id="nagoya">
          <h2>Nagoya Protocol Harmonization (Access &amp; Benefit Sharing)</h2>
          <p>
            The Nagoya Protocol on Access to Genetic Resources and the Fair and Equitable Sharing of Benefits
            Arising from their Utilization guides UbuntuBio’s Digital Sequence Information (DSI) architecture:
          </p>
          <ul>
            <li>
              <strong>Prior Informed Consent (PIC):</strong> Submitting laboratories certify that field collection
              and biological sampling conformed to host-nation environmental and health ministry permits.
            </li>
            <li>
              <strong>Mutually Agreed Terms (MAT):</strong> Downstream computational discovery must cite originating African
              institutions, sequencing facilities, and surveillance scientists.
            </li>
            <li>
              <strong>Fair Benefit Sharing:</strong> Prohibits the enclosure of sovereign African microbial assets
              behind proprietary patents without equitable reciprocity.
            </li>
          </ul>
        </section>

        {/* Section 3: Open Sovereign Licensing */}
        <section className="docs-section" id="licensing">
          <h2>Open Sovereign Licensing</h2>
          <p>
            Datasets on UbuntuBio default to <code>CC-BY-4.0</code> with custom African Union sovereignty riders ensuring attribution
            to African primary research institutions and surveillance networks.
          </p>
        </section>
      </div>
    </DocsLayout>
  );
}
