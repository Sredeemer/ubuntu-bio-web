import { describe, it, expect } from "vitest";
import {
  getLocalTodayIso,
  serializeCollectionDate,
  validateCollectionDate,
} from "../submitValidation";

const NOW = new Date(2026, 5, 15, 9, 30);
// Mirrors the backend DATE_REGEX (server/src/ubuntubio/validator/models.py).
const BACKEND_DATE_REGEX =
  /^\d{4}(-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?)?(\/\d{4}(-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?)?)?$/;

describe("getLocalTodayIso", () => {
  it("uses local calendar fields", () => {
    expect(getLocalTodayIso(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
  });
});

describe("serializeCollectionDate", () => {
  it("returns empty string with no start", () => {
    expect(serializeCollectionDate({ startDate: "" })).toBe("");
    expect(serializeCollectionDate({ startDate: "", endDate: "2024-10-20" })).toBe("");
  });
  it("returns a single date", () => {
    expect(serializeCollectionDate({ startDate: "2024-10-05" })).toBe("2024-10-05");
  });
  it("collapses an end equal to the start", () => {
    expect(serializeCollectionDate({ startDate: "2024-10-05", endDate: "2024-10-05" })).toBe("2024-10-05");
  });
  it("returns a slash-separated range without time or spaces", () => {
    const s = serializeCollectionDate({ startDate: "2024-10-05", endDate: "2024-10-20" });
    expect(s).toBe("2024-10-05/2024-10-20");
    expect(s).not.toMatch(/T|\s/);
    expect(s).toMatch(BACKEND_DATE_REGEX);
    expect(s.length).toBeLessThanOrEqual(32);
  });
});

describe("validateCollectionDate", () => {
  it("accepts empty, single, range and today", () => {
    expect(validateCollectionDate({ startDate: "" }, NOW)).toBeUndefined();
    expect(validateCollectionDate({ startDate: "2024-10-05" }, NOW)).toBeUndefined();
    expect(validateCollectionDate({ startDate: "2024-10-05", endDate: "2026-06-15" }, NOW)).toBeUndefined();
    expect(validateCollectionDate({ startDate: "2024-10-05", endDate: "2024-10-05" }, NOW)).toBeUndefined();
  });
  it("rejects a future start", () => {
    expect(validateCollectionDate({ startDate: "2026-06-16" }, NOW)?.start).toMatch(/future/);
  });
  it("rejects a future end", () => {
    expect(validateCollectionDate({ startDate: "2026-06-01", endDate: "2026-06-16" }, NOW)?.end).toMatch(/future/);
  });
  it("rejects an end before the start", () => {
    expect(validateCollectionDate({ startDate: "2024-10-20", endDate: "2024-10-05" }, NOW)?.end).toMatch(/before/);
  });
  it("rejects an end without a start", () => {
    expect(validateCollectionDate({ startDate: "", endDate: "2024-10-05" }, NOW)?.start).toBeDefined();
  });
});
