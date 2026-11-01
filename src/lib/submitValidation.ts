/**
 * Validation and serialization utilities for the UbuntuBio dataset submission wizard.
 * Collection dates are date-only (no time) and serialize to the backend DATE_REGEX forms:
 * "YYYY-MM-DD" or "YYYY-MM-DD/YYYY-MM-DD".
 */

export interface CollectionDateValue {
  /** Local calendar date, YYYY-MM-DD. Empty string when nothing is selected. */
  startDate: string;
  /** Optional range end, YYYY-MM-DD. Absent for a single date. */
  endDate?: string | undefined;
}

export const EMPTY_COLLECTION_DATE: CollectionDateValue = { startDate: "" };

export interface CollectionDateErrors {
  start?: string | undefined;
  end?: string | undefined;
}

/**
 * Returns today's date in local time as an ISO string: YYYY-MM-DD.
 */
export function getLocalTodayIso(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Serializes a collection date: "YYYY-MM-DD" for a single date (or a range whose end equals
 * its start), "YYYY-MM-DD/YYYY-MM-DD" for a range, and "" when no start date is set.
 */
export function serializeCollectionDate(val: CollectionDateValue): string {
  if (!val.startDate) return "";
  if (!val.endDate || val.endDate === val.startDate) return val.startDate;
  return `${val.startDate}/${val.endDate}`;
}

/**
 * Validates collection date boundaries against the user's local clock:
 * start and end cannot be in the future, and end cannot precede start.
 */
export function validateCollectionDate(
  val: CollectionDateValue,
  now: Date = new Date()
): CollectionDateErrors | undefined {
  const today = getLocalTodayIso(now);
  const errors: CollectionDateErrors = {};

  if (val.startDate && val.startDate > today) {
    errors.start = "Start date can't be in the future.";
  }

  if (val.endDate) {
    if (!val.startDate) {
      errors.start = "Select a start date.";
    } else if (val.endDate > today) {
      errors.end = "End date can't be in the future.";
    } else if (val.endDate < val.startDate) {
      errors.end = "End date can't be before the start date.";
    }
  }

  return errors.start || errors.end ? errors : undefined;
}
