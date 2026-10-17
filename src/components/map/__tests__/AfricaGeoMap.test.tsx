import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AfricaGeoMap } from "../AfricaGeoMap";

describe("AfricaGeoMap Component", () => {
  it("renders regional genomic datasets with default country selected", () => {
    render(<AfricaGeoMap />);
    expect(screen.getByText("Regional Genomic Datasets & AU Coverage")).toBeDefined();
    expect(screen.getByText(/ACEGID/i)).toBeDefined();
    expect(screen.getAllByText(/Ibadan/i).length).toBeGreaterThan(0);
  });

  it("switches active node when selecting a different hub tab", () => {
    render(<AfricaGeoMap />);
    const dakarTab = screen.getByRole("tab", { name: /Dakar/i });

    fireEvent.click(dakarTab);

    expect(screen.getByText(/Institut Pasteur de Dakar/i)).toBeDefined();
    expect(screen.getByText(/Yellow fever virus/i)).toBeDefined();
  });
});
