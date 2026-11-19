/**
 * Date parsing, validation and normalization for sample metadata.
 *
 * Normalization is deliberately conservative: a date is only rewritten when its
 * meaning is unambiguous. "03/04/2026" could be 3 April or 4 March, so it is
 * reported as ambiguous and left untouched for the user to fix by hand.
 */

export type DateNormalization =
  | { status: "empty" }
  /** Already a valid ISO-8601 calendar date (YYYY, YYYY-MM or YYYY-MM-DD). */
  | { status: "valid"; value: string }
  /** Recognised alternative format, rewritten to ISO-8601. */
  | { status: "normalized"; value: string; from: string }
  /** More than one reading is possible (e.g. 03/04/2026); not converted. */
  | { status: "ambiguous"; message: string }
  /** Not a recognisable or real calendar date; not converted. */
  | { status: "invalid"; message: string };

const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

const ISO_PATTERN = /^(\d{4})(?:-(0[1-9]|1[0-2])(?:-(0[1-9]|[12]\d|3[01]))?)?$/;

const pad = (n: number | string, width = 2) => String(n).padStart(width, "0");

/** True when year/month/day form a real calendar date (handles leap years and 30/31-day months). */
export function isRealCalendarDate(year: number, month: number, day: number): boolean {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return false;
  if (year < 1 || month < 1 || month > 12 || day < 1) return false;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return day <= daysInMonth;
}

/** Checks the ISO-8601 shape and, for full dates, that the day exists in that month. */
export function isIsoDate(value: string): boolean {
  const m = ISO_PATTERN.exec(value);
  if (!m) return false;
  if (m[3]) return isRealCalendarDate(Number(m[1]), Number(m[2]), Number(m[3]));
  return true;
}

function monthFromName(name: string): number | null {
  const lower = name.toLowerCase().replace(/\.$/, "");
  if (lower.length < 3) return null;
  const idx = MONTHS.findIndex((full) => full === lower || (lower.length >= 3 && full.startsWith(lower)));
  return idx >= 0 ? idx + 1 : null;
}

function build(year: number, month: number, day: number, from: string): DateNormalization {
  if (!isRealCalendarDate(year, month, day)) {
    return {
      status: "invalid",
      message: `"${from}" is not a real calendar date. Use ISO-8601 (YYYY-MM-DD).`,
    };
  }
  return { status: "normalized", value: `${pad(year, 4)}-${pad(month)}-${pad(day)}`, from };
}

/**
 * Classify a collection date string and, when safe, convert it to YYYY-MM-DD.
 *
 * Recognised alternatives: YYYY/MM/DD, YYYY.MM.DD, YYYYMMDD, D/M/YYYY and M/D/YYYY
 * (with / - . or spaces) when the order is unambiguous, and month-name forms such as
 * "1 Oct 2026", "01-Oct-2026" and "October 1, 2026".
 */
export function normalizeDateString(raw: string): DateNormalization {
  const text = (raw ?? "").trim();
  if (!text) return { status: "empty" };

  if (ISO_PATTERN.test(text)) {
    return isIsoDate(text)
      ? { status: "valid", value: text }
      : {
          status: "invalid",
          message: `"${text}" is not a real calendar date. Use ISO-8601 (YYYY-MM-DD).`,
        };
  }

  // Year first with non-ISO separators or no zero padding: 2026/10/01, 2026.10.1, 2026-10-1
  let m = /^(\d{4})[./-](\d{1,2})[./-](\d{1,2})$/.exec(text);
  if (m) return build(Number(m[1]), Number(m[2]), Number(m[3]), text);

  // Compact: 20261001
  m = /^(\d{4})(\d{2})(\d{2})$/.exec(text);
  if (m) return build(Number(m[1]), Number(m[2]), Number(m[3]), text);

  // Numeric day/month/year in either order: 14/05/2026, 05-14-2026, 1.10.2026
  m = /^(\d{1,2})[./\-\s](\d{1,2})[./\-\s](\d{4})$/.exec(text);
  if (m) {
    const a = Number(m[1]);
    const b = Number(m[2]);
    const year = Number(m[3]);
    if (a > 12 && b <= 12) return build(year, b, a, text); // D/M/YYYY
    if (b > 12 && a <= 12) return build(year, a, b, text); // M/D/YYYY
    if (a === b) return build(year, a, b, text); // same either way
    if (a <= 12 && b <= 12) {
      return {
        status: "ambiguous",
        message: `"${text}" is ambiguous (day/month or month/day). Enter it as YYYY-MM-DD.`,
      };
    }
    return {
      status: "invalid",
      message: `"${text}" is not a real calendar date. Use ISO-8601 (YYYY-MM-DD).`,
    };
  }

  // Day Month-name Year: 1 Oct 2026, 01-Oct-2026, 1st October 2026
  m = /^(\d{1,2})(?:st|nd|rd|th)?[\s./-]+([A-Za-z]{3,9})\.?,?[\s./-]+(\d{4})$/i.exec(text);
  if (m) {
    const month = monthFromName(m[2] ?? "");
    if (month) return build(Number(m[3]), month, Number(m[1]), text);
  }

  // Month-name Day, Year: October 1, 2026 / Oct 1 2026
  m = /^([A-Za-z]{3,9})\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})$/i.exec(text);
  if (m) {
    const month = monthFromName(m[1] ?? "");
    if (month) return build(Number(m[3]), month, Number(m[2]), text);
  }

  return {
    status: "invalid",
    message: `"${text}" is not a recognised date. Use ISO-8601 (YYYY-MM-DD).`,
  };
}

/**
 * Validation message for a per-sample collection date cell, or undefined when it is valid.
 * Always mentions ISO-8601, and says why a value could not be accepted.
 */
export function collectionDateIssue(raw: string): string | undefined {
  const result = normalizeDateString(raw);
  switch (result.status) {
    case "empty":
      return "Collection date is required.";
    case "valid":
      return undefined;
    case "normalized":
      return `Collection date must strictly adhere to ISO-8601 (YYYY-MM-DD or YYYY-MM). Use "Normalize Dates" to convert it to ${result.value}.`;
    case "ambiguous":
    case "invalid":
      return `Collection date must strictly adhere to ISO-8601 (YYYY-MM-DD or YYYY-MM). ${result.message}`;
  }
}

/** Start date of a "YYYY-MM-DD/YYYY-MM-DD" range, or the value itself for a single date. */
export function firstDateOf(collectionDate: string | undefined): string {
  const value = (collectionDate ?? "").trim();
  if (!value) return "";
  return value.split("/")[0]?.trim() ?? "";
}
