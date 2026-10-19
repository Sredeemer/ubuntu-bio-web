import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { InteractiveTerminal } from "../InteractiveTerminal";

describe("InteractiveTerminal Component", () => {
  it("renders CLI terminal with tabs and initial command", () => {
    render(<InteractiveTerminal />);
    expect(screen.getByText("ubuntu-bio@node-af")).toBeDefined();
    expect(screen.getByRole("tab", { name: /ubio upload/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /ubio login/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /ubio search/i })).toBeDefined();
  });

  it("handles tab switching and fires onTabChange callback", () => {
    const onTabChange = vi.fn();
    render(<InteractiveTerminal onTabChange={onTabChange} />);

    const authTab = screen.getByRole("tab", { name: /ubio login/i });
    fireEvent.click(authTab);

    expect(authTab.getAttribute("aria-selected")).toBe("true");
    expect(onTabChange).toHaveBeenCalledWith("auth");
  });

  it("allows copying the active command to clipboard", async () => {
    render(<InteractiveTerminal />);
    const copyBtn = screen.getByTitle("Copy command");
    fireEvent.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });
});
