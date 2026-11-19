import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import FoundingCharterPage, { metadata } from "../page";

describe("FoundingCharterPage", () => {
  it("exports route metadata and renders the charter title, metadata, and preamble", () => {
    expect(metadata.title).toBe("Founding Charter — UbuntuBio");
    render(<FoundingCharterPage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /Founding Cohort Charter for the African Genomic Database/i,
      })
    ).toBeDefined();

    expect(screen.getByText(/Charter · Version 1\.0/i)).toBeDefined();
    expect(
      screen.getByText(/West African Centre for Cell Biology of Infectious Pathogens \(WACCBIP\)/i)
    ).toBeDefined();
    expect(screen.getByRole("heading", { level: 2, name: /Preamble/i })).toBeDefined();
  });

  it("renders all twelve charter articles, FAIR/CARE sections, and closing declaration", () => {
    render(<FoundingCharterPage />);

    expect(
      screen.getByRole("heading", { level: 2, name: /Article I: Name, Identity, and Scope/i })
    ).toBeDefined();
    expect(
      screen.getByRole("heading", { level: 2, name: /Article II: Vision, Mission, and Objectives/i })
    ).toBeDefined();
    expect(
      screen.getByRole("heading", { level: 2, name: /Article III: Founding Principles/i })
    ).toBeDefined();
    expect(
      screen.getByRole("heading", { level: 2, name: /Article IV: The Founding Cohort/i })
    ).toBeDefined();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /Article V: Responsibilities of Successive Cohorts/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /Article VI: Institutional Governance and Custodianship/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /Article VII: Data Stewardship and Responsible Use/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole("heading", { level: 2, name: /Article VIII: Partnerships and Collaboration/i })
    ).toBeDefined();
    expect(
      screen.getByRole("heading", { level: 2, name: /Article IX: Sustainability and Continuity/i })
    ).toBeDefined();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /Article X: Scientific Legacy and Recognition/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /Article XI: Charter Adoption, Review, and Amendment/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole("heading", { level: 2, name: /Article XII: Founding Declaration/i })
    ).toBeDefined();

    // FAIR & CARE principles
    expect(screen.getByRole("heading", { level: 3, name: /FAIR Principles/i })).toBeDefined();
    expect(screen.getByRole("heading", { level: 3, name: /CARE Principles/i })).toBeDefined();

    // Closing oath and handover cross-link
    expect(screen.getByText(/We build what we may not finish/i)).toBeDefined();
    const handoverLinks = screen.getAllByRole("link", { name: /Technical Handover/i });
    expect(handoverLinks.length).toBeGreaterThanOrEqual(1);
    expect(handoverLinks.some((link) => link.getAttribute("href") === "/technical-handover")).toBe(
      true
    );

    // Original conception attribution, review gate & Founding Cohort Roll (Class of 2026)
    expect(screen.getAllByText(/Dr\. Abiola Isawumi/i).length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByRole("heading", {
        level: 3,
        name: /5\.7 Cohort Review & Website Recognition Gate/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole("heading", { level: 2, name: /Founding Cohort Roll \(Class of 2026\)/i })
    ).toBeDefined();
    expect(screen.getByText("Addo Stephen Tetteh")).toBeDefined();
    expect(screen.getByText("Samuel Mawuli Kumordzi")).toBeDefined();
    expect(screen.getByText("0009-0009-9340-8905")).toBeDefined();
    expect(screen.getByText("Doreen Akakpo")).toBeDefined();
    expect(screen.getByText("0009-0001-9407-4398")).toBeDefined();
    expect(screen.getByText("Redeemer Salami Okekale")).toBeDefined();
    expect(screen.getByText("Rexford Adade")).toBeDefined();
  });
});
