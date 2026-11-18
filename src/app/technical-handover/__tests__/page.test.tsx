import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import TechnicalHandoverPage, { metadata } from "../page";

describe("TechnicalHandoverPage", () => {
  it("exports route metadata and renders a blank main landmark", () => {
    expect(metadata.title).toBe("Technical Handover — UbuntuBio");
    render(<TechnicalHandoverPage />);
    const main = screen.getByRole("main");
    expect(main).toBeDefined();
    expect(main.textContent).toBe("");
  });
});
