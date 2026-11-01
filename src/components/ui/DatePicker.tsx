"use client";

import React, { useState, useRef, useEffect, useLayoutEffect, useId } from "react";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import "./DatePicker.css";

export interface DatePickerProps {
  /** id of the main trigger button (so an outer <label htmlFor> can point at it). */
  id?: string | undefined;
  value?: string | undefined; // ISO-8601 string: YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string | undefined;
  maxDate?: string | undefined; // ISO string, defaults to today (local)
  minDate?: string | undefined; // ISO string (e.g. 1900-01-01)
  disabled?: boolean | undefined;
  error?: boolean | undefined;
  className?: string | undefined;
  ariaLabel?: string | undefined;
  /** id(s) of element(s) describing the field, e.g. an error message. */
  ariaDescribedBy?: string | undefined;
  placement?: "auto" | "top" | "bottom" | undefined;
  /**
   * Optional time ("HH:MM", 24h) shown as an "Add time" button inside the pill.
   * The time control only appears when onTimeChange is given and a date is set.
   */
  time?: string | undefined;
  onTimeChange?: ((value: string) => void) | undefined;
  /** Earliest / latest selectable time ("HH:MM") for the chosen date; others are disabled. */
  minTime?: string | undefined;
  maxTime?: string | undefined;
  /** Accessible name for the time list, e.g. "Choose start time". */
  timeAriaLabel?: string | undefined;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** 15-minute steps across the day: "00:00" … "23:45". */
export const TIME_SLOTS: readonly string[] = Array.from({ length: 96 }, (_, i) => {
  const h = Math.floor(i / 4);
  const m = (i % 4) * 15;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
});

function formatIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseIsoDate(iso: string): Date | null {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  return isNaN(date.getTime()) ? null : date;
}

function addDays(d: Date, days: number): Date {
  const out = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  out.setDate(out.getDate() + days);
  return out;
}

function formatDisplayDate(iso: string): string {
  const parsed = parseIsoDate(iso);
  if (!parsed) return iso;
  const month = MONTH_NAMES[parsed.getMonth()]?.slice(0, 3) || "";
  return `${parsed.getDate()} ${month} ${parsed.getFullYear()}`;
}

function formatLongDate(iso: string): string {
  const parsed = parseIsoDate(iso);
  if (!parsed) return iso;
  return `${parsed.getDate()} ${MONTH_NAMES[parsed.getMonth()]} ${parsed.getFullYear()}`;
}

/** "Today", "Yesterday", otherwise "15 Mar 2026". */
export function formatFriendlyDate(iso: string, now: Date = new Date()): string {
  const today = formatIsoDate(now);
  if (iso === today) return "Today";
  if (iso === formatIsoDate(addDays(now, -1))) return "Yesterday";
  return formatDisplayDate(iso);
}

/** "14:30" -> "2:30 pm". Unparseable values are returned unchanged. */
export function formatTime12h(hhmm: string): string {
  const match = /^(\d{2}):(\d{2})$/.exec(hhmm);
  if (!match) return hhmm;
  const h = Number(match[1]);
  const suffix = h < 12 ? "am" : "pm";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${match[2]} ${suffix}`;
}

export interface DatePreset {
  label: string;
  iso: string;
  /** Weekday ("Sat") within the last week, otherwise "24 Oct". */
  hint: string;
}

/**
 * Past-only quick presets for collection dates. Weeks start on Sunday (matching the
 * calendar), so "Last weekend" is the Saturday before the current week.
 */
export function getPastDatePresets(now: Date = new Date()): DatePreset[] {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = addDays(today, -today.getDay());
  const entries: Array<[string, Date]> = [
    ["Today", today],
    ["Yesterday", addDays(today, -1)],
    ["Last week", addDays(today, -7)],
    ["Last weekend", addDays(startOfWeek, -1)],
    ["2 weeks ago", addDays(today, -14)],
    ["4 weeks ago", addDays(today, -28)],
    ["8 weeks ago", addDays(today, -56)],
  ];
  return entries.map(([label, date]) => {
    const daysAgo = Math.round((today.getTime() - date.getTime()) / 86_400_000);
    const hint =
      daysAgo < 7
        ? WEEKDAY_SHORT[date.getDay()] ?? ""
        : `${date.getDate()} ${MONTH_NAMES[date.getMonth()]?.slice(0, 3) ?? ""}`;
    return { label, iso: formatIsoDate(date), hint };
  });
}

interface PopoverPosition {
  side: "top" | "bottom";
  /** Horizontal nudge (px) from the CSS anchor (left: 0 for "start", right: 0 for "end"). */
  shiftX: number;
  maxHeight: number | undefined;
}

/** Fixed height cap for the time list (~7 rows); must match .date-picker-time-list in CSS. */
export const TIME_LIST_MAX_HEIGHT = 280;

const VIEWPORT_MARGIN = 8;
const GAP = 6;

/**
 * Positions an absolutely-positioned popover relative to its anchor: picks the side with
 * room (never past the footer or viewport), clamps it horizontally inside the viewport
 * and caps its height to the space available so it scrolls instead of overflowing.
 */
function usePopoverPosition(
  open: boolean,
  anchorRef: React.RefObject<HTMLElement | null>,
  popoverRef: React.RefObject<HTMLElement | null>,
  placement: "auto" | "top" | "bottom",
  align: "start" | "end",
  /** Changes whenever the popover content may change size (e.g. month or view switch). */
  layoutKey: string = "",
  /**
   * Hard height limit. scrollHeight reports the full content height and ignores CSS
   * max-height, so without this a long list "needs" thousands of pixels and the
   * computed inline maxHeight (which overrides the stylesheet) becomes huge.
   */
  heightCap?: number
): PopoverPosition {
  const [pos, setPos] = useState<PopoverPosition>({
    side: placement === "top" ? "top" : "bottom",
    shiftX: 0,
    maxHeight: heightCap,
  });

  useLayoutEffect(() => {
    if (!open) return;

    const update = () => {
      const anchor = anchorRef.current;
      const pop = popoverRef.current;
      if (!anchor || !pop) return;
      const rect = anchor.getBoundingClientRect();
      const viewportW = document.documentElement.clientWidth || window.innerWidth;
      const viewportH = window.innerHeight;

      let bottomLimit = viewportH;
      const footer = document.querySelector(".ubio-footer") || document.querySelector("footer");
      if (footer) {
        const footerTop = footer.getBoundingClientRect().top;
        if (footerTop > rect.bottom) bottomLimit = Math.min(bottomLimit, footerTop);
      }
      const spaceBelow = bottomLimit - rect.bottom - GAP - VIEWPORT_MARGIN;
      const spaceAbove = rect.top - GAP - VIEWPORT_MARGIN;
      const naturalH = heightCap ? Math.min(pop.scrollHeight, heightCap) : pop.scrollHeight;

      let side: "top" | "bottom";
      if (placement === "top" || placement === "bottom") side = placement;
      else if (naturalH <= spaceBelow) side = "bottom";
      else if (naturalH <= spaceAbove) side = "top";
      else side = spaceAbove > spaceBelow ? "top" : "bottom";

      const available = side === "top" ? spaceAbove : spaceBelow;
      // Shrink only when the chosen side is too short (keeping a usable minimum), and never
      // exceed the cap.
      let maxHeight: number | undefined =
        naturalH > available && available > 0 ? Math.max(available, 160) : undefined;
      if (heightCap) maxHeight = Math.min(maxHeight ?? heightCap, heightCap);

      // Where CSS puts it, then nudge back inside the viewport if needed.
      const width = pop.offsetWidth;
      const naturalLeft = align === "end" ? rect.right - width : rect.left;
      let clampedLeft = naturalLeft;
      if (clampedLeft + width > viewportW - VIEWPORT_MARGIN) clampedLeft = viewportW - VIEWPORT_MARGIN - width;
      if (clampedLeft < VIEWPORT_MARGIN) clampedLeft = VIEWPORT_MARGIN;
      const shiftX = Math.round(clampedLeft - naturalLeft);

      setPos((prev) =>
        prev.side === side && prev.shiftX === shiftX && prev.maxHeight === maxHeight
          ? prev
          : { side, shiftX, maxHeight }
      );
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [open, placement, align, anchorRef, popoverRef, layoutKey, heightCap]);

  return pos;
}

export function DatePicker({
  id,
  value = "",
  onChange,
  placeholder = "Select date",
  maxDate,
  minDate = "1900-01-01",
  disabled = false,
  error = false,
  className = "",
  ariaLabel = "Choose date",
  ariaDescribedBy,
  placement = "auto",
  time = "",
  onTimeChange,
  minTime,
  maxTime,
  timeAriaLabel = "Choose time",
}: DatePickerProps) {
  const generatedId = useId();
  const baseId = id || `date-picker-${generatedId.replace(/:/g, "")}`;
  const dialogTitleId = `${baseId}-dialog-title`;
  const timeListId = `${baseId}-time-list`;

  const now = new Date();
  const todayIso = formatIsoDate(now);
  const effectiveMaxDate = maxDate || todayIso;
  const isOutOfRange = (iso: string) =>
    Boolean((effectiveMaxDate && iso > effectiveMaxDate) || (minDate && iso < minDate));

  const [openPanel, setOpenPanel] = useState<"none" | "calendar" | "time">("none");
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const timeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const timeListRef = useRef<HTMLUListElement>(null);

  // Calendar viewport (year & month)
  const initialDate = parseIsoDate(value) || now;
  const [viewYear, setViewYear] = useState<number>(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(initialDate.getMonth());

  // Month / year pickers inside the calendar column.
  const [calendarView, setCalendarView] = useState<"days" | "months" | "years">("days");
  const [pickerYear, setPickerYear] = useState<number>(initialDate.getFullYear());

  const calendarPos = usePopoverPosition(
    openPanel === "calendar",
    rootRef,
    dialogRef,
    placement,
    "start",
    `${calendarView}-${viewYear}-${viewMonth}-${pickerYear}`
  );
  const timePos = usePopoverPosition(
    openPanel === "time",
    rootRef,
    timeListRef,
    placement,
    "end",
    "",
    TIME_LIST_MAX_HEIGHT
  );

  useEffect(() => {
    const parsed = parseIsoDate(value);
    if (parsed) {
      setViewYear(parsed.getFullYear());
      setViewMonth(parsed.getMonth());
    }
  }, [value]);

  // Close on outside click (focus stays wherever the user clicked).
  useEffect(() => {
    if (openPanel === "none") return;
    const handleOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpenPanel("none");
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [openPanel]);

  const closeAndReturnFocus = (to: "trigger" | "time") => {
    setOpenPanel("none");
    // The time button only exists while a date is set; fall back to the trigger.
    const target = to === "time" ? timeButtonRef.current ?? triggerRef.current : triggerRef.current;
    target?.focus();
  };

  /* ---------------------------- Calendar panel ---------------------------- */

  // Every time the calendar opens it starts on the day grid.
  useEffect(() => {
    if (openPanel === "calendar") setCalendarView("days");
  }, [openPanel]);

  // Move focus to the highlighted cell whenever the dialog opens or switches view:
  // selected cell, else today's cell, else the first enabled cell.
  useEffect(() => {
    if (openPanel !== "calendar" || !dialogRef.current) return;
    const grid = dialogRef.current.querySelector<HTMLElement>(".calendar-grid");
    const target =
      grid?.querySelector<HTMLButtonElement>(".is-selected:not(:disabled)") ||
      grid?.querySelector<HTMLButtonElement>(".is-today:not(:disabled)") ||
      grid?.querySelector<HTMLButtonElement>("button:not(:disabled)") ||
      dialogRef.current.querySelector<HTMLButtonElement>("button:not(:disabled)");
    target?.focus({ preventScroll: true });
    // Scroll the (scrollable) year grid itself so the focused year is visible, without
    // scrolling the page. The grid is position: relative, so offsetTop is grid-relative.
    if (grid && target && grid.contains(target) && grid.scrollHeight > grid.clientHeight) {
      grid.scrollTop = Math.max(0, target.offsetTop - (grid.clientHeight - target.offsetHeight) / 2);
    }
    // Deliberately not keyed on the viewed month: re-running on month navigation would
    // steal focus from the month arrows.
  }, [openPanel, calendarView]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleShowToday = () => {
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setCalendarView("days");
  };

  // Year bounds for the month / year pickers (from minDate / maxDate).
  const minYear = parseIsoDate(minDate)?.getFullYear() ?? -Infinity;
  const maxYear = parseIsoDate(effectiveMaxDate)?.getFullYear() ?? Infinity;
  const minMonthKey = minDate ? minDate.slice(0, 7) : "";
  const maxMonthKey = effectiveMaxDate ? effectiveMaxDate.slice(0, 7) : "";
  const monthKey = (y: number, m: number) => `${y}-${String(m + 1).padStart(2, "0")}`;
  const isMonthDisabled = (y: number, m: number) =>
    Boolean((maxMonthKey && monthKey(y, m) > maxMonthKey) || (minMonthKey && monthKey(y, m) < minMonthKey));
  const isYearDisabled = (y: number) => y > maxYear || y < minYear;
  // The year view lists every selectable year at once (oldest first, newest at the bottom).
  const firstYear = Number.isFinite(minYear) ? minYear : 1900;
  const lastYear = Number.isFinite(maxYear) ? maxYear : now.getFullYear();
  const yearList = Array.from({ length: Math.max(0, lastYear - firstYear + 1) }, (_, i) => firstYear + i);

  const openMonthView = () => {
    setPickerYear(viewYear);
    setCalendarView("months");
  };

  const openYearView = () => {
    setCalendarView("years");
  };

  const selectYear = (y: number) => {
    if (isYearDisabled(y)) return;
    setPickerYear(y);
    setCalendarView("months");
  };

  const selectMonth = (m: number) => {
    if (isMonthDisabled(pickerYear, m)) return;
    setViewYear(pickerYear);
    setViewMonth(m);
    setCalendarView("days");
  };

  /** Arrow-key movement inside a grid of buttons; skips disabled cells. */
  const handleGridKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, columns: number) => {
    const deltas: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -columns, ArrowDown: columns };
    const delta = deltas[e.key];
    if (!delta) return;
    const buttons = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>("button"));
    const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (current < 0) return;
    e.preventDefault();
    for (let i = current + delta; i >= 0 && i < buttons.length; i += delta) {
      const candidate = buttons[i];
      if (candidate && !candidate.disabled) {
        candidate.focus();
        return;
      }
    }
  };

  const selectDate = (iso: string) => {
    if (isOutOfRange(iso)) return;
    onChange(iso);
    closeAndReturnFocus("trigger");
  };

  const handleClear = () => {
    onChange("");
    triggerRef.current?.focus();
  };

  const presets = getPastDatePresets(now);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sunday

  /* ------------------------------ Time panel ------------------------------ */

  const isTimeDisabled = (t: string) =>
    Boolean((minTime && t < minTime) || (maxTime && t > maxTime));

  interface TimeOption {
    value: string; // "" = clear
    label: string;
    disabled: boolean;
  }
  const timeOptions: TimeOption[] = [
    ...(time ? [{ value: "", label: "Clear time", disabled: false }] : []),
    ...TIME_SLOTS.map((t) => ({ value: t, label: formatTime12h(t), disabled: isTimeDisabled(t) })),
  ];

  const [activeTimeIndex, setActiveTimeIndex] = useState(0);

  const initialTimeIndex = (): number => {
    const exact = timeOptions.findIndex((o) => o.value !== "" && o.value === time);
    if (exact >= 0 && !timeOptions[exact]?.disabled) return exact;
    // Nearest 15-minute step at or before the selected time (or the current time).
    const ref = time || `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    let idx = timeOptions.reduce((best, o, i) => (o.value !== "" && o.value <= ref ? i : best), -1);
    if (idx < 0) idx = timeOptions.findIndex((o) => o.value !== "");
    // Step to the closest enabled option (prefer earlier, since later is often "future").
    for (let d = 0; d < timeOptions.length; d++) {
      for (const cand of [idx - d, idx + d]) {
        const o = timeOptions[cand];
        if (o && o.value !== "" && !o.disabled) return cand;
      }
    }
    return 0;
  };

  useEffect(() => {
    if (openPanel !== "time") return;
    setActiveTimeIndex(initialTimeIndex());
    timeListRef.current?.focus({ preventScroll: true });
    // Deliberately keyed on openPanel only: reset the active option when the list opens.
  }, [openPanel]);

  // Keep the active option scrolled into view inside the list.
  useEffect(() => {
    if (openPanel !== "time") return;
    const list = timeListRef.current;
    const el = list?.children[activeTimeIndex] as HTMLElement | undefined;
    if (list && el) {
      const top = el.offsetTop;
      const bottom = top + el.offsetHeight;
      if (top < list.scrollTop) list.scrollTop = top;
      else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight;
    }
  }, [openPanel, activeTimeIndex]);

  const chooseTimeOption = (idx: number) => {
    const opt = timeOptions[idx];
    if (!opt || opt.disabled || !onTimeChange) return;
    onTimeChange(opt.value);
    closeAndReturnFocus("time");
  };

  const moveActive = (from: number, step: 1 | -1) => {
    for (let i = from + step; i >= 0 && i < timeOptions.length; i += step) {
      if (!timeOptions[i]?.disabled) return i;
    }
    return from;
  };

  const handleTimeListKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveTimeIndex((i) => moveActive(i, 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveTimeIndex((i) => moveActive(i, -1));
        break;
      case "Home":
        e.preventDefault();
        setActiveTimeIndex(moveActive(-1, 1));
        break;
      case "End":
        e.preventDefault();
        setActiveTimeIndex(moveActive(timeOptions.length, -1));
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        chooseTimeOption(activeTimeIndex);
        break;
      case "Escape":
        e.preventDefault();
        e.stopPropagation();
        closeAndReturnFocus("time");
        break;
      case "Tab":
        setOpenPanel("none");
        break;
      default:
        break;
    }
  };

  const showTime = Boolean(onTimeChange && value);
  const displayLabel = value ? formatFriendlyDate(value, now) : placeholder;

  return (
    <div className={`date-picker-root ${className}`} ref={rootRef}>
      <div
        className={`date-picker-pill ${openPanel !== "none" ? "is-open" : ""} ${error ? "has-error" : ""} ${
          disabled ? "is-disabled" : ""
        }`}
        onClick={(e) => {
          // Mouse convenience: clicking empty pill space opens the calendar. Keyboard users
          // reach the same action through the trigger button.
          if (!disabled && e.target === e.currentTarget) setOpenPanel("calendar");
        }}
      >
        <button
          ref={triggerRef}
          id={baseId}
          type="button"
          className="date-picker-trigger"
          disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={openPanel === "calendar"}
          aria-label={value ? `${ariaLabel}, ${formatLongDate(value)}` : ariaLabel}
          aria-invalid={error || undefined}
          aria-describedby={ariaDescribedBy}
          onClick={() => setOpenPanel((p) => (p === "calendar" ? "none" : "calendar"))}
        >
          <Calendar size={16} className="date-picker-icon" aria-hidden="true" />
          <span className={`date-picker-value ${!value ? "is-placeholder" : ""}`}>{displayLabel}</span>
        </button>

        {value && !disabled && (
          <button
            type="button"
            className="date-picker-clear-btn"
            onClick={handleClear}
            title="Clear date"
            aria-label="Clear date"
          >
            <X size={13} />
          </button>
        )}

        {showTime && !disabled && (
          <button
            ref={timeButtonRef}
            type="button"
            className={`date-picker-time-btn ${time ? "has-time" : ""}`}
            aria-haspopup="listbox"
            aria-expanded={openPanel === "time"}
            aria-controls={openPanel === "time" ? timeListId : undefined}
            aria-label={time ? `Change time, ${formatTime12h(time)}` : "Add time"}
            aria-describedby={ariaDescribedBy}
            onClick={() => setOpenPanel((p) => (p === "time" ? "none" : "time"))}
          >
            {time ? formatTime12h(time) : "Add time"}
          </button>
        )}
      </div>

      {openPanel === "calendar" && (
        <div
          ref={dialogRef}
          className={`date-picker-popover placement-${calendarPos.side}`}
          data-placement={calendarPos.side}
          role="dialog"
          aria-modal="false"
          aria-label={ariaLabel}
          style={{
            left: `${calendarPos.shiftX}px`,
            ...(calendarPos.maxHeight ? { maxHeight: `${calendarPos.maxHeight}px` } : {}),
          }}
          onKeyDown={(e) => {
            if (e.key !== "Escape") return;
            e.preventDefault();
            e.stopPropagation();
            // Escape steps back one level (years -> months -> days) before closing.
            if (calendarView === "years") setCalendarView("months");
            else if (calendarView === "months") setCalendarView("days");
            else closeAndReturnFocus("trigger");
          }}
        >
          <ul className="date-preset-list" aria-label="Quick dates">
            {presets.map((p) => {
              const presetDisabled = isOutOfRange(p.iso);
              return (
                <li key={p.label}>
                  <button
                    type="button"
                    className={`date-preset-item ${value === p.iso ? "is-selected" : ""}`}
                    disabled={presetDisabled}
                    aria-label={`${p.label}, ${formatLongDate(p.iso)}`}
                    onClick={() => selectDate(p.iso)}
                  >
                    <span className="date-preset-label">{p.label}</span>
                    <span className="date-preset-hint">{p.hint}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="date-picker-calendar">
            <div className="calendar-header">
              {calendarView === "days" && (
                <button
                  type="button"
                  className="calendar-title-btn"
                  aria-expanded={false}
                  aria-label={`Choose month and year, ${MONTH_NAMES[viewMonth]} ${viewYear}`}
                  onClick={openMonthView}
                >
                  <span className="month-name">{MONTH_NAMES[viewMonth]}</span>{" "}
                  <span className="year-number">{viewYear}</span>
                  <ChevronDown size={14} aria-hidden="true" />
                </button>
              )}
              {calendarView === "months" && (
                <button
                  type="button"
                  className="calendar-title-btn"
                  aria-expanded={false}
                  aria-label={`Choose year, ${pickerYear}`}
                  onClick={openYearView}
                >
                  <span className="year-number">{pickerYear}</span>
                  <ChevronDown size={14} aria-hidden="true" />
                </button>
              )}
              {calendarView === "years" && (
                <span className="calendar-title" id={dialogTitleId}>
                  {firstYear} – {lastYear}
                </span>
              )}

              <div className="calendar-header-actions">
                <button type="button" className="calendar-today-btn" aria-label="Go to today" onClick={handleShowToday}>
                  Today
                </button>
                {calendarView === "days" && (
                  <>
                    <button type="button" className="calendar-nav-btn" onClick={handlePrevMonth} aria-label="Previous month">
                      <ChevronLeft size={15} />
                    </button>
                    <button type="button" className="calendar-nav-btn" onClick={handleNextMonth} aria-label="Next month">
                      <ChevronRight size={15} />
                    </button>
                  </>
                )}
                {calendarView === "months" && (
                  <>
                    <button
                      type="button"
                      className="calendar-nav-btn"
                      onClick={() => setPickerYear((y) => y - 1)}
                      disabled={pickerYear - 1 < minYear}
                      aria-label="Previous year"
                    >
                      <ChevronLeft size={15} />
                    </button>
                    <button
                      type="button"
                      className="calendar-nav-btn"
                      onClick={() => setPickerYear((y) => y + 1)}
                      disabled={pickerYear + 1 > maxYear}
                      aria-label="Next year"
                    >
                      <ChevronRight size={15} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {calendarView === "days" && (
              <>
                <div className="calendar-weekdays" aria-hidden="true">
                  {WEEKDAY_NAMES.map((wd) => (
                    <span key={wd} className="weekday-label">
                      {wd}
                    </span>
                  ))}
                </div>

                <div
                  className="calendar-grid calendar-days-grid"
                  role="group"
                  aria-label={`${MONTH_NAMES[viewMonth]} ${viewYear}`}
                  onKeyDown={(e) => handleGridKeyDown(e, 7)}
                >
                  {Array.from({ length: firstDayIndex }).map((_, idx) => (
                    <span key={`empty-${idx}`} className="day-cell day-empty" />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, idx) => {
                    const day = idx + 1;
                    const cellIso = formatIsoDate(new Date(viewYear, viewMonth, day));
                    const isSelected = value === cellIso;
                    const isToday = todayIso === cellIso;
                    const isDisabled = isOutOfRange(cellIso);
                    return (
                      <button
                        key={`day-${day}`}
                        type="button"
                        disabled={isDisabled}
                        className={`day-cell day-btn ${isSelected ? "is-selected" : ""} ${isToday ? "is-today" : ""} ${
                          isDisabled ? "is-disabled" : ""
                        }`}
                        aria-pressed={isSelected}
                        aria-current={isToday ? "date" : undefined}
                        onClick={() => selectDate(cellIso)}
                        aria-label={`${day} ${MONTH_NAMES[viewMonth]} ${viewYear}`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {calendarView === "months" && (
              <div
                className="calendar-grid calendar-period-grid"
                role="group"
                aria-label={`Months of ${pickerYear}`}
                onKeyDown={(e) => handleGridKeyDown(e, 3)}
              >
                {MONTH_NAMES.map((name, m) => {
                  const isSelected = pickerYear === viewYear && m === viewMonth;
                  const isCurrent = pickerYear === now.getFullYear() && m === now.getMonth();
                  const isDisabled = isMonthDisabled(pickerYear, m);
                  return (
                    <button
                      key={name}
                      type="button"
                      disabled={isDisabled}
                      className={`period-btn ${isSelected ? "is-selected" : ""} ${isCurrent ? "is-today" : ""} ${
                        isDisabled ? "is-disabled" : ""
                      }`}
                      aria-pressed={isSelected}
                      aria-current={isCurrent ? "date" : undefined}
                      aria-label={`${name} ${pickerYear}`}
                      onClick={() => selectMonth(m)}
                    >
                      {name.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            )}

            {calendarView === "years" && (
              <div
                className="calendar-grid calendar-period-grid calendar-year-grid"
                role="group"
                aria-label={`Years ${firstYear} – ${lastYear}`}
                onKeyDown={(e) => handleGridKeyDown(e, 3)}
              >
                {yearList.map((y) => {
                  const isSelected = y === pickerYear;
                  const isCurrent = y === now.getFullYear();
                  return (
                    <button
                      key={y}
                      type="button"
                      className={`period-btn ${isSelected ? "is-selected" : ""} ${isCurrent ? "is-today" : ""}`}
                      aria-pressed={isSelected}
                      aria-current={isCurrent ? "date" : undefined}
                      onClick={() => selectYear(y)}
                    >
                      {y}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {openPanel === "time" && showTime && (
        <ul
          ref={timeListRef}
          id={timeListId}
          role="listbox"
          tabIndex={0}
          aria-label={timeAriaLabel}
          aria-activedescendant={`${timeListId}-opt-${activeTimeIndex}`}
          className={`date-picker-time-list align-end placement-${timePos.side}`}
          data-placement={timePos.side}
          style={{
            right: `${-timePos.shiftX}px`,
            maxHeight: `${timePos.maxHeight ?? TIME_LIST_MAX_HEIGHT}px`,
          }}
          onKeyDown={handleTimeListKeyDown}
        >
          {timeOptions.map((opt, idx) => (
            <li
              key={opt.value || "clear"}
              id={`${timeListId}-opt-${idx}`}
              role="option"
              aria-selected={opt.value !== "" && opt.value === time}
              aria-disabled={opt.disabled || undefined}
              className={`time-option ${opt.value === "" ? "is-clear" : ""} ${idx === activeTimeIndex ? "is-active" : ""} ${
                opt.value !== "" && opt.value === time ? "is-selected" : ""
              } ${opt.disabled ? "is-disabled" : ""}`}
              onMouseEnter={() => !opt.disabled && setActiveTimeIndex(idx)}
              onMouseDown={(e) => e.preventDefault() /* keep focus on the listbox */}
              onClick={() => chooseTimeOption(idx)}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
