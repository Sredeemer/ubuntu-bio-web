import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DeviceVerificationPage } from "../DeviceVerificationPage";
import { AuthContext } from "../../../context/AuthContext";
import * as api from "../../../lib/api";

let mockSearchParams: Record<string, string | null> = {
  user_code: "UBIO-8492-AF",
};

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: (param: string) => mockSearchParams[param] ?? null,
  }),
}));

describe("DeviceVerificationPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockSearchParams = {
      user_code: "UBIO-8492-AF",
    };
  });

  it("shows sign in CTA when researcher is not logged in", () => {
    render(
      <AuthContext.Provider
        value={{
          user: null,
          token: null,
          isLoading: false,
          isAuthenticated: false,
          loginWithToken: vi.fn(),
          loginWithOrcid: vi.fn(),
          logout: vi.fn(),
          refreshUser: vi.fn(),
        }}
      >
        <DeviceVerificationPage />
      </AuthContext.Provider>
    );

    expect(
      screen.getByText(/please sign in with your verified orcid id/i)
    ).toBeDefined();
    expect(
      screen.getByRole("button", { name: /sign in with orcid to continue/i })
    ).toBeDefined();
  });

  it("pre-fills user_code and successfully authorizes device when logged in", async () => {
    vi.spyOn(api, "verifyDeviceCode").mockResolvedValueOnce({
      success: true,
      message: "Device authorized",
    });

    render(
      <AuthContext.Provider
        value={{
          user: {
            id: "user-123",
            name: "Dr. Redeemer Okekale",
            orcid_id: "0009-0000-2900-592X",
          },
          token: "ubp_test_token",
          isLoading: false,
          isAuthenticated: true,
          loginWithToken: vi.fn(),
          loginWithOrcid: vi.fn(),
          logout: vi.fn(),
          refreshUser: vi.fn(),
        }}
      >
        <DeviceVerificationPage />
      </AuthContext.Provider>
    );

    const input = screen.getByLabelText(/one-time code/i) as HTMLInputElement;
    expect(input.value).toBe("UBIO-8492-AF");

    const submitBtn = screen.getByRole("button", { name: /authorize terminal/i });
    expect(submitBtn.disabled).toBe(false);

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /terminal authorized!/i })).toBeDefined();
    });
  });

  it("auto-authorizes device when auto=1 is passed and user is authenticated", async () => {
    mockSearchParams = {
      user_code: "UBIO-AUTO-01",
      auto: "1",
    };

    const verifySpy = vi.spyOn(api, "verifyDeviceCode").mockResolvedValueOnce({
      success: true,
      message: "Device authorized",
    });

    render(
      <AuthContext.Provider
        value={{
          user: {
            id: "user-123",
            name: "Dr. Redeemer Okekale",
            orcid_id: "0009-0000-2900-592X",
          },
          token: "ubp_test_token",
          isLoading: false,
          isAuthenticated: true,
          loginWithToken: vi.fn(),
          loginWithOrcid: vi.fn(),
          logout: vi.fn(),
          refreshUser: vi.fn(),
        }}
      >
        <DeviceVerificationPage />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(verifySpy).toHaveBeenCalledWith("UBIO-AUTO-01", "ubp_test_token");
      expect(screen.getByRole("heading", { name: /terminal authorized!/i })).toBeDefined();
    });
  });
});

