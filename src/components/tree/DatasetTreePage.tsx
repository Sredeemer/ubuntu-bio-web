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
  ChevronRight
} from "lucide-react";
import { DatasetItem, DatasetFile } from "../../data/datasets";
import { fetchRepoTree, TreeItem } from "../../lib/api";

interface DatasetTreePageProps {
  dataset?: DatasetItem | null | undefined;
  namespace: string;
  datasetId: string;
}

export function DatasetTreePage({ dataset, namespace, datasetId }: DatasetTreePageProps) {
  const [fileList, setFileList] = useState<DatasetFile[]>(dataset?.files || []);
  const [selectedFile, setSelectedFile] = useState<DatasetFile | null>(() => {
    if (dataset && dataset.files.length > 0) {
      return dataset.files[0] ?? null;
    }
    return null;
  });
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState(false);
  const [copiedHeader, setCopiedHeader] = useState(false);

  // Sync with live Git tree from FastAPI Hub
  useEffect(() => {
    fetchRepoTree(namespace, datasetId).then((items: TreeItem[]) => {
      if (items && items.length > 0) {
        const liveFiles: DatasetFile[] = items.map((item) => {
          const ext = item.path.split(".").pop()?.toUpperCase() || "TSV";
          const format = (["FASTQ", "BAM", "VCF", "FASTA", "TSV", "JSON"].includes(ext)
            ? ext
            : "TSV") as DatasetFile["format"];
          return {
            name: item.path.split("/").pop() || item.path,
            path: item.path,
            sizeBytes: item.size || 1024,
            format,
            casHash: `git:${item.oid}`,
            chunksCount: 1,
          };
        });
        setFileList(liveFiles);
        if (!selectedFile && liveFiles.length > 0) {
          setSelectedFile(liveFiles[0] ?? null);
        }
      }
    });
  }, [namespace, datasetId]);

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
    ? `>sequence_record_${selectedFile.name.replace(/[^a-zA-Z0-9]/g, "_")}\n` +
      `ATGCGATCGATCGATCGATCGATCGATCGATCGATCGATCGA\n` +
      `GCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGC\n` +
      `CGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCG`
    : "";

  const previewText = selectedFile?.previewHeader || fallbackPreview;

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
          {dataset.name} &bull; <span className="font-mono">{fileList.length} indexed files</span>
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
            <span className="tree-list-count font-mono">{fileList.length} files</span>
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
                <button
                  type="button"
                  className="btn-copy-header"
                  onClick={() => handleCopyHeader(previewText)}
                  title="Copy header content"
                >
                  {copiedHeader ? (
                    <>
                      <Check size={14} className="text-green" /> Copied Header
                    </>
                  ) : (
                    <>
                      <Copy size={14} /> Copy Sequence
                    </>
                  )}
                </button>
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
                  <span className="meta-val font-mono">{selectedFile.chunksCount} CAS chunks</span>
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

              {/* CLI Command Box */}
              <div className="preview-cli-block">
                <span className="cli-hint">Download this dataset with UbuntuBio CLI:</span>
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
                  <span className="code-header-badge font-mono">Live Ingest Sample</span>
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
