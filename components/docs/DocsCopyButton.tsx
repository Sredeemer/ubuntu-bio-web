"use client";

import React, { useState, useRef, useEffect } from "react";
import { Copy, Check, ChevronDown, Link as LinkIcon, FileText } from "lucide-react";

interface DocsCopyButtonProps {
  pageTitle?: string;
}

export function DocsCopyButton({ pageTitle = "Page" }: DocsCopyButtonProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopyUrl = async () => {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(window.location.href);
        setCopied("url");
        setTimeout(() => setCopied(null), 2000);
      }
    } catch {
      // Fallback
    }
    setDropdownOpen(false);
  };

  const handleCopyMarkdown = async () => {
    try {
      if (typeof window !== "undefined") {
        const md = `# ${pageTitle}\nSource: ${window.location.href}\nLLM Spec: ${window.location.origin}/llms.txt`;
        await navigator.clipboard.writeText(md);
        setCopied("md");
        setTimeout(() => setCopied(null), 2000);
      }
    } catch {
      // Fallback
    }
    setDropdownOpen(false);
  };

  return (
    <div className="docs-copy-page-wrapper" ref={dropdownRef}>
      <button
        type="button"
        className="docs-copy-page-btn"
        onClick={() => setDropdownOpen((prev) => !prev)}
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
        aria-label="Copy page options"
      >
        {copied ? (
          <Check size={14} className="text-green" />
        ) : (
          <Copy size={14} />
        )}
        <span>{copied ? "Copied!" : "Copy page"}</span>
        <ChevronDown size={13} className={`docs-copy-chevron ${dropdownOpen ? "open" : ""}`} />
      </button>

      {dropdownOpen && (
        <div className="docs-copy-dropdown" role="menu">
          <button
            type="button"
            className="docs-copy-dropdown-item"
            role="menuitem"
            onClick={handleCopyUrl}
          >
            <LinkIcon size={14} />
            <span>Copy Page URL</span>
          </button>
          <button
            type="button"
            className="docs-copy-dropdown-item"
            role="menuitem"
            onClick={handleCopyMarkdown}
          >
            <FileText size={14} />
            <span>Copy as Markdown Summary</span>
          </button>
        </div>
      )}
    </div>
  );
}
