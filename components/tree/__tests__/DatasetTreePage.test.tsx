import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { DatasetTreePage } from "../DatasetTreePage";
import { getDataset } from "../../../data/datasets";

describe("DatasetTreePage", () => {
  const sampleDataset = getDataset("pasteur-dakar", "lassa-surveillance-2026")!;

  it("renders file explorer and file count", () => {
    render(
      <DatasetTreePage
        dataset={sampleDataset}
        namespace="pasteur-dakar"
        datasetId="lassa-surveillance-2026"
      />
    );

    expect(
      screen.getByRole("heading", { name: /File Tree & Sequence Browser/i })
    ).toBeDefined();
    expect(screen.getByText(/Repository File Index/i)).toBeDefined();
  });

  it("selects a file and displays sequence inspection preview", () => {
    render(
      <DatasetTreePage
        dataset={sampleDataset}
        namespace="pasteur-dakar"
        datasetId="lassa-surveillance-2026"
      />
    );

    // Initial first file is selected
    expect(screen.getByText(/Sequence & Header Inspection/i)).toBeDefined();
    expect(screen.getByText(/IPD_LASV_SN_001_S_segment/i)).toBeDefined();

    // Select second file
    const secondFileRow = screen.getByText("reads/IPD_LASV_R1.fastq.gz");
    fireEvent.click(secondFileRow);

    expect(screen.getByText(/ERR109381\.1/i)).toBeDefined();
  });

  it("copies CAS content hash to clipboard", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(
      <DatasetTreePage
        dataset={sampleDataset}
        namespace="pasteur-dakar"
        datasetId="lassa-surveillance-2026"
      />
    );

    const copyHashBtn = screen.getByRole("button", { name: /Copy Hash/i });
    fireEvent.click(copyHashBtn);

    expect(writeTextMock).toHaveBeenCalledWith(
      expect.stringContaining("xet:sha256:")
    );
  });

  it("copies ubio download CLI command to clipboard", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(
      <DatasetTreePage
        dataset={sampleDataset}
        namespace="pasteur-dakar"
        datasetId="lassa-surveillance-2026"
      />
    );

    const copyCliBtn = screen.getByTitle(/Copy CLI command/i);
    fireEvent.click(copyCliBtn);

    expect(writeTextMock).toHaveBeenCalledWith(
      expect.stringContaining("ubio download")
    );
  });
});
