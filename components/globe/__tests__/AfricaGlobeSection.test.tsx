import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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

  it("renders the sovereign badges and node counter", () => {
    render(<AfricaGlobeSection />);
    expect(screen.getByText("100% African Data Sovereignty")).toBeDefined();
    expect(screen.getByText("54 Sovereign Nodes")).toBeDefined();
  });

  it("renders sovereign coverage metrics", () => {
    render(<AfricaGlobeSection />);
    expect(screen.getByText("AU Member States Covered")).toBeDefined();
    expect(screen.getByText("Strict Human Data Exclusion")).toBeDefined();
    expect(screen.getByText("Global Content-Addressed Queries")).toBeDefined();
  });
});
