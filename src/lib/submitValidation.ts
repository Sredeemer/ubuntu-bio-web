/**
 * Validation and date range formatting utilities for the UbuntuBio dataset submission wizard.
 * Strictly adheres to sovereign metadata standards and local time boundary invariants.
 */

export interface CollectionDateInput {
  isRange: boolean;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
}

export const EMPTY_COLLECTION_DATE_INPUT: CollectionDateInput = {
  isRange: false,
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
};

export interface CollectionDateErrors {
  start?: string | undefined;
  end?: string | undefined;
}

export interface CollectionDateRange {
  start_datetime: string | null;
  end_datetime: string | null;
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
 * Returns current time in local time formatted as 24-hour HH:MM.
 */
export function getLocalTimeHHMM(now: Date = new Date()): string {
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

/**
 * Builds the canonical start and end datetime representation from user input.
 * In single-date mode or when no end date is provided, end_datetime is strictly null.
 */
export function buildCollectionDateRange(input: CollectionDateInput): CollectionDateRange {
  if (!input.startDate) {
    return { start_datetime: null, end_datetime: null };
  }

  const start_datetime = input.startTime
    ? `${input.startDate}T${input.startTime}`
    : input.startDate;

  if (!input.isRange || !input.endDate) {
    return { start_datetime, end_datetime: null };
  }

  const end_datetime = input.endTime
    ? `${input.endDate}T${input.endTime}`
    : input.endDate;

  return { start_datetime, end_datetime };
}

/**
 * Validates collection date boundaries:
 * 1. Dates and times cannot be in the future relative to the user's local clock.
 * 2. Range end date cannot be earlier than start date.
 * 3. Range end time cannot precede start time on the same day.
 */
export function validateCollectionDate(
  input: CollectionDateInput,
  now: Date = new Date()
): CollectionDateErrors | undefined {
  const today = getLocalTodayIso(now);
  const nowTime = getLocalTimeHHMM(now);
  const errors: CollectionDateErrors = {};

  if (input.startDate) {
    if (input.startDate > today) {
      errors.start = "Start date can't be in the future.";
    } else if (input.startDate === today && input.startTime && input.startTime > nowTime) {
      errors.start = "Start time can't be in the future.";
    }
  }

  if (input.isRange && input.endDate) {
    if (input.endDate > today) {
      errors.end = "End date can't be in the future.";
    } else if (input.endDate === today && input.endTime && input.endTime > nowTime) {
      errors.end = "End time can't be in the future.";
    } else if (input.startDate && input.endDate < input.startDate) {
      errors.end = "End date can't be before the start date.";
    } else if (
      input.startDate &&
      input.endDate === input.startDate &&
      input.startTime &&
      input.endTime &&
      input.endTime < input.startTime
    ) {
      errors.end = "End time can't be before the start time.";
    }
  }

  if (errors.start || errors.end) {
    return errors;
  }

  return undefined;
}
