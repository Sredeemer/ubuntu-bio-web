import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { Navbar } from "../Navbar";
import { AuthProvider } from "../../../context/AuthContext";

const renderNavbar = () =>
  render(
    <AuthProvider>
      <Navbar />
    </AuthProvider>
  );

describe("Navbar navigation items", () => {
  it("shows 'Governance' (not 'Our Story') pointing at the governance page", () => {
    renderNavbar();
    const nav = screen.getByRole("navigation", { name: "Main Navigation" });
    const link = within(nav).getByRole("link", { name: "Governance" });
    expect(link.getAttribute("href")).toBe("/docs/governance");
    expect(within(nav).queryByRole("link", { name: /Our Story/i })).toBeNull();
  });

  it("uses the same item in the mobile drawer", () => {
    renderNavbar();
    fireEvent.click(screen.getByRole("button", { name: "Open navigation menu" }));
    const drawer = document.getElementById("mobile-navigation-drawer")!;
    const link = within(drawer).getByRole("link", { name: "Governance" });
    expect(link.getAttribute("href")).toBe("/docs/governance");
    expect(within(drawer).queryByRole("link", { name: /Our Story/i })).toBeNull();
  });
});

describe("Navigation drawer toggle accessibility", () => {
  it("always has aria-expanded, aria-controls and an accessible name that track state", () => {
    renderNavbar();
    const closed = screen.getByRole("button", { name: "Open navigation menu" });
    expect(closed.getAttribute("aria-expanded")).toBe("false");
    expect(closed.getAttribute("aria-controls")).toBe("mobile-navigation-drawer");
    // The drawer is not rendered while closed, so the reference is only live when open.
    expect(document.getElementById("mobile-navigation-drawer")).toBeNull();

    fireEvent.click(closed);
    const open = screen.getByRole("button", { name: "Close navigation menu" });
    expect(open.getAttribute("aria-expanded")).toBe("true");
    expect(open.getAttribute("aria-controls")).toBe("mobile-navigation-drawer");
    expect(document.getElementById("mobile-navigation-drawer")).not.toBeNull();

    fireEvent.click(open);
    const closedAgain = screen.getByRole("button", { name: "Open navigation menu" });
    expect(closedAgain.getAttribute("aria-expanded")).toBe("false");
    expect(document.getElementById("mobile-navigation-drawer")).toBeNull();
  });

  it("closes on Escape and returns focus to the toggle", () => {
    renderNavbar();
    fireEvent.click(screen.getByRole("button", { name: "Open navigation menu" }));
    fireEvent.keyDown(document, { key: "Escape" });
    const toggle = screen.getByRole("button", { name: "Open navigation menu" });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(toggle);
  });

  it("closes the drawer after choosing a link", () => {
    renderNavbar();
    fireEvent.click(screen.getByRole("button", { name: "Open navigation menu" }));
    const drawer = document.getElementById("mobile-navigation-drawer")!;
    fireEvent.click(within(drawer).getByRole("link", { name: "Datasets" }));
    expect(screen.getByRole("button", { name: "Open navigation menu" }).getAttribute("aria-expanded")).toBe("false");
  });
});
