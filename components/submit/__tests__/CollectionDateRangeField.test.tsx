import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import React, { useState } from "react";
import { CollectionDateRangeField } from "../CollectionDateRangeField";
import {
  CollectionDateInput,
  EMPTY_COLLECTION_DATE_INPUT,
  buildCollectionDateRange,
  validateCollectionDate,
} from "../../../lib/submitValidation";

/** Stateful harness that validates like the Submit page and exposes the stored model. */
function Harness({ initial = EMPTY_COLLECTION_DATE_INPUT }: { initial?: CollectionDateInput }) {
  const [value, setValue] = useState<CollectionDateInput>(initial);
  const range = buildCollectionDateRange(value);
  return (
    <>
      <CollectionDateRangeField
        id="input-sample-date"
        value={value}
        onChange={setValue}
        errors={validateCollectionDate(value)}
      />
      <output data-testid="model">{JSON.stringify(range)}</output>
    </>
  );
}

const model = () => JSON.parse(screen.getByTestId("model").textContent || "{}");

function pickDay(triggerName: RegExp, dayLabel: string) {
  fireEvent.click(screen.getByRole("button", { name: triggerName }));
  fireEvent.click(screen.getByRole("button", { name: dayLabel }));
}

describe("CollectionDateRangeField", () => {
  beforeEach(() => {
    // Fake only Date so React / testing-library timers keep working. 31 Oct 2026, 10:00 local.
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 9, 31, 10, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("defaults to single-date mode and stores the date only, with a null end", () => {
    render(<Harness />);
    const toggle = screen.getByRole("checkbox", { name: /Date range/i }) as HTMLInputElement;
    expect(toggle.checked).toBe(false);
    expect(screen.queryByRole("button", { name: /collection end date/i })).toBeNull();

    pickDay(/Choose collection date/i, "15 October 2026");
    expect(model()).toEqual({ start_datetime: "2026-10-15", end_datetime: null });
  });

  it("time is optional and is appended when picked from the time list", () => {
    render(<Harness />);
    expect(screen.queryByRole("button", { name: "Add time" })).toBeNull(); // no date yet

    pickDay(/Choose collection date/i, "15 October 2026");
    expect(model().start_datetime).toBe("2026-10-15");

    fireEvent.click(screen.getByRole("button", { name: "Add time" }));
    fireEvent.click(
      within(screen.getByRole("listbox", { name: "Choose collection time" })).getByRole("option", { name: "2:30 pm" })
    );
    expect(model()).toEqual({ start_datetime: "2026-10-15T14:30", end_datetime: null });
    expect(screen.getByRole("button", { name: "Change time, 2:30 pm" })).toBeDefined();
  });

  it("disables future times when the date is today", () => {
    render(<Harness />);
    pickDay(/Choose collection date/i, "31 October 2026");
    fireEvent.click(screen.getByRole("button", { name: "Add time" }));
    const list = screen.getByRole("listbox");
    expect(within(list).getByRole("option", { name: "10:00 am" }).getAttribute("aria-disabled")).toBeNull();
    expect(within(list).getByRole("option", { name: "10:15 am" }).getAttribute("aria-disabled")).toBe("true");
  });

  it("disables end times before the start time on a same-day range", () => {
    render(
      <Harness initial={{ isRange: true, startDate: "2026-10-20", startTime: "14:00", endDate: "2026-10-20", endTime: "" }} />
    );
    fireEvent.click(screen.getAllByRole("button", { name: "Add time" })[0]!);
    const list = screen.getByRole("listbox", { name: "Choose end time" });
    expect(within(list).getByRole("option", { name: "1:45 pm" }).getAttribute("aria-disabled")).toBe("true");
    expect(within(list).getByRole("option", { name: "2:00 pm" }).getAttribute("aria-disabled")).toBeNull();
  });

  it("switches to range mode and stores start and end", () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("checkbox", { name: /Date range/i }));

    pickDay(/Choose collection start date/i, "10 October 2026");
    pickDay(/Choose collection end date/i, "20 October 2026");
    const addTimeButtons = screen.getAllByRole("button", { name: "Add time" });
    expect(addTimeButtons).toHaveLength(2);
    fireEvent.click(addTimeButtons[1]!);
    fireEvent.click(
      within(screen.getByRole("listbox", { name: "Choose end time" })).getByRole("option", { name: "8:00 am" })
    );

    expect(model()).toEqual({ start_datetime: "2026-10-10", end_datetime: "2026-10-20T08:00" });
    expect(screen.queryByText(/can't be before/i)).toBeNull();
  });

  it("shows an error under the end date when it is before the start", () => {
    render(
      <Harness initial={{ isRange: true, startDate: "2026-10-20", startTime: "", endDate: "2026-10-10", endTime: "" }} />
    );
    const error = screen.getByText("End date can't be before the start date.");
    expect(error.closest("[id]")?.id).toBe("input-sample-date-end-error");
    const endTrigger = screen.getByRole("button", { name: /Choose collection end date/i });
    expect(endTrigger.getAttribute("aria-invalid")).toBe("true");
    expect(endTrigger.getAttribute("aria-describedby")).toBe("input-sample-date-end-error");
    const startTrigger = screen.getByRole("button", { name: /Choose collection start date/i });
    expect(startTrigger.getAttribute("aria-invalid")).toBeNull();
  });

  it("shows an error when the end time is before the start time on the same day", () => {
    render(
      <Harness
        initial={{ isRange: true, startDate: "2026-10-20", startTime: "14:00", endDate: "2026-10-20", endTime: "09:00" }}
      />
    );
    expect(screen.getByText("End time can't be before the start time.")).toBeDefined();
  });

  it("shows an error for a future date (e.g. a stale or pasted value)", () => {
    render(<Harness initial={{ ...EMPTY_COLLECTION_DATE_INPUT, startDate: "2026-11-02" }} />);
    expect(screen.getByText("Start date can't be in the future.")).toBeDefined();
  });

  it("disables future days in the calendar (local today is the max)", () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: /Choose collection date/i }));
    expect((screen.getByRole("button", { name: "31 October 2026" }) as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: /Next month/i }));
    expect((screen.getByRole("button", { name: "1 November 2026" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("lets collection dates go back to 1990 (and no earlier) via the year view", () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: /Choose collection date/i }));
    fireEvent.click(screen.getByRole("button", { name: /^Choose month and year/ }));
    fireEvent.click(screen.getByRole("button", { name: "Choose year, 2026" }));
    const grid = screen.getByRole("group", { name: "Years 1990 – 2026" });
    expect(within(grid).getByRole("button", { name: "1990" })).toBeDefined();
    expect(within(grid).queryByRole("button", { name: "1989" })).toBeNull();

    fireEvent.click(within(grid).getByRole("button", { name: "1990" }));
    expect((screen.getByRole("button", { name: "Previous year" }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "January 1990" }));
    fireEvent.click(screen.getByRole("button", { name: "1 January 1990" }));
    expect(model()).toEqual({ start_datetime: "1990-01-01", end_datetime: null });
  });

  it("turning range off drops the end so the stored end is null again", () => {
    render(
      <Harness initial={{ isRange: true, startDate: "2026-10-01", startTime: "", endDate: "2026-10-05", endTime: "" }} />
    );
    expect(model().end_datetime).toBe("2026-10-05");
    fireEvent.click(screen.getByRole("checkbox", { name: /Date range/i }));
    expect(model()).toEqual({ start_datetime: "2026-10-01", end_datetime: null });
    expect(screen.queryByRole("button", { name: /collection end date/i })).toBeNull();
  });
});
