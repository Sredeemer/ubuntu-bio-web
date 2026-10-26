"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { Calendar, ChevronLeft, ChevronRight, X, Clock } from "lucide-react";
import "./DatePicker.css";

export interface DatePickerProps {
  id?: string | undefined;
  value?: string | undefined; // ISO-8601 string: YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string | undefined;
  maxDate?: string | undefined; // ISO string, defaults to today
  minDate?: string | undefined; // ISO string (e.g. 1900-01-01)
  disabled?: boolean | undefined;
  error?: boolean | undefined;
  className?: string | undefined;
  ariaLabel?: string | undefined;
  placement?: "auto" | "top" | "bottom" | undefined;
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

function formatDisplayDate(iso: string): string {
  const parsed = parseIsoDate(iso);
  if (!parsed) return iso;
  const day = parsed.getDate();
  const month = MONTH_NAMES[parsed.getMonth()]?.slice(0, 3) || "";
  const year = parsed.getFullYear();
  return `${day} ${month} ${year}`;
}

export function DatePicker({
  id,
  value = "",
  onChange,
  placeholder = "Select sample collection date",
  maxDate,
  minDate = "1900-01-01",
  disabled = false,
  error = false,
  className = "",
  ariaLabel = "Choose date",
  placement = "auto",
}: DatePickerProps) {
  const generatedId = useId();
  const inputId = id || `date-picker-${generatedId}`;

  const todayIso = formatIsoDate(new Date());
  const effectiveMaxDate = maxDate || todayIso;

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Dynamic placement state ('top' | 'bottom')
  const [calculatedPlacement, setCalculatedPlacement] = useState<"top" | "bottom">(
    placement === "top" ? "top" : "bottom"
  );

  useEffect(() => {
    if (!isOpen) return;

    if (placement === "top" || placement === "bottom") {
      setCalculatedPlacement(placement);
      return;
    }

    const updatePlacement = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelowViewport = window.innerHeight - rect.bottom;
      const spaceAboveViewport = rect.top;

      let spaceToFooter = spaceBelowViewport;
      const footer =
        document.querySelector(".ubio-footer") || document.querySelector("footer");
      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        if (footerRect.top > rect.bottom) {
          spaceToFooter = Math.min(spaceBelowViewport, footerRect.top - rect.bottom);
        }
      }

      // Calendar popover is ~340px tall. Flip upward if space below or to footer is constrained.
      if (spaceToFooter < 360 && spaceAboveViewport > 260) {
        setCalculatedPlacement("top");
      } else {
        setCalculatedPlacement("bottom");
      }
    };

    updatePlacement();
    window.addEventListener("scroll", updatePlacement, { passive: true });
    window.addEventListener("resize", updatePlacement);

    return () => {
      window.removeEventListener("scroll", updatePlacement);
      window.removeEventListener("resize", updatePlacement);
    };
  }, [isOpen, placement]);

  // Calendar Viewport State (Year & Month)
  const initialDate = parseIsoDate(value) || new Date();
  const [viewYear, setViewYear] = useState<number>(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(initialDate.getMonth());

  // Keep view aligned when value changes externally
  useEffect(() => {
    const parsed = parseIsoDate(value);
    if (parsed) {
      setViewYear(parsed.getFullYear());
      setViewMonth(parsed.getMonth());
    }
  }, [value]);

  // Click outside to close
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

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

  const handleSelectDay = (day: number) => {
    const selected = new Date(viewYear, viewMonth, day);
    const iso = formatIsoDate(selected);
    if (effectiveMaxDate && iso > effectiveMaxDate) return;
    if (minDate && iso < minDate) return;
    onChange(iso);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  const handleQuickPreset = (daysOffset: number) => {
    const target = new Date();
    target.setDate(target.getDate() - daysOffset);
    const iso = formatIsoDate(target);
    onChange(iso);
    setIsOpen(false);
  };

  // Build calendar matrix
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sunday

  return (
    <div className={`date-picker-root ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <div
        id={inputId}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        className={`date-picker-trigger ${isOpen ? "is-open" : ""} ${error ? "has-error" : ""} ${
          disabled ? "is-disabled" : ""
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (!disabled && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
      >
        <Calendar size={16} className="date-picker-icon" />
        <span className={`date-picker-value ${!value ? "is-placeholder" : "font-mono"}`}>
          {value ? formatDisplayDate(value) : placeholder}
        </span>

        {value && !disabled && (
          <button
            type="button"
            className="date-picker-clear-btn"
            onClick={handleClear}
            title="Clear date"
            aria-label="Clear date"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Popover Calendar */}
      {isOpen && (
        <div
          className={`date-picker-popover placement-${
            placement === "top" || placement === "bottom" ? placement : calculatedPlacement
          }`}
          data-placement={
            placement === "top" || placement === "bottom" ? placement : calculatedPlacement
          }
          role="dialog"
          aria-modal="true"
        >
          {/* Quick Presets Bar */}
          <div className="date-picker-presets">
            <span className="presets-label">
              <Clock size={12} /> Presets:
            </span>
            <button
              type="button"
              className="preset-chip"
              onClick={() => handleQuickPreset(0)}
            >
              Today
            </button>
            <button
              type="button"
              className="preset-chip"
              onClick={() => handleQuickPreset(1)}
            >
              Yesterday
            </button>
            <button
              type="button"
              className="preset-chip"
              onClick={() => handleQuickPreset(7)}
            >
              7d ago
            </button>
            <button
              type="button"
              className="preset-chip"
              onClick={() => handleQuickPreset(30)}
            >
              30d ago
            </button>
          </div>

          {/* Calendar Header */}
          <div className="calendar-header">
            <button
              type="button"
              className="calendar-nav-btn"
              onClick={handlePrevMonth}
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="calendar-month-year">
              <span className="month-name">{MONTH_NAMES[viewMonth]}</span>
              <span className="year-number">{viewYear}</span>
            </div>
            <button
              type="button"
              className="calendar-nav-btn"
              onClick={handleNextMonth}
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Weekday Labels */}
          <div className="calendar-weekdays">
            {WEEKDAY_NAMES.map((wd) => (
              <span key={wd} className="weekday-label">
                {wd}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="calendar-days-grid">
            {/* Empty offset padding for days before month starts */}
            {Array.from({ length: firstDayIndex }).map((_, idx) => (
              <span key={`empty-${idx}`} className="day-cell day-empty" />
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const cellDate = new Date(viewYear, viewMonth, day);
              const cellIso = formatIsoDate(cellDate);

              const isSelected = value === cellIso;
              const isToday = todayIso === cellIso;
              const isDisabled =
                Boolean(effectiveMaxDate && cellIso > effectiveMaxDate) ||
                Boolean(minDate && cellIso < minDate);

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  disabled={isDisabled}
                  className={`day-cell day-btn ${isSelected ? "is-selected" : ""} ${
                    isToday ? "is-today" : ""
                  } ${isDisabled ? "is-disabled" : ""}`}
                  onClick={() => handleSelectDay(day)}
                  aria-label={`${day} ${MONTH_NAMES[viewMonth]} ${viewYear}`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer Info */}
          <div className="calendar-footer">
            <span className="calendar-iso-hint font-mono">
              ISO-8601: {value || "YYYY-MM-DD"}
            </span>
            <button
              type="button"
              className="btn-calendar-close"
              onClick={() => setIsOpen(false)}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
