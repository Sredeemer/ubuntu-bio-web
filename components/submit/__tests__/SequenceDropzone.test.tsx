import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { SequenceDropzone } from "../SequenceDropzone";

describe("SequenceDropzone", () => {
  it("renders dropzone container and input elements", () => {
    render(<SequenceDropzone />);
    expect(screen.getByText(/Drag & drop FASTQ, FASTA, or BAM files/i)).toBeDefined();
    expect(screen.getByLabelText(/Drop sequence files for pre-flight validation/i)).toBeDefined();
  });

  it("handles empty or missing files gracefully", () => {
    const onFiles = vi.fn();
    render(<SequenceDropzone onFilesInspected={onFiles} />);
    const input = screen.getByLabelText(/Drop sequence files for pre-flight validation/i);

    fireEvent.change(input, { target: { files: [] } });
    expect(onFiles).not.toHaveBeenCalled();
  });
});
