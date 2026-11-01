import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import React, { useState } from "react";
import { DatePicker, getPastDatePresets, formatFriendlyDate, formatTime12h, TIME_SLOTS } from "../DatePicker";

describe("DatePicker Component", () => {
  it("renders trigger button with placeholder when empty", () => {
    const handleChange = vi.fn();
    render(<DatePicker value="" onChange={handleChange} placeholder="Select date" />);

    expect(screen.getByText("Select date")).toBeDefined();
    expect(screen.getByRole("button", { name: /Choose date/i })).toBeDefined();
  });

  it("renders formatted display date when ISO value is provided", () => {
    const handleChange = vi.fn();
    render(<DatePicker value="2026-03-12" onChange={handleChange} />);

    expect(screen.getByText("12 Mar 2026")).toBeDefined();
  });

  it("opens popover calendar on click and selects a date", () => {
    const handleChange = vi.fn();
    render(<DatePicker value="2026-03-12" onChange={handleChange} />);

    const trigger = screen.getByRole("button", { name: /Choose date/i });
    fireEvent.click(trigger);

    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByText("March")).toBeDefined();
    expect(screen.getByText("2026")).toBeDefined();

    // Click day 15
    const day15Btn = screen.getByRole("button", { name: /15 March 2026/i });
    fireEvent.click(day15Btn);

    expect(handleChange).toHaveBeenCalledWith("2026-03-15");
  });

  it("calls onChange with Today's date when Today preset is clicked", () => {
    const handleChange = vi.fn();
    render(<DatePicker value="" onChange={handleChange} />);

    fireEvent.click(screen.getByRole("button", { name: /Choose date/i }));

    // Presets are named "<label>, <full date>" so the date is announced too.
    const todayBtn = screen.getByRole("button", { name: /^Today, / });
    fireEvent.click(todayBtn);

    expect(handleChange).toHaveBeenCalled();
    const calledDate = handleChange.mock.calls[0]?.[0];
    expect(calledDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("clears value when clear button is clicked", () => {
    const handleChange = vi.fn();
    render(<DatePicker value="2026-03-12" onChange={handleChange} />);

    const clearBtn = screen.getByRole("button", { name: "Clear date" });
    fireEvent.click(clearBtn);

    expect(handleChange).toHaveBeenCalledWith("");
  });

  it("supports explicit top placement prop", () => {
    const handleChange = vi.fn();
    render(<DatePicker value="2026-03-12" onChange={handleChange} placement="top" />);

    fireEvent.click(screen.getByRole("button", { name: /Choose date/i }));

    const dialog = screen.getByRole("dialog");
    expect(dialog.getAttribute("data-placement")).toBe("top");
    expect(dialog.className).toContain("placement-top");
  });

  it("supports explicit bottom placement prop", () => {
    const handleChange = vi.fn();
    render(<DatePicker value="2026-03-12" onChange={handleChange} placement="bottom" />);

    fireEvent.click(screen.getByRole("button", { name: /Choose date/i }));

    const dialog = screen.getByRole("dialog");
    expect(dialog.getAttribute("data-placement")).toBe("bottom");
    expect(dialog.className).toContain("placement-bottom");
  });
});

describe("DatePicker presets, pill and time list", () => {
  // Saturday 31 Oct 2026, 10:00 local. Only Date is faked so React timers still run.
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 9, 31, 10, 0, 0));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  /** Stateful harness with date + time. */
  function Harness(props: { initialDate?: string; initialTime?: string; minTime?: string; maxTime?: string; minDate?: string }) {
    const [date, setDate] = useState(props.initialDate ?? "");
    const [time, setTime] = useState(props.initialTime ?? "");
    return (
      <>
        <DatePicker
          id="dp"
          value={date}
          onChange={setDate}
          time={time}
          onTimeChange={setTime}
          minTime={props.minTime}
          maxTime={props.maxTime}
          minDate={props.minDate}
          ariaLabel="Choose collection date"
          placeholder="Start date"
        />
        <output data-testid="out">{`${date}|${time}`}</output>
      </>
    );
  }
  const out = () => screen.getByTestId("out").textContent;

  it("computes past-only presets with weekday hints inside the last week and day-month hints otherwise", () => {
    expect(getPastDatePresets(new Date(2026, 9, 31, 10))).toEqual([
      { label: "Today", iso: "2026-10-31", hint: "Sat" },
      { label: "Yesterday", iso: "2026-10-30", hint: "Fri" },
      { label: "Last week", iso: "2026-10-24", hint: "24 Oct" },
      { label: "Last weekend", iso: "2026-10-24", hint: "24 Oct" },
      { label: "2 weeks ago", iso: "2026-10-17", hint: "17 Oct" },
      { label: "4 weeks ago", iso: "2026-10-03", hint: "3 Oct" },
      { label: "8 weeks ago", iso: "2026-09-05", hint: "5 Sep" },
    ]);
    // On a Sunday, "last weekend" is the day before (Saturday) and gets a weekday hint.
    const sunday = getPastDatePresets(new Date(2026, 10, 1, 9));
    expect(sunday.find((p) => p.label === "Last weekend")).toEqual({ label: "Last weekend", iso: "2026-10-31", hint: "Sat" });
    // Nothing in the future.
    for (const p of sunday) expect(p.iso <= "2026-11-01").toBe(true);
  });

  it("formats friendly dates and 12-hour times", () => {
    const now = new Date(2026, 9, 31, 10);
    expect(formatFriendlyDate("2026-10-31", now)).toBe("Today");
    expect(formatFriendlyDate("2026-10-30", now)).toBe("Yesterday");
    expect(formatFriendlyDate("2026-03-15", now)).toBe("15 Mar 2026");
    expect(formatTime12h("00:00")).toBe("12:00 am");
    expect(formatTime12h("12:15")).toBe("12:15 pm");
    expect(formatTime12h("14:30")).toBe("2:30 pm");
    expect(TIME_SLOTS).toHaveLength(96);
    expect(TIME_SLOTS[0]).toBe("00:00");
    expect(TIME_SLOTS[95]).toBe("23:45");
  });

  it("opens a named two-column dialog; picking a preset sets the date and shows a friendly label", () => {
    render(<Harness />);
    expect(screen.getByText("Start date")).toBeDefined();
    expect(screen.queryByRole("button", { name: "Add time" })).toBeNull(); // no date yet

    fireEvent.click(screen.getByRole("button", { name: "Choose collection date" }));
    const dialog = screen.getByRole("dialog", { name: "Choose collection date" });
    const presetList = within(dialog).getByRole("list", { name: "Quick dates" });
    expect(within(presetList).getAllByRole("button").map((b) => b.textContent)).toEqual([
      "TodaySat",
      "YesterdayFri",
      "Last week24 Oct",
      "Last weekend24 Oct",
      "2 weeks ago17 Oct",
      "4 weeks ago3 Oct",
      "8 weeks ago5 Sep",
    ]);
    expect(within(dialog).getByText("October")).toBeDefined();

    fireEvent.click(within(dialog).getByRole("button", { name: /^Yesterday, 30 October 2026$/ }));
    expect(out()).toBe("2026-10-30|");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByText("Yesterday")).toBeDefined();
  });

  it("disables presets and days outside min/max", () => {
    render(<Harness minDate="2026-10-20" />);
    fireEvent.click(screen.getByRole("button", { name: "Choose collection date" }));
    const btn = (name: RegExp) => screen.getByRole("button", { name }) as HTMLButtonElement;
    expect(btn(/^Today, /).disabled).toBe(false);
    expect(btn(/^Last week, /).disabled).toBe(false); // 24 Oct
    expect(btn(/^2 weeks ago, /).disabled).toBe(true); // 17 Oct < min
    expect(btn(/^8 weeks ago, /).disabled).toBe(true);
    expect(btn(/^19 October 2026$/).disabled).toBe(true);
    fireEvent.click(btn(/^Next month$/));
    expect(btn(/^1 November 2026$/).disabled).toBe(true); // future
  });

  it("header Today button jumps the calendar back to the current month without selecting", () => {
    render(<Harness initialDate="2026-03-12" />);
    fireEvent.click(screen.getByRole("button", { name: /Choose collection date/ }));
    expect(screen.getByText("March")).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Go to today" }));
    expect(screen.getByText("October")).toBeDefined();
    expect(out()).toBe("2026-03-12|");
  });

  it("the clear (x) and Add time controls are separate buttons, not nested in the trigger", () => {
    render(<Harness initialDate="2026-10-31" />);
    const trigger = screen.getByRole("button", { name: "Choose collection date, 31 October 2026" });
    const clear = screen.getByRole("button", { name: "Clear date" });
    const addTime = screen.getByRole("button", { name: "Add time" });
    expect(trigger.contains(clear)).toBe(false);
    expect(trigger.contains(addTime)).toBe(false);
    expect(clear.closest("button")).toBe(clear);
    expect(addTime.closest("button")).toBe(addTime);
    expect(trigger.textContent).toContain("Today");

    fireEvent.click(clear);
    expect(out()).toBe("|");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Choose collection date" }));
  });

  it("Escape closes the calendar dialog and returns focus to the trigger", () => {
    render(<Harness initialDate="2026-10-15" />);
    const trigger = screen.getByRole("button", { name: /Choose collection date/ });
    fireEvent.click(trigger);
    const dialog = screen.getByRole("dialog");
    // Focus moved into the dialog, onto the selected day.
    expect(document.activeElement?.getAttribute("aria-label")).toBe("15 October 2026");
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("time list: 15-minute options, future times disabled for today, opens on the nearest enabled time", () => {
    render(<Harness initialDate="2026-10-31" maxTime="10:00" />);
    fireEvent.click(screen.getByRole("button", { name: "Add time" }));
    const list = screen.getByRole("listbox", { name: "Choose time" });
    const options = within(list).getAllByRole("option");
    expect(options).toHaveLength(96); // no "Clear time" until a time is set
    expect(options[0]?.textContent).toBe("12:00 am");
    expect(options[95]?.textContent).toBe("11:45 pm");

    const opt = (label: string) => within(list).getByRole("option", { name: label });
    expect(opt("10:00 am").getAttribute("aria-disabled")).toBeNull();
    expect(opt("10:15 am").getAttribute("aria-disabled")).toBe("true");
    expect(opt("11:45 pm").getAttribute("aria-disabled")).toBe("true");
    // Active option starts at the current time (10:00) and focus is on the listbox.
    expect(document.activeElement).toBe(list);
    expect(list.getAttribute("aria-activedescendant")).toBe(opt("10:00 am").id);

    // Clicking a disabled (future) time does nothing.
    fireEvent.click(opt("2:30 pm"));
    expect(out()).toBe("2026-10-31|");
    fireEvent.click(opt("9:15 am"));
    expect(out()).toBe("2026-10-31|09:15");
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(screen.getByRole("button", { name: "Change time, 9:15 am" }).textContent).toBe("9:15 am");
  });

  it("time list keyboard: arrows skip disabled options, Enter selects, Escape closes and refocuses", () => {
    render(<Harness initialDate="2026-10-15" initialTime="14:30" minTime="14:00" />);
    const timeBtn = screen.getByRole("button", { name: "Change time, 2:30 pm" });
    fireEvent.click(timeBtn);
    const list = screen.getByRole("listbox");
    const opt = (label: string) => within(list).getByRole("option", { name: label });
    // Opens on the selected time, with a Clear time option first.
    expect(list.getAttribute("aria-activedescendant")).toBe(opt("2:30 pm").id);
    expect(opt("2:30 pm").getAttribute("aria-selected")).toBe("true");
    expect(within(list).getAllByRole("option")[0]?.textContent).toBe("Clear time");

    fireEvent.keyDown(list, { key: "ArrowDown" });
    expect(list.getAttribute("aria-activedescendant")).toBe(opt("2:45 pm").id);
    fireEvent.keyDown(list, { key: "ArrowUp" });
    fireEvent.keyDown(list, { key: "ArrowUp" });
    fireEvent.keyDown(list, { key: "ArrowUp" });
    expect(list.getAttribute("aria-activedescendant")).toBe(opt("2:00 pm").id);
    // 1:45 pm is before minTime, so ArrowUp jumps over the disabled block to "Clear time".
    fireEvent.keyDown(list, { key: "ArrowUp" });
    expect(list.getAttribute("aria-activedescendant")).toBe(opt("Clear time").id);
    fireEvent.keyDown(list, { key: "ArrowDown" });
    fireEvent.keyDown(list, { key: "Enter" });
    expect(out()).toBe("2026-10-15|14:00");

    const changed = screen.getByRole("button", { name: "Change time, 2:00 pm" });
    fireEvent.click(changed);
    fireEvent.keyDown(screen.getByRole("listbox"), { key: "Escape" });
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(document.activeElement).toBe(changed);
    expect(out()).toBe("2026-10-15|14:00");
  });

  it("Clear time removes the time and leaves the date", () => {
    render(<Harness initialDate="2026-10-15" initialTime="08:00" />);
    fireEvent.click(screen.getByRole("button", { name: "Change time, 8:00 am" }));
    fireEvent.click(screen.getByRole("option", { name: "Clear time" }));
    expect(out()).toBe("2026-10-15|");
    expect(screen.getByRole("button", { name: "Add time" })).toBeDefined();
  });

  describe("month and year views", () => {
    const openCalendar = () => fireEvent.click(screen.getByRole("button", { name: /^Choose collection date/ }));
    const btn = (name: string | RegExp) => screen.getByRole("button", { name }) as HTMLButtonElement;

    it("the month title opens a month grid with the viewed month highlighted and future months disabled", () => {
      render(<Harness />);
      openCalendar();
      const title = btn("Choose month and year, October 2026");
      expect(title.getAttribute("aria-expanded")).toBe("false");
      fireEvent.click(title);

      const grid = screen.getByRole("group", { name: "Months of 2026" });
      const months = within(grid).getAllByRole("button");
      expect(months.map((m) => m.textContent)).toEqual([
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ]);
      expect(btn("October 2026").getAttribute("aria-pressed")).toBe("true");
      expect(btn("October 2026").className).toContain("is-selected");
      expect(btn("November 2026").disabled).toBe(true);
      expect(btn("December 2026").disabled).toBe(true);
      expect(btn("September 2026").disabled).toBe(false);
      expect(btn("Next year").disabled).toBe(true);
      expect(document.activeElement).toBe(btn("October 2026"));
      // The day grid is replaced, not shown alongside.
      expect(screen.queryByRole("button", { name: "15 October 2026" })).toBeNull();
    });

    it("picking a month returns to that month's day grid without selecting a date", () => {
      render(<Harness />);
      openCalendar();
      fireEvent.click(btn(/^Choose month and year/));
      fireEvent.click(btn("Previous year"));
      expect(btn("Choose year, 2025")).toBeDefined();
      fireEvent.click(btn("March 2025"));

      expect(btn("Choose month and year, March 2025")).toBeDefined();
      expect(btn("15 March 2025").disabled).toBe(false);
      expect(document.activeElement).toBe(btn("1 March 2025"));
      expect(out()).toBe("|");
      expect(screen.getByRole("dialog")).toBeDefined();
    });

    it("the year label opens one scrollable grid of every year from minDate to this year", () => {
      render(<Harness minDate="1990-01-01" />);
      openCalendar();
      fireEvent.click(btn(/^Choose month and year/));
      fireEvent.click(btn("Choose year, 2026"));

      expect(screen.getByText("1990 – 2026")).toBeDefined();
      const grid = screen.getByRole("group", { name: "Years 1990 – 2026" });
      expect(grid.className).toContain("calendar-year-grid");
      const years = within(grid).getAllByRole("button").map((b) => b.textContent);
      expect(years).toHaveLength(37);
      expect(years[0]).toBe("1990"); // oldest first, newest at the bottom
      expect(years[36]).toBe("2026");
      expect(within(grid).queryByRole("button", { name: "1989" })).toBeNull();
      expect(within(grid).queryByRole("button", { name: "2027" })).toBeNull();
      // No paging arrows any more.
      expect(screen.queryByRole("button", { name: /12 years/ })).toBeNull();
      expect(btn("2026").getAttribute("aria-pressed")).toBe("true");
      expect(document.activeElement).toBe(btn("2026"));

      // The 90s are one click away.
      fireEvent.click(btn("1994"));
      expect(btn("Choose year, 1994")).toBeDefined();
      fireEvent.click(btn("July 1994"));
      expect(btn("Choose month and year, July 1994")).toBeDefined();
      expect(out()).toBe("|");
    });

    it("month view respects minDate / maxDate, including the year arrows", () => {
      render(<Harness minDate="2020-06-15" />);
      openCalendar();
      fireEvent.click(btn(/^Choose month and year/));
      fireEvent.click(btn("Choose year, 2026"));
      expect(screen.getByRole("group", { name: "Years 2020 – 2026" })).toBeDefined();
      expect(screen.queryByRole("button", { name: "2019" })).toBeNull();
      fireEvent.click(btn("2020"));
      expect(btn("May 2020").disabled).toBe(true);
      expect(btn("June 2020").disabled).toBe(false); // partially in range
      expect(btn("Previous year").disabled).toBe(true);
    });

    it("Escape steps back years -> months -> days, then closes and refocuses the trigger", () => {
      render(<Harness />);
      const trigger = btn("Choose collection date");
      fireEvent.click(trigger);
      fireEvent.click(btn(/^Choose month and year/));
      fireEvent.click(btn("Choose year, 2026"));
      const dialog = screen.getByRole("dialog");

      fireEvent.keyDown(document.activeElement ?? dialog, { key: "Escape" });
      expect(screen.getByRole("group", { name: "Months of 2026" })).toBeDefined();
      expect(document.activeElement).toBe(btn("October 2026"));

      fireEvent.keyDown(document.activeElement ?? dialog, { key: "Escape" });
      expect(btn("Choose month and year, October 2026")).toBeDefined();
      expect(document.activeElement).toBe(btn("31 October 2026")); // today

      fireEvent.keyDown(document.activeElement ?? dialog, { key: "Escape" });
      expect(screen.queryByRole("dialog")).toBeNull();
      expect(document.activeElement).toBe(trigger);
    });

    it("header Today returns to the day grid of the current month from any view", () => {
      render(<Harness />);
      openCalendar();
      fireEvent.click(btn(/^Choose month and year/));
      fireEvent.click(btn("Previous year"));
      fireEvent.click(btn("Go to today"));
      expect(btn("Choose month and year, October 2026")).toBeDefined();
      expect(btn("31 October 2026")).toBeDefined();
    });

    it("arrow keys move within the month grid and skip disabled months", () => {
      render(<Harness />);
      openCalendar();
      fireEvent.click(btn(/^Choose month and year/));
      const grid = screen.getByRole("group", { name: "Months of 2026" });
      expect(document.activeElement).toBe(btn("October 2026"));
      fireEvent.keyDown(grid, { key: "ArrowRight" }); // Nov, Dec disabled
      expect(document.activeElement).toBe(btn("October 2026"));
      fireEvent.keyDown(grid, { key: "ArrowLeft" });
      expect(document.activeElement).toBe(btn("September 2026"));
      fireEvent.keyDown(grid, { key: "ArrowUp" });
      expect(document.activeElement).toBe(btn("June 2026"));
      // Enter / Space on a focused <button> fire click natively; jsdom doesn't, so click directly.
      fireEvent.click(document.activeElement as HTMLElement);
      expect(btn("Choose month and year, June 2026")).toBeDefined();
    });

    it("re-opening the calendar starts on the day grid", () => {
      render(<Harness />);
      openCalendar();
      fireEvent.click(btn(/^Choose month and year/));
      fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" }); // back to days
      fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" }); // close
      openCalendar();
      fireEvent.click(btn(/^Choose month and year/));
      fireEvent.mouseDown(document.body); // outside click closes from month view
      expect(screen.queryByRole("dialog")).toBeNull();
      openCalendar();
      expect(btn("Choose month and year, October 2026")).toBeDefined();
    });
  });

  describe("time list positioning", () => {
    /**
     * jsdom has no layout, so stub the measurements the positioning hook reads:
     * the pill wrapper's rect, the list's content height and width, and the viewport width.
     */
    function withLayout(rootRect: { top: number; left: number; width: number }, viewportWidth: number, run: () => void) {
      const rectSpy = vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
        const isRoot = this.classList.contains("date-picker-root");
        const r = isRoot ? { ...rootRect, height: 42 } : { top: 0, left: 0, width: 0, height: 0 };
        return {
          ...r,
          x: r.left,
          y: r.top,
          right: r.left + r.width,
          bottom: r.top + r.height,
          toJSON: () => ({}),
        } as DOMRect;
      });
      const scrollDesc = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollHeight");
      const widthDesc = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetWidth");
      const innerWidth = window.innerWidth;
      Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
        configurable: true,
        get(this: HTMLElement) {
          return this.getAttribute("role") === "listbox" ? 3800 : 0; // 96 rows uncapped
        },
      });
      Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
        configurable: true,
        get(this: HTMLElement) {
          return this.getAttribute("role") === "listbox" ? 192 : 0;
        },
      });
      Object.defineProperty(window, "innerWidth", { configurable: true, value: viewportWidth });
      try {
        run();
      } finally {
        rectSpy.mockRestore();
        if (scrollDesc) Object.defineProperty(HTMLElement.prototype, "scrollHeight", scrollDesc);
        if (widthDesc) Object.defineProperty(HTMLElement.prototype, "offsetWidth", widthDesc);
        Object.defineProperty(window, "innerWidth", { configurable: true, value: innerWidth });
      }
    }

    const openTimeList = () => {
      fireEvent.click(screen.getByRole("button", { name: "Add time" }));
      return screen.getByRole("listbox");
    };

    it("opens downward when there is room below, capped at 280px and right-aligned", () => {
      withLayout({ top: 100, left: 100, width: 400 }, 1024, () => {
        render(<Harness initialDate="2026-10-15" />);
        const list = openTimeList();
        expect(list.getAttribute("data-placement")).toBe("bottom");
        expect(list.className).toContain("align-end");
        // Even though the content is ~3800px tall, the inline cap is the fixed 280px.
        expect(list.style.maxHeight).toBe("280px");
        expect(list.style.right).toBe("0px");
        expect(list.style.left).toBe("");
      });
    });

    it("opens upward when the pill is near the viewport bottom, still capped at 280px", () => {
      // jsdom innerHeight is 768: 12px below the pill, ~690px above it.
      withLayout({ top: 712, left: 100, width: 400 }, 1024, () => {
        render(<Harness initialDate="2026-10-15" />);
        const list = openTimeList();
        expect(list.getAttribute("data-placement")).toBe("top");
        expect(list.className).toContain("placement-top");
        expect(list.style.maxHeight).toBe("280px");
      });
    });

    it("is nudged back inside a narrow viewport", () => {
      // Pill's right edge (500) is past a 400px viewport: list moves left by 108px.
      withLayout({ top: 100, left: 100, width: 400 }, 400, () => {
        render(<Harness initialDate="2026-10-15" />);
        const list = openTimeList();
        expect(list.style.right).toBe("108px");
      });
    });
  });

  it("closes on an outside click", () => {
    render(
      <>
        <Harness initialDate="2026-10-15" />
        <button type="button">elsewhere</button>
      </>
    );
    fireEvent.click(screen.getByRole("button", { name: /Choose collection date/ }));
    expect(screen.getByRole("dialog")).toBeDefined();
    fireEvent.mouseDown(screen.getByRole("button", { name: "elsewhere" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
