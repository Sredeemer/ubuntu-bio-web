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

    // Switch to remote cluster declaration mode or drop files
    const remoteModeBtn = screen.getByRole("tab", {
      name: /Remote Server \/ HPC Cluster Declaration/i,
    });
    fireEvent.click(remoteModeBtn);

    const step4NextBtn = screen.getByRole("button", {
      name: /Review & Ingest Dataset/i,
    }) as HTMLButtonElement;
    expect(step4NextBtn.disabled).toBe(false);
    fireEvent.click(step4NextBtn);

    // Step 5: Review, README.md & Ingest
    expect(screen.getByText(/Step 5: Review, README.md & UbuntuBio Push/i)).toBeDefined();
    expect(screen.getAllByText(/inrb-kinshasa\/ebola-drc-2026/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Generated README.md/i)).toBeDefined();
    expect(screen.getByText(/samples\.tsv/i)).toBeDefined();
    expect(screen.getAllByText(/Terminal CLI Push/i).length).toBeGreaterThan(0);
  });

  it("enforces compulsory sequence file selection in browser mode on Step 4", () => {
    render(<SubmitDatasetPage />);

    // Step 1
    fireEvent.change(screen.getByLabelText(/Namespace Identifier/i), { target: { value: "waccbip" } });
    fireEvent.change(screen.getByLabelText(/Dataset Slug ID/i), { target: { value: "cholera-accra" } });
    fireEvent.change(screen.getByLabelText(/Formal Dataset Name/i), { target: { value: "Cholera Surveillance" } });
    fireEvent.change(screen.getByLabelText(/Contributing Institution/i), { target: { value: "WACCBIP" } });
    fireEvent.click(screen.getByRole("button", { name: /Proceed to Taxonomy & Safety/i }));

    // Step 2
    fireEvent.change(screen.getByLabelText(/NCBI Taxonomy ID/i), { target: { value: "666" } });
    fireEvent.change(screen.getByLabelText(/Scientific Name/i), { target: { value: "Vibrio cholerae" } });
    fireEvent.click(screen.getByRole("button", { name: /Continue to Sequencing Specs/i }));

    // Step 3
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: /Continue to Runs & Sequence Files/i }));

    // Step 4: Browser mode is active by default with no files dropped
    expect(screen.getByText(/Sequence File Selection Required/i)).toBeDefined();
    const nextBtn = screen.getByRole("button", { name: /Review & Ingest Dataset/i }) as HTMLButtonElement;
    expect(nextBtn.disabled).toBe(true);

    // Switching to Remote Cluster mode enables the button
    const remoteBtn = screen.getByRole("tab", { name: /Remote Server \/ HPC Cluster Declaration/i });
    fireEvent.click(remoteBtn);
    expect(nextBtn.disabled).toBe(false);
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
    expect(screen.getAllByText(/dataset-slug/i).length).toBeGreaterThanOrEqual(1);

    // Vertical stepper in sidebar should render all 5 steps
    expect(screen.getByText(/Ingestion Progress/i)).toBeDefined();
    expect(screen.getByText(/Identification & Metadata/i)).toBeDefined();
    expect(screen.getByText(/Taxonomy & Human Exclusion/i)).toBeDefined();
    expect(screen.getByText(/Sequencing Specifications/i)).toBeDefined();
    expect(screen.getByText(/Runs & Sequence Files/i)).toBeDefined();
    expect(screen.getByText(/Review & Ingest Dataset/i)).toBeDefined();
  });

  it("Step 3 constraint: locks library layout to SINGLE and disables PAIRED when long-read platform is selected", () => {
    render(<SubmitDatasetPage />);

    // Advance to Step 3
    fireEvent.change(screen.getByLabelText(/Namespace Identifier/i), { target: { value: "acegid" } });
    fireEvent.change(screen.getByLabelText(/Dataset Slug ID/i), { target: { value: "surv-test" } });
    fireEvent.change(screen.getByLabelText(/Formal Dataset Name/i), { target: { value: "Surveillance Test" } });
    fireEvent.change(screen.getByLabelText(/Contributing Institution/i), { target: { value: "ACEGID" } });
    fireEvent.click(screen.getByRole("button", { name: /Proceed to Taxonomy & Safety/i }));

    fireEvent.change(screen.getByLabelText(/NCBI Taxonomy ID/i), { target: { value: "11620" } });
    fireEvent.change(screen.getByLabelText(/Scientific Name/i), { target: { value: "Lassa mammarenavirus" } });
    fireEvent.click(screen.getByRole("button", { name: /Continue to Sequencing Specs/i }));

    // By default Illumina allows PAIRED
    const platformSelect = screen.getByLabelText(/Sequencing Platform/i);
    const layoutSelect = screen.getByLabelText(/Library Layout/i) as HTMLSelectElement;
    expect(layoutSelect.disabled).toBe(false);

    // Switch to PacBio
    fireEvent.change(platformSelect, { target: { value: "PACBIO" } });
    expect(layoutSelect.value).toBe("SINGLE");
    expect(layoutSelect.disabled).toBe(true);

    // Switch to Oxford Nanopore
    fireEvent.change(platformSelect, { target: { value: "OXFORD_NANOPORE" } });
    expect(layoutSelect.value).toBe("SINGLE");
    expect(layoutSelect.disabled).toBe(true);

    // Switch back to Illumina
    fireEvent.change(platformSelect, { target: { value: "ILLUMINA" } });
    expect(layoutSelect.disabled).toBe(false);
  });

  it("Step 3 constraint: prevents WGS from selecting PCR, restricting selection to non-amplicon protocols", () => {
    render(<SubmitDatasetPage />);

    // Advance to Step 3
    fireEvent.change(screen.getByLabelText(/Namespace Identifier/i), { target: { value: "acegid" } });
    fireEvent.change(screen.getByLabelText(/Dataset Slug ID/i), { target: { value: "wgs-test" } });
    fireEvent.change(screen.getByLabelText(/Formal Dataset Name/i), { target: { value: "WGS Test" } });
    fireEvent.change(screen.getByLabelText(/Contributing Institution/i), { target: { value: "ACEGID" } });
    fireEvent.click(screen.getByRole("button", { name: /Proceed to Taxonomy & Safety/i }));

    fireEvent.change(screen.getByLabelText(/NCBI Taxonomy ID/i), { target: { value: "1773" } });
    fireEvent.change(screen.getByLabelText(/Scientific Name/i), { target: { value: "Mycobacterium tuberculosis" } });
    fireEvent.click(screen.getByRole("button", { name: /Continue to Sequencing Specs/i }));

    const strategySelect = screen.getByLabelText(/Library Strategy/i) as HTMLSelectElement;
    const selectionSelect = screen.getByLabelText(/Library Selection/i) as HTMLSelectElement;

    // Strategy is WGS by default -> PCR must NOT be an option
    expect(strategySelect.value).toBe("WGS");
    const optionValues = Array.from(selectionSelect.options).map((o) => o.value);
    expect(optionValues).not.toContain("PCR");
    expect(optionValues).toContain("RANDOM");

    // Switching to AMPLICON requires PCR
    fireEvent.change(strategySelect, { target: { value: "AMPLICON" } });
    expect(selectionSelect.value).toBe("PCR");
    const ampliconOptions = Array.from(selectionSelect.options).map((o) => o.value);
    expect(ampliconOptions).toEqual(["PCR"]);
  });

  it("Step 3 & Step 2: supports Parasite pathogen category, restricts VIRAL_RNA, and outputs parasite domain", () => {
    render(<SubmitDatasetPage />);

    // Step 1
    fireEvent.change(screen.getByLabelText(/Namespace Identifier/i), { target: { value: "acegid" } });
    fireEvent.change(screen.getByLabelText(/Dataset Slug ID/i), { target: { value: "pf-malaria-2026" } });
    fireEvent.change(screen.getByLabelText(/Formal Dataset Name/i), { target: { value: "Plasmodium falciparum Malaria Study" } });
    fireEvent.change(screen.getByLabelText(/Contributing Institution/i), { target: { value: "ACEGID" } });
    fireEvent.click(screen.getByRole("button", { name: /Proceed to Taxonomy & Safety/i }));

    // Step 2: Select Parasite category
    const pathogenCategorySelect = screen.getByLabelText(/Pathogen \/ Biological Category/i) as HTMLSelectElement;
    fireEvent.change(pathogenCategorySelect, { target: { value: "Parasite" } });
    expect(pathogenCategorySelect.value).toBe("Parasite");

    fireEvent.change(screen.getByLabelText(/NCBI Taxonomy ID/i), { target: { value: "5833" } });
    fireEvent.change(screen.getByLabelText(/Scientific Name/i), { target: { value: "Plasmodium falciparum" } });
    fireEvent.click(screen.getByRole("button", { name: /Continue to Sequencing Specs/i }));

    // Step 3: Library source must default to GENOMIC and exclude VIRAL_RNA for Parasite
    const sourceSelect = screen.getByLabelText(/Library Source/i) as HTMLSelectElement;
    expect(sourceSelect.value).toBe("GENOMIC");
    const sourceOptions = Array.from(sourceSelect.options).map((o) => o.value);
    expect(sourceOptions).not.toContain("VIRAL_RNA");

    // Agree to Nagoya and continue
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: /Continue to Runs & Sequence Files/i }));

    // Step 4: Remote cluster mode
    const remoteBtn = screen.getByRole("tab", { name: /Remote Server \/ HPC Cluster Declaration/i });
    fireEvent.click(remoteBtn);
    fireEvent.click(screen.getByRole("button", { name: /Review & Ingest Dataset/i }));

    // Step 5: Verify parasite domain in generated README and review card
    expect(screen.getByText(/domain: parasite/i)).toBeDefined();
    expect(screen.getAllByText(/Parasite/i).length).toBeGreaterThanOrEqual(1);
  });

  it("Step 3 biosafety: auto-selects BSL-4 and displays warning for VHF pathogens", () => {
    render(<SubmitDatasetPage />);

    // Advance to Step 2
    fireEvent.change(screen.getByLabelText(/Namespace Identifier/i), { target: { value: "inrb" } });
    fireEvent.change(screen.getByLabelText(/Dataset Slug ID/i), { target: { value: "ebola-vhf" } });
    fireEvent.change(screen.getByLabelText(/Formal Dataset Name/i), { target: { value: "Ebola Outbreak" } });
    fireEvent.change(screen.getByLabelText(/Contributing Institution/i), { target: { value: "INRB" } });
    fireEvent.click(screen.getByRole("button", { name: /Proceed to Taxonomy & Safety/i }));

    // Ebola virus
    fireEvent.change(screen.getByLabelText(/NCBI Taxonomy ID/i), { target: { value: "186538" } });
    fireEvent.change(screen.getByLabelText(/Scientific Name/i), { target: { value: "Zaire ebolavirus" } });
    fireEvent.click(screen.getByRole("button", { name: /Continue to Sequencing Specs/i }));

    // Step 3
    const bslSelect = screen.getByLabelText(/Biosafety Level/i) as HTMLSelectElement;
    expect(bslSelect.value).toBe("BSL-4");
    expect(screen.getByText(/Biosafety Notice:/i)).toBeDefined();
  });

  it("Step 1 batch surveillance workflow: switches to 3-step streamlined cohort ingestion", () => {
    render(<SubmitDatasetPage />);

    // In Step 1: Select Batch Surveillance Cohort track
    const batchCard = screen.getByRole("radio", { name: /Batch Surveillance Cohort/i });
    fireEvent.click(batchCard);

    // Verify stepper rail displays 3 steps
    expect(screen.getByText(/Step 1 of 3/i)).toBeDefined();
    expect(screen.getByText("Batch Matrix & Folder Drop")).toBeDefined();

    // Fill Step 1 Study & Sovereign Provenance
    fireEvent.change(screen.getByLabelText(/Namespace Identifier/i), { target: { value: "ceri" } });
    fireEvent.change(screen.getByLabelText(/Dataset Slug ID/i), { target: { value: "mpox-batch-2026" } });
    fireEvent.change(screen.getByLabelText(/Formal Dataset Name/i), { target: { value: "Mpox Surveillance Cohort" } });
    fireEvent.change(screen.getByLabelText(/Contributing Institution/i), { target: { value: "CERI" } });

    // Target Pathogen
    fireEvent.change(screen.getByLabelText(/NCBI Taxonomy ID/i), { target: { value: "10244" } });
    fireEvent.change(screen.getByLabelText(/Scientific Name/i), { target: { value: "Monkeypox virus" } });

    // AU Sovereign Nagoya Checkbox
    fireEvent.click(screen.getByRole("checkbox"));

    // Click Proceed to Batch Matrix & Folder Drop
    const proceedBtn = screen.getByRole("button", { name: /Proceed to Batch Matrix & Folder Drop/i });
    expect((proceedBtn as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(proceedBtn);

    // Verify user lands directly on Step 2 (Batch Matrix & Folder Drop)
    expect(screen.getByText(/Step 2: Batch Metadata Matrix & Folder Sequence Ingestion/i)).toBeDefined();
    expect(screen.getByText("Drag & Drop Local Sequencing Folder")).toBeDefined();
    expect(screen.getByText("TSV")).toBeDefined();
    expect(screen.getByText(/Fill Defaults/i)).toBeDefined();

    // Add a sample row in the table editor
    fireEvent.click(screen.getByText("Add Row"));
    expect(screen.getByDisplayValue("SAMPLE_001")).toBeDefined();
  });
});
