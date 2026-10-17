import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScrollyHero } from "../ScrollyHero";

describe("ScrollyHero Component", () => {
  it("renders scrollytelling section with narrative steps and sticky terminal", () => {
    render(<ScrollyHero />);
    expect(screen.getByLabelText("UbuntuBio Technology Overview")).toBeDefined();
    expect(screen.getAllByText("Bandwidth-Optimized Transfer").length).toBeGreaterThan(0);
    expect(screen.getByText("African Genomic Sovereignty")).toBeDefined();
    expect(screen.getByText("Sub-50ms Discovery")).toBeDefined();
  });
});
