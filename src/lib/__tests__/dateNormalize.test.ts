import { describe, it, expect } from "vitest";
import {
  normalizeDateString,
  collectionDateIssue,
  isRealCalendarDate,
  isIsoDate,
  firstDateOf,
} from "../dateNormalize";

describe("normalizeDateString", () => {
  it("leaves valid ISO dates untouched", () => {
    expect(normalizeDateString("2026-10-01")).toEqual({ status: "valid", value: "2026-10-01" });
    expect(normalizeDateString("2026-10")).toEqual({ status: "valid", value: "2026-10" });
    expect(normalizeDateString("2026")).toEqual({ status: "valid", value: "2026" });
  });

  it("reports empty input", () => {
    expect(normalizeDateString("   ").status).toBe("empty");
  });

  it.each([
    ["2026/10/01", "2026-10-01"],
    ["2026.10.1", "2026-10-01"],
    ["2026-10-1", "2026-10-01"],
    ["20261001", "2026-10-01"],
    ["14/05/2026", "2026-05-14"], // day > 12 can only be D/M/Y
    ["05/14/2026", "2026-05-14"], // second part > 12 can only be M/D/Y
    ["14-05-2026", "2026-05-14"],
    ["05/05/2026", "2026-05-05"], // same either way
    ["1 Oct 2026", "2026-10-01"],
    ["01-Oct-2026", "2026-10-01"],
    ["1st October 2026", "2026-10-01"],
    ["October 1, 2026", "2026-10-01"],
    ["Sept 9 2026", "2026-09-09"],
  ])("normalizes %s -> %s", (input, expected) => {
    const result = normalizeDateString(input);
    expect(result.status).toBe("normalized");
    if (result.status === "normalized") expect(result.value).toBe(expected);
  });

  it("does NOT guess ambiguous day/month dates", () => {
    const result = normalizeDateString("03/04/2026");
    expect(result.status).toBe("ambiguous");
    if (result.status === "ambiguous") expect(result.message).toContain("ambiguous");
  });

  it("rejects impossible calendar dates instead of rolling them over", () => {
    expect(normalizeDateString("2026-02-30").status).toBe("invalid");
    expect(normalizeDateString("31/04/2026").status).toBe("invalid");
    expect(normalizeDateString("2026/13/01").status).toBe("invalid");
  });

  it("rejects unrecognised text", () => {
    expect(normalizeDateString("invalid-date").status).toBe("invalid");
    expect(normalizeDateString("yesterday").status).toBe("invalid");
  });
});

describe("calendar helpers", () => {
  it("handles leap years", () => {
    expect(isRealCalendarDate(2024, 2, 29)).toBe(true);
    expect(isRealCalendarDate(2026, 2, 29)).toBe(false);
  });
  it("isIsoDate checks the day exists in its month", () => {
    expect(isIsoDate("2026-04-31")).toBe(false);
    expect(isIsoDate("2026-04-30")).toBe(true);
  });
});

describe("collectionDateIssue", () => {
  it("has no issue for valid ISO dates", () => {
    expect(collectionDateIssue("2026-03-01")).toBeUndefined();
  });
  it("mentions ISO-8601 and points at Normalize Dates when a conversion exists", () => {
    const msg = collectionDateIssue("14/05/2026");
    expect(msg).toContain("ISO-8601");
    expect(msg).toContain("2026-05-14");
  });
  it("explains ambiguity", () => {
    expect(collectionDateIssue("03/04/2026")).toContain("ambiguous");
  });
  it("requires a value", () => {
    expect(collectionDateIssue("")).toBe("Collection date is required.");
  });
});

describe("firstDateOf", () => {
  it("returns the start of a range or the date itself", () => {
    expect(firstDateOf("2026-10-01/2026-10-21")).toBe("2026-10-01");
    expect(firstDateOf("2026-10-01")).toBe("2026-10-01");
    expect(firstDateOf(undefined)).toBe("");
  });
});
