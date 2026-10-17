import React from "react";
import { Navbar } from "../navbar/Navbar";
import { Footer } from "../footer/Footer";
import { DocsSidebar } from "./DocsSidebar";

interface DocsLayoutProps {
  currentPath: string;
  children: React.ReactNode;
}

export function DocsLayout({ currentPath, children }: DocsLayoutProps) {
  return (
    <div className="ubio-landing-wrapper">
      <Navbar />
      <main id="main-content" className="ubio-docs-wrapper">
        <div className="ubio-docs-container">
          <DocsSidebar currentPath={currentPath} />
          <article className="ubio-docs-article">{children}</article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
