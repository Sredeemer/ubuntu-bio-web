import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { SubmitDatasetPage } from "../SubmitDatasetPage";

describe("SubmitDatasetPage", () => {
  it("renders Step 1 form fields", () => {
    render(<SubmitDatasetPage />);
    expect(screen.getByText(/Step 1: Dataset Namespace & Metadata/i)).toBeDefined();
    expect(screen.getByLabelText(/Namespace Identifier/i)).toBeDefined();
  });

  it("advances from Step 1 to Step 2 when required fields are filled", () => {
    render(<SubmitDatasetPage />);

    fireEvent.change(screen.getByLabelText(/Namespace Identifier/i), {
      target: { value: "acegid" },
    });
    fireEvent.change(screen.getByLabelText(/Dataset Slug ID/i), {
      target: { value: "marburg-surveillance-2026" },
    });
    fireEvent.change(screen.getByLabelText(/Formal Dataset Name/i), {
      target: { value: "Marburg Virus Surveillance" },
    });
    fireEvent.change(screen.getByLabelText(/Contributing Institution/i), {
      target: { value: "ACEGID Redeemer's University" },
    });

    const nextBtn = screen.getByRole("button", { name: /Proceed to Taxonomy & Safety/i }) as HTMLButtonElement;
    expect(nextBtn.disabled).toBe(false);
    fireEvent.click(nextBtn);

    expect(screen.getByText(/Step 2: Taxonomy & Strict Human Exclusion Verification/i)).toBeDefined();
  });

  it("CRITICAL INVARIANT: Blocks submission when NCBI Taxon ID 9606 (Homo sapiens) is entered", () => {
    render(<SubmitDatasetPage />);

    // Complete step 1
    fireEvent.change(screen.getByLabelText(/Namespace Identifier/i), { target: { value: "test-institute" } });
    fireEvent.change(screen.getByLabelText(/Dataset Slug ID/i), { target: { value: "test-study" } });
    fireEvent.change(screen.getByLabelText(/Formal Dataset Name/i), { target: { value: "Human Blood Samples" } });
    fireEvent.change(screen.getByLabelText(/Contributing Institution/i), { target: { value: "Test Institute" } });
    fireEvent.click(screen.getByRole("button", { name: /Proceed to Taxonomy & Safety/i }));

    // In Step 2, enter Taxon 9606
    const taxonInput = screen.getByLabelText(/NCBI Taxonomy ID/i);
    const taxonNameInput = screen.getByLabelText(/Scientific Name/i);

    fireEvent.change(taxonInput, { target: { value: "9606" } });
    fireEvent.change(taxonNameInput, { target: { value: "Homo sapiens" } });

    // Expect violation banner to be displayed
    expect(screen.getByRole("alert")).toBeDefined();
    expect(screen.getByText(/Prohibited Taxon Invariant Triggered!/i)).toBeDefined();
    expect(screen.getByText(/Human genomic data .* is strictly prohibited/i)).toBeDefined();

    // Next button must be disabled
    const continueBtn = screen.getByRole("button", { name: /Continue to Sovereign Specs/i }) as HTMLButtonElement;
    expect(continueBtn.disabled).toBe(true);
  });

  it("allows non-human pathogen taxon and generates CLI push command in Step 4", () => {
    render(<SubmitDatasetPage />);

    // Step 1
    fireEvent.change(screen.getByLabelText(/Namespace Identifier/i), { target: { value: "inrb-kinshasa" } });
    fireEvent.change(screen.getByLabelText(/Dataset Slug ID/i), { target: { value: "ebola-drc-2026" } });
    fireEvent.change(screen.getByLabelText(/Formal Dataset Name/i), { target: { value: "Ebola Virus Outbreak" } });
    fireEvent.change(screen.getByLabelText(/Contributing Institution/i), { target: { value: "INRB Kinshasa" } });
    fireEvent.click(screen.getByRole("button", { name: /Proceed to Taxonomy & Safety/i }));

    // Step 2
    fireEvent.change(screen.getByLabelText(/NCBI Taxonomy ID/i), { target: { value: "186538" } });
    fireEvent.change(screen.getByLabelText(/Scientific Name/i), { target: { value: "Zaire ebolavirus" } });
    expect(screen.getByText(/Verified: Non-Human Organism/i)).toBeDefined();

    const continueBtn = screen.getByRole("button", { name: /Continue to Sovereign Specs/i }) as HTMLButtonElement;
    expect(continueBtn.disabled).toBe(false);
    fireEvent.click(continueBtn);

    // Step 3
    expect(screen.getByText(/Step 3: Sovereign Provenance & MIxS Specifications/i)).toBeDefined();
    const nagoyaCheckbox = screen.getByRole("checkbox");
    fireEvent.click(nagoyaCheckbox);

    const step3NextBtn = screen.getByRole("button", { name: /Review & Generate Ingest Command/i }) as HTMLButtonElement;
    expect(step3NextBtn.disabled).toBe(false);
    fireEvent.click(step3NextBtn);

    // Step 4
    expect(screen.getByText(/Step 4: Dataset Manifest & UbuntuBio CLI Push/i)).toBeDefined();
    expect(screen.getByText(/ubio push inrb-kinshasa\/ebola-drc-2026/i)).toBeDefined();
  });
});
