"use client";

import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./FieldTooltip.css";

interface FieldTooltipProps {
  /** Tooltip body. Shown on hover, keyboard focus and touch (tapping focuses the control). */
  content: React.ReactNode;
  /** Exactly one focusable control (input or button). It receives aria-describedby while open. */
  children: React.ReactElement<{ "aria-describedby"?: string | undefined }>;
  /** Marks the tooltip as describing an invalid value (red accent). */
  invalid?: boolean;
  /** Wrapper element display; use "block" to fill a table cell. */
  block?: boolean;
}

const GAP = 8;
const MARGIN = 8;
const CLOSE_DELAY_MS = 120;

// Only one field tooltip is open at a time: opening one closes the previous immediately,
// so moving between cells never leaves two overlapping tooltips.
let closeActiveTooltip: (() => void) | null = null;

/**
 * Accessible tooltip that is not clipped by scroll containers (portalled, fixed position).
 *  - Hover and focus open it, so keyboard and touch users get the same guidance as mouse users.
 *  - Escape dismisses it, and the pointer can move onto it without it disappearing (WCAG 1.4.13).
 */
export function FieldTooltip({ content, children, invalid = false, block = false }: FieldTooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);
  const closeNow = useCallback(() => {
    cancelClose();
    setOpen(false);
  }, [cancelClose]);
  const show = () => {
    cancelClose();
    if (closeActiveTooltip && closeActiveTooltip !== closeNow) closeActiveTooltip();
    closeActiveTooltip = closeNow;
    setOpen(true);
  };
  const hideSoon = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  };

  useEffect(
    () => () => {
      cancelClose();
      if (closeActiveTooltip === closeNow) closeActiveTooltip = null;
    },
    [closeNow, cancelClose]
  );

  const place = useCallback(() => {
    const anchor = anchorRef.current;
    const tip = tipRef.current;
    if (!anchor || !tip) return;
    const a = anchor.getBoundingClientRect();
    const t = tip.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let top = a.top - t.height - GAP; // prefer above
    if (top < MARGIN) top = a.bottom + GAP; // flip below when there is no room
    if (top + t.height > vh - MARGIN) top = Math.max(MARGIN, vh - MARGIN - t.height);
    let left = a.left + a.width / 2 - t.width / 2;
    left = Math.min(Math.max(MARGIN, left), Math.max(MARGIN, vw - MARGIN - t.width));
    setPos({ top, left });
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, place, content]);

  const child = React.cloneElement(children, {
    "aria-describedby": open ? id : children.props["aria-describedby"],
  });

  return (
    <>
      <span
        ref={anchorRef}
        className={`field-tip-anchor${block ? " is-block" : ""}`}
        onMouseEnter={show}
        onMouseLeave={hideSoon}
        onFocusCapture={show}
        onBlurCapture={hideSoon}
        onKeyDown={(e) => {
          if (e.key === "Escape" && open) {
            e.stopPropagation();
            setOpen(false);
          }
        }}
      >
        {child}
      </span>
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={tipRef}
            id={id}
            role="tooltip"
            className={`field-tip${invalid ? " is-invalid" : ""}`}
            style={{ top: pos?.top ?? 0, left: pos?.left ?? 0, visibility: pos ? "visible" : "hidden" }}
            onMouseEnter={cancelClose}
            onMouseLeave={hideSoon}
          >
            {content}
          </div>,
          document.body
        )}
    </>
  );
}
