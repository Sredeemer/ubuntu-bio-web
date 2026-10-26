import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import { Progress } from "../Progress";

describe("Progress Component (Shadcn)", () => {
  it("renders with default value 0", () => {
    const { container } = render(<Progress value={0} />);
    const root = container.querySelector(".ubio-progress-root");
    expect(root).toBeDefined();

    const indicator = container.querySelector(".ubio-progress-indicator");
    expect(indicator).toBeDefined();
    expect((indicator as HTMLElement).style.transform).toBe("translateX(-100%)");
  });

  it("updates indicator transform corresponding to value", () => {
    const { container } = render(<Progress value={65} />);
    const indicator = container.querySelector(".ubio-progress-indicator");
    expect((indicator as HTMLElement).style.transform).toBe("translateX(-35%)");
  });

  it("clamps indicator transform within 0-100 bounds", () => {
    const { container } = render(<Progress value={120} />);
    const indicator = container.querySelector(".ubio-progress-indicator");
    expect((indicator as HTMLElement).style.transform).toBe("translateX(-0%)");
  });
});
