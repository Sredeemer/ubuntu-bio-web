import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { DatasetsCatalogPage } from "../DatasetsCatalogPage";

describe("DatasetsCatalogPage", () => {
  it("renders catalog title and initial indexed datasets", () => {
    render(<DatasetsCatalogPage />);
    expect(
      screen.getByRole("heading", { name: /African Pathogen & Genomic Catalog/i })
    ).toBeDefined();
    expect(screen.getAllByText(/Lassa Mammarenavirus/i).length).toBeGreaterThan(0);
  });

  it("filters datasets by search query", () => {
    render(<DatasetsCatalogPage />);
    const searchInput = screen.getByPlaceholderText(/Search by pathogen name/i);
    fireEvent.change(searchInput, { target: { value: "cholera" } });

    expect(screen.getByText(/Vibrio cholerae O1 Epidemic Lineage/i)).toBeDefined();
    expect(screen.queryByText(/Lassa Mammarenavirus Genomic Surveillance/i)).toBeNull();
  });

  it("filters datasets by pathogen category checkbox", () => {
    render(<DatasetsCatalogPage />);
    const bacteriaCheckbox = screen.getByRole("checkbox", { name: /Bacteria/i });
    fireEvent.click(bacteriaCheckbox);

    expect(screen.getByText(/Vibrio cholerae O1/i)).toBeDefined();
    expect(screen.queryByText(/Lassa Mammarenavirus Genomic Surveillance/i)).toBeNull();
  });

  it("filters datasets by biocontainment level checkbox", () => {
    render(<DatasetsCatalogPage />);
    const bsl4Checkbox = screen.getByRole("checkbox", { name: /BSL-4/i });
    fireEvent.click(bsl4Checkbox);

    expect(screen.getAllByText(/Lassa Mammarenavirus/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Vibrio cholerae/i)).toBeNull();
    expect(screen.queryByText(/Mycobacterium tuberculosis/i)).toBeNull();
  });

  it("toggles collapsible filter sidebar", () => {
    render(<DatasetsCatalogPage />);
    const toggleBtn = screen.getByRole("button", { name: /Hide Filters/i });
    fireEvent.click(toggleBtn);
    expect(screen.getByRole("button", { name: /Show Filters/i })).toBeDefined();
  });

  it("handles copy ubio pull command", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<DatasetsCatalogPage />);
    const copyBtns = screen.getAllByTitle(/Copy 'ubio pull/i);
    expect(copyBtns.length).toBeGreaterThan(0);
    fireEvent.click(copyBtns[0]);

    expect(writeTextMock).toHaveBeenCalledWith(expect.stringContaining("ubio pull"));
  });
});
