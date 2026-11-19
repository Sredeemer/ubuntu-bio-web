import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { AUCountryMultiSelect } from "../AUCountryMultiSelect";

describe("AUCountryMultiSelect", () => {
  it("renders selected AU country chips and allows removing one", () => {
    const onChange = vi.fn();
    render(<AUCountryMultiSelect selectedCodes={["GH", "NG"]} onChange={onChange} />);

    expect(screen.getByText("Ghana (GH)")).toBeDefined();
    expect(screen.getByText("Nigeria (NG)")).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Remove Ghana (GH)" }));
    expect(onChange).toHaveBeenCalledWith(["NG"]);
  });

  it("opens searchable dropdown with all 55 AU states including EH and toggles selection", () => {
    const onChange = vi.fn();
    render(<AUCountryMultiSelect selectedCodes={["GH"]} onChange={onChange} />);

    fireEvent.click(screen.getByRole("combobox", { name: /AU Countries of Origin/i }));
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(55);

    const searchInput = screen.getByLabelText(/Filter AU member states/i);
    fireEvent.change(searchInput, { target: { value: "Kenya" } });
    fireEvent.click(screen.getByRole("option", { name: /Kenya/i }));
    expect(onChange).toHaveBeenCalledWith(["GH", "KE"]);

    fireEvent.change(searchInput, { target: { value: "EH" } });
    expect(screen.getByRole("option", { name: /Western Sahara/i })).toBeDefined();
  });
});
