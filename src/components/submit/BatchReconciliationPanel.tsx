"use client";

import React, { useRef, useState } from "react";
import { Folder, FolderUp, CheckCircle2, AlertTriangle, AlertCircle, FilePlus2, Trash2, Upload } from "lucide-react";
import { DiscoveredSequenceFile, ReconciliationReport } from "../../lib/parityMatcher";
import { BatchSampleRow, parseBatchSheet } from "../../lib/templateGenerator";
import "./BatchReconciliationPanel.css";

interface BatchReconciliationPanelProps {
  report: ReconciliationReport;
  discoveredFiles: DiscoveredSequenceFile[];
  onFilesDiscovered: (files: DiscoveredSequenceFile[]) => void;
  onClearFiles: () => void;
  onAddRowsFromOrphans: () => void;
  onSheetDiscovered?: (rows: BatchSampleRow[]) => void;
}

export function BatchReconciliationPanel({
  report,
  discoveredFiles,
  onFilesDiscovered,
  onClearFiles,
  onAddRowsFromOrphans,
  onSheetDiscovered,
}: BatchReconciliationPanelProps) {
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const items = e.dataTransfer.items;
    if (!items || items.length === 0) return;

    const filesFound: DiscoveredSequenceFile[] = [];
    const sheetFiles: File[] = [];

    const processEntry = (entry: any): Promise<void> => {
      return new Promise((resolve) => {
        if (entry.isFile) {
          entry.file((file: File) => {
            if (
              file.name.match(/\.(tsv|csv|tab)$/i) ||
              (file.name.endsWith(".txt") && file.name.toLowerCase().includes("sample"))
            ) {
              sheetFiles.push(file);
            }
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
          if (file.name.match(/\.(tsv|csv|tab)$/i)) {
            sheetFiles.push(file);
          }
          filesFound.push({
            name: file.name,
            sizeBytes: file.size,
          });
        }
      }
    }

    await Promise.all(promises);

    // If a sheet file was discovered inside the dropped folder/files
    if (sheetFiles.length > 0 && onSheetDiscovered) {
      const firstSheet = sheetFiles[0];
      if (firstSheet) {
        try {
          const text = await firstSheet.text();
          const parsed = parseBatchSheet(text);
          if (parsed.length > 0) {
            onSheetDiscovered(parsed);
          }
        } catch {
          // ignore parsing error
        }
      }
    }

    if (filesFound.length > 0) {
      onFilesDiscovered(filesFound);
    }
  };

  const handleFolderInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const filesFound: DiscoveredSequenceFile[] = [];
    const sheetFiles: File[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (!file) continue;
      if (
        file.name.match(/\.(tsv|csv|tab)$/i) ||
        (file.name.endsWith(".txt") && file.name.toLowerCase().includes("sample"))
      ) {
        sheetFiles.push(file);
      }
      filesFound.push({
        name: file.name,
        relativePath: (file as any).webkitRelativePath || file.name,
        sizeBytes: file.size,
      });
    }

    if (sheetFiles.length > 0 && onSheetDiscovered) {
      const firstSheet = sheetFiles[0];
      if (firstSheet) {
        try {
          const text = await firstSheet.text();
          const parsed = parseBatchSheet(text);
          if (parsed.length > 0) {
            onSheetDiscovered(parsed);
          }
        } catch {
          // ignore parsing error
        }
      }
    }

    onFilesDiscovered(filesFound);
    e.target.value = "";
  };

  const hasActivity = report.totalSamples > 0 || discoveredFiles.length > 0;

  return (
    <div className="batch-reconcile-container">
      {/* Sleek, space-conserving Dropzone Banner */}
      <div
        className={`batch-folder-dropzone ${isDragging ? "active" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
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

        <div className="folder-dropzone-left">
          <FolderUp size={22} className="folder-dropzone-icon" />
          <div className="folder-dropzone-info">
            <span className="folder-dropzone-title">
              {discoveredFiles.length > 0
                ? `${discoveredFiles.length} Sequence Files Scanned`
                : "Drag & Drop Local Sequencing Folder"}
            </span>
            <span className="folder-dropzone-subtext">
              {discoveredFiles.length > 0
                ? "Local directory linked. Read files will be verified against the matrix."
                : "FASTQ, FASTA, or BAM reads. Validated locally without uploading."}
            </span>
          </div>
        </div>

        <div className="folder-dropzone-actions" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="btn-folder-browse"
            onClick={() => folderInputRef.current?.click()}
          >
            <Folder size={14} />
            <span>{discoveredFiles.length > 0 ? "Change Folder" : "Browse Folder"}</span>
          </button>

          {discoveredFiles.length > 0 && (
            <button
              type="button"
              className="btn-folder-clear"
              onClick={onClearFiles}
              title="Unlink scanned folder files"
            >
              <Trash2 size={14} />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Parity Status Strip: Only show when there are samples or files. Never show empty 0 cards! */}
      {hasActivity && (
        <div className="batch-parity-strip" data-testid="batch-parity-strip">
          <div className="parity-chip parity-chip-neutral">
            <span className="parity-chip-label">Total Samples</span>
            <span className="parity-chip-val">{report.totalSamples}</span>
          </div>

          {discoveredFiles.length === 0 && report.matchedCount === 0 && report.missingFileCount === 0 ? (
            <div className="parity-chip parity-chip-pending">
              <span className="parity-chip-dot" />
              <span>Awaiting folder drop to verify reads on disk</span>
            </div>
          ) : (
            <>
              <div className={`parity-chip ${report.matchedCount > 0 ? "parity-chip-matched" : "parity-chip-neutral"}`}>
                <CheckCircle2 size={13} />
                <span className="parity-chip-label">Matched Samples</span>
                <span className="parity-chip-val">{report.matchedCount}</span>
              </div>

              {report.missingFileCount > 0 && (
                <div className="parity-chip parity-chip-missing">
                  <AlertCircle size={13} />
                  <span className="parity-chip-label">Missing Files</span>
                  <span className="parity-chip-val">{report.missingFileCount}</span>
                </div>
              )}

              {report.orphanFiles.length > 0 && (
                <div className="parity-chip parity-chip-orphan">
                  <AlertTriangle size={13} />
                  <span className="parity-chip-label">Unlinked Reads</span>
                  <span className="parity-chip-val">{report.orphanFiles.length}</span>
                </div>
              )}

              {report.invalidAttributeCount > 0 && (
                <div className="parity-chip parity-chip-invalid">
                  <AlertCircle size={13} />
                  <span className="parity-chip-label">Invalid Cells</span>
                  <span className="parity-chip-val">{report.invalidAttributeCount}</span>
                </div>
              )}

              {report.totalSamples > 0 &&
                report.matchedCount === report.totalSamples &&
                report.missingFileCount === 0 &&
                report.invalidAttributeCount === 0 && (
                  <div className="parity-chip parity-chip-all-good">
                    <CheckCircle2 size={13} />
                    <span>All reads verified on disk</span>
                  </div>
                )}
            </>
          )}
        </div>
      )}

      {/* Orphan Files Quick Link Alert */}
      {report.orphanFiles.length > 0 && (
        <div className="orphan-alert-banner">
          <div className="orphan-banner-left">
            <AlertTriangle size={15} />
            <span>
              {report.orphanFiles.length} sequence file{report.orphanFiles.length === 1 ? "" : "s"} in the folder {report.orphanFiles.length === 1 ? "is" : "are"} not declared in the table.
            </span>
          </div>
          <button
            type="button"
            className="btn-action-sm"
            onClick={onAddRowsFromOrphans}
          >
            <FilePlus2 size={13} />
            <span>Add Rows from Orphan Files</span>
          </button>
        </div>
      )}
    </div>
  );
}
