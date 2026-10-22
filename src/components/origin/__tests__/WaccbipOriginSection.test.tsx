import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { WaccbipOriginSection } from "../WaccbipOriginSection";

describe("WaccbipOriginSection Component", () => {
  it("renders the WACCBIP founding heading and University of Ghana badge", () => {
    render(<WaccbipOriginSection />);
    expect(screen.getByRole("heading", { name: /Founded at WACCBIP by Ghana[’']s First Cohort of Bioinformatics/i })).toBeDefined();
    expect(screen.getAllByText(/University of Ghana/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/First cohort of bioinformatics/i).length).toBeGreaterThan(0);
  });

  it("renders the 3D ring asset for scroll animation", () => {
    const { container } = render(<WaccbipOriginSection />);
    const ringImg = container.querySelector(".ubio-ring-img");
    expect(ringImg).not.toBeNull();
    expect(ringImg?.getAttribute("src")).toBe("/img/ring.svg");
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

  it("navigates through carousel slides via next/prev buttons and tabs", () => {
    render(<WaccbipOriginSection />);
    const nextBtn = screen.getByRole("button", { name: /Next role/i });
    const prevBtn = screen.getByRole("button", { name: /Previous role/i });

    // Click Next
    fireEvent.click(nextBtn);
    const tabs = screen.getAllByRole("tab");
    expect(tabs[1]?.getAttribute("aria-selected")).toBe("true");

    // Click Tab 3
    if (tabs[2]) {
      fireEvent.click(tabs[2]);
      expect(tabs[2].getAttribute("aria-selected")).toBe("true");
    }

    // Click Prev
    fireEvent.click(prevBtn);
    expect(tabs[1]?.getAttribute("aria-selected")).toBe("true");
  });

  it("renders explicit tab labels with Labs for the third tab instead of truncated text", () => {
    render(<WaccbipOriginSection />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs[0]?.textContent).toContain("Donors");
    expect(tabs[1]?.textContent).toContain("Curators");
    expect(tabs[2]?.textContent).toContain("Labs");
    expect(tabs[2]?.textContent).not.toBe("3 African");
  });
});
