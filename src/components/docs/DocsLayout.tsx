import React from "react";
import { Navbar } from "../navbar/Navbar";
import { Footer } from "../footer/Footer";
import { DocsSidebar } from "./DocsSidebar";
import { DocsHeaderBar } from "./DocsHeaderBar";
import { DocsRightRail, type TocItem } from "./DocsRightRail";

interface DocsLayoutProps {
  currentPath: string;
  tocItems?: TocItem[];
  children: React.ReactNode;
}

export function DocsLayout({ currentPath, tocItems, children }: DocsLayoutProps) {
  const hasRightRail = tocItems && tocItems.length > 0;

  return (
    <div className="ubio-landing-wrapper">
      <Navbar />
      <DocsHeaderBar currentPath={currentPath} />
      <main id="main-content" className="ubio-docs-wrapper">
        <div className={`ubio-docs-container ${hasRightRail ? "has-right-rail" : ""}`}>
          <DocsSidebar currentPath={currentPath} />
          <article className="ubio-docs-article">{children}</article>
          {hasRightRail && <DocsRightRail tocItems={tocItems} />}
        </div>
      </main>
      <Footer />
    </div>
  );
}
