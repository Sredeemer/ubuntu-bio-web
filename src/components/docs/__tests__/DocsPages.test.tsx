import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { DocsLayout } from "../DocsLayout";

describe("DocsLayout & Navigation", () => {
  it("renders docs sidebar links and active state", () => {
    render(
      <DocsLayout currentPath="/docs/cli">
        <div>Docs Content Here</div>
      </DocsLayout>
    );

    const docHeadings = screen.getAllByText(/Documentation/i);
    expect(docHeadings.length).toBeGreaterThanOrEqual(1);

    expect(screen.getByText(/Overview & Quickstart/i)).toBeDefined();
    expect(screen.getByText(/CLI Command Reference/i)).toBeDefined();
    expect(screen.getByText(/REST & CAS API Reference/i)).toBeDefined();
    expect(screen.getByText(/AU Sovereignty & Governance/i)).toBeDefined();
    expect(screen.getByText(/Docs Content Here/i)).toBeDefined();
  });
});
