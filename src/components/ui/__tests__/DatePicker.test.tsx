import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { DatePicker } from "../DatePicker";

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

    const todayBtn = screen.getByRole("button", { name: "Today" });
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
});
