"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  UploadCloud,
  FileCheck2,
  AlertTriangle,
  ShieldAlert,
  Check,
  X,
  FileCode,
} from "lucide-react";
import {
  inspectSequenceFileWeb,
  WebSequenceInspectionResult,
} from "../../lib/sequenceSnifferWeb";

export interface SequenceDropzoneProps {
  onFilesInspected?: (results: WebSequenceInspectionResult[]) => void;
  onClearFiles?: () => void;
}

export function SequenceDropzone({ onFilesInspected, onClearFiles }: SequenceDropzoneProps) {
  const [inspectedFiles, setInspectedFiles] = useState<WebSequenceInspectionResult[]>([]);
  const [isInspecting, setIsInspecting] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      setIsInspecting(true);

      const results: WebSequenceInspectionResult[] = [];
      for (const file of acceptedFiles) {
        try {
          const res = await inspectSequenceFileWeb(file);
          results.push(res);
        } catch {
          results.push({
            fileName: file.name,
            fileSizeBytes: file.size,
            format: "UNKNOWN",
            compression: "NONE",
            phredScale: "UNKNOWN",
            estimatedReadLength: 0,
            humanContaminationDetected: false,
            issues: ["Failed to inspect file in browser."],
          });
        }
      }

      const updated = [...inspectedFiles, ...results];
      setInspectedFiles(updated);
      setIsInspecting(false);
      if (onFilesInspected) {
        onFilesInspected(updated);
      }
    },
    [inspectedFiles, onFilesInspected]
  );

  const handleRemoveFile = (index: number) => {
    const updated = inspectedFiles.filter((_, i) => i !== index);
    setInspectedFiles(updated);
    if (onFilesInspected) {
      onFilesInspected(updated);
    }
    if (updated.length === 0 && onClearFiles) {
      onClearFiles();
    }
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    multiple: true,
  });

  return (
    <div className="ubio-dropzone-wrapper">
      <div
        {...getRootProps()}
        className={`ubio-dropzone ${isDragActive ? "drag-active" : ""} ${
          isDragReject ? "drag-reject" : ""
        }`}
      >
        <input {...getInputProps()} aria-label="Drop sequence files for pre-flight validation" />
        <div className="dropzone-content">
          <div className="dropzone-icon-wrap">
            <UploadCloud size={32} className="dropzone-icon" />
          </div>
          <div className="dropzone-text-block">
            <h4 className="dropzone-title">
              {isDragActive
                ? "Drop sequence files to inspect..."
                : "Drag & drop FASTQ, FASTA, or BAM files"}
            </h4>
            <p className="dropzone-subtitle">
              Browser-native pre-flight validation. Inspects magic bytes, Phred scale, and human
              markers locally without uploading gigabytes over the network.
            </p>
            <span className="dropzone-supported">
              Supported: .fastq.gz, .fq.gz, .fasta, .fa, .bam, .cram
            </span>
          </div>
        </div>
      </div>

      {isInspecting && (
        <div className="dropzone-inspecting-notice" role="status">
          <span className="spinner-dots" /> Inspecting binary headers in browser...
        </div>
      )}

      {inspectedFiles.length > 0 && (
        <div className="dropzone-results-list">
          <div className="results-list-header">
            <span className="results-header-title">
              <FileCheck2 size={15} className="text-green" /> Pre-Flight Inspected Files (
              {inspectedFiles.length})
            </span>
            <button
              type="button"
              className="btn-clear-inspected"
              onClick={() => {
                setInspectedFiles([]);
                if (onClearFiles) onClearFiles();
              }}
            >
              Clear All
            </button>
          </div>

          <div className="results-table-scroll">
            <table className="dropzone-table">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Format</th>
                  <th>Compression</th>
                  <th>Est. Length</th>
                  <th>Phred Scale</th>
                  <th>Safety Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {inspectedFiles.map((f, idx) => (
                  <tr key={`${f.fileName}-${idx}`}>
                    <td className="font-mono text-truncate-cell">
                      <FileCode size={13} className="cell-icon" />
                      {f.fileName}
                    </td>
                    <td>
                      <span className={`badge-fmt badge-fmt-${f.format.toLowerCase()}`}>
                        {f.format}
                      </span>
                    </td>
                    <td>{f.compression}</td>
                    <td>{f.estimatedReadLength > 0 ? `${f.estimatedReadLength} bp` : "-"}</td>
                    <td>{f.phredScale}</td>
                    <td>
                      {f.humanContaminationDetected ? (
                        <span className="status-badge failed">
                          <ShieldAlert size={13} /> Human Marker Detected
                        </span>
                      ) : f.issues.length > 0 ? (
                        <span className="status-badge warning">
                          <AlertTriangle size={13} /> {f.issues[0]}
                        </span>
                      ) : (
                        <span className="status-badge passed">
                          <Check size={13} /> Passed Pre-Flight
                        </span>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-remove-row"
                        aria-label={`Remove ${f.fileName}`}
                        onClick={() => handleRemoveFile(idx)}
                      >
                        <X size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
