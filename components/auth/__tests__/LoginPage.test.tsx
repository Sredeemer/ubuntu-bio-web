import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LoginPage } from "../LoginPage";
import { AuthProvider } from "../../../context/AuthContext";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("LoginPage", () => {
  it("renders split-screen login elements matching MongoDB aesthetic", () => {
    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    // Form pane checks
    expect(screen.getByRole("heading", { name: /log in to your account/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /continue with orcid/i })).toBeDefined();
    expect(screen.getByLabelText(/personal access token/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeDefined();

    // Hero pane checks
    expect(
      screen.getByRole("heading", {
        name: /explore sovereign african genomics and pathogen surveillance/i,
      })
    ).toBeDefined();
    expect(screen.getByText(/54 african union member states/i)).toBeDefined();
    expect(screen.getByRole("link", { name: /browse public datasets/i })).toBeDefined();
  });

  it("enables sign in button when Personal Access Token is entered", () => {
    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    const input = screen.getByLabelText(/personal access token/i);
    const submitBtn = screen.getByRole("button", { name: /sign in/i });

    expect((submitBtn as HTMLButtonElement).disabled).toBe(true);

    fireEvent.change(input, { target: { value: "ubp_test_token_12345" } });
    expect((submitBtn as HTMLButtonElement).disabled).toBe(false);
  });
});
