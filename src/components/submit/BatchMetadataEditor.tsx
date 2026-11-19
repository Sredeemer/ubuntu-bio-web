"use client";

import React, { useRef, useState } from "react";
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
import { normalizeDateString, firstDateOf } from "../../lib/dateNormalize";
import { FieldTooltip } from "../ui/FieldTooltip";
import "./BatchMetadataEditor.css";

const TAXON_GUIDANCE =
  "NCBI Taxonomy ID of the sequenced organism: a positive whole number (e.g. 11620 for Lassa mammarenavirus). Human data (Taxon ID 9606) is prohibited under the African Union sovereign-data invariants.";
const COUNTRY_GUIDANCE =
  "Two-letter ISO 3166-1 alpha-2 code of the African Union member state where the sample was collected (e.g. NG, KE, SN, ZA).";
const DATE_GUIDANCE =
  "Collection date in ISO-8601 format: YYYY-MM-DD (YYYY-MM is also accepted). Use Normalize Dates to convert recognised formats.";

function CellGuidance({ issue, guidance }: { issue?: string | undefined; guidance: string }) {
  return (
    <>
      {issue && <span className="field-tip-issue">{issue}</span>}
      <span className="field-tip-guidance">{guidance}</span>
    </>
  );
}

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
  // A wizard-level range ("start/end") is not a single sample's date; default rows to its start.
  const collectionDateDefault = firstDateOf(defaults.collectionDate);
  const [feedback, setFeedback] = useState<{ kind: "success" | "warning" | "info"; text: string } | null>(null);
  const templateDefaults = { ...defaults, collectionDate: collectionDateDefault };

  const handleDownloadTemplate = (format: "tsv" | "csv") => {
    const content =
      format === "tsv"
        ? generateSampleTemplateTsv(templateDefaults)
        : generateSampleTemplateCsv(templateDefaults);

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
    const dateStr = collectionDateDefault || fallbackDate;

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
    setFeedback(null);

    if (field === "taxon_id") {
      target.taxon_id = value ? parseInt(value, 10) || value : "";
    } else {
      (target as any)[field] = value;
    }

    const updated = [...rows];
    updated[index] = target;
    onChange(updated);
  };

  /**
   * Reset the study-level fields of every row to the defaults chosen earlier in the wizard.
   * An explicit reset overwrites manual edits, but only where a study default actually exists;
   * identifiers and read-file paths (sample_id, forward/reverse read) are never touched.
   */
  const handleFillDefaults = () => {
    if (rows.length === 0) {
      setFeedback({ kind: "info", text: "Add a row first, then use Fill Defaults to apply the study defaults." });
      return;
    }
    const fallbackDate = new Date().toISOString().split("T")[0] ?? "2026-01-01";
    let changedRows = 0;
    const updated: BatchSampleRow[] = rows.map((r) => {
      const next: BatchSampleRow = {
        ...r,
        taxon_id: defaults.taxonId || r.taxon_id || 5833,
        country: defaults.countryCode || r.country || "NG",
        collection_date: collectionDateDefault || r.collection_date || fallbackDate,
        host: defaults.hostSpecies || r.host || "Homo sapiens",
        isolation_source: defaults.sampleType || r.isolation_source || "clinical specimen",
      };
      const changed =
        String(next.taxon_id) !== String(r.taxon_id) ||
        next.country !== r.country ||
        next.collection_date !== r.collection_date ||
        next.host !== r.host ||
        next.isolation_source !== r.isolation_source;
      if (changed) changedRows += 1;
      return changed ? next : r;
    });
    onChange(updated);
    setFeedback(
      changedRows > 0
        ? {
            kind: "success",
            text: `Defaults applied to ${changedRows} of ${rows.length} row${rows.length === 1 ? "" : "s"}.`,
          }
        : { kind: "info", text: "All rows already match the study defaults." }
    );
  };

  /**
   * Rewrite recognised alternative date formats to ISO-8601 (YYYY-MM-DD). Ambiguous or invalid
   * values (e.g. 03/04/2026) are never guessed at: they stay as typed and stay flagged.
   */
  const handleNormalizeDates = () => {
    if (rows.length === 0) {
      setFeedback({ kind: "info", text: "There are no rows to normalize." });
      return;
    }
    let normalized = 0;
    const unresolved: number[] = [];
    const updated: BatchSampleRow[] = rows.map((r, idx) => {
      const result = normalizeDateString(r.collection_date);
      if (result.status === "normalized") {
        normalized += 1;
        return { ...r, collection_date: result.value };
      }
      if (result.status === "ambiguous" || result.status === "invalid") unresolved.push(idx + 1);
      return r;
    });

    if (normalized > 0) onChange(updated);

    const parts: string[] = [];
    if (normalized > 0) parts.push(`Normalized ${normalized} date${normalized === 1 ? "" : "s"} to YYYY-MM-DD.`);
    if (unresolved.length > 0) {
      parts.push(
        `Row${unresolved.length === 1 ? "" : "s"} ${unresolved.join(", ")} could not be converted (ambiguous or invalid) — fix ${unresolved.length === 1 ? "it" : "them"} manually.`
      );
    }
    if (parts.length === 0) parts.push("All dates are already in YYYY-MM-DD format.");
    setFeedback({ kind: unresolved.length > 0 ? "warning" : normalized > 0 ? "success" : "info", text: parts.join(" ") });
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
      {/* Sleek, 1-Line Compact Toolbar */}
      <div className="batch-toolbar">
        <div className="batch-toolbar-left">
          <button
            type="button"
            className="btn-toolbar btn-toolbar-primary"
            onClick={handleAddRow}
          >
            <Plus size={14} />
            <span>Add Row</span>
          </button>

          <button
            type="button"
            className="btn-toolbar"
            onClick={() => fileUploadInputRef.current?.click()}
            title="Import metadata from TSV, CSV, or Tab-delimited spreadsheet"
          >
            <Upload size={13} />
            <span>Upload Sheet</span>
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
            title="Populate missing fields with study defaults from Step 1"
          >
            <Wand2 size={13} />
            <span>Fill Defaults</span>
          </button>

          <button
            type="button"
            className="btn-toolbar"
            onClick={handleNormalizeDates}
            title="Convert recognised date formats (e.g. 14/05/2026, 1 Oct 2026) to ISO-8601 (YYYY-MM-DD). Ambiguous dates are left for you to fix."
          >
            <CalendarCheck size={13} />
            <span>Normalize Dates</span>
          </button>
        </div>

        <div className="batch-toolbar-right">
          <div className="template-download-group">
            <span className="template-download-label">
              <Download size={12} />
              <span>Template:</span>
            </span>
            <button
              type="button"
              className="btn-template-pill"
              onClick={() => handleDownloadTemplate("tsv")}
              title="Download TSV template with header specification"
            >
              TSV
            </button>
            <button
              type="button"
              className="btn-template-pill"
              onClick={() => handleDownloadTemplate("csv")}
              title="Download CSV template with header specification"
            >
              CSV
            </button>
          </div>

          {rows.length > 0 && (
            <button
              type="button"
              className="btn-toolbar btn-toolbar-ghost-danger"
              onClick={() => onChange([])}
              title="Clear all records from table"
            >
              <Trash2 size={13} />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      <div className="batch-feedback-region" role="status" aria-live="polite">
        {feedback && (
          <p className={`batch-feedback batch-feedback-${feedback.kind}`}>{feedback.text}</p>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="table-empty-container">
          <div className="table-empty-box">
            <div className="table-empty-title">Specimen Matrix Is Empty</div>
            <div className="table-empty-desc">
              No sample records in table. Use the toolbar above to add rows, upload a sheet (TSV/CSV), or paste cells (Ctrl+V).
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="batch-paste-hint">
            <HelpCircle size={13} />
            <span>Tip: You can copy cells directly from Microsoft Excel or Google Sheets and paste (Ctrl+V) into this table.</span>
          </div>

          <div className="batch-table-container">
            <table className="batch-table">
              <thead>
                <tr>
                  <th style={{ width: "36px", textAlign: "center" }}>#</th>
                  <th style={{ width: "105px" }}>Status</th>
                  <th style={{ minWidth: "130px" }}>Sample ID *</th>
                  <th style={{ minWidth: "90px" }}>
                    Taxon ID *{" "}
                    <FieldTooltip content={<span className="field-tip-guidance">{TAXON_GUIDANCE}</span>}>
                      <button type="button" className="th-help-btn" aria-label="About Taxon ID">
                        <HelpCircle size={12} aria-hidden="true" />
                      </button>
                    </FieldTooltip>
                  </th>
                  <th style={{ minWidth: "80px" }}>
                    AU Country *{" "}
                    <FieldTooltip content={<span className="field-tip-guidance">{COUNTRY_GUIDANCE}</span>}>
                      <button type="button" className="th-help-btn" aria-label="About AU Country">
                        <HelpCircle size={12} aria-hidden="true" />
                      </button>
                    </FieldTooltip>
                  </th>
                  <th style={{ minWidth: "120px" }}>Collection Date *</th>
                  <th style={{ minWidth: "140px" }}>Host Organism *</th>
                  <th style={{ minWidth: "140px" }}>Specimen Source *</th>
                  <th style={{ minWidth: "180px" }}>Forward Read (R1) *</th>
                  {isPaired && <th style={{ minWidth: "180px" }}>Reverse Read (R2) *</th>}
                  <th style={{ width: "38px", textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => {
                  const recon = getRowReconciliation(idx);
                  const status = recon?.status || "pending_folder";

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
                          {status === "matched"
                            ? "Matched"
                            : status === "pending_folder"
                            ? "Folder Pending"
                            : status === "missing_file"
                            ? "Missing File"
                            : "Invalid"}
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
                        <FieldTooltip
                          block
                          invalid={Boolean(taxonIssue)}
                          content={<CellGuidance issue={taxonIssue} guidance={TAXON_GUIDANCE} />}
                        >
                          <input
                            type="text"
                            inputMode="numeric"
                            aria-label={`Taxon ID, row ${idx + 1}`}
                            aria-invalid={taxonIssue ? true : undefined}
                            className={`cell-input font-mono ${taxonIssue ? "cell-input-error" : ""}`}
                            value={row.taxon_id}
                            onChange={(e) => handleUpdateCell(idx, "taxon_id", e.target.value)}
                          />
                        </FieldTooltip>
                      </td>
                      <td>
                        <FieldTooltip
                          block
                          invalid={Boolean(countryIssue)}
                          content={<CellGuidance issue={countryIssue} guidance={COUNTRY_GUIDANCE} />}
                        >
                          <input
                            type="text"
                            maxLength={2}
                            aria-label={`AU country code, row ${idx + 1}`}
                            aria-invalid={countryIssue ? true : undefined}
                            className={`cell-input font-mono ${countryIssue ? "cell-input-error" : ""}`}
                            style={{ textTransform: "uppercase" }}
                            value={row.country}
                            onChange={(e) => handleUpdateCell(idx, "country", e.target.value)}
                          />
                        </FieldTooltip>
                      </td>
                      <td>
                        <FieldTooltip
                          block
                          invalid={Boolean(dateIssue)}
                          content={<CellGuidance issue={dateIssue} guidance={DATE_GUIDANCE} />}
                        >
                          <input
                            type="text"
                            aria-label={`Collection date, row ${idx + 1}`}
                            aria-invalid={dateIssue ? true : undefined}
                            className={`cell-input ${dateIssue ? "cell-input-error" : ""}`}
                            placeholder="YYYY-MM-DD"
                            value={row.collection_date}
                            onChange={(e) => handleUpdateCell(idx, "collection_date", e.target.value)}
                          />
                        </FieldTooltip>
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
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
