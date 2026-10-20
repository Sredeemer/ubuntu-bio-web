"use client";

import React, { useState, useEffect } from "react";

export interface TocItem {
  id: string;
  label: string;
  level?: 2 | 3;
}

interface DocsRightRailProps {
  tocItems?: TocItem[];
}

export function DocsRightRail({ tocItems = [] }: DocsRightRailProps) {
  const [activeId, setActiveId] = useState<string>(tocItems[0]?.id || "");

  useEffect(() => {
    if (tocItems.length === 0) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140;

      for (let i = tocItems.length - 1; i >= 0; i--) {
        const item = tocItems[i];
        if (!item) continue;
        const el = document.getElementById(item.id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveId(item.id);
            return;
          }
        }
      }
      if (tocItems[0]) {
        setActiveId(tocItems[0].id);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [tocItems]);

  if (tocItems.length === 0) return null;

  return (
    <aside className="ubio-docs-right-rail" aria-label="Page Table of Contents">
      <div className="docs-toc-card">
        <span className="docs-rail-label">On this page</span>
        <nav className="docs-toc-track-wrap" aria-label="Table of Contents Navigation">
          <div className="docs-toc-list">
            {tocItems.map((item) => {
              const isActive = activeId === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`docs-toc-link ${isActive ? "active" : ""} ${item.level === 3 ? "indent" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveId(item.id);
                    const el = document.getElementById(item.id);
                    if (el) {
                      const offsetTop = el.getBoundingClientRect().top + window.scrollY - 100;
                      window.scrollTo({ top: offsetTop, behavior: "smooth" });
                      window.history.pushState(null, "", `#${item.id}`);
                    }
                  }}
                >
                  <span className="docs-toc-text">{item.label}</span>
                </a>
              );
            })}
          </div>
        </nav>
      </div>
    </aside>
  );
}
