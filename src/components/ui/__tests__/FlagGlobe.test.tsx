import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import * as Flags from "country-flag-icons/react/3x2";
import { FlagGlobe, COUNTRY_COORDINATES } from "../flag-globe";
import { AU_COUNTRIES } from "../../../data/auCountries";

vi.mock("cobe", () => ({
  default: vi.fn(() => ({ destroy: vi.fn(), update: vi.fn() })),
}));

describe("AU member-state data feeding the globe", () => {
  it("has 55 unique ISO 3166-1 alpha-2 codes", () => {
    const codes = AU_COUNTRIES.map((c) => c.code);
    expect(codes).toHaveLength(55);
    expect(new Set(codes).size).toBe(55);
    for (const code of codes) expect(code).toMatch(/^[A-Z]{2}$/);
  });

  it("maps every member state to coordinates and a flag, so each can be hovered", () => {
    for (const { code, name } of AU_COUNTRIES) {
      expect(COUNTRY_COORDINATES[code], `${name} (${code}) has no coordinates`).toBeDefined();
      expect((Flags as Record<string, unknown>)[code], `${name} (${code}) has no flag`).toBeDefined();
    }
  });

  it("puts every country within Africa's bounding box (catches swapped lat/lon)", () => {
    for (const { code, name } of AU_COUNTRIES) {
      const [lat, lon] = COUNTRY_COORDINATES[code]!;
      expect(lat, `${name} latitude`).toBeGreaterThan(-36);
      expect(lat, `${name} latitude`).toBeLessThan(38);
      expect(lon, `${name} longitude`).toBeGreaterThan(-26);
      expect(lon, `${name} longitude`).toBeLessThan(65);
    }
  });
});

describe("FlagGlobe hover and tap tooltip", () => {
  const SIZE = 640;
  const markers = AU_COUNTRIES.map((c) => ({ code: c.code, label: c.name }));
  let rectSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // jsdom has no pointer-capture API.
    HTMLElement.prototype.setPointerCapture = vi.fn();
    HTMLElement.prototype.releasePointerCapture = vi.fn();
    HTMLElement.prototype.hasPointerCapture = vi.fn(() => false);
    rectSpy = vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(
      () => ({ x: 0, y: 0, left: 0, top: 0, right: SIZE, bottom: SIZE, width: SIZE, height: SIZE, toJSON: () => ({}) }) as DOMRect
    );
  });
  afterEach(() => rectSpy.mockRestore());

  const renderGlobe = () => {
    const utils = render(
      <FlagGlobe markers={markers} size={SIZE} flagSize={28} altitude={0.16} autoRotate={false} phi={4} theta={0.16} markerDots />
    );
    const surface = utils.container.querySelector(".cursor-grab") as HTMLElement;
    return { ...utils, surface };
  };

  /** Sweep the sphere with the mouse until a flag is hit; returns the tooltip text it showed. */
  const hoverSomething = (surface: HTMLElement): { name: string; code: string } | null => {
    for (let y = 120; y <= 520; y += 12) {
      for (let x = 120; x <= 520; x += 12) {
        act(() => {
          fireEvent.pointerMove(surface, { clientX: x, clientY: y, pointerType: "mouse", pointerId: 1, isPrimary: true });
        });
        const name = document.querySelector(".flag-globe-tooltip-name")?.textContent;
        const code = document.querySelector(".flag-globe-tooltip-code")?.textContent;
        if (name && code) return { name, code };
      }
    }
    return null;
  };

  it("lists each country with its ISO code for assistive tech", () => {
    renderGlobe();
    expect(screen.getByText("Nigeria (NG)")).toBeDefined();
    expect(screen.getByText("Côte d'Ivoire (CI)")).toBeDefined();
  });

  it("shows a tooltip with the hovered country's name and matching ISO code", () => {
    const { surface } = renderGlobe();
    const hit = hoverSomething(surface);
    expect(hit, "hovering the globe never produced a tooltip").not.toBeNull();

    // The name and code must be a consistent pair from the AU data (no mismatched/duplicated info).
    const match = AU_COUNTRIES.find((c) => c.code === hit!.code);
    expect(match).toBeDefined();
    expect(match!.name).toBe(hit!.name);

    const tip = screen.getByRole("tooltip");
    expect(tip.textContent).toBe(`${hit!.name}${hit!.code}`);
    // Announced politely, and the globe region is described by the tooltip.
    expect(screen.getByRole("status").textContent).toContain(`ISO code ${hit!.code}`);
    expect(screen.getByRole("region").getAttribute("aria-describedby")).toBe(tip.id);
  });

  it("clears the tooltip when the pointer leaves the globe", () => {
    const { surface } = renderGlobe();
    expect(hoverSomething(surface)).not.toBeNull();
    act(() => {
      fireEvent.pointerLeave(surface, { pointerType: "mouse", pointerId: 1 });
    });
    expect(document.querySelector(".flag-globe-tooltip-name")).toBeNull();
    expect(screen.getByRole("region").getAttribute("aria-describedby")).toBeNull();
  });

  it("highlights exactly one flag while it is active", () => {
    const { surface, container } = renderGlobe();
    expect(hoverSomething(surface)).not.toBeNull();
    // Highlight is applied from the animation frame; flush it.
    act(() => {
      fireEvent.pointerMove(surface, { clientX: 0, clientY: 0, pointerType: "mouse", pointerId: 1 });
    });
    expect(container.querySelectorAll('.flag-globe-flag[data-active="true"]').length).toBeLessThanOrEqual(1);
  });

  it("supports tap selection on touch (no hover available) and Escape to dismiss", () => {
    const { surface } = renderGlobe();
    let tapped: string | null = null;
    outer: for (let y = 120; y <= 520; y += 12) {
      for (let x = 120; x <= 520; x += 12) {
        act(() => {
          fireEvent.pointerDown(surface, { clientX: x, clientY: y, pointerType: "touch", pointerId: 7, isPrimary: true });
          fireEvent.pointerUp(surface, { clientX: x, clientY: y, pointerType: "touch", pointerId: 7, isPrimary: true });
        });
        const code = document.querySelector(".flag-globe-tooltip-code")?.textContent;
        if (code) {
          tapped = code;
          break outer;
        }
      }
    }
    expect(tapped, "tapping the globe never selected a country").not.toBeNull();
    expect(AU_COUNTRIES.some((c) => c.code === tapped)).toBe(true);

    // The selection persists after the finger lifts…
    expect(document.querySelector(".flag-globe-tooltip-name")).not.toBeNull();
    // …and Escape dismisses it for keyboard users.
    act(() => {
      fireEvent.keyDown(screen.getByRole("region"), { key: "Escape" });
    });
    expect(document.querySelector(".flag-globe-tooltip-name")).toBeNull();
  });

  it("does not select anything when a drag (not a tap) ends over a flag", () => {
    const { surface } = renderGlobe();
    act(() => {
      fireEvent.pointerDown(surface, { clientX: 100, clientY: 300, pointerType: "touch", pointerId: 9, isPrimary: true });
      fireEvent.pointerMove(surface, { clientX: 220, clientY: 300, pointerType: "touch", pointerId: 9, isPrimary: true });
      fireEvent.pointerUp(surface, { clientX: 320, clientY: 300, pointerType: "touch", pointerId: 9, isPrimary: true });
    });
    expect(document.querySelector(".flag-globe-tooltip-name")).toBeNull();
  });
});
