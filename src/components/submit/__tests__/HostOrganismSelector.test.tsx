import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React, { useState } from "react";
import { HostOrganismSelector, HostEntry } from "../HostOrganismSelector";

// Mock suggestTaxa API
vi.mock("../../../lib/api", () => ({
  suggestTaxa: vi.fn().mockImplementation((query: string) => {
    if (query.toLowerCase().includes("bat")) {
      return Promise.resolve([
        {
          taxon_id: 9407,
          scientific_name: "Rousettus aegyptiacus",
          common_name: "Egyptian fruit bat",
          rank: "species",
        },
      ]);
    }
    return Promise.resolve([]);
  }),
}));

function Harness({ initial = [] }: { initial?: HostEntry[] }) {
  const [hosts, setHosts] = useState<HostEntry[]>(initial);
  return (
    <>
      <HostOrganismSelector value={hosts} onChange={setHosts} />
      <output data-testid="selected-hosts">
        {JSON.stringify(hosts.map((h) => ({ id: h.id, name: h.name, taxonId: h.taxonId })))}
      </output>
    </>
  );
}

const getSelectedHosts = () =>
  JSON.parse(screen.getByTestId("selected-hosts").textContent || "[]");

describe("HostOrganismSelector Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with default placeholder and no initial hosts", () => {
    render(<Harness />);
    expect(
      screen.getByPlaceholderText(/Search or type host organism/i)
    ).toBeDefined();
    expect(getSelectedHosts()).toHaveLength(0);
  });

  it("renders initial selected host pills with remove buttons", () => {
    render(
      <Harness
        initial={[
          {
            id: "9606",
            name: "Homo sapiens",
            commonName: "Human Patient",
            taxonId: 9606,
          },
        ]}
      />
    );

    expect(screen.getByText(/Human Patient \(Homo sapiens\)/i)).toBeDefined();
    expect(screen.getByText("#9606")).toBeDefined();
    expect(screen.getByRole("button", { name: /Remove Human Patient/i })).toBeDefined();
  });

  it("opens suggestions dropdown on focus and shows priority African hosts", () => {
    render(<Harness />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);

    expect(
      screen.getByText(/African Pathogen Hosts & Reservoirs/i)
    ).toBeDefined();
    expect(screen.getByText(/Human Patient/i)).toBeDefined();
    expect(screen.getByText(/African Malaria Mosquito/i)).toBeDefined();
  });

  it("filters suggestions as user types and adds a host pill on click", () => {
    render(<Harness />);
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "mosquito" } });

    // Both Anopheles and Aedes should appear
    expect(screen.getByText(/African Malaria Mosquito/i)).toBeDefined();
    expect(screen.getByText(/Yellow Fever Mosquito/i)).toBeDefined();

    // Click to add Anopheles
    fireEvent.click(screen.getByText(/African Malaria Mosquito/i));

    const selected = getSelectedHosts();
    expect(selected).toHaveLength(1);
    expect(selected[0].name).toBe("Anopheles gambiae");
    expect(selected[0].taxonId).toBe(7165);
  });

  it("allows selecting multiple host pills and removing via 'x' button", () => {
    render(
      <Harness
        initial={[
          {
            id: "9606",
            name: "Homo sapiens",
            commonName: "Human Patient",
            taxonId: 9606,
          },
        ]}
      />
    );

    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "cattle" } });

    fireEvent.click(screen.getByText(/Bovine \/ Cattle/i));
    expect(getSelectedHosts()).toHaveLength(2);

    // Remove Human Patient
    const removeBtn = screen.getByRole("button", { name: /Remove Human Patient/i });
    fireEvent.click(removeBtn);

    const remaining = getSelectedHosts();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].name).toBe("Bos taurus");
  });

  it("removes the last pill on Backspace when search input is empty", () => {
    render(
      <Harness
        initial={[
          { id: "9606", name: "Homo sapiens", taxonId: 9606 },
          { id: "7165", name: "Anopheles gambiae", taxonId: 7165 },
        ]}
      />
    );

    const input = screen.getByRole("combobox");
    fireEvent.keyDown(input, { key: "Backspace" });

    const remaining = getSelectedHosts();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe("9606");
  });

  it("allows adding a custom uncatalogued host (e.g. environmental matrix)", () => {
    render(<Harness />);
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "Hospital wastewater effluent" } });

    const customOption = screen.getByRole("option", {
      name: /Add custom host: “Hospital wastewater effluent”/i,
    });
    fireEvent.click(customOption);

    const selected = getSelectedHosts();
    expect(selected).toHaveLength(1);
    expect(selected[0].name).toBe("Hospital wastewater effluent");
    expect(selected[0].taxonId).toBeNull();
  });
});
