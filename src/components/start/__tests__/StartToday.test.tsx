import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StartToday } from "../StartToday";

describe("StartToday Component", () => {
  it("renders the CTA card and resource links inside the light band", () => {
    const { container } = render(<StartToday />);
    expect(screen.getByRole("heading", { name: /Publish your first isolate/i })).toBeDefined();
    expect(screen.getByRole("link", { name: "Get started" })).toBeDefined();
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
    expect(container.querySelector(".ubio-band-light")).not.toBeNull();
  });

  it("uses an AU member state and a non-human taxon in the example command", () => {
    render(<StartToday />);
    const code = screen.getByLabelText("Example upload commands").textContent ?? "";
    expect(code).toContain("--country SN");
    expect(code).not.toContain("9606");
  });
});
