import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WaccbipOriginSection } from "../WaccbipOriginSection";

describe("WaccbipOriginSection Component", () => {
  it("renders the WACCBIP founding heading and University of Ghana badge", () => {
    render(<WaccbipOriginSection />);
    expect(screen.getByRole("heading", { name: /Founded at WACCBIP/i })).toBeDefined();
    expect(screen.getAllByText(/University of Ghana/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/First cohort of bioinformatics/i).length).toBeGreaterThan(0);
  });

  it("renders the three invitation cards for donors, biocurators, and labs", () => {
    render(<WaccbipOriginSection />);
    expect(screen.getByRole("heading", { name: /Donors & Philanthropies/i })).toBeDefined();
    expect(screen.getByRole("heading", { name: /Biocurators & Researchers/i })).toBeDefined();
    expect(screen.getByRole("heading", { name: /African Research Labs/i })).toBeDefined();
  });

  it("contains links to partner or get involved", () => {
    render(<WaccbipOriginSection />);
    const partnerLink = screen.getByRole("link", { name: /Partner as a Supporter/i });
    expect(partnerLink).toBeDefined();
    expect(partnerLink.getAttribute("href")).toContain("mailto:");
  });
});
