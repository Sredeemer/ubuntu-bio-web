import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import {
  CasChunkIcon,
  PathogenCapsidIcon,
  NanoporeIcon,
  SovereignShieldIcon,
  FederatedClusterIcon,
  UbuntuBioLogo,
} from "../index";

describe("Custom SVG Icons", () => {
  it("renders CasChunkIcon with correct SVG attributes", () => {
    const { container } = render(<CasChunkIcon size={48} className="test-cas" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeDefined();
    expect(svg?.getAttribute("width")).toBe("48");
    expect(svg?.getAttribute("height")).toBe("48");
    expect(svg?.classList.contains("test-cas")).toBe(true);
  });

  it("renders PathogenCapsidIcon with viral geometry", () => {
    const { container } = render(<PathogenCapsidIcon size={32} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeDefined();
    expect(svg?.getAttribute("width")).toBe("32");
    expect(svg?.querySelectorAll("polygon").length).toBeGreaterThan(0);
  });

  it("renders NanoporeIcon with translocation flowcell channels", () => {
    const { container } = render(<NanoporeIcon size={64} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeDefined();
    expect(svg?.getAttribute("viewBox")).toBe("0 0 64 64");
  });

  it("renders SovereignShieldIcon with African continent silhouette", () => {
    const { container } = render(<SovereignShieldIcon size={24} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeDefined();
    expect(svg?.querySelectorAll("path").length).toBeGreaterThanOrEqual(2);
  });

  it("renders FederatedClusterIcon with regional nodes", () => {
    const { container } = render(<FederatedClusterIcon size={56} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeDefined();
    expect(svg?.querySelectorAll("circle").length).toBeGreaterThanOrEqual(5);
  });

  it("renders UbuntuBioLogo in green with 8 radial hub paths", () => {
    const { container } = render(<UbuntuBioLogo size={32} color="#00ed64" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeDefined();
    expect(svg?.getAttribute("viewBox")).toBe("0 0 40 48");
    expect(svg?.querySelectorAll("path").length).toBe(8);
    const group = container.querySelector("g");
    expect(group?.getAttribute("fill")).toBe("#00ed64");
  });
});
