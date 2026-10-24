"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Copy,
  Check,
  FolderTree,
  Terminal,
  ShieldCheck,
  FileCode,
  Share2,
  ExternalLink,
  Info,
  Layers,
  BookOpen,
  GitCommit,
} from "lucide-react";
import { DatasetItem, DatasetFile } from "../../data/datasets";
import { fetchCommitHistory, fetchRepoTree, CommitLogItem } from "../../lib/api";

interface DatasetDetailPageProps {
  dataset?: DatasetItem | null | undefined;
  namespace: string;
  datasetId: string;
}

export function DatasetDetailPage({ dataset: initialDataset, namespace, datasetId }: DatasetDetailPageProps) {
  const [dataset, setDataset] = useState<DatasetItem | null>(initialDataset ?? null);
  const [copiedPull, setCopiedPull] = useState(false);
  const [copiedCitation, setCopiedCitation] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "files" | "citation">("overview");
  const [commits, setCommits] = useState<CommitLogItem[]>([]);

  useEffect(() => {
    if (initialDataset) setDataset(initialDataset);
  }, [initialDataset]);

  useEffect(() => {
    fetchCommitHistory(namespace, datasetId).then((res) => {
      if (res && res.length > 0) setCommits(res);
    });

    fetchRepoTree(namespace, datasetId).then((treeItems) => {
      if (treeItems && treeItems.length > 0) {
        setDataset((prev) => {
          if (!prev) return prev;
          const files: DatasetFile[] = treeItems.map((t) => {
            const filePath = t.path || t.name || "file";
            const fileName = t.name || filePath.split("/").pop() || filePath;
            let format: DatasetFile["format"] = "FASTQ";
            if (fileName.endsWith(".fastq.gz") || fileName.endsWith(".fq.gz")) format = "FASTQ";
            else if (fileName.endsWith(".fasta.gz") || fileName.endsWith(".fa.gz")) format = "FASTA";
            else if (fileName.endsWith(".tsv")) format = "TSV";
            else if (fileName.endsWith(".bam")) format = "BAM";
            else if (fileName.endsWith(".vcf") || fileName.endsWith(".vcf.gz")) format = "VCF";
            else if (fileName.endsWith(".json")) format = "JSON";

            return {
              name: fileName,
              path: filePath,
              sizeBytes: t.size || 0,
              casHash: t.oid || "0000000000000000000000000000000000000000",
              chunksCount: Math.max(1, Math.ceil((t.size || 65536) / (64 * 1024))),
              format,
            };
          });

          const totalBytes = files.reduce((acc, f) => acc + f.sizeBytes, 0);
          const totalSizeMb = Math.max(1, Math.round(totalBytes / (1024 * 1024)));
          const fastqFiles = files.filter((f) => f.name.includes(".fastq") || f.name.includes(".fq"));
          const samplesCount = fastqFiles.length >= 2 ? Math.floor(fastqFiles.length / 2) : prev.samplesCount;

          return {
            ...prev,
            files,
            totalSizeMb,
            samplesCount: Math.max(prev.samplesCount, samplesCount),
          };
        });
      }
    });
  }, [namespace, datasetId]);

  if (!dataset) {
    return (
      <div className="ubio-detail-container">
        <div className="ubio-detail-not-found">
          <h2>Dataset Not Found</h2>
          <p>
            The dataset <code>{namespace}/{datasetId}</code> could not be located in the sovereign registry.
          </p>
          <a href="/datasets" className="btn-pill-primary">
            <ArrowLeft size={16} /> Return to Datasets Catalog
          </a>
        </div>
      </div>
    );
  }

  const handleCopyPull = () => {
    navigator.clipboard.writeText(`ubio download ${dataset.id}`);
    setCopiedPull(true);
    setTimeout(() => setCopiedPull(false), 2000);
  };

  const handleCopyCitation = () => {
    navigator.clipboard.writeText(dataset.citation);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2000);
  };

  const formattedSize =
    dataset.totalSizeMb >= 1000
      ? `${(dataset.totalSizeMb / 1024).toFixed(1)} GB`
      : `${dataset.totalSizeMb} MB`;

  return (
    <div className="ubio-detail-container">
      {/* Breadcrumb Navigation */}
      <nav className="ubio-detail-breadcrumb" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span className="crumb-sep">/</span>
        <a href="/datasets">Datasets</a>
        <span className="crumb-sep">/</span>
        <span className="crumb-current">{dataset.namespace}</span>
        <span className="crumb-sep">/</span>
        <span className="crumb-current">{dataset.datasetId}</span>
      </nav>

      {/* Dataset Header Hero */}
      <header className="ubio-detail-header">
        <div className="ubio-detail-header-badges">
          <span className="badge-country">
            <span className="flag-code">{dataset.countryCode}</span>
            <span className="country-name">{dataset.countryName}</span>
            <span className="country-au-tag"> (AU Member State)</span>
          </span>
          <span className={`badge-type badge-${dataset.pathogenType.toLowerCase()}`}>
            {dataset.pathogenType}
          </span>
          <span className={`badge-bsl badge-${dataset.biocontainment.toLowerCase()}`}>
            {dataset.biocontainment}
          </span>
          <span className="badge-gate badge-gate-desktop">
            <ShieldCheck size={13} />
            Open Sovereign Access
          </span>
        </div>

        <h1 className="ubio-detail-title">{dataset.name}</h1>
        <p className="ubio-detail-description">{dataset.description}</p>

        <div className="ubio-detail-header-meta">
          <div className="meta-block">
            <span className="meta-label">Lead Institution</span>
            <span className="meta-value">{dataset.leadInstitution}</span>
          </div>
          <div className="meta-block meta-block-desktop-only">
            <span className="meta-label">Taxon ID</span>
            <span className="meta-value font-mono">
              NCBI:{dataset.taxonId} (<em>{dataset.taxonName}</em>)
            </span>
          </div>
          <div className="meta-block">
            <span className="meta-label">Total Volume</span>
            <span className="meta-value font-mono">{formattedSize}</span>
          </div>
          <div className="meta-block meta-block-desktop-only">
            <span className="meta-label">Last Updated</span>
            <span className="meta-value font-mono">{dataset.updatedAt}</span>
          </div>
        </div>
      </header>

      {/* Two Column Layout */}
      <div className="ubio-detail-grid">
        {/* Main Left Column */}
        <main className="ubio-detail-main">
          {/* Navigation Tabs */}
          <div className="ubio-detail-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "overview"}
              className={`detail-tab ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              <Info size={15} className="detail-tab-icon" /> <span>Overview & MIxS Specs</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "files"}
              className={`detail-tab ${activeTab === "files" ? "active" : ""}`}
              onClick={() => setActiveTab("files")}
            >
              <Layers size={15} className="detail-tab-icon" /> <span>Files Manifest ({dataset.files.length})</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "citation"}
              className={`detail-tab ${activeTab === "citation" ? "active" : ""}`}
              onClick={() => setActiveTab("citation")}
            >
              <BookOpen size={15} className="detail-tab-icon" /> <span>Citation & Provenance</span>
            </button>
          </div>

          {/* Tab 1: Overview & MIxS Specs */}
          {activeTab === "overview" && (
            <div className="detail-tab-content">
              <section className="detail-section">
                <h3 className="section-title">Abstract & Surveillance Summary</h3>
                <p className="section-text">{dataset.longDescription}</p>
              </section>

              <section className="detail-section">
                <h3 className="section-title">MIxS Genomic Metadata Invariants</h3>
                <div className="mixs-specs-table-wrapper">
                  <table className="mixs-specs-table">
                    <tbody>
                      <tr>
                        <td className="spec-label">NCBI Taxon ID</td>
                        <td className="spec-val font-mono">
                          {dataset.taxonId} ({dataset.taxonName})
                        </td>
                      </tr>
                      <tr>
                        <td className="spec-label">Human Exclusion Status</td>
                        <td className="spec-val">
                          <span className="status-badge-verified">
                            <ShieldCheck size={12} /> Strictly Verified (Non-Human / Taxon 9606 Absent)
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="spec-label">African Union Sovereign Provenance</td>
                        <td className="spec-val">
                          {dataset.countryName} (ISO-3166-1 alpha-2: <code>{dataset.countryCode}</code>)
                        </td>
                      </tr>
                      <tr>
                        <td className="spec-label">Biocontainment Tier</td>
                        <td className="spec-val font-mono">{dataset.biocontainment}</td>
                      </tr>
                      <tr>
                        <td className="spec-label">Sequencing Platforms</td>
                        <td className="spec-val">{dataset.seqPlatforms.join(", ")}</td>
                      </tr>
                      <tr>
                        <td className="spec-label">Sample Cohort Size</td>
                        <td className="spec-val font-mono">{dataset.samplesCount} clinical & field isolates</td>
                      </tr>
                      <tr>
                        <td className="spec-label">Data Governance License</td>
                        <td className="spec-val">{dataset.license}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="detail-section">
                <h3 className="section-title">Quick File Manifest Snapshot</h3>
                <div className="file-snapshot-list">
                  {dataset.files.slice(0, 3).map((f) => (
                    <div key={f.path} className="file-snapshot-item">
                      <div className="file-snapshot-info">
                        <span className={`format-badge format-${f.format.toLowerCase()}`}>{f.format}</span>
                        <span className="file-name">{f.name}</span>
                      </div>
                      <div className="file-snapshot-meta">
                        <span className="file-size font-mono">{(f.sizeBytes / (1024 * 1024)).toFixed(2)} MB</span>
                        <span className="cas-chunk-tag font-mono">{f.chunksCount} CAS chunks</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="file-snapshot-cta">
                  <a
                    href={`/datasets/${dataset.namespace}/${dataset.datasetId}/tree`}
                    className="btn-tree-link"
                  >
                    <FolderTree size={16} />
                    Explore all {dataset.files.length} files & sequence headers in Tree Browser
                  </a>
                </div>
              </section>
            </div>
          )}

          {/* Tab 2: Files Manifest */}
          {activeTab === "files" && (
            <div className="detail-tab-content">
              <section className="detail-section">
                <div className="files-header-row">
                  <div>
                    <h3 className="section-title">Dataset Files & CAS Content Hashes</h3>
                    <p className="section-subtitle">
                      All files are chunked, deduplicated, and addressed by content hash using OpenXet CAS.
                    </p>
                  </div>
                  <a
                    href={`/datasets/${dataset.namespace}/${dataset.datasetId}/tree`}
                    className="btn-pill-primary"
                  >
                    <FolderTree size={14} /> Open Interactive Tree
                  </a>
                </div>

                <div className="files-table-wrapper">
                  <table className="files-table">
                    <thead>
                      <tr>
                        <th>Format</th>
                        <th>Path</th>
                        <th>Size</th>
                        <th>CAS Chunks</th>
                        <th>Address Hash</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dataset.files.map((file) => (
                        <tr key={file.path}>
                          <td>
                            <span className={`format-badge format-${file.format.toLowerCase()}`}>
                              {file.format}
                            </span>
                          </td>
                          <td className="file-table-path font-mono">{file.path}</td>
                          <td className="file-table-size font-mono">
                            {(file.sizeBytes / (1024 * 1024)).toFixed(2)} MB
                          </td>
                          <td className="font-mono">{file.chunksCount}</td>
                          <td className="font-mono cas-hash-cell" title={file.casHash}>
                            {file.casHash.substring(0, 22)}...
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {/* Tab 3: Citation & Provenance */}
          {activeTab === "citation" && (
            <div className="detail-tab-content">
              <section className="detail-section">
                <h3 className="section-title">How to Cite this Dataset</h3>
                <p className="section-subtitle">
                  Please cite both the originating African laboratory and the UbuntuBio data registry in your publications:
                </p>
                <div className="citation-box">
                  <p className="citation-text">{dataset.citation}</p>
                  <button
                    type="button"
                    className="btn-copy-citation"
                    onClick={handleCopyCitation}
                  >
                    {copiedCitation ? (
                      <>
                        <Check size={14} className="text-green" /> Copied Citation
                      </>
                    ) : (
                      <>
                        <Copy size={14} /> Copy Citation Text
                      </>
                    )}
                  </button>
                </div>

                <h4 className="bibtex-title">BibTeX Reference</h4>
                <pre className="bibtex-code">
{`@dataset{${dataset.namespace}_${dataset.datasetId.replace(/-/g, "_")},
  title        = {${dataset.name}},
  author       = {${dataset.leadInstitution}},
  year         = {2026},
  publisher    = {UbuntuBio Sovereign Hub},
  country      = {${dataset.countryName}},
  taxon_id     = {${dataset.taxonId}},
  url          = {https://ubuntubio.org/datasets/${dataset.namespace}/${dataset.datasetId}}
}`}
                </pre>
              </section>
            </div>
          )}
        </main>

        {/* Right Sidebar */}
        <aside className="ubio-detail-sidebar">
          {/* CLI Action Box */}
          <div className="sidebar-card cli-action-card">
            <div className="cli-action-header">
              <Terminal size={16} className="text-green" />
              <span>Download with UbuntuBio CLI</span>
            </div>
            <p className="cli-action-hint">
              Clone or download this dataset directly to your local workstation or pipeline:
            </p>
            <div className="cli-code-box">
              <span className="cli-prompt">$</span>
              <code className="cli-cmd">ubio download {dataset.id}</code>
              <button
                type="button"
                className="btn-copy-cli"
                onClick={handleCopyPull}
                aria-label="Copy download command"
              >
                {copiedPull ? <Check size={15} className="text-green" /> : <Copy size={15} />}
              </button>
            </div>
            <div className="cli-options-links">
              <a
                href={`/datasets/${dataset.namespace}/${dataset.datasetId}/tree`}
                className="btn-pill-primary w-full"
              >
                <FolderTree size={16} /> Browse File Tree & Headers
              </a>
            </div>
          </div>

          {/* Storage Specs Card */}
          <div className="sidebar-card">
            <h4 className="sidebar-card-title">Storage Architecture</h4>
            <div className="sidebar-metric-row">
              <span className="sidebar-metric-label">Engine</span>
              <span className="sidebar-metric-val">OpenXet CAS Deduplication</span>
            </div>
            <div className="sidebar-metric-row">
              <span className="sidebar-metric-label">Total Files</span>
              <span className="sidebar-metric-val font-mono">{dataset.files.length} files</span>
            </div>
            <div className="sidebar-metric-row">
              <span className="sidebar-metric-label">CAS Chunks</span>
              <span className="sidebar-metric-val font-mono">
                {dataset.files.reduce((acc, f) => acc + f.chunksCount, 0)} chunks
              </span>
            </div>
            <div className="sidebar-metric-row">
              <span className="sidebar-metric-label">Access Protocol</span>
              <span className="sidebar-metric-val">HTTPS / CAS Token Stream</span>
            </div>
          </div>

          {/* Governance & Sovereignty Card */}
          <div className="sidebar-card">
            <h4 className="sidebar-card-title">AU Data Sovereignty</h4>
            <div className="sovereignty-badge">
              <ShieldCheck size={16} className="text-green" />
              <span>Nagoya Protocol Harmonized</span>
            </div>
            <p className="sidebar-text">
              Originating African Union member state data rights remain with the host laboratory.
              Global scientific use is authorized under open public health surveillance principles.
            </p>
            <a href="/docs/governance" className="sidebar-link">
              Read Governance Framework &rarr;
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
