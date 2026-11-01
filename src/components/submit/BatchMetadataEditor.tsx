"use client";

import React, { useRef } from "react";
import {
  Download,
  Upload,
  Plus,
  Trash2,
  Wand2,
  CalendarCheck,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import {
  BatchSampleRow,
  TemplateDefaults,
  generateSampleTemplateTsv,
  generateSampleTemplateCsv,
  parseBatchSheet,
} from "../../lib/templateGenerator";
import { ReconciliationReport, ReconciledRow } from "../../lib/parityMatcher";
import "./BatchMetadataEditor.css";

interface BatchMetadataEditorProps {
  rows: BatchSampleRow[];
  onChange: (rows: BatchSampleRow[]) => void;
  report: ReconciliationReport;
  defaults: TemplateDefaults;
  isPaired: boolean;
}

export function BatchMetadataEditor({
  rows,
  onChange,
  report,
  defaults,
  isPaired,
}: BatchMetadataEditorProps) {
  const fileUploadInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = (format: "tsv" | "csv") => {
    const content =
      format === "tsv"
        ? generateSampleTemplateTsv(defaults)
        : generateSampleTemplateCsv(defaults);

    const mime = format === "tsv" ? "text/tab-separated-values" : "text/csv";
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ubuntubio_sample_template.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUploadSheet = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result;
      if (typeof text === "string") {
        const parsedRows = parseBatchSheet(text);
        if (parsedRows.length > 0) {
          onChange(parsedRows);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const clipboardData = e.clipboardData.getData("text");
    if (!clipboardData || (!clipboardData.includes("\t") && !clipboardData.includes("\n"))) {
      return;
    }

    const parsed = parseBatchSheet(clipboardData);
    if (parsed.length > 0) {
      e.preventDefault();
      onChange([...rows, ...parsed]);
    }
  };

  const handleAddRow = () => {
    const nextIdx = rows.length + 1;
    const fallbackDate = new Date().toISOString().split("T")[0] ?? "2026-01-01";
    const dateStr = defaults.collectionDate || fallbackDate;

    const newRow: BatchSampleRow = {
      sample_id: `SAMPLE_${String(nextIdx).padStart(3, "0")}`,
      taxon_id: defaults.taxonId || 5833,
      country: defaults.countryCode || "NG",
      collection_date: dateStr,
      host: defaults.hostSpecies || "Homo sapiens",
      isolation_source: defaults.sampleType || "clinical specimen",
      forward_read: `reads/SAMPLE_${String(nextIdx).padStart(3, "0")}_R1.fastq.gz`,
      reverse_read: isPaired
        ? `reads/SAMPLE_${String(nextIdx).padStart(3, "0")}_R2.fastq.gz`
        : undefined,
    };

    onChange([...rows, newRow]);
  };

  const handleDeleteRow = (index: number) => {
    const updated = rows.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  const handleUpdateCell = (index: number, field: keyof BatchSampleRow, value: string) => {
    const currentRow = rows[index];
    if (!currentRow) return;

    const target: BatchSampleRow = { ...currentRow };

    if (field === "taxon_id") {
      target.taxon_id = value ? parseInt(value, 10) || value : "";
    } else {
      (target as any)[field] = value;
    }

    const updated = [...rows];
    updated[index] = target;
    onChange(updated);
  };

  const handleFillDefaults = () => {
    const fallbackDate = new Date().toISOString().split("T")[0] ?? "2026-01-01";
    const dateStr = defaults.collectionDate || fallbackDate;
    const updated: BatchSampleRow[] = rows.map((r) => ({
      ...r,
      taxon_id: r.taxon_id || defaults.taxonId || 5833,
      country: r.country || defaults.countryCode || "NG",
      collection_date: r.collection_date || dateStr,
      host: r.host || defaults.hostSpecies || "Homo sapiens",
      isolation_source: r.isolation_source || defaults.sampleType || "clinical specimen",
    }));
    onChange(updated);
  };

  const handleNormalizeDates = () => {
    const updated: BatchSampleRow[] = rows.map((r) => {
      const raw = r.collection_date.trim();
      const slashParts = raw.split(/[/]/);
      if (slashParts.length === 3) {
        const p0 = slashParts[0] ?? "";
        const p1 = slashParts[1] ?? "";
        const p2 = slashParts[2] ?? "";
        if (p0.length === 4) {
          const y = p0;
          const m = p1.padStart(2, "0");
          const d = p2.padStart(2, "0");
          return { ...r, collection_date: `${y}-${m}-${d}` };
        }
        if (p2.length === 4) {
          const y = p2;
          const m = p0.padStart(2, "0");
          const d = p1.padStart(2, "0");
          return { ...r, collection_date: `${y}-${m}-${d}` };
        }
      }
      return r;
    });
    onChange(updated);
  };

  const getRowReconciliation = (index: number): ReconciledRow | undefined => {
    return report.reconciledRows[index];
  };

  const getCellIssue = (index: number, field: keyof BatchSampleRow): string | undefined => {
    const recon = getRowReconciliation(index);
    if (!recon) return undefined;
    const issue = recon.issues.find((i) => i.field === field);
    return issue?.message;
  };

  return (
    <div className="batch-editor-wrapper" onPaste={handlePaste}>
      <div className="batch-toolbar">
        <div className="batch-toolbar-group">
          <button
            type="button"
            className="btn-toolbar btn-toolbar-primary"
            onClick={handleAddRow}
          >
            <Plus size={15} />
            <span>Add Row</span>
          </button>

          <button
            type="button"
            className="btn-toolbar"
            onClick={() => fileUploadInputRef.current?.click()}
          >
            <Upload size={14} />
            <span>Upload Sheet (TSV/CSV)</span>
          </button>

          <input
            ref={fileUploadInputRef}
            type="file"
            accept=".tsv,.csv,.txt,.tab"
            style={{ display: "none" }}
            onChange={handleUploadSheet}
          />

          <button
            type="button"
            className="btn-toolbar"
            onClick={handleFillDefaults}
          >
            <Wand2 size={14} />
            <span>Fill Study Defaults</span>
          </button>

          <button
            type="button"
            className="btn-toolbar"
            onClick={handleNormalizeDates}
          >
            <CalendarCheck size={14} />
            <span>Normalize Dates (ISO-8601)</span>
          </button>
        </div>

        <div className="batch-toolbar-group">
          <button
            type="button"
            className="btn-toolbar"
            onClick={() => handleDownloadTemplate("tsv")}
          >
            <Download size={14} />
            <span>Download TSV</span>
          </button>

          <button
            type="button"
            className="btn-toolbar"
            onClick={() => handleDownloadTemplate("csv")}
          >
            <Download size={14} />
            <span>Download CSV</span>
          </button>

          {rows.length > 0 && (
            <button
              type="button"
              className="btn-toolbar btn-toolbar-danger"
              onClick={() => onChange([])}
            >
              <Trash2 size={14} />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      <div className="batch-paste-hint">
        <HelpCircle size={14} />
        <span>Tip: You can copy cells directly from Microsoft Excel or Google Sheets and paste (Ctrl+V) into this table.</span>
      </div>

      <div className="batch-table-container">
        <table className="batch-table">
          <thead>
            <tr>
              <th style={{ width: "40px" }}>#</th>
              <th style={{ width: "90px" }}>Status</th>
              <th style={{ minWidth: "130px" }}>Sample ID *</th>
              <th style={{ minWidth: "90px" }}>Taxon ID *</th>
              <th style={{ minWidth: "80px" }}>AU Country *</th>
              <th style={{ minWidth: "120px" }}>Collection Date *</th>
              <th style={{ minWidth: "140px" }}>Host Organism *</th>
              <th style={{ minWidth: "140px" }}>Specimen Source *</th>
              <th style={{ minWidth: "180px" }}>Forward Read (R1) *</th>
              {isPaired && <th style={{ minWidth: "180px" }}>Reverse Read (R2) *</th>}
              <th style={{ width: "45px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={isPaired ? 11 : 10} style={{ textAlign: "center", padding: "36px", color: "#64748b" }}>
                  No sample records in table. Click "Add Row", upload a spreadsheet, or drop a sequence folder above.
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => {
                const recon = getRowReconciliation(idx);
                const status = recon?.status || "matched";

                const sampleIdIssue = getCellIssue(idx, "sample_id");
                const taxonIssue = getCellIssue(idx, "taxon_id");
                const countryIssue = getCellIssue(idx, "country");
                const dateIssue = getCellIssue(idx, "collection_date");
                const fwdIssue = getCellIssue(idx, "forward_read");
                const revIssue = getCellIssue(idx, "reverse_read");

                return (
                  <tr key={idx}>
                    <td style={{ textAlign: "center", color: "#64748b", fontWeight: 600 }}>{idx + 1}</td>
                    <td>
                      <span className={`status-badge-cell status-cell-${status}`}>
                        {status === "matched" ? "Matched" : status === "missing_file" ? "Missing File" : "Invalid"}
                      </span>
                    </td>
                    <td>
                      <input
                        type="text"
                        className={`cell-input font-mono ${sampleIdIssue ? "cell-input-error" : ""}`}
                        title={sampleIdIssue}
                        value={row.sample_id}
                        onChange={(e) => handleUpdateCell(idx, "sample_id", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className={`cell-input font-mono ${taxonIssue ? "cell-input-error" : ""}`}
                        title={taxonIssue}
                        value={row.taxon_id}
                        onChange={(e) => handleUpdateCell(idx, "taxon_id", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        maxLength={2}
                        className={`cell-input font-mono ${countryIssue ? "cell-input-error" : ""}`}
                        title={countryIssue}
                        style={{ textTransform: "uppercase" }}
                        value={row.country}
                        onChange={(e) => handleUpdateCell(idx, "country", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className={`cell-input ${dateIssue ? "cell-input-error" : ""}`}
                        title={dateIssue}
                        placeholder="YYYY-MM-DD"
                        value={row.collection_date}
                        onChange={(e) => handleUpdateCell(idx, "collection_date", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="cell-input"
                        value={row.host}
                        onChange={(e) => handleUpdateCell(idx, "host", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="cell-input"
                        value={row.isolation_source}
                        onChange={(e) => handleUpdateCell(idx, "isolation_source", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className={`cell-input font-mono ${fwdIssue ? "cell-input-error" : ""}`}
                        title={fwdIssue}
                        value={row.forward_read}
                        onChange={(e) => handleUpdateCell(idx, "forward_read", e.target.value)}
                      />
                    </td>
                    {isPaired && (
                      <td>
                        <input
                          type="text"
                          className={`cell-input font-mono ${revIssue ? "cell-input-error" : ""}`}
                          title={revIssue}
                          value={row.reverse_read || ""}
                          onChange={(e) => handleUpdateCell(idx, "reverse_read", e.target.value)}
                        />
                      </td>
                    )}
                    <td style={{ textAlign: "center" }}>
                      <button
                        type="button"
                        className="btn-row-delete"
                        title="Delete row"
                        onClick={() => handleDeleteRow(idx)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
