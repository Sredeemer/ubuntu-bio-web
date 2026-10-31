"use client";

import React from "react";
import { BookOpen, Terminal, Code2, ShieldCheck, ArrowLeft, ExternalLink, Bot, UploadCloud } from "lucide-react";

interface DocsSidebarProps {
  currentPath: string;
}

export function DocsSidebar({ currentPath }: DocsSidebarProps) {
  const links = [
    {
      title: "Overview & Quickstart",
      href: "/docs",
      icon: BookOpen,
    },
    {
      title: "Dataset Submission & Schema",
      href: "/docs/submission",
      icon: UploadCloud,
    },
    {
      title: "CLI Command Reference",
      href: "/docs/cli",
      icon: Terminal,
    },
    {
      title: "REST & CAS API Reference",
      href: "/docs/api",
      icon: Code2,
    },
    {
      title: "AU Sovereignty & Governance",
      href: "/docs/governance",
      icon: ShieldCheck,
    },
  ];

  return (
    <aside className="ubio-docs-sidebar" aria-label="Documentation Navigation">
      <div className="docs-sidebar-header">
        <a href="/" className="docs-back-link">
          <ArrowLeft size={14} /> Back to UbuntuBio
        </a>
        <h3 className="docs-sidebar-title">Documentation</h3>
      </div>

      <nav className="docs-nav-menu">
        <div className="docs-nav-group">
          <span className="docs-group-label">Core Guides</span>
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = currentPath === link.href;
            return (
              <a
                key={link.href}
                href={link.href}
                className={`docs-nav-item ${isActive ? "active" : ""}`}
              >
                <Icon size={16} className="docs-nav-icon" />
                <span>{link.title}</span>
              </a>
            );
          })}
        </div>

        <div className="docs-nav-group mt-6">
          <span className="docs-group-label">AI & Agents</span>
          <a
            href="/llms.txt"
            target="_blank"
            rel="noreferrer"
            className="docs-nav-item external"
          >
            <div className="docs-nav-item-left">
              <Bot size={16} className="docs-nav-icon" />
              <span>llms.txt for Agents</span>
            </div>
            <ExternalLink size={13} />
          </a>
        </div>

        <div className="docs-nav-group mt-6">
          <span className="docs-group-label">External Resources</span>
          <a
            href="https://github.com/Sredeemer/bioinf-db"
            target="_blank"
            rel="noreferrer"
            className="docs-nav-item external"
          >
            <span>GitHub Repository</span>
            <ExternalLink size={13} />
          </a>
          <a
            href="/datasets"
            className="docs-nav-item"
          >
            <span>Live Datasets Catalog</span>
          </a>
        </div>
      </nav>
    </aside>
  );
}
