import React from "react";
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import TechnicalHandoverPage, { metadata } from "../page";

function activateTab(tab: HTMLElement): void {
  fireEvent.mouseDown(tab, { button: 0, ctrlKey: false });
  fireEvent.click(tab);
}

describe("TechnicalHandoverPage", () => {
  it("exports route metadata and renders the default System Map tab", () => {
    expect(metadata.title).toBe("Technical Handover — UbuntuBio");
    render(<TechnicalHandoverPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: /Technical Handover & Self-Hosting Guide/i })
    ).toBeDefined();

    // Verify all 5 tab triggers are rendered
    expect(screen.getByRole("tab", { name: /System Map/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /Self-Hosting Guide/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /Contributing/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /AI Policy/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /What's Next & 10-Year Plan/i })).toBeDefined();

    // Default tab shows System Map content
    expect(
      screen.getByRole("heading", { level: 2, name: /Platform Components You Inherit/i })
    ).toBeDefined();
    expect(
      screen.getByRole("heading", { level: 2, name: /Single-Root Storage Invariant/i })
    ).toBeDefined();
    expect(screen.getAllByText(/\/srv\/ubuntubio\/data\//i).length).toBeGreaterThanOrEqual(1);
  });

  it("switches to Self-Hosting Guide, Contributing, and Roadmap tabs", () => {
    render(<TechnicalHandoverPage />);

    // Tab 2: Self-Hosting Guide
    activateTab(screen.getByRole("tab", { name: /Self-Hosting Guide/i }));
    expect(screen.getByRole("heading", { level: 2, name: /Prerequisites/i })).toBeDefined();
    expect(
      screen.getByText(/docker compose -f compose\.yaml up -d --build server caddy/i)
    ).toBeDefined();
    expect(screen.getByText(/UBUNTUBIO_ORCID_CLIENT_ID/i)).toBeDefined();

    // Tab 3: Contributing
    activateTab(screen.getByRole("tab", { name: /Contributing/i }));
    expect(
      screen.getByRole("heading", { level: 2, name: /Non-Negotiable Project Invariants/i })
    ).toBeDefined();
    expect(screen.getAllByText(/9606/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Conventional Commits/i)).toBeDefined();

    // Tab 4: AI Policy
    activateTab(screen.getByRole("tab", { name: /AI Policy/i }));
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /AI-Assisted Development & Human Accountability/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /Data Sovereignty & Confidentiality Boundary/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /Open-Weight & Self-Hosted Runtime Standard/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole("heading", { level: 2, name: /Scientific & Metadata Integrity/i })
    ).toBeDefined();

    // Tab 5: What's Next & 10-Year Plan
    activateTab(screen.getByRole("tab", { name: /What's Next & 10-Year Plan/i }));
    expect(
      screen.getByRole("heading", { level: 2, name: /What You Can Build Next \(v1\.1 → v2\.0\)/i })
    ).toBeDefined();
    expect(
      screen.getByRole("heading", { level: 2, name: /The 10-Year Goal \(2026–2036\)/i })
    ).toBeDefined();
    expect(
      screen.getByRole("heading", { level: 2, name: /Graduating Cohort Handover Rule/i })
    ).toBeDefined();
    expect(
      screen.getByRole("heading", {
        level: 3,
        name: /Requirements & Review Gate Before Website Roll Recognition/i,
      })
    ).toBeDefined();
    expect(screen.getByText(/Dr\. Abiola Isawumi/i)).toBeDefined();
    expect(
      screen.getByText(/# Cohort Handover Brief: Class of \[YEAR\] -> Class of \[YEAR \+ 1\]/i)
    ).toBeDefined();
  });
});
