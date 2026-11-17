import React from "react";
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import fs from "node:fs";
import path from "node:path";

// layout.tsx relies on Next's automatic JSX runtime; make React available for the test transform.
(globalThis as unknown as { React: typeof React }).React = React;
const { default: RootLayout } = await import("../layout");

describe("skip-to-main-content link", () => {
  const html = renderToStaticMarkup(
    <RootLayout>
      <main id="main-content" tabIndex={-1}>
        content
      </main>
    </RootLayout>
  );

  it("is the first focusable element in the body and targets #main-content", () => {
    const body = html.slice(html.indexOf("<body"));
    const firstLink = /<a [^>]*>/.exec(body)?.[0] ?? "";
    expect(firstLink).toContain('href="#main-content"');
    expect(firstLink).toContain('class="skip-link"');
    expect(body).toContain("Skip to main content");
    // It must come before any page content so it is the first Tab stop.
    expect(body.indexOf("Skip to main content")).toBeLessThan(body.indexOf("content</main>"));
  });

  it("is hidden off-screen until focused (CSS contract)", () => {
    const css = fs.readFileSync(path.resolve(__dirname, "../globals.css"), "utf8");
    expect(css).toMatch(/\.skip-link\s*{[^}]*transform:\s*translateY\(-200%\)/);
    expect(css).toMatch(/\.skip-link:focus[^{]*{[^}]*transform:\s*translateY\(0\)/);
  });

  it("every page renders a focusable #main-content target", () => {
    const root = path.resolve(__dirname, "..");
    const files = [
      "page.tsx",
      "submit/page.tsx",
      "settings/page.tsx",
      "datasets/page.tsx",
      "datasets/[namespace]/[datasetId]/page.tsx",
      "datasets/[namespace]/[datasetId]/tree/page.tsx",
      "device/page.tsx",
      "auth/callback/page.tsx",
      "../components/docs/DocsLayout.tsx",
    ];
    for (const f of files) {
      const src = fs.readFileSync(path.join(root, f), "utf8");
      expect(src, f).toMatch(/<main id="main-content" tabIndex=\{-1\}/);
    }
  });
});
