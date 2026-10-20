"use client";

import React, { useState } from "react";
import { Search, Bot, ExternalLink, BookOpen, Terminal, Code2, ShieldCheck } from "lucide-react";

interface DocsHeaderBarProps {
  currentPath: string;
}

export function DocsHeaderBar({ currentPath }: DocsHeaderBarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const tabs = [
    { label: "Overview", href: "/docs", icon: BookOpen },
    { label: "CLI (ubio)", href: "/docs/cli", icon: Terminal },
    { label: "REST & CAS API", href: "/docs/api", icon: Code2 },
    { label: "AU Governance", href: "/docs/governance", icon: ShieldCheck },
    {
      label: "llms.txt (Agents)",
      href: "/llms.txt",
      icon: Bot,
      external: true,
    },
  ];

  return (
    <div className="ubio-docs-header-bar" role="navigation" aria-label="Documentation Sub-navigation">
      <div className="docs-header-bar-container">
        {/* Left: Category Title + Subnav Tabs */}
        <div className="docs-header-tabs-group">
          <span className="docs-header-category-label">Documentation</span>
          <div className="docs-header-tabs" role="tablist">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentPath === tab.href;
              return (
                <a
                  key={tab.href}
                  href={tab.href}
                  target={tab.external ? "_blank" : undefined}
                  rel={tab.external ? "noreferrer" : undefined}
                  className={`docs-header-tab ${isActive ? "active" : ""}`}
                  role="tab"
                  aria-selected={isActive}
                >
                  <Icon size={14} className="docs-tab-icon" />
                  <span>{tab.label}</span>
                  {tab.external && <ExternalLink size={11} className="docs-tab-ext" />}
                </a>
              );
            })}
          </div>
        </div>

        {/* Right: Docs Search input */}
        <div className="docs-header-search-wrap">
          <label htmlFor="docs-search-input" className="sr-only">
            Search Documentation
          </label>
          <Search size={14} className="docs-search-icon" aria-hidden="true" />
          <input
            id="docs-search-input"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search docs..."
            className="docs-search-input"
          />
        </div>
      </div>
    </div>
  );
}
