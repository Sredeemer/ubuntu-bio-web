import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import FoundingCharterPage, { metadata } from "../page";

describe("FoundingCharterPage", () => {
  it("exports route metadata and renders a blank main landmark", () => {
    expect(metadata.title).toBe("Founding Charter — UbuntuBio");
    render(<FoundingCharterPage />);
    const main = screen.getByRole("main");
    expect(main).toBeDefined();
    expect(main.textContent).toBe("");
  });
});
