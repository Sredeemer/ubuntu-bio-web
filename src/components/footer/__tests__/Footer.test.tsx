import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "../Footer";

describe("Footer Component", () => {
  it("renders the brand header and mandate text", () => {
    render(<Footer />);
    expect(screen.getAllByText(/UbuntuBio/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Open-source biological data infrastructure/i)).toBeDefined();
  });

  it("does not render the removed 'Goal: 54 AU Member States Coverage' pill", () => {
    render(<Footer />);
    expect(screen.queryByText(/Goal: 54 AU Member States Coverage/i)).toBeNull();
  });

  it("renders the spinning UbuntuBio logo", () => {
    const { container } = render(<Footer />);
    const logoSvg = container.querySelector(".ubio-logo-spin");
    expect(logoSvg).not.toBeNull();
  });

  it("renders clean navigation columns with actionable links and links to waccbip", () => {
    render(<Footer />);
    expect(screen.getByRole("heading", { name: /Platform/i })).toBeDefined();
    expect(screen.getByRole("heading", { name: /Developers/i })).toBeDefined();
    expect(screen.getByRole("heading", { name: /Community/i })).toBeDefined();

    expect(screen.getByRole("link", { name: /Browse Datasets/i })).toBeDefined();
    expect(screen.getByRole("link", { name: /Deposit Data/i })).toBeDefined();
    expect(screen.getByRole("link", { name: /Our Story/i })).toBeDefined();

    // WACCBIP link to https://www.waccbip.org/
    const waccbipLinks = screen.getAllByRole("link", { name: /WACCBIP/i });
    expect(waccbipLinks.length).toBeGreaterThan(0);
    expect(waccbipLinks[0]?.getAttribute("href")).toBe("https://www.waccbip.org/");

    // No GitHub repository link
    expect(screen.queryByText(/GitHub Repository/i)).toBeNull();
  });

  it("renders the system status badge in the footer", () => {
    const { container } = render(<Footer />);
    const statusBadge = container.querySelector(".hub-status-badge");
    expect(statusBadge).not.toBeNull();
    expect(statusBadge?.getAttribute("role")).toBe("status");
  });
});
