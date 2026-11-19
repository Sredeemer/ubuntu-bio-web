import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ScrollyHero } from "../ScrollyHero";

describe("ScrollyHero Component", () => {
  it("renders scrollytelling section with narrative steps and sticky terminal", () => {
    render(<ScrollyHero />);
    expect(screen.getByLabelText("UbuntuBio Technology Overview")).toBeDefined();
    expect(screen.getAllByText("Bandwidth-Optimized Transfer").length).toBeGreaterThan(0);
    expect(screen.getByText("African Genomic Sovereignty")).toBeDefined();
    expect(screen.getByText("Sub-50ms Discovery")).toBeDefined();
  });

  it("uses a tab key that exists in the terminal for every step", () => {
    render(<ScrollyHero />);
    const tabIds = screen.getAllByRole("tab").map((t) => t.id.replace("ubio-tab-", ""));
    // Step 1 must map to a real tab (it used to be "push", which matched nothing).
    expect(tabIds).toEqual(expect.arrayContaining(["upload", "auth", "search"]));
    expect(screen.getByRole("tab", { name: /ubio upload/i }).getAttribute("aria-selected")).toBe("true");
  });

  it("clicking a terminal command switches the terminal and keeps the stage badge in sync", () => {
    const { container } = render(<ScrollyHero />);
    const badge = () => container.querySelector(".satellite-text")?.textContent;
    expect(badge()).toBe("Bandwidth-Optimized Transfer");

    fireEvent.click(screen.getByRole("tab", { name: /ubio search/i }));
    expect(screen.getByRole("tab", { name: /ubio search/i }).getAttribute("aria-selected")).toBe("true");
    expect(badge()).toBe("Sub-50ms Discovery");

    fireEvent.click(screen.getByRole("tab", { name: /ubio login/i }));
    expect(screen.getByRole("tab", { name: /ubio login/i }).getAttribute("aria-selected")).toBe("true");
    expect(badge()).toBe("African Genomic Sovereignty");

    fireEvent.click(screen.getByRole("tab", { name: /ubio upload/i }));
    expect(screen.getByRole("tab", { name: /ubio upload/i }).getAttribute("aria-selected")).toBe("true");
  });
});
