import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HeroHeader } from "../HeroHeader";

describe("HeroHeader bento links", () => {
  it("'Browse the catalog' opens the datasets catalog", () => {
    render(<HeroHeader />);
    const link = screen.getByRole("link", { name: /Browse the catalog/i });
    expect(link.getAttribute("href")).toBe("/datasets");
  });

  it("'Read the policy' opens the governance policy", () => {
    render(<HeroHeader />);
    const link = screen.getByRole("link", { name: /Read the policy/i });
    expect(link.getAttribute("href")).toBe("/docs/governance");
  });

  it("has no dead in-page anchors left in the bento cards", () => {
    const { container } = render(<HeroHeader />);
    const bento = container.querySelector(".ubio-hero-bento")!;
    for (const a of Array.from(bento.querySelectorAll("a"))) {
      const href = a.getAttribute("href") ?? "";
      if (href.startsWith("#")) {
        // The only legitimate in-page link is the one that scrolls to the architecture section.
        expect(href).toBe("#architecture");
      }
    }
  });
});
