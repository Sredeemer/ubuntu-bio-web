"use client";

import React, { useState, useRef, useEffect, useLayoutEffect, useId } from "react";
import { createPortal } from "react-dom";
import { Calendar, ChevronLeft, ChevronRight, ChevronDown, X } from "lucide-react";
import type { CollectionDateValue } from "../../lib/submitValidation";
import "./DatePicker.css";

export interface DatePickerProps {
  /** id of the trigger button (so an outer <label htmlFor> can point at it). */
  id?: string | undefined;
  value: CollectionDateValue;
  onChange: (value: CollectionDateValue) => void;
  placeholder?: string | undefined;
  /** Latest selectable date (YYYY-MM-DD); defaults to today in local time. */
  maxDate?: string | undefined;
  /** Earliest selectable date (YYYY-MM-DD); defaults to 1990-01-01. */
  minDate?: string | undefined;
  disabled?: boolean | undefined;
  error?: boolean | undefined;
  className?: string | undefined;
  ariaLabel?: string | undefined;
  /** id(s) of element(s) describing the field, e.g. an error message. */
  ariaDescribedBy?: string | undefined;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatIsoDate(d: Date): string {
  const y = String(d.getFullYear()).padStart(4, "0");
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseIsoDate(iso: string | undefined): Date | null {
  if (!iso) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

function addDays(d: Date, days: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
}

/** "15 Oct 2024" */
export function formatDisplayDate(iso: string): string {
  const d = parseIsoDate(iso);
  if (!d) return iso;
  return `${d.getDate()} ${(MONTH_NAMES[d.getMonth()] ?? "").slice(0, 3)} ${d.getFullYear()}`;
}

/** "15 Oct 2024" or "10 Oct 2024 – 24 Oct 2024". */
export function formatDateValue(val: CollectionDateValue): string {
  if (!val.startDate) return "";
  if (!val.endDate || val.endDate === val.startDate) return formatDisplayDate(val.startDate);
  return `${formatDisplayDate(val.startDate)} – ${formatDisplayDate(val.endDate)}`;
}

export function DatePicker({
  id,
  value,
  onChange,
  placeholder = "Select date or date range",
  maxDate,
  minDate = "1990-01-01",
  disabled = false,
  error = false,
  className = "",
  ariaLabel = "Choose date or date range",
  ariaDescribedBy,
}: DatePickerProps) {
  const generatedId = useId();
  const baseId = id || `date-picker-${generatedId.replace(/:/g, "")}`;
  const dialogId = `${baseId}-dialog`;

  const todayIso = formatIsoDate(new Date());
  const max = maxDate && maxDate < todayIso ? maxDate : todayIso; // never beyond local today
  const minYear = Number(minDate.slice(0, 4));
  const maxYear = Number(max.slice(0, 4));
  const isOutOfRange = (iso: string) => iso > max || iso < minDate;

  const [open, setOpen] = useState(false);
  /** True after the first click of a range, until the second click or close. */
  const [awaitingEnd, setAwaitingEnd] = useState(false);
  const [view, setView] = useState<"days" | "years">("days");
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const focusAfterRender = useRef(false);
  /** Viewport-fixed popover position, computed from the trigger on open/resize/scroll. */
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const anchor = parseIsoDate(value.startDate) ?? parseIsoDate(max) ?? new Date();
  const [viewYear, setViewYear] = useState(anchor.getFullYear());
  const [viewMonth, setViewMonth] = useState(anchor.getMonth());
  const [focusIso, setFocusIso] = useState(formatIsoDate(anchor));

  const close = (returnFocus: boolean) => {
    setOpen(false);
    setAwaitingEnd(false);
    setView("days");
    if (returnFocus) triggerRef.current?.focus();
  };

  const openPopover = () => {
    const a = parseIsoDate(value.startDate) ?? parseIsoDate(max) ?? new Date();
    setViewYear(a.getFullYear());
    setViewMonth(a.getMonth());
    setFocusIso(formatIsoDate(a));
    setView("days");
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      // The popover is portalled, so it is outside rootRef in the DOM.
      if (
        rootRef.current && !rootRef.current.contains(target) &&
        !(dialogRef.current && dialogRef.current.contains(target))
      ) {
        setOpen(false);
        setAwaitingEnd(false);
        setView("days");
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  // Place the popover next to the trigger, flipping/clamping to stay in the viewport.
  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    const GAP = 6;
    const MARGIN = 8;
    const place = () => {
      const anchorEl = rootRef.current;
      const pop = dialogRef.current;
      if (!anchorEl || !pop) return;
      const r = anchorEl.getBoundingClientRect();
      const vw = window.innerWidth || document.documentElement.clientWidth;
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const w = pop.offsetWidth;
      const h = pop.offsetHeight;
      // Horizontal: left-align with the trigger; right-align if that overflows; then clamp.
      let left = r.left;
      if (left + w > vw - MARGIN) left = r.right - w;
      left = Math.max(MARGIN, Math.min(left, vw - w - MARGIN));
      // Vertical: prefer below; flip above when there is not enough room and more room above.
      const spaceBelow = vh - r.bottom - GAP - MARGIN;
      const spaceAbove = r.top - GAP - MARGIN;
      let top = h <= spaceBelow || spaceBelow >= spaceAbove ? r.bottom + GAP : r.top - GAP - h;
      top = Math.max(MARGIN, Math.min(top, vh - h - MARGIN));
      setPos((prev) => (prev && prev.top === top && prev.left === left ? prev : { top, left }));
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  // Bring the selected year into view when the year grid opens.
  useEffect(() => {
    if (!open || view !== "years") return;
    const el = dialogRef.current?.querySelector<HTMLElement>(".year-cell.is-selected");
    el?.scrollIntoView?.({ block: "nearest" });
  }, [open, view]);

  // Move DOM focus to the roving day button after keyboard navigation.
  useEffect(() => {
    if (open && view === "days" && focusAfterRender.current) {
      focusAfterRender.current = false;
      dialogRef.current?.querySelector<HTMLButtonElement>('button[data-iso][tabindex="0"]')?.focus();
    }
  }, [open, view, focusIso]);

  const selectDay = (iso: string) => {
    if (isOutOfRange(iso)) return;
    if (!awaitingEnd) {
      onChange({ startDate: iso });
      setAwaitingEnd(true);
      return;
    }
    const start = value.startDate;
    if (!start || iso === start) {
      // Same day twice = a single date.
      onChange({ startDate: iso });
    } else if (iso < start) {
      onChange({ startDate: iso, endDate: start });
    } else {
      onChange({ startDate: start, endDate: iso });
    }
    close(true);
  };

  const moveFocus = (target: Date) => {
    let iso = formatIsoDate(target);
    if (iso > max) iso = max;
    if (iso < minDate) iso = minDate;
    const d = parseIsoDate(iso);
    if (!d) return;
    focusAfterRender.current = true;
    setFocusIso(iso);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const onGridKeyDown = (e: React.KeyboardEvent) => {
    const cur = parseIsoDate(focusIso);
    if (!cur) return;
    const deltas: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    const delta = deltas[e.key];
    if (delta !== undefined) {
      e.preventDefault();
      moveFocus(addDays(cur, delta));
    } else if (e.key === "PageUp" || e.key === "PageDown") {
      e.preventDefault();
      const step = e.key === "PageUp" ? -1 : 1;
      const lastDay = new Date(cur.getFullYear(), cur.getMonth() + step + 1, 0).getDate();
      moveFocus(new Date(cur.getFullYear(), cur.getMonth() + step, Math.min(cur.getDate(), lastDay)));
    }
  };

  const onDialogKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      if (view === "years") setView("days");
      else close(true);
    }
  };

  const canPrev = viewYear > minYear || (viewYear === minYear && viewMonth > Number(minDate.slice(5, 7)) - 1);
  const canNext = viewYear < maxYear || (viewYear === maxYear && viewMonth < Number(max.slice(5, 7)) - 1);
  const stepMonth = (delta: number) => {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const pickYear = (year: number) => {
    let month = viewMonth;
    if (year === maxYear) month = Math.min(month, Number(max.slice(5, 7)) - 1);
    if (year === minYear) month = Math.max(month, Number(minDate.slice(5, 7)) - 1);
    setViewYear(year);
    setViewMonth(month);
    const first = formatIsoDate(new Date(year, month, 1));
    setFocusIso(first < minDate ? minDate : first);
    setView("days");
  };

  const goToToday = () => {
    const t = parseIsoDate(max) ?? new Date();
    setViewYear(t.getFullYear());
    setViewMonth(t.getMonth());
    setFocusIso(formatIsoDate(t));
    setView("days");
  };

  // Quick-select presets (each picks a single date).
  const today = parseIsoDate(todayIso) ?? new Date();
  const dayShort = (d: Date) => WEEKDAYS_SHORT[d.getDay()] ?? "";
  const dayMonth = (d: Date) => `${d.getDate()} ${(MONTH_NAMES[d.getMonth()] ?? "").slice(0, 3)}`;
  const yesterday = addDays(today, -1);
  const lastSaturday = addDays(yesterday, -((yesterday.getDay() + 1) % 7));
  const weeksAgo = (n: number) => addDays(today, -7 * n);
  const presets: { label: string; iso: string; meta: string }[] = [
    { label: "Today", iso: formatIsoDate(today), meta: dayShort(today) },
    { label: "Yesterday", iso: formatIsoDate(yesterday), meta: dayShort(yesterday) },
    { label: "Last week", iso: formatIsoDate(weeksAgo(1)), meta: dayMonth(weeksAgo(1)) },
    { label: "Last weekend", iso: formatIsoDate(lastSaturday), meta: dayShort(lastSaturday) },
    { label: "2 weeks ago", iso: formatIsoDate(weeksAgo(2)), meta: dayMonth(weeksAgo(2)) },
    { label: "4 weeks ago", iso: formatIsoDate(weeksAgo(4)), meta: dayMonth(weeksAgo(4)) },
    { label: "8 weeks ago", iso: formatIsoDate(weeksAgo(8)), meta: dayMonth(weeksAgo(8)) },
  ];

  // Calendar cells for the viewed month (null = leading blank).
  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (string | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => formatIsoDate(new Date(viewYear, viewMonth, i + 1))),
  ];
  // The roving tab stop must land on a rendered, enabled day.
  const monthPrefix = `${String(viewYear).padStart(4, "0")}-${String(viewMonth + 1).padStart(2, "0")}-`;
  const tabIso = focusIso.startsWith(monthPrefix) && !isOutOfRange(focusIso)
    ? focusIso
    : cells.find((c): c is string => c !== null && !isOutOfRange(c));

  const start = value.startDate;
  const end = value.endDate && value.endDate !== start ? value.endDate : "";
  const hasValue = Boolean(start);
  const years: number[] = [];
  for (let y = maxYear; y >= minYear; y--) years.push(y);

  return (
    <div ref={rootRef} className={`date-picker-root ${className}`.trim()}>
      <div
        className={`date-picker-pill${open ? " is-open" : ""}${error ? " has-error" : ""}${disabled ? " is-disabled" : ""}`}
      >
        <button
          ref={triggerRef}
          type="button"
          id={baseId}
          className="date-picker-trigger"
          disabled={disabled}
          aria-label={ariaLabel}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? dialogId : undefined}
          aria-describedby={ariaDescribedBy}
          aria-invalid={error || undefined}
          onClick={() => (open ? close(false) : openPopover())}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown" && !open && !disabled) {
              e.preventDefault();
              openPopover();
            }
          }}
        >
          <Calendar size={16} className="date-picker-icon" aria-hidden="true" />
          <span className={`date-picker-value${hasValue ? "" : " is-placeholder"}`}>
            {hasValue ? formatDateValue(value) : placeholder}
          </span>
        </button>
        {hasValue && !disabled && (
          <button
            type="button"
            className="date-picker-clear-btn"
            aria-label="Clear date"
            onClick={() => {
              onChange({ startDate: "" });
              close(false);
            }}
          >
            <X size={14} aria-hidden="true" />
          </button>
        )}
      </div>

      {open && createPortal(
        <div
          ref={dialogRef}
          id={dialogId}
          role="dialog"
          aria-label="Choose collection date or date range"
          className="date-picker-popover"
          style={pos ? { top: pos.top, left: pos.left } : { top: 0, left: 0, visibility: "hidden" }}
          onKeyDown={onDialogKeyDown}
        >
          <ul className="preset-list" aria-label="Quick select">
            {presets.map((p) => (
              <li key={p.label}>
                <button
                  type="button"
                  className="preset-btn"
                  disabled={isOutOfRange(p.iso)}
                  onClick={() => {
                    onChange({ startDate: p.iso });
                    close(true);
                  }}
                >
                  <span className="preset-label">{p.label}</span>
                  <span className="preset-meta">{p.meta}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="calendar-panel">
          <div className="calendar-header">
            <button
              type="button"
              className="calendar-title-btn"
              aria-expanded={view === "years"}
              aria-label={`${MONTH_NAMES[viewMonth]} ${viewYear}, choose year`}
              onClick={() => setView(view === "years" ? "days" : "years")}
            >
              <span>{MONTH_NAMES[viewMonth]}</span> <span>{viewYear}</span>
              <ChevronDown size={16} aria-hidden="true" />
            </button>
            <div className="calendar-header-actions">
              <button type="button" className="calendar-today-btn" onClick={goToToday}>
                Today
              </button>
              <button
                type="button"
                className="calendar-nav-btn"
                aria-label="Previous month"
                disabled={view !== "days" || !canPrev}
                onClick={() => stepMonth(-1)}
              >
                <ChevronLeft size={18} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="calendar-nav-btn"
                aria-label="Next month"
                disabled={view !== "days" || !canNext}
                onClick={() => stepMonth(1)}
              >
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            </div>
          </div>

          {view === "years" ? (
            <div className="year-grid" role="listbox" aria-label="Choose year">
              {years.map((y) => (
                <button
                  key={y}
                  type="button"
                  role="option"
                  aria-selected={y === viewYear}
                  className={`year-cell${y === viewYear ? " is-selected" : ""}`}
                  onClick={() => pickYear(y)}
                >
                  {y}
                </button>
              ))}
            </div>
          ) : (
            <>
              <div className="calendar-weekdays" aria-hidden="true">
                {WEEKDAYS.map((w) => (
                  <span key={w} className="weekday-label">{w}</span>
                ))}
              </div>
              <div className="calendar-days-grid" role="grid" aria-label={`${MONTH_NAMES[viewMonth]} ${viewYear}`} onKeyDown={onGridKeyDown}>
                {cells.map((iso, i) => {
                  if (!iso) return <span key={`blank-${i}`} className="day-cell day-empty" />;
                  const dayNum = Number(iso.slice(8));
                  const isStart = iso === start;
                  const isEnd = Boolean(end) && iso === end;
                  const inRange = Boolean(end) && iso > start && iso < end;
                  const cls = [
                    "day-cell day-btn",
                    isStart ? "is-start" : "",
                    isEnd ? "is-end" : "",
                    isStart && !end ? "is-single" : "",
                    inRange ? "in-range" : "",
                    iso === todayIso ? "is-today" : "",
                  ].filter(Boolean).join(" ");
                  const dt = parseIsoDate(iso);
                  return (
                    <button
                      key={iso}
                      type="button"
                      data-iso={iso}
                      className={cls}
                      disabled={isOutOfRange(iso)}
                      tabIndex={iso === tabIso ? 0 : -1}
                      aria-pressed={isStart || isEnd || inRange}
                      aria-label={dt ? `${dayNum} ${MONTH_NAMES[dt.getMonth()]} ${dt.getFullYear()}` : iso}
                      onClick={() => selectDay(iso)}
                      onFocus={() => setFocusIso(iso)}
                    >
                      {dayNum}
                    </button>
                  );
                })}
              </div>
            </>
          )}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
