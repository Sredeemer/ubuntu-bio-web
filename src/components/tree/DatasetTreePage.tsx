"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  FileText,
  FolderTree,
  Copy,
  Check,
  Eye,
  Terminal,
  ShieldCheck,
  Binary,
  Layers,
  ChevronRight,
  Download,
} from "lucide-react";
import { DatasetItem, DatasetFile } from "../../data/datasets";
import { fetchRepoTree, TreeItem } from "../../lib/api";

interface DatasetTreePageProps {
  dataset?: DatasetItem | null | undefined;
  namespace: string;
  datasetId: string;
}

function detectFormat(filePath: string): DatasetFile["format"] {
  const lower = filePath.toLowerCase();
  if (
    lower.endsWith(".fastq.gz") ||
    lower.endsWith(".fq.gz") ||
    lower.endsWith(".fastq") ||
    lower.endsWith(".fq")
  ) {
    return "FASTQ";
  }
  if (
    lower.endsWith(".fasta.gz") ||
    lower.endsWith(".fa.gz") ||
    lower.endsWith(".fasta") ||
    lower.endsWith(".fa")
  ) {
    return "FASTA";
  }
  if (lower.endsWith(".vcf.gz") || lower.endsWith(".vcf")) {
    return "VCF";
  }
  if (lower.endsWith(".bam")) {
    return "BAM";
  }
  if (lower.endsWith(".json")) {
    return "JSON";
  }
  return "TSV";
}

export function DatasetTreePage({ dataset, namespace, datasetId }: DatasetTreePageProps) {
  const [fileList, setFileList] = useState<DatasetFile[]>(dataset?.files || []);
  const [selectedFile, setSelectedFile] = useState<DatasetFile | null>(() => {
    if (dataset && dataset.files.length > 0) {
      return dataset.files[0] ?? null;
    }
    return null;
  });
  const [livePreview, setLivePreview] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState(false);
  const [copiedHeader, setCopiedHeader] = useState(false);

  // Sync with live Git tree from FastAPI Hub
  useEffect(() => {
    fetchRepoTree(namespace, datasetId).then((items: TreeItem[]) => {
      if (items && items.length > 0) {
        const liveFiles: DatasetFile[] = items.map((item) => {
          const filePath = item.path || item.name || "file";
          const fileName = filePath.split("/").pop() || filePath;
          const format = detectFormat(filePath);
          return {
            name: fileName,
            path: filePath,
            sizeBytes: item.size || 1024,
            format,
            casHash: item.oid
              ? item.oid.startsWith("sha256:")
                ? item.oid
                : `git:${item.oid}`
              : "0000000000000000000000000000000000000000",
            chunksCount: Math.max(1, Math.ceil((item.size || 65536) / (64 * 1024))),
          };
        });
        setFileList(liveFiles);
        // Synchronize selectedFile with liveFiles to eliminate stale format badges
        setSelectedFile((prev) => {
          if (!prev) return liveFiles[0] ?? null;
          const match = liveFiles.find((f) => f.path === prev.path);
          return match ?? liveFiles[0] ?? null;
        });
      }
    });
  }, [namespace, datasetId]);

  // Attempt live sequence/text fetch for small human-readable files
  useEffect(() => {
    if (!selectedFile) {
      setLivePreview(null);
      return;
    }
    const lower = selectedFile.name.toLowerCase();
    const isTextReadable =
      lower.endsWith(".fasta") ||
      lower.endsWith(".fa") ||
      lower.endsWith(".tsv") ||
      lower.endsWith(".md") ||
      lower.endsWith(".txt") ||
      lower.endsWith(".json");

    if (isTextReadable && selectedFile.sizeBytes < 5 * 1024 * 1024) {
      setPreviewLoading(true);
      fetch(`/api/repos/${namespace}/${datasetId}/raw/HEAD/${selectedFile.path}`)
        .then(async (res) => {
          if (res.ok) {
            const text = await res.text();
            const snippet = text.split("\n").slice(0, 16).join("\n");
            setLivePreview(snippet);
          } else {
            setLivePreview(null);
          }
        })
        .catch(() => setLivePreview(null))
        .finally(() => setPreviewLoading(false));
    } else {
      setLivePreview(null);
    }
  }, [selectedFile?.path, namespace, datasetId]);

  if (!dataset) {
    return (
      <div className="ubio-tree-container">
        <div className="ubio-tree-not-found">
          <h2>Dataset Not Found</h2>
          <p>The dataset could not be found to browse files.</p>
          <a href="/datasets" className="btn-pill-primary">
            Return to Datasets Catalog
          </a>
        </div>
      </div>
    );
  }

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleCopyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCommand(true);
    setTimeout(() => setCopiedCommand(false), 2000);
  };

  const handleCopyHeader = (headerText: string) => {
    navigator.clipboard.writeText(headerText);
    setCopiedHeader(true);
    setTimeout(() => setCopiedHeader(false), 2000);
  };

  const getFormatBadgeClass = (format: string) => {
    switch (format) {
      case "FASTQ":
        return "format-fastq";
      case "FASTA":
        return "format-fasta";
      case "VCF":
        return "format-vcf";
      case "BAM":
        return "format-bam";
      default:
        return "format-tsv";
    }
  };

  const fallbackPreview = selectedFile
    ? selectedFile.format === "FASTQ"
      ? `@${selectedFile.name.replace(/[^a-zA-Z0-9]/g, "_")}_read1 length=150\n` +
        `GATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGA\n` +
        `+\n` +
        `IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII`
      : `>sequence_record_${selectedFile.name.replace(/[^a-zA-Z0-9]/g, "_")}\n` +
        `ATGCGATCGATCGATCGATCGATCGATCGATCGATCGATCGA\n` +
        `GCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGC\n` +
        `CGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCG`
    : "";

  const previewText = livePreview || selectedFile?.previewHeader || fallbackPreview;

  return (
    <div className="ubio-tree-container">
      {/* Breadcrumb Navigation */}
      <nav className="ubio-tree-breadcrumb" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span className="crumb-sep">/</span>
        <a href="/datasets">Datasets</a>
        <span className="crumb-sep">/</span>
        <a href={`/datasets/${namespace}/${datasetId}`}>{namespace}/{datasetId}</a>
        <span className="crumb-sep">/</span>
        <span className="crumb-current">tree</span>
      </nav>

      {/* Header */}
      <div className="ubio-tree-header">
        <div className="tree-header-top">
          <a href={`/datasets/${namespace}/${datasetId}`} className="btn-back-link">
            <ArrowLeft size={15} /> Back to Dataset Overview
          </a>
          <span className="cas-verified-tag">
            <ShieldCheck size={14} /> OpenXet Content Addressable (CAS)
          </span>
        </div>
        <h1 className="ubio-tree-title">File Tree & Sequence Browser</h1>
        <p className="ubio-tree-subtitle">
          {dataset.name} &bull;{" "}
          <span className="font-mono">
            {fileList.length} indexed {fileList.length === 1 ? "file" : "files"}
          </span>
        </p>
      </div>

      {/* Interactive Explorer Grid */}
      <div className="ubio-tree-grid">
        {/* Left Column: File Explorer List */}
        <div className="tree-list-card">
          <div className="tree-list-header">
            <span className="tree-list-title">
              <FolderTree size={16} /> Repository File Index
            </span>
            <span className="tree-list-count font-mono">
              {fileList.length} {fileList.length === 1 ? "file" : "files"}
            </span>
          </div>

          <div className="tree-files-scroll" role="listbox" aria-label="Dataset files list">
            {fileList.map((file) => {
              const isSelected = selectedFile?.path === file.path;
              const sizeMb = (file.sizeBytes / (1024 * 1024)).toFixed(2);

              return (
                <div
                  key={file.path}
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={0}
                  className={`tree-file-row ${isSelected ? "selected" : ""}`}
                  onClick={() => setSelectedFile(file)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setSelectedFile(file);
                    }
                  }}
                >
                  <div className="file-row-left">
                    <span className={`format-badge ${getFormatBadgeClass(file.format)}`}>
                      {file.format}
                    </span>
                    <span className="file-row-path font-mono">{file.path}</span>
                  </div>
                  <div className="file-row-right">
                    <span className="file-row-size font-mono">{sizeMb} MB</span>
                    <ChevronRight size={14} className="file-chevron" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: File & Sequence Inspector */}
        <div className="tree-preview-card">
          {selectedFile ? (
            <>
              <div className="preview-card-header">
                <div className="preview-title-block">
                  <span className={`format-badge ${getFormatBadgeClass(selectedFile.format)}`}>
                    {selectedFile.format}
                  </span>
                  <h3 className="preview-filename font-mono">{selectedFile.name}</h3>
                </div>
                <div className="preview-actions">
                  <a
                    href={`/api/repos/${namespace}/${datasetId}/raw/HEAD/${selectedFile.path}`}
                    download={selectedFile.name}
                    className="btn-download-file"
                    title={`Download ${selectedFile.name} to disk`}
                  >
                    <Download size={14} /> Download File
                  </a>
                  <button
                    type="button"
                    className="btn-copy-header"
                    onClick={() => handleCopyHeader(previewText)}
                    title="Copy preview content"
                  >
                    {copiedHeader ? (
                      <>
                        <Check size={14} className="text-green" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy size={14} /> Copy Preview
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* File Meta Stats Strip */}
              <div className="preview-meta-strip">
                <div className="meta-cell">
                  <span className="meta-lbl">Relative Path</span>
                  <span className="meta-val font-mono">{selectedFile.path}</span>
                </div>
                <div className="meta-cell">
                  <span className="meta-lbl">Payload Size</span>
                  <span className="meta-val font-mono">
                    {(selectedFile.sizeBytes / (1024 * 1024)).toFixed(2)} MB ({selectedFile.sizeBytes.toLocaleString()} bytes)
                  </span>
                </div>
                <div className="meta-cell">
                  <span className="meta-lbl">Deduplication</span>
                  <span className="meta-val font-mono">
                    {selectedFile.chunksCount} CAS {selectedFile.chunksCount === 1 ? "chunk" : "chunks"}
                  </span>
                </div>
              </div>

              {/* CAS Hash Block */}
              <div className="preview-hash-block">
                <div className="hash-header">
                  <span className="hash-lbl">Content-Addressable Storage (CAS) Hash:</span>
                  <button
                    type="button"
                    className="btn-copy-hash"
                    onClick={() => handleCopyHash(selectedFile.casHash)}
                  >
                    {copiedHash ? <Check size={13} className="text-green" /> : <Copy size={13} />}
                    <span>{copiedHash ? "Copied" : "Copy Hash"}</span>
                  </button>
                </div>
                <code className="hash-val font-mono">{selectedFile.casHash}</code>
              </div>

              {/* CLI Command & Direct Download Box */}
              <div className="preview-cli-block">
                <div className="cli-hint-row">
                  <span className="cli-hint">Download with UbuntuBio CLI or direct HTTP stream:</span>
                  <a
                    href={`/api/repos/${namespace}/${datasetId}/raw/HEAD/${selectedFile.path}`}
                    download={selectedFile.name}
                    className="direct-file-download-link"
                    title={`Download ${selectedFile.name}`}
                  >
                    <Download size={13} /> Direct browser download ({selectedFile.name})
                  </a>
                </div>
                <div className="cli-snippet">
                  <span className="cli-prompt">$</span>
                  <code className="font-mono">
                    ubio download {dataset.namespace}/{dataset.datasetId} --output-dir ./data
                  </code>
                  <button
                    type="button"
                    className="btn-copy-cli"
                    onClick={() =>
                      handleCopyCommand(
                        `ubio download ${dataset.namespace}/${dataset.datasetId} --output-dir ./data`
                      )
                    }
                    title="Copy CLI command"
                  >
                    {copiedCommand ? <Check size={14} className="text-green" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {/* Sequence / Header Inspection Box */}
              <div className="preview-code-section">
                <div className="preview-code-header">
                  <span className="code-header-title">
                    <Eye size={14} /> Sequence & Header Inspection (First Records)
                  </span>
                  <span className={`code-header-badge font-mono ${livePreview ? "badge-live" : "badge-synthetic"}`}>
                    {previewLoading
                      ? "Loading stream..."
                      : livePreview
                      ? "Live Remote Payload"
                      : "Sample Synthetic Header"}
                  </span>
                </div>
                <pre className="preview-code-body font-mono">
                  {previewText}
                </pre>
              </div>
            </>
          ) : (
            <div className="tree-no-selection">
              <FileText size={36} className="text-dim" />
              <p>Select a file from the repository index to inspect its CAS chunks and sequence header.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
