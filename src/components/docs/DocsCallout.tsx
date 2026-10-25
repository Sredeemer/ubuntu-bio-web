import React from "react";
import { Info, Sparkles, AlertTriangle, ShieldAlert, CheckCircle2 } from "lucide-react";

export type CalloutType = "important" | "tip" | "note" | "warning" | "success";

interface DocsCalloutProps {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
}

export function DocsCallout({
  type = "note",
  title,
  children,
}: DocsCalloutProps) {
  const renderIcon = () => {
    switch (type) {
      case "tip":
        return <Sparkles size={15} className="docs-callout-clean-icon" />;
      case "warning":
        return <AlertTriangle size={15} className="docs-callout-clean-icon" />;
      case "important":
        return <ShieldAlert size={15} className="docs-callout-clean-icon" />;
      case "success":
        return <CheckCircle2 size={15} className="docs-callout-clean-icon" />;
      default:
        return <Info size={15} className="docs-callout-clean-icon" />;
    }
  };

  return (
    <div
      className={`docs-callout-clean docs-callout-clean-${type}`}
      role="note"
      aria-label={title || "Note"}
    >
      <div className="docs-callout-clean-header">
        {renderIcon()}
        {title && <span className="docs-callout-clean-title">{title}</span>}
      </div>
      <div className="docs-callout-clean-body">{children}</div>
    </div>
  );
}
