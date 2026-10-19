"use client";

import React, { useState, useEffect } from "react";
import { Terminal, Copy, Check, Sparkles } from "lucide-react";

export interface TerminalTab {
  id: string;
  label: string;
  command: string;
  executionMs: number;
  badge: string;
  outputs: Array<{
    text: string;
    type?: "info" | "success" | "warning" | "dim";
  }>;
}

const TABS: TerminalTab[] = [
  {
    id: "upload",
    label: "ubio upload",
    command: "ubio upload pasteur-dakar/lassa-2026 ./assemblies -m \"Release consensus genomes\"",
    executionMs: 1400,
    badge: "Optimized Sequence Upload",
    outputs: [
      { text: "Scanning MIxS sample metadata (NCBI Taxon: 11620, AU: SN)...", type: "info" },
      { text: "Enforcing Human Taxon 9606 filter: PASSED (Zero human reads detected)", type: "success" },
      { text: "Indexing 64.8 GB FASTQ sequence reads...", type: "dim" },
      { text: "Sequence match: 48.6 GB existing in regional cache (Dakar hub)", type: "dim" },
      { text: "Upload complete: 16.2 GB transmitted (75.0% bandwidth saved)", type: "success" },
      { text: "Pointer created -> Commit: af7c92b (Tracked in Git LFS)", type: "info" },
    ],
  },
  {
    id: "auth",
    label: "ubio login",
    command: "ubio login",
    executionMs: 800,
    badge: "Decentralized PKCE Auth",
    outputs: [
      { text: "Initializing OAuth2 PKCE flow with ORCID authority...", type: "info" },
      { text: "Researcher: Dr. Fatoumata Diallo (ID: 0009-0004-8192-3341)", type: "success" },
      { text: "Affiliation: Institut Pasteur de Dakar, Senegal", type: "dim" },
      { text: "Access token saved to ~/.config/ubuntubio/token (mode 0600)", type: "success" },
    ],
  },
  {
    id: "search",
    label: "ubio search",
    command: "ubio search \"Vibrio cholerae\" --country KE --limit 3",
    executionMs: 350,
    badge: "Meilisearch Geo-Index",
    outputs: [
      { text: "Query took 18ms across 48,200 African pathogen isolates:", type: "info" },
      { text: "1. KEMRI/VC-2025-04 | Kisumu, Kenya | Biocontainment: BSL-2", type: "success" },
      { text: "2. KEMRI/VC-2025-09 | Mombasa, Kenya | Illumina NovaSeq 6000", type: "success" },
      { text: "3. KEMRI/VC-2025-14 | Nairobi, Kenya | Oxford Nanopore GridION", type: "success" },
      { text: "All access logs recorded under AU Data Governance Framework", type: "dim" },
    ],
  },
];

export function InteractiveTerminal({
  activeTabOverride,
  onTabChange,
}: {
  activeTabOverride?: string;
  onTabChange?: (tabId: string) => void;
}) {
  const [selectedTabId, setSelectedTabId] = useState<string>("upload");
  const [typedCommand, setTypedCommand] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const activeTabId = activeTabOverride || selectedTabId;
  const currentTab = TABS.find((t) => t.id === activeTabId) ?? TABS[0]!;

  useEffect(() => {
    setTypedCommand("");
    setIsTyping(true);
    let index = 0;
    const cmd = currentTab.command;

    const interval = setInterval(() => {
      if (index < cmd.length) {
        setTypedCommand(cmd.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 32);

    return () => clearInterval(interval);
  }, [currentTab.command]);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentTab.command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTabClick = (tabId: string) => {
    setSelectedTabId(tabId);
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  return (
    <div className="ubio-terminal-frame">
      {/* Top Header Bar */}
      <div className="ubio-terminal-bar">
        <div className="ubio-window-dots">
          <span className="window-dot dot-close" />
          <span className="window-dot dot-minimize" />
          <span className="window-dot dot-maximize" />
        </div>

        {/* Tab Switcher */}
        <div className="ubio-tab-group" role="tablist" aria-label="CLI commands">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={tab.id === activeTabId}
              onClick={() => handleTabClick(tab.id)}
              className={`ubio-tab-btn ${tab.id === activeTabId ? "active" : ""}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="ubio-copy-btn"
          aria-label="Copy terminal command"
          title="Copy command"
        >
          {copied ? <Check size={14} className="icon-success" /> : <Copy size={14} />}
        </button>
      </div>

      {/* Terminal Viewport */}
      <div className="ubio-terminal-screen">
        <div className="ubio-prompt-row">
          <span className="terminal-prompt-user">ubuntu-bio@node-af</span>
          <span className="terminal-prompt-sep">:</span>
          <span className="terminal-prompt-dir">~/datasets</span>
          <span className="terminal-prompt-symbol">$</span>
          <span className="terminal-typed-cmd">{typedCommand}</span>
          <span className={`terminal-cursor ${isTyping ? "typing" : ""}`} />
        </div>

        {/* Output Stream */}
        <div className="ubio-output-stream" aria-live="polite">
          {!isTyping &&
            currentTab.outputs.map((out, idx) => (
              <div
                key={idx}
                className={`ubio-stream-line line-${out.type || "info"}`}
                style={{ animationDelay: `${idx * 70}ms` }}
              >
                <span className="ubio-line-arrow">›</span>
                <span className="ubio-line-text">{out.text}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="ubio-terminal-footer">
        <div className="ubio-footer-badge">
          <span>{currentTab.badge}</span>
        </div>
        <span className="ubio-footer-protocol">v0.1.0 • AU-54 Compliant</span>
      </div>
    </div>
  );
}
