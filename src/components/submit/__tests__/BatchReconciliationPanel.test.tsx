import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { BatchReconciliationPanel } from "../BatchReconciliationPanel";
import { ReconciliationReport } from "../../../lib/parityMatcher";

describe("BatchReconciliationPanel", () => {
  const mockReport: ReconciliationReport = {
    reconciledRows: [],
    totalSamples: 10,
    matchedCount: 8,
    missingFileCount: 2,
    invalidAttributeCount: 1,
    orphanFiles: [
      { name: "ORPHAN_R1.fq.gz", sizeBytes: 1024 },
      { name: "ORPHAN_R2.fq.gz", sizeBytes: 1024 },
    ],
    canProceed: false,
  };

  it("renders metric cards and values correctly", () => {
    render(
      <BatchReconciliationPanel
        report={mockReport}
        discoveredFiles={[]}
        onFilesDiscovered={vi.fn()}
        onClearFiles={vi.fn()}
        onAddRowsFromOrphans={vi.fn()}
      />
    );

    expect(screen.getByText("8")).toBeDefined();
    expect(screen.getByText("Matched Samples")).toBeDefined();

    expect(screen.getAllByText("2").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Missing Files")).toBeDefined();

    expect(screen.getByText("1")).toBeDefined();
    expect(screen.getByText("Invalid Cells")).toBeDefined();

    expect(screen.getByText(/2 sequence files in the folder are not declared in the table/i)).toBeDefined();
  });

  it("triggers onAddRowsFromOrphans callback when button is clicked", () => {
    const onAdd = vi.fn();
    render(
      <BatchReconciliationPanel
        report={mockReport}
        discoveredFiles={[]}
        onFilesDiscovered={vi.fn()}
        onClearFiles={vi.fn()}
        onAddRowsFromOrphans={onAdd}
      />
    );

    const button = screen.getByText("Add Rows from Orphan Files");
    fireEvent.click(button);
    expect(onAdd).toHaveBeenCalledTimes(1);
  });
});
