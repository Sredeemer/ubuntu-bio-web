import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { OrganismSelector } from "../OrganismSelector";

describe("OrganismSelector", () => {
  it("renders search input, priority African pathogen chips, and no emojis", () => {
    const handleChange = vi.fn();
    const { container } = render(
      <OrganismSelector
        valueTaxonId=""
        valueTaxonName=""
        onChange={handleChange}
      />
    );

    expect(screen.getByPlaceholderText(/Search African pathogens by name or NCBI Taxon ID/i)).toBeDefined();
    expect(screen.getByText(/African Priority:/i)).toBeDefined();
    expect(screen.getByText("Cholera")).toBeDefined();
    expect(screen.getByText("Mpox")).toBeDefined();
    expect(screen.getByText("TB")).toBeDefined();
    expect(screen.getByText("Malaria")).toBeDefined();

    // Invariant: strictly no emojis anywhere in rendered HTML
    const html = container.innerHTML;
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    expect(emojiRegex.test(html)).toBe(false);
  });

  it("selects a priority pathogen when clicking quick-pick chip", () => {
    const handleChange = vi.fn();
    render(
      <OrganismSelector
        valueTaxonId=""
        valueTaxonName=""
        onChange={handleChange}
      />
    );

    const choleraChip = screen.getByText("Cholera");
    fireEvent.click(choleraChip);

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        taxonId: "666",
        taxonName: "Vibrio cholerae",
        domain: "bacteria",
      })
    );
  });

  it("shows verified card view when valueTaxonId is selected", () => {
    const handleChange = vi.fn();
    render(
      <OrganismSelector
        valueTaxonId="11620"
        valueTaxonName="Lassa mammarenavirus"
        onChange={handleChange}
      />
    );

    expect(screen.getByText(/NCBI Verified Organism/i)).toBeDefined();
    expect(screen.getByText(/Taxon ID: 11620/i)).toBeDefined();
    expect(screen.getByText("Lassa mammarenavirus")).toBeDefined();
    expect(screen.getByRole("button", { name: /Change/i })).toBeDefined();
  });

  it("triggers human invariant notification and shows alert when human (9606) is queried or selected", async () => {
    const handleChange = vi.fn();
    const handleHumanDetected = vi.fn();

    render(
      <OrganismSelector
        valueTaxonId="9606"
        valueTaxonName="Homo sapiens"
        onChange={handleChange}
        onHumanDetected={handleHumanDetected}
      />
    );

    expect(handleHumanDetected).toHaveBeenCalledWith(true);
    expect(screen.getByText(/Prohibited Target Organism: Human Genomic Data/i)).toBeDefined();
    expect(screen.getByText(/Clinical isolates permitted:/i)).toBeDefined();
  });

  it("allows switching to custom entry mode for uncatalogued NCBI taxa", () => {
    const handleChange = vi.fn();
    render(
      <OrganismSelector
        valueTaxonId=""
        valueTaxonName=""
        onChange={handleChange}
      />
    );

    // Open dropdown by focusing
    const searchInput = screen.getByPlaceholderText(/Search African pathogens by name or NCBI Taxon ID/i);
    fireEvent.focus(searchInput);

    const manualBtn = screen.getByRole("button", { name: /Unlisted organism\? Enter manually/i });
    fireEvent.click(manualBtn);

    expect(screen.getByText(/Enter Custom NCBI Taxonomy Metadata/i)).toBeDefined();
    const idInput = screen.getByLabelText(/NCBI Taxon ID/i);
    const nameInput = screen.getByLabelText(/Scientific Name/i);

    fireEvent.change(idInput, { target: { value: "99999" } });
    fireEvent.change(nameInput, { target: { value: "Novel isolate" } });

    fireEvent.click(screen.getByRole("button", { name: /Apply Custom Organism/i }));

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        taxonId: "99999",
        taxonName: "Novel isolate",
      })
    );
  });
});
