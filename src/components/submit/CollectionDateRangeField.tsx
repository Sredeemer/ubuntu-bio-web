"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import { DatePicker } from "../ui/DatePicker";
import {
  CollectionDateErrors,
  CollectionDateInput,
  getLocalTimeHHMM,
  getLocalTodayIso,
} from "../../lib/submitValidation";

/** Earliest selectable collection date. */
export const COLLECTION_MIN_DATE = "1990-01-01";

export interface CollectionDateRangeFieldProps {
  /** id of the start-date trigger; the field's outer <label htmlFor> should point at it. */
  id: string;
  value: CollectionDateInput;
  onChange: (next: CollectionDateInput) => void;
  /** Errors to display. The parent decides when they are visible. */
  errors?: CollectionDateErrors | undefined;
  /** Called when the user leaves any part of the field (used to reveal errors). */
  onBlur?: (() => void) | undefined;
  /** Latest selectable date (YYYY-MM-DD); defaults to today in local time. */
  maxDate?: string | undefined;
}

/**
 * Collection date as a single date (default) or a date range. Each end is a DatePicker
 * pill with an optional "Add time" control (15-minute steps).
 */
export function CollectionDateRangeField({
  id,
  value,
  onChange,
  errors,
  onBlur,
  maxDate,
}: CollectionDateRangeFieldProps) {
  const today = getLocalTodayIso();
  const max = maxDate || today;
  const nowTime = getLocalTimeHHMM();
  const startErrorId = `${id}-start-error`;
  const endErrorId = `${id}-end-error`;
  const startError = errors?.start;
  const endError = errors?.end;

  const update = (patch: Partial<CollectionDateInput>) => {
    onChange({ ...value, ...patch });
  };

  const handleToggleRange = (checked: boolean) => {
    // Leaving range mode drops the end so a single date is stored with end = null.
    onChange(checked ? { ...value, isRange: true } : { ...value, isRange: false, endDate: "", endTime: "" });
  };

  // Times later than "now" are disabled for today's date; on a same-day range the end
  // time can't be before the start time.
  const startMaxTime = value.startDate === today ? nowTime : undefined;
  const endMaxTime = value.endDate === today ? nowTime : undefined;
  const endMinTime =
    value.endDate && value.endDate === value.startDate && value.startTime ? value.startTime : undefined;

  return (
    <div
      className="collection-date-field"
      onBlur={(e) => {
        // Only fire when focus leaves the whole field, not when moving between its parts.
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) onBlur?.();
      }}
    >
      <label className="collection-date-toggle" htmlFor={`${id}-range-toggle`}>
        <input
          type="checkbox"
          id={`${id}-range-toggle`}
          className="form-checkbox"
          checked={value.isRange}
          onChange={(e) => handleToggleRange(e.target.checked)}
        />
        <span>Date range</span>
      </label>

      <div className={`collection-date-pills ${value.isRange ? "is-range" : ""}`}>
        <DatePicker
          id={id}
          value={value.startDate}
          onChange={(iso) => update({ startDate: iso, ...(iso ? {} : { startTime: "" }) })}
          placeholder={value.isRange ? "Start date" : "Collection date"}
          ariaLabel={value.isRange ? "Choose collection start date" : "Choose collection date"}
          ariaDescribedBy={startError ? startErrorId : undefined}
          maxDate={max}
          minDate={COLLECTION_MIN_DATE}
          error={Boolean(startError)}
          time={value.startTime}
          onTimeChange={(t) => update({ startTime: t })}
          maxTime={startMaxTime}
          timeAriaLabel={value.isRange ? "Choose start time" : "Choose collection time"}
        />
        {value.isRange && (
          <DatePicker
            id={`${id}-end`}
            value={value.endDate}
            onChange={(iso) => update({ endDate: iso, ...(iso ? {} : { endTime: "" }) })}
            placeholder="End date"
            ariaLabel="Choose collection end date"
            ariaDescribedBy={endError ? endErrorId : undefined}
            maxDate={max}
            minDate={value.startDate && value.startDate > COLLECTION_MIN_DATE ? value.startDate : COLLECTION_MIN_DATE}
            error={Boolean(endError)}
            time={value.endTime}
            onTimeChange={(t) => update({ endTime: t })}
            minTime={endMinTime}
            maxTime={endMaxTime}
            timeAriaLabel="Choose end time"
          />
        )}
      </div>

      {startError && (
        <span className="field-error-msg" id={startErrorId}>
          <AlertCircle size={13} /> {startError}
        </span>
      )}
      {value.isRange && endError && (
        <span className="field-error-msg" id={endErrorId}>
          <AlertCircle size={13} /> {endError}
        </span>
      )}
    </div>
  );
}
