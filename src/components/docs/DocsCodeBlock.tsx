"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

interface DocsCodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

export function DocsCodeBlock({ code, language = "bash", title }: DocsCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(code.trim());
      }
    } catch {
      // Fallback
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="docs-code-block">
      <div className="code-block-header">
        <span className="code-block-title">{title || language.toUpperCase()}</span>
        <div className="code-block-actions">
          <span className="code-lang">{language}</span>
          <button
            type="button"
            className="code-copy-btn"
            onClick={handleCopy}
            aria-label={`Copy ${language} code`}
            title="Copy to clipboard"
          >
            {copied ? (
              <>
                <Check size={13} className="text-green" />
                <span className="copy-text text-green">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span className="copy-text">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
      <pre>
        <code>{code.trim()}</code>
      </pre>
    </div>
  );
}
