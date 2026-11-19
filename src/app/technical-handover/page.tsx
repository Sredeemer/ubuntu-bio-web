import React from "react";
import type { Metadata } from "next";
import { DocsLayout } from "../../components/docs/DocsLayout";
import { DocsCopyButton } from "../../components/docs/DocsCopyButton";
import { TechnicalHandoverTabs } from "../../components/handover/TechnicalHandoverTabs";

export const metadata: Metadata = {
  title: "Technical Handover — UbuntuBio",
  description:
    "Self-hosting runbook, open-source contribution guide, v2 engineering backlog, and 10-year cohort handover protocol for UbuntuBio.",
};

export default function TechnicalHandoverPage(): React.ReactElement {
  return (
    <DocsLayout currentPath="/technical-handover">
      <div className="docs-content-body">
        <nav className="docs-breadcrumb" aria-label="Breadcrumb">
          <a href="/">UbuntuBio</a>
          <span>/</span>
          <span>Technical Handover</span>
        </nav>

        <div className="docs-header-title-row">
          <div>
            <div className="docs-badge">Cohort Playbook · v1.0.0</div>
            <h1 className="docs-page-title">Technical Handover &amp; Self-Hosting Guide</h1>
          </div>
          <DocsCopyButton pageTitle="UbuntuBio Technical Handover & Self-Hosting Guide" />
        </div>

        <p className="docs-page-lead">
          Everything the next cohort of bioinformatics students needs to self-host UbuntuBio,
          contribute under open-source engineering standards, ship v2 improvements, and hand the
          platform cleanly to the class that follows.
        </p>

        <TechnicalHandoverTabs />
      </div>
    </DocsLayout>
  );
}
