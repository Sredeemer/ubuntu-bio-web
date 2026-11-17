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

  it("does not use a collection-date range as an individual sample default", () => {
    const onChange = vi.fn();
    const rangeDefaults = {
      ...sampleDefaults,
      collectionDate: "2026-05-01/2026-05-10",
    };
    render(
      <BatchMetadataEditor
        rows={[]}
        onChange={onChange}
        report={dummyReport}
        defaults={rangeDefaults}
        isPaired={true}
      />
    );

    fireEvent.click(screen.getByText("Add Row"));
    const addedRows: BatchSampleRow[] = onChange.mock.calls[0]![0];
    expect(addedRows[0]?.collection_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(addedRows[0]?.collection_date).not.toContain("/");
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
    expect(taxonInput.getAttribute("aria-invalid")).toBe("true");
    fireEvent.focus(taxonInput);
    const taxonTip = screen.getByRole("tooltip");
    expect(taxonTip.textContent).toContain("Taxon ID 9606 is prohibited.");
    expect(taxonInput.getAttribute("aria-describedby")).toBe(taxonTip.id);
    fireEvent.blur(taxonInput);

    const countryInput = screen.getByDisplayValue("US");
    expect(countryInput.className).toContain("cell-input-error");
    fireEvent.mouseEnter(countryInput.parentElement!);
    expect(screen.getByRole("tooltip").textContent).toContain(
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

describe("BatchMetadataEditor: Fill Defaults, Normalize Dates and field guidance", () => {
  const defaults = {
    taxonId: 11620,
    countryCode: "NG",
    hostSpecies: "Homo sapiens",
    sampleType: "blood specimen",
    collectionDate: "2026-05-01",
    layout: "SINGLE" as const,
  };

  const makeRow = (over: Partial<BatchSampleRow> = {}): BatchSampleRow => ({
    sample_id: "SAM_01",
    taxon_id: 11620,
    country: "NG",
    collection_date: "2026-05-01",
    host: "Homo sapiens",
    isolation_source: "blood specimen",
    forward_read: "reads/s1.fq.gz",
    ...over,
  });

  // Real state, so assertions are about what the form holds and shows, not about a spy.
  function Harness({ initial }: { initial: BatchSampleRow[] }) {
    const [rows, setRows] = React.useState(initial);
    return (
      <>
        <BatchMetadataEditor
          rows={rows}
          onChange={setRows}
          report={{
            reconciledRows: rows.map((row, i) => ({
              row,
              originalIndex: i,
              status: "pending_folder" as const,
              issues: [],
            })),
            totalSamples: rows.length,
            matchedCount: 0,
            missingFileCount: 0,
            invalidAttributeCount: 0,
            orphanFiles: [],
            canProceed: false,
          }}
          defaults={defaults}
          isPaired={false}
        />
        <pre data-testid="state">{JSON.stringify(rows)}</pre>
      </>
    );
  }

  const state = (): BatchSampleRow[] => JSON.parse(screen.getByTestId("state").textContent ?? "[]");

  it("Fill Defaults restores modified fields to the study defaults", () => {
    render(
      <Harness
        initial={[makeRow({ taxon_id: 99999, country: "KE", collection_date: "2020-01-01", host: "Bos taurus", isolation_source: "milk" })]}
      />
    );
    fireEvent.click(screen.getByText("Fill Defaults"));

    const row = state()[0]!;
    expect(Number(row.taxon_id)).toBe(11620);
    expect(row.country).toBe("NG");
    expect(row.collection_date).toBe("2026-05-01");
    expect(row.host).toBe("Homo sapiens");
    expect(row.isolation_source).toBe("blood specimen");
    // Identifiers and read paths are never overwritten.
    expect(row.sample_id).toBe("SAM_01");
    expect(row.forward_read).toBe("reads/s1.fq.gz");
    // The inputs show the restored values, not just the underlying state.
    expect((screen.getByLabelText("AU country code, row 1") as HTMLInputElement).value).toBe("NG");
    expect(screen.getByRole("status").textContent).toContain("Defaults applied to 1 of 1 row");
  });

  it("Fill Defaults still runs and says so when every row already has the defaults", () => {
    render(<Harness initial={[makeRow()]} />);
    fireEvent.click(screen.getByText("Fill Defaults"));
    expect(state()[0]).toEqual(makeRow());
    expect(screen.getByRole("status").textContent).toContain("already match");
  });

  it("Fill Defaults uses the start of a date range for a single sample", () => {
    function RangeHarness() {
      const [rows, setRows] = React.useState([makeRow({ collection_date: "2019-01-01" })]);
      return (
        <>
          <BatchMetadataEditor
            rows={rows}
            onChange={setRows}
            report={{ reconciledRows: [], totalSamples: 1, matchedCount: 0, missingFileCount: 0, invalidAttributeCount: 0, orphanFiles: [], canProceed: false }}
            defaults={{ ...defaults, collectionDate: "2026-05-01/2026-05-10" }}
            isPaired={false}
          />
          <pre data-testid="state">{JSON.stringify(rows)}</pre>
        </>
      );
    }
    render(<RangeHarness />);
    fireEvent.click(screen.getByText("Fill Defaults"));
    expect(state()[0]?.collection_date).toBe("2026-05-01");
  });

  it("Normalize Dates converts unambiguous formats in the real row state", () => {
    render(
      <Harness
        initial={[
          makeRow({ sample_id: "A", collection_date: "14/05/2026" }),
          makeRow({ sample_id: "B", collection_date: "1 Oct 2026" }),
          makeRow({ sample_id: "C", collection_date: "2026/10/01" }),
          makeRow({ sample_id: "D", collection_date: "2026-05-01" }),
        ]}
      />
    );
    fireEvent.click(screen.getByText("Normalize Dates"));

    expect(state().map((r) => r.collection_date)).toEqual([
      "2026-05-14",
      "2026-10-01",
      "2026-10-01",
      "2026-05-01",
    ]);
    expect((screen.getByLabelText("Collection date, row 1") as HTMLInputElement).value).toBe("2026-05-14");
    expect(screen.getByRole("status").textContent).toContain("Normalized 3 dates");
  });

  it("Normalize Dates leaves ambiguous and invalid dates alone and reports them", () => {
    render(
      <Harness
        initial={[
          makeRow({ sample_id: "A", collection_date: "03/04/2026" }),
          makeRow({ sample_id: "B", collection_date: "not-a-date" }),
          makeRow({ sample_id: "C", collection_date: "14/05/2026" }),
        ]}
      />
    );
    fireEvent.click(screen.getByText("Normalize Dates"));

    expect(state().map((r) => r.collection_date)).toEqual(["03/04/2026", "not-a-date", "2026-05-14"]);
    const text = screen.getByRole("status").textContent ?? "";
    expect(text).toContain("Normalized 1 date");
    expect(text).toContain("Rows 1, 2 could not be converted");
  });

  it("Normalize Dates reports when there is nothing to do", () => {
    render(<Harness initial={[makeRow()]} />);
    fireEvent.click(screen.getByText("Normalize Dates"));
    expect(screen.getByRole("status").textContent).toContain("already in YYYY-MM-DD");
  });

  it("shows validation guidance for Taxon ID and AU Country on hover, focus and Escape", () => {
    render(<Harness initial={[makeRow()]} />);

    const taxon = screen.getByLabelText("Taxon ID, row 1");
    fireEvent.mouseEnter(taxon.parentElement!);
    let tip = screen.getByRole("tooltip");
    expect(tip.textContent).toContain("NCBI Taxonomy ID");
    expect(tip.textContent).toContain("9606");
    expect(taxon.getAttribute("aria-describedby")).toBe(tip.id);

    fireEvent.keyDown(taxon, { key: "Escape" });
    expect(screen.queryByRole("tooltip")).toBeNull();

    const country = screen.getByLabelText("AU country code, row 1");
    fireEvent.focus(country); // keyboard / touch path
    tip = screen.getByRole("tooltip");
    expect(tip.textContent).toContain("ISO 3166-1 alpha-2");
  });

  it("shows header help for Taxon ID and AU Country to keyboard users", () => {
    render(<Harness initial={[makeRow()]} />);
    fireEvent.focus(screen.getByRole("button", { name: "About Taxon ID" }));
    expect(screen.getByRole("tooltip").textContent).toContain("NCBI Taxonomy ID");
  });
});
