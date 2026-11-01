"use client";

import React, { useRef } from "react";
import { Folder, FolderUp, CheckCircle2, AlertTriangle, AlertCircle, FilePlus2, Trash2 } from "lucide-react";
import { DiscoveredSequenceFile, ReconciliationReport } from "../../lib/parityMatcher";
import "./BatchReconciliationPanel.css";

interface BatchReconciliationPanelProps {
  report: ReconciliationReport;
  discoveredFiles: DiscoveredSequenceFile[];
  onFilesDiscovered: (files: DiscoveredSequenceFile[]) => void;
  onClearFiles: () => void;
  onAddRowsFromOrphans: () => void;
}

export function BatchReconciliationPanel({
  report,
  discoveredFiles,
  onFilesDiscovered,
  onClearFiles,
  onAddRowsFromOrphans,
}: BatchReconciliationPanelProps) {
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const items = e.dataTransfer.items;
    if (!items || items.length === 0) return;

    const filesFound: DiscoveredSequenceFile[] = [];

    const processEntry = (entry: any): Promise<void> => {
      return new Promise((resolve) => {
        if (entry.isFile) {
          entry.file((file: File) => {
            filesFound.push({
              name: file.name,
              relativePath: entry.fullPath || file.name,
              sizeBytes: file.size,
            });
            resolve();
          });
        } else if (entry.isDirectory) {
          const dirReader = entry.createReader();
          dirReader.readEntries(async (entries: any[]) => {
            for (const subEntry of entries) {
              await processEntry(subEntry);
            }
            resolve();
          });
        } else {
          resolve();
        }
      });
    };

    const promises: Promise<void>[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item) continue;
      if (item.webkitGetAsEntry) {
        const entry = item.webkitGetAsEntry();
        if (entry) {
          promises.push(processEntry(entry));
        }
      } else if (item.kind === "file") {
        const file = item.getAsFile();
        if (file) {
          filesFound.push({
            name: file.name,
            sizeBytes: file.size,
          });
        }
      }
    }

    Promise.all(promises).then(() => {
      if (filesFound.length > 0) {
        onFilesDiscovered(filesFound);
      }
    });
  };

  const handleFolderInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const filesFound: DiscoveredSequenceFile[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (!file) continue;
      filesFound.push({
        name: file.name,
        relativePath: (file as any).webkitRelativePath || file.name,
        sizeBytes: file.size,
      });
    }

    onFilesDiscovered(filesFound);
  };

  return (
    <div className="batch-reconcile-container">
      <div className="batch-summary-strip">
        <div className="summary-metric-card metric-card-matched">
          <span className="summary-metric-label">Matched Samples</span>
          <span className="summary-metric-value">{report.matchedCount}</span>
        </div>

        <div className="summary-metric-card metric-card-missing">
          <span className="summary-metric-label">Missing Files</span>
          <span className="summary-metric-value">{report.missingFileCount}</span>
        </div>

        <div className="summary-metric-card metric-card-orphan">
          <span className="summary-metric-label">Unlinked Reads</span>
          <span className="summary-metric-value">{report.orphanFiles.length}</span>
        </div>

        <div className="summary-metric-card metric-card-defects">
          <span className="summary-metric-label">Invalid Cells</span>
          <span className="summary-metric-value">{report.invalidAttributeCount}</span>
        </div>
      </div>

      <div
        className="batch-folder-dropzone"
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={handleDrop}
        onClick={() => folderInputRef.current?.click()}
      >
        <input
          ref={folderInputRef}
          type="file"
          // @ts-ignore
          webkitdirectory=""
          directory=""
          multiple
          style={{ display: "none" }}
          onChange={handleFolderInputChange}
        />

        <FolderUp size={36} className="folder-dropzone-icon" />
        <div className="folder-dropzone-title">
          {discoveredFiles.length > 0
            ? `${discoveredFiles.length} Sequence Files Scanned from Folder`
            : "Drag and Drop Sequencing Folder"}
        </div>
        <div className="folder-dropzone-subtext">
          Drop a local directory containing FASTQ, FASTA, or BAM sequencing reads.
        </div>

        <div className="folder-dropzone-actions" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="btn-folder-browse"
            onClick={() => folderInputRef.current?.click()}
          >
            <Folder size={15} />
            <span>Browse Folder</span>
          </button>

          {discoveredFiles.length > 0 && (
            <button
              type="button"
              className="btn-folder-browse"
              onClick={onClearFiles}
              style={{ color: "#dc2626" }}
            >
              <Trash2 size={15} />
              <span>Clear Folder Files</span>
            </button>
          )}
        </div>
      </div>

      {report.orphanFiles.length > 0 && (
        <div className="orphan-alert-banner">
          <div className="orphan-banner-left">
            <AlertTriangle size={18} />
            <span>
              {report.orphanFiles.length} sequence file{report.orphanFiles.length === 1 ? "" : "s"} in the folder {report.orphanFiles.length === 1 ? "is" : "are"} not declared in the table.
            </span>
          </div>
          <button
            type="button"
            className="btn-action-sm"
            onClick={onAddRowsFromOrphans}
          >
            <FilePlus2 size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
            Add Rows from Orphan Files
          </button>
        </div>
      )}
    </div>
  );
}
