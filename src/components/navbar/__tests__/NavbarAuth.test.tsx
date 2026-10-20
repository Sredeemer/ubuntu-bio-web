import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Navbar } from "../Navbar";
import { AuthProvider, AUTH_TOKEN_KEY } from "../../../context/AuthContext";

describe("Navbar Authentication State", () => {
  it("renders 'Sign In' button when user is unauthenticated", () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    render(
      <AuthProvider>
        <Navbar />
      </AuthProvider>
    );

    const signInLink = screen.getByRole("link", { name: /sign in/i });
    expect(signInLink).toBeDefined();
    expect(signInLink.getAttribute("href")).toBe("/login");
  });

  it("renders the animated spinning UbuntuBio logo in the navbar header", () => {
    const { container } = render(
      <AuthProvider>
        <Navbar />
      </AuthProvider>
    );
    const spinningLogo = container.querySelector(".ubio-brand-link .ubio-logo-spin");
    expect(spinningLogo).not.toBeNull();
  });

  it("does not render the HubStatusBadge in the header navbar", () => {
    const { container } = render(
      <AuthProvider>
        <Navbar />
      </AuthProvider>
    );
    expect(container.querySelector(".hub-status-badge")).toBeNull();
  });
});
