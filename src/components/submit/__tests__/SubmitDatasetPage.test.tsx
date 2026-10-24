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

    const nextBtn = screen.getByRole("button", {
      name: /Proceed to Taxonomy & Safety/i,
    }) as HTMLButtonElement;
    expect(nextBtn.disabled).toBe(false);
    fireEvent.click(nextBtn);

    expect(
      screen.getByText(/Step 2: Taxonomy & Strict Human Exclusion Verification/i)
    ).toBeDefined();
  });

  it("CRITICAL INVARIANT: Blocks submission when NCBI Taxon ID 9606 (Homo sapiens) is entered", () => {
    render(<SubmitDatasetPage />);

    // Complete step 1
    fireEvent.change(screen.getByLabelText(/Namespace Identifier/i), {
      target: { value: "test-institute" },
    });
    fireEvent.change(screen.getByLabelText(/Dataset Slug ID/i), {
      target: { value: "test-study" },
    });
    fireEvent.change(screen.getByLabelText(/Formal Dataset Name/i), {
      target: { value: "Human Blood Samples" },
    });
    fireEvent.change(screen.getByLabelText(/Contributing Institution/i), {
      target: { value: "Test Institute" },
    });
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
    const continueBtn = screen.getByRole("button", {
      name: /Continue to Sequencing Specs/i,
    }) as HTMLButtonElement;
    expect(continueBtn.disabled).toBe(true);
  });

  it("allows non-human pathogen taxon and traverses all 5 steps to generate README.md and CLI push", () => {
    render(<SubmitDatasetPage />);

    // Step 1: Identification
    fireEvent.change(screen.getByLabelText(/Namespace Identifier/i), {
      target: { value: "inrb-kinshasa" },
    });
    fireEvent.change(screen.getByLabelText(/Dataset Slug ID/i), {
      target: { value: "ebola-drc-2026" },
    });
    fireEvent.change(screen.getByLabelText(/Formal Dataset Name/i), {
      target: { value: "Ebola Virus Outbreak" },
    });
    fireEvent.change(screen.getByLabelText(/Contributing Institution/i), {
      target: { value: "INRB Kinshasa" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Proceed to Taxonomy & Safety/i }));

    // Step 2: Taxonomy
    fireEvent.change(screen.getByLabelText(/NCBI Taxonomy ID/i), { target: { value: "186538" } });
    fireEvent.change(screen.getByLabelText(/Scientific Name/i), {
      target: { value: "Zaire ebolavirus" },
    });
    expect(screen.getByText(/Verified: Non-Human Organism/i)).toBeDefined();

    const step2NextBtn = screen.getByRole("button", {
      name: /Continue to Sequencing Specs/i,
    }) as HTMLButtonElement;
    expect(step2NextBtn.disabled).toBe(false);
    fireEvent.click(step2NextBtn);

    // Step 3: Sequencing Specs & Sovereign Provenance
    expect(screen.getByText(/Step 3: Sequencing Technology & Protocol Specs/i)).toBeDefined();
    const nagoyaCheckbox = screen.getByRole("checkbox");
    fireEvent.click(nagoyaCheckbox);

    const step3NextBtn = screen.getByRole("button", {
      name: /Continue to Runs & Sequence Files/i,
    }) as HTMLButtonElement;
    expect(step3NextBtn.disabled).toBe(false);
    fireEvent.click(step3NextBtn);

    // Step 4: Runs & Sequence Files
    expect(screen.getByText(/Step 4: Sequencing Runs & Sequence Files/i)).toBeDefined();
    expect(screen.getByText(/Run #1: RUN001/i)).toBeDefined();

    // Verify adding a second run
    const addRunBtn = screen.getByRole("button", { name: /Add Sequencing Run/i });
    fireEvent.click(addRunBtn);
    expect(screen.getByText(/Run #2: RUN002/i)).toBeDefined();

    const step4NextBtn = screen.getByRole("button", {
      name: /Review & Ingest Dataset/i,
    }) as HTMLButtonElement;
    expect(step4NextBtn.disabled).toBe(false);
    fireEvent.click(step4NextBtn);

    // Step 5: Review, README.md & Ingest
    expect(screen.getByText(/Step 5: Review, README.md & UbuntuBio Push/i)).toBeDefined();
    expect(screen.getAllByText(/inrb-kinshasa\/ebola-drc-2026/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Generated README.md/i)).toBeDefined();
    expect(screen.getAllByText(/Terminal CLI Push/i).length).toBeGreaterThan(0);
  });

  it("displays inline validation errors and blocks Step 2 when clicking Proceed with empty fields", () => {
    render(<SubmitDatasetPage />);

    // Click Proceed with empty form
    const proceedBtn = screen.getByRole("button", { name: /Proceed to Taxonomy & Safety/i });
    fireEvent.click(proceedBtn);

    // Verify inline errors appear
    expect(screen.getByText(/Namespace is required/i)).toBeDefined();
    expect(screen.getByText(/Dataset Slug ID is required/i)).toBeDefined();
    expect(screen.getByText(/Formal Dataset Name is required/i)).toBeDefined();
    expect(screen.getByText(/Contributing Institution is required/i)).toBeDefined();

    // Verify user remains on Step 1
    expect(screen.getByText(/Step 1: Dataset Namespace & Metadata/i)).toBeDefined();
    expect(screen.queryByText(/Step 2: Taxonomy & Strict Human Exclusion Verification/i)).toBeNull();
  });

  it("accepts short pathogen names (>= 3 chars) and short institution abbreviations (>= 2 chars)", () => {
    render(<SubmitDatasetPage />);

    fireEvent.change(screen.getByLabelText(/Namespace Identifier/i), {
      target: { value: "acegid" },
    });
    fireEvent.change(screen.getByLabelText(/Dataset Slug ID/i), {
      target: { value: "rsv-surv" },
    });
    // 3 characters name
    fireEvent.change(screen.getByLabelText(/Formal Dataset Name/i), {
      target: { value: "RSV" },
    });
    // 2 characters institution
    fireEvent.change(screen.getByLabelText(/Contributing Institution/i), {
      target: { value: "IP" },
    });

    const proceedBtn = screen.getByRole("button", { name: /Proceed to Taxonomy & Safety/i });
    fireEvent.click(proceedBtn);

    // Successfully advanced to Step 2
    expect(
      screen.getByText(/Step 2: Taxonomy & Strict Human Exclusion Verification/i)
    ).toBeDefined();
  });

  it("renders pending state badges on sidebar rail on Step 1", () => {
    render(<SubmitDatasetPage />);

    // Rail specs should show pending for steps not yet configured
    expect(screen.getByText(/Pending Step 2/i)).toBeDefined();
    expect(screen.getAllByText(/Pending Step 3/i).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/Pending Step 4/i)).toBeDefined();

    // Slug placeholder should appear when dataset ID is empty
    expect(screen.getByText(/your-dataset-slug/i)).toBeDefined();
  });
});
