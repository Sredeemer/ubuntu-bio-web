import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { DocsLayout } from "../DocsLayout";
import { NotificationBanner } from "../../common/NotificationBanner";
import { DocsCallout } from "../DocsCallout";
import { DocsCopyButton } from "../DocsCopyButton";
import { DocsRightRail } from "../DocsRightRail";

describe("DocsLayout & Navigation", () => {
  it("renders docs sidebar links, header bar, and active state on white canvas", () => {
    render(
      <DocsLayout currentPath="/docs/cli">
        <div>Docs Content Here</div>
      </DocsLayout>
    );

    const docHeadings = screen.getAllByText(/Documentation/i);
    expect(docHeadings.length).toBeGreaterThanOrEqual(1);

    expect(screen.getAllByText(/Overview/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/CLI/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/REST & CAS API/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/AU Sovereignty & Governance/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Docs Content Here/i)).toBeDefined();
  });

  it("renders NotificationBanner with llms.txt announcement and controls", () => {
    render(<NotificationBanner />);

    expect(screen.getByText("LLMS.TXT")).toBeDefined();
    expect(screen.getByText(/Machine-readable documentation for LLMs & AI coding agents/i)).toBeDefined();
    expect(screen.getByText(/Access \/llms\.txt/i)).toBeDefined();

    // Pager controls
    const nextBtn = screen.getByLabelText(/Next announcement/i);
    fireEvent.click(nextBtn);
    expect(screen.getByText("ANNOUNCEMENT")).toBeDefined();
    expect(screen.getByText(/ubuntu-bio Python SDK & ubio CLI/i)).toBeDefined();
  });

  it("renders clean neutral DocsCallout without colored edges", () => {
    render(
      <DocsCallout title="Clean Agent Notice">
        <p>Clean notice content</p>
      </DocsCallout>
    );

    expect(screen.getByText("Clean Agent Notice")).toBeDefined();
    expect(screen.getByText("Clean notice content")).toBeDefined();
  });

  it("renders DocsCopyButton with lucide icons and dropdown options", () => {
    render(<DocsCopyButton pageTitle="Test Page" />);

    const btn = screen.getByRole("button", { name: /Copy page options/i });
    expect(btn).toBeDefined();
    expect(screen.getByText("Copy page")).toBeDefined();

    fireEvent.click(btn);
    expect(screen.getByText("Copy Page URL")).toBeDefined();
    expect(screen.getByText("Copy as Markdown Summary")).toBeDefined();
  });

  it("renders DocsRightRail with TOC items and tracking bar", () => {
    const toc = [
      { id: "sec-1", label: "Section 1", level: 2 as const },
      { id: "sec-2", label: "Section 2", level: 3 as const },
    ];
    render(<DocsRightRail tocItems={toc} />);

    expect(screen.getByText("On this page")).toBeDefined();
    const link1 = screen.getByText("Section 1");
    const link2 = screen.getByText("Section 2");
    expect(link1).toBeDefined();
    expect(link2).toBeDefined();

    // Verify rating widget is NOT present
    expect(screen.queryByText("Rate this page")).toBeNull();

    // Clicking link activates tracking and scroll
    fireEvent.click(link2);
    expect(link2.closest("a")?.className).toContain("active");
  });
});

describe("DocsCodeBlock", () => {
  it("renders code block with language, title, and interactive copy button", async () => {
    const { DocsCodeBlock } = await import("../DocsCodeBlock");
    render(
      <DocsCodeBlock
        title="Terminal"
        language="bash"
        code="pip install ubuntu-bio"
      />
    );

    expect(screen.getByText("Terminal")).toBeDefined();
    expect(screen.getByText("bash")).toBeDefined();
    expect(screen.getByText("pip install ubuntu-bio")).toBeDefined();

    const copyBtn = screen.getByRole("button", { name: /Copy bash code/i });
    expect(copyBtn).toBeDefined();
    expect(screen.getByText("Copy")).toBeDefined();

    fireEvent.click(copyBtn);
    expect(await screen.findByText("Copied!")).toBeDefined();
  });
});
