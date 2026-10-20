import React from "react";
import { Info } from "lucide-react";

export type CalloutType = "important" | "tip" | "note" | "warning" | "success";

interface DocsCalloutProps {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
}

export function DocsCallout({
  title,
  children,
}: DocsCalloutProps) {
  return (
    <div
      className="docs-callout-clean"
      role="note"
      aria-label={title || "Note"}
    >
      <div className="docs-callout-clean-header">
        <Info size={15} className="docs-callout-clean-icon" />
        {title && <span className="docs-callout-clean-title">{title}</span>}
      </div>
      <div className="docs-callout-clean-body">{children}</div>
    </div>
  );
}
