import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AfricaGlobeSection } from "../AfricaGlobeSection";

// Mock cobe createGlobe to prevent WebGL requirement in JSDOM
vi.mock("cobe", () => ({
  default: vi.fn(() => ({
    destroy: vi.fn(),
    update: vi.fn(),
  })),
}));

describe("AfricaGlobeSection", () => {
  it("renders the 3D globe section and heading", () => {
    render(<AfricaGlobeSection />);
    expect(screen.getByText("Pan-African Genomic Observatory")).toBeDefined();
    expect(screen.getByText(/54 Sovereign Member States/i)).toBeDefined();
    expect(screen.getByRole("region", { name: /Globe with flags/i })).toBeDefined();
  });

  it("renders African region filter tabs and updates selection", () => {
    render(<AfricaGlobeSection />);
    const westAfricaTab = screen.getByRole("tab", { name: /West Africa/i });
    expect(westAfricaTab).toBeDefined();

    fireEvent.click(westAfricaTab);
    expect(westAfricaTab.classList.contains("active")).toBe(true);
  });

  it("renders all African region filters", () => {
    render(<AfricaGlobeSection />);
    expect(screen.getByRole("tab", { name: /All 54 AU Member States/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /East Africa/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /Southern Africa/i })).toBeDefined();
  });

  it("renders sovereign coverage metrics and catalog link", () => {
    render(<AfricaGlobeSection />);
    expect(screen.getByText("AU Member States Covered")).toBeDefined();
    expect(screen.getByText("Strict Human Data Exclusion")).toBeDefined();
    const catalogLink = screen.getByRole("link", { name: /Browse Full Dataset Catalog/i });
    expect(catalogLink.getAttribute("href")).toBe("/datasets");
  });
});
