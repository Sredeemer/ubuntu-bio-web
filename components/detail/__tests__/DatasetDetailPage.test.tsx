import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { DatasetDetailPage } from "../DatasetDetailPage";
import { getDataset } from "../../../data/datasets";

describe("DatasetDetailPage", () => {
  const sampleDataset = getDataset("pasteur-dakar", "lassa-surveillance-2026")!;

  it("renders dataset details, metadata, and breadcrumb", () => {
    render(
      <DatasetDetailPage
        dataset={sampleDataset}
        namespace="pasteur-dakar"
        datasetId="lassa-surveillance-2026"
      />
    );

    expect(
      screen.getByRole("heading", { name: /Lassa Mammarenavirus Genomic Surveillance/i })
    ).toBeDefined();
    expect(screen.getByText(/Institut Pasteur de Dakar/i)).toBeDefined();
    expect(screen.getByText(/NCBI:11620/i)).toBeDefined();
  });

  it("switches tabs between Overview, Files Manifest, and Citation", () => {
    render(
      <DatasetDetailPage
        dataset={sampleDataset}
        namespace="pasteur-dakar"
        datasetId="lassa-surveillance-2026"
      />
    );

    // Initial Overview tab
    expect(screen.getByText(/MIxS Genomic Metadata Invariants/i)).toBeDefined();

    // Click Files tab
    const filesTab = screen.getByRole("tab", { name: /Files Manifest/i });
    fireEvent.click(filesTab);
    expect(screen.getByText(/Dataset Files & CAS Content Hashes/i)).toBeDefined();

    // Click Citation tab
    const citationTab = screen.getByRole("tab", { name: /Citation & Provenance/i });
    fireEvent.click(citationTab);
    expect(screen.getByText(/How to Cite this Dataset/i)).toBeDefined();
    expect(screen.getByText(/@dataset\{pasteur-dakar_lassa_surveillance_2026/i)).toBeDefined();
  });

  it("renders not-found state when dataset does not exist", () => {
    render(
      <DatasetDetailPage
        dataset={undefined}
        namespace="invalid-ns"
        datasetId="invalid-id"
      />
    );

    expect(screen.getByText(/Dataset Not Found/i)).toBeDefined();
    expect(screen.getByText(/Return to Datasets Catalog/i)).toBeDefined();
  });

  it("copies pull command to clipboard", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(
      <DatasetDetailPage
        dataset={sampleDataset}
        namespace="pasteur-dakar"
        datasetId="lassa-surveillance-2026"
      />
    );

    const copyBtn = screen.getByLabelText(/Copy download command/i);
    fireEvent.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalledWith(
      "ubio download pasteur-dakar/lassa-surveillance-2026"
    );
  });
});
