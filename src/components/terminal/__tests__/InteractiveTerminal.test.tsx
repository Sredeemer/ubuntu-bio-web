import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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

  describe("when driven by scroll (activeTabOverride is supplied)", () => {
    const typed = (container: HTMLElement) => container.querySelector(".terminal-typed-cmd")?.textContent ?? "";

    it.each([
      ["ubio login", "ubio login"],
      ["ubio search", 'ubio search "Vibrio cholerae"'],
      ["ubio upload", "ubio upload pasteur-dakar"],
    ])("clicking %s switches the terminal even though an override is set", async (label, expectedCmd) => {
      // Start on a different tab so the click is a real change for each case.
      const start = label === "ubio login" ? "upload" : "auth";
      const { container } = render(<InteractiveTerminal activeTabOverride={start} />);

      const tab = screen.getByRole("tab", { name: new RegExp(label, "i") });
      fireEvent.click(tab);

      expect(tab.getAttribute("aria-selected")).toBe("true");
      await waitFor(() => expect(typed(container)).toContain(expectedCmd), { timeout: 4000 });
      expect(screen.getAllByRole("tab").filter((t) => t.getAttribute("aria-selected") === "true")).toHaveLength(1);
    });

    it("keeps a manual selection when the override has not changed, but follows a new scroll position", () => {
      const { rerender } = render(<InteractiveTerminal activeTabOverride="upload" />);
      const login = screen.getByRole("tab", { name: /ubio login/i });
      const search = screen.getByRole("tab", { name: /ubio search/i });

      fireEvent.click(login);
      expect(login.getAttribute("aria-selected")).toBe("true");

      // Re-render with the SAME override (e.g. unrelated parent update): manual choice stands.
      rerender(<InteractiveTerminal activeTabOverride="upload" />);
      expect(login.getAttribute("aria-selected")).toBe("true");

      // Scrolling to a new section changes the override: the terminal follows it.
      rerender(<InteractiveTerminal activeTabOverride="search" />);
      expect(search.getAttribute("aria-selected")).toBe("true");
      expect(login.getAttribute("aria-selected")).toBe("false");
    });

    it("exposes the active tab as the labelled tabpanel", () => {
      render(<InteractiveTerminal activeTabOverride="upload" />);
      fireEvent.click(screen.getByRole("tab", { name: /ubio login/i }));
      const panel = screen.getByRole("tabpanel");
      expect(panel.getAttribute("aria-labelledby")).toBe("ubio-tab-auth");
    });
  });
});
