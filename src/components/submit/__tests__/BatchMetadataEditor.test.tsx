import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { BatchMetadataEditor } from "../BatchMetadataEditor";
import { BatchSampleRow } from "../../../lib/templateGenerator";
import { ReconciliationReport } from "../../../lib/parityMatcher";

describe("BatchMetadataEditor", () => {
  const dummyReport: ReconciliationReport = {
    reconciledRows: [],
    totalSamples: 0,
    matchedCount: 0,
    missingFileCount: 0,
    invalidAttributeCount: 0,
    orphanFiles: [],
    canProceed: true,
  };

  const sampleDefaults = {
    taxonId: 5833,
    countryCode: "NG",
    hostSpecies: "Homo sapiens",
    sampleType: "blood specimen",
    collectionDate: "2026-05-01",
    layout: "PAIRED" as const,
  };

  it("renders toolbar controls and empty state instructions", () => {
    render(
      <BatchMetadataEditor
        rows={[]}
        onChange={vi.fn()}
        report={dummyReport}
        defaults={sampleDefaults}
        isPaired={true}
      />
    );

    expect(screen.getByText("Add Row")).toBeDefined();
    expect(screen.getByText("Upload Sheet")).toBeDefined();
    expect(screen.getByText("Fill Defaults")).toBeDefined();
    expect(screen.getByText("Normalize Dates")).toBeDefined();
    expect(screen.getByText("TSV")).toBeDefined();
    expect(screen.getByText("CSV")).toBeDefined();
    expect(screen.getByText(/No sample records in table/i)).toBeDefined();
  });

  it("triggers onChange when Add Row button is clicked", () => {
    const onChange = vi.fn();
    render(
      <BatchMetadataEditor
        rows={[]}
        onChange={onChange}
        report={dummyReport}
        defaults={sampleDefaults}
        isPaired={true}
      />
    );

    fireEvent.click(screen.getByText("Add Row"));
    expect(onChange).toHaveBeenCalledTimes(1);
    const addedRows: BatchSampleRow[] = onChange.mock.calls[0]![0];
    expect(addedRows.length).toBe(1);
    expect(addedRows[0]?.sample_id).toBe("SAMPLE_001");
    expect(addedRows[0]?.country).toBe("NG");
  });

  it("renders rows and updates cell on change", () => {
    const initialRows: BatchSampleRow[] = [
      {
        sample_id: "SAM_01",
        taxon_id: 5833,
        country: "NG",
        collection_date: "2026-05-01",
        host: "Homo sapiens",
        isolation_source: "blood",
        forward_read: "reads/s1_R1.fq.gz",
        reverse_read: "reads/s1_R2.fq.gz",
      },
    ];

    const onChange = vi.fn();
    render(
      <BatchMetadataEditor
        rows={initialRows}
        onChange={onChange}
        report={dummyReport}
        defaults={sampleDefaults}
        isPaired={true}
      />
    );

    const sampleInput = screen.getByDisplayValue("SAM_01");
    fireEvent.change(sampleInput, { target: { value: "SAM_EDITED" } });

    expect(onChange).toHaveBeenCalledTimes(1);
    const updatedRows: BatchSampleRow[] = onChange.mock.calls[0]![0];
    expect(updatedRows[0]?.sample_id).toBe("SAM_EDITED");
  });

  it("highlights invalid cells with error styling and informative tooltip", () => {
    const invalidRow: BatchSampleRow = {
      sample_id: "SAM_ERR",
      taxon_id: 9606, // Prohibited human taxon
      country: "US", // Non-AU country
      collection_date: "invalid-date",
      host: "Homo sapiens",
      isolation_source: "blood",
      forward_read: "reads/err_R1.fq.gz",
    };

    const invalidReport: ReconciliationReport = {
      reconciledRows: [
        {
          row: invalidRow,
          originalIndex: 0,
          status: "invalid_attributes",
          issues: [
            {
              field: "taxon_id",
              message: "Taxon ID 9606 is prohibited.",
              severity: "error",
            },
            {
              field: "country",
              message: "Country must be one of the 54 African Union member states.",
              severity: "error",
            },
          ],
        },
      ],
      totalSamples: 1,
      matchedCount: 0,
      missingFileCount: 0,
      invalidAttributeCount: 2,
      orphanFiles: [],
      canProceed: false,
    };

    render(
      <BatchMetadataEditor
        rows={[invalidRow]}
        onChange={vi.fn()}
        report={invalidReport}
        defaults={sampleDefaults}
        isPaired={false}
      />
    );

    const taxonInput = screen.getByDisplayValue("9606");
    expect(taxonInput.className).toContain("cell-input-error");
    expect(taxonInput.getAttribute("title")).toBe("Taxon ID 9606 is prohibited.");

    const countryInput = screen.getByDisplayValue("US");
    expect(countryInput.className).toContain("cell-input-error");
    expect(countryInput.getAttribute("title")).toBe(
      "Country must be one of the 54 African Union member states."
    );
  });

  it("displays 'Folder Pending' status badge when sequence folder is not yet linked", () => {
    const pendingRow: BatchSampleRow = {
      sample_id: "SAM_PENDING",
      taxon_id: 5833,
      country: "GH",
      collection_date: "2026-05-01",
      host: "Homo sapiens",
      isolation_source: "blood",
      forward_read: "reads/pending_R1.fq.gz",
    };

    const pendingReport: ReconciliationReport = {
      reconciledRows: [
        {
          row: pendingRow,
          originalIndex: 0,
          status: "pending_folder",
          issues: [
            {
              field: "forward_read",
              message: "No folder scanned yet.",
              severity: "warning",
            },
          ],
        },
      ],
      totalSamples: 1,
      matchedCount: 0,
      missingFileCount: 0,
      invalidAttributeCount: 0,
      orphanFiles: [],
      canProceed: false,
    };

    render(
      <BatchMetadataEditor
        rows={[pendingRow]}
        onChange={vi.fn()}
        report={pendingReport}
        defaults={sampleDefaults}
        isPaired={false}
      />
    );

    expect(screen.getByText("Folder Pending")).toBeDefined();
    expect(screen.queryByText("Matched")).toBeNull();
  });
});
