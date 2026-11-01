import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React, { useState } from "react";
import { DatePicker, formatDateValue } from "../DatePicker";
import type { CollectionDateValue } from "../../../lib/submitValidation";

function Harness({
  initial = { startDate: "" },
  spy,
}: {
  initial?: CollectionDateValue;
  spy?: (v: CollectionDateValue) => void;
}) {
  const [value, setValue] = useState<CollectionDateValue>(initial);
  return (
    <DatePicker
      id="dp"
      value={value}
      onChange={(v) => {
        spy?.(v);
        setValue(v);
      }}
    />
  );
}

const trigger = () => screen.getByRole("button", { name: /Choose date or date range/i });
const day = (label: string) => screen.getByRole("button", { name: label });

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 5, 15, 12, 0, 0)); // 15 Jun 2026 local
});
afterEach(() => vi.useRealTimers());

describe("formatDateValue", () => {
  it("formats empty, single and range values", () => {
    expect(formatDateValue({ startDate: "" })).toBe("");
    expect(formatDateValue({ startDate: "2024-10-15" })).toBe("15 Oct 2024");
    expect(formatDateValue({ startDate: "2024-10-10", endDate: "2024-10-24" })).toBe("10 Oct 2024 – 24 Oct 2024");
    expect(formatDateValue({ startDate: "2024-10-10", endDate: "2024-10-10" })).toBe("10 Oct 2024");
  });
});

describe("DatePicker", () => {
  it("shows the placeholder and no clear button when empty", () => {
    render(<Harness />);
    expect(screen.getByText("Select date or date range")).toBeDefined();
    expect(screen.queryByRole("button", { name: "Clear date" })).toBeNull();
  });

  it("renders exactly one trigger and no text inputs or time controls", () => {
    const { container } = render(<Harness initial={{ startDate: "2024-10-15" }} />);
    fireEvent.click(trigger());
    expect(container.querySelectorAll("input").length).toBe(0);
    expect(screen.queryByText(/Add time/i)).toBeNull();
    expect(screen.queryByText(/AM|PM/)).toBeNull();
  });

  it("exposes aria-expanded and role=dialog", () => {
    render(<Harness />);
    expect(trigger().getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(trigger());
    expect(trigger().getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("dialog")).toBeDefined();
  });

  it("picks a range: first click start, second click end, closes and shows both", () => {
    const spy = vi.fn();
    render(<Harness initial={{ startDate: "2024-10-01" }} spy={spy} />);
    fireEvent.click(trigger());
    fireEvent.click(day("5 October 2024"));
    expect(spy).toHaveBeenLastCalledWith({ startDate: "2024-10-05" });
    expect(screen.getByRole("dialog")).toBeDefined(); // waits for the end date

    fireEvent.click(day("20 October 2024"));
    expect(spy).toHaveBeenLastCalledWith({ startDate: "2024-10-05", endDate: "2024-10-20" });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByText("5 Oct 2024 – 20 Oct 2024")).toBeDefined();
  });

  it("highlights start, end and in-between days", () => {
    render(<Harness initial={{ startDate: "2024-10-05", endDate: "2024-10-20" }} />);
    fireEvent.click(trigger());
    expect(day("5 October 2024").className).toContain("is-start");
    expect(day("20 October 2024").className).toContain("is-end");
    expect(day("6 October 2024").className).toContain("in-range");
    expect(day("19 October 2024").className).toContain("in-range");
    expect(day("21 October 2024").className).not.toContain("in-range");
  });

  it("keeps a single date when only one day is picked and the popover is closed", () => {
    const spy = vi.fn();
    render(<Harness initial={{ startDate: "2024-10-01" }} spy={spy} />);
    fireEvent.click(trigger());
    fireEvent.click(day("5 October 2024"));
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(screen.getByText("5 Oct 2024")).toBeDefined();
  });

  it("treats clicking the same day twice as a single date", () => {
    const spy = vi.fn();
    render(<Harness initial={{ startDate: "2024-10-01" }} spy={spy} />);
    fireEvent.click(trigger());
    fireEvent.click(day("5 October 2024"));
    fireEvent.click(day("5 October 2024"));
    expect(spy).toHaveBeenLastCalledWith({ startDate: "2024-10-05" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("swaps when the second click is earlier than the start", () => {
    const spy = vi.fn();
    render(<Harness initial={{ startDate: "2024-10-01" }} spy={spy} />);
    fireEvent.click(trigger());
    fireEvent.click(day("20 October 2024"));
    fireEvent.click(day("5 October 2024"));
    expect(spy).toHaveBeenLastCalledWith({ startDate: "2024-10-05", endDate: "2024-10-20" });
  });

  it("clears the value with the X button", () => {
    const spy = vi.fn();
    render(<Harness initial={{ startDate: "2024-10-05" }} spy={spy} />);
    fireEvent.click(screen.getByRole("button", { name: "Clear date" }));
    expect(spy).toHaveBeenCalledWith({ startDate: "" });
    expect(screen.getByText("Select date or date range")).toBeDefined();
  });

  it("disables dates after today and blocks navigating past the current month", () => {
    render(<Harness initial={{ startDate: "2026-06-10" }} />);
    fireEvent.click(trigger());
    expect((day("15 June 2026") as HTMLButtonElement).disabled).toBe(false);
    expect((day("16 June 2026") as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: "Next month" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("jumps from 2026 to 2014 in two clicks via the year grid", () => {
    render(<Harness initial={{ startDate: "2026-06-10" }} />);
    fireEvent.click(trigger());
    fireEvent.click(screen.getByRole("button", { name: /June 2026, choose year/ }));
    const options = screen.getAllByRole("option").map((o) => o.textContent);
    expect(options[0]).toBe("2026");
    expect(options[options.length - 1]).toBe("1990");
    fireEvent.click(screen.getByRole("option", { name: "2014" }));
    expect(screen.getByRole("grid", { name: "June 2014" })).toBeDefined();
    expect((day("30 June 2014") as HTMLButtonElement).disabled).toBe(false);
  });

  it("clamps the month when jumping to the current year", () => {
    render(<Harness initial={{ startDate: "2024-12-10" }} />);
    fireEvent.click(trigger());
    fireEvent.click(screen.getByRole("button", { name: /December 2024, choose year/ }));
    fireEvent.click(screen.getByRole("option", { name: "2026" }));
    expect(screen.getByRole("grid", { name: "June 2026" })).toBeDefined();
  });

  it("supports arrow-key navigation, Enter selection and Escape", () => {
    const spy = vi.fn();
    render(<Harness initial={{ startDate: "2024-10-05" }} spy={spy} />);
    fireEvent.click(trigger());
    const grid = screen.getByRole("grid");
    fireEvent.keyDown(day("5 October 2024"), { key: "ArrowRight" });
    expect(document.activeElement).toBe(day("6 October 2024"));
    fireEvent.keyDown(grid, { key: "ArrowDown" });
    expect(document.activeElement).toBe(day("13 October 2024"));
    fireEvent.keyDown(grid, { key: "ArrowUp" });
    fireEvent.keyDown(grid, { key: "ArrowLeft" });
    expect(document.activeElement).toBe(day("5 October 2024"));

    // Enter on a native button fires click.
    fireEvent.click(document.activeElement as HTMLElement);
    expect(spy).toHaveBeenCalledWith({ startDate: "2024-10-05" });

    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });

  it("cannot arrow-navigate into the future", () => {
    render(<Harness initial={{ startDate: "2026-06-15" }} />);
    fireEvent.click(trigger());
    act(() => day("15 June 2026").focus());
    fireEvent.keyDown(day("15 June 2026"), { key: "ArrowDown" });
    fireEvent.keyDown(day("15 June 2026"), { key: "ArrowRight" });
    expect(document.activeElement).toBe(day("15 June 2026"));
    expect((day("15 June 2026") as HTMLButtonElement).tabIndex).toBe(0);
  });

  it("Escape in the year grid returns to the day view without closing", () => {
    render(<Harness initial={{ startDate: "2026-06-10" }} />);
    fireEvent.click(trigger());
    fireEvent.click(screen.getByRole("button", { name: /choose year/ }));
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(screen.getByRole("grid")).toBeDefined();
  });

  it("renders the popover in a body portal, fixed-positioned and inside the viewport", () => {
    const { container } = render(<Harness initial={{ startDate: "2026-06-10" }} />);
    fireEvent.click(trigger());
    const dialog = screen.getByRole("dialog");
    expect(container.contains(dialog)).toBe(false);
    expect(dialog.parentElement).toBe(document.body);
    expect(dialog.style.visibility).not.toBe("hidden");
    expect(Number.parseFloat(dialog.style.left)).toBeGreaterThanOrEqual(0);
    expect(Number.parseFloat(dialog.style.top)).toBeGreaterThanOrEqual(0);
  });

  it("scrolls the selected year into view when the year grid opens", () => {
    const spy = vi.fn();
    const original = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = spy;
    try {
      render(<Harness initial={{ startDate: "2026-06-10" }} />);
      fireEvent.click(trigger());
      fireEvent.click(screen.getByRole("button", { name: /choose year/ }));
      expect(spy).toHaveBeenCalledWith({ block: "nearest" });
    } finally {
      Element.prototype.scrollIntoView = original;
    }
  });

  it("closes on an outside mousedown but not on a mousedown inside the portalled popover", () => {
    render(<Harness initial={{ startDate: "2026-06-10" }} />);
    fireEvent.click(trigger());
    fireEvent.mouseDown(screen.getByRole("dialog"));
    expect(screen.queryByRole("dialog")).not.toBeNull();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
