import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { SequenceDropzone } from "../SequenceDropzone";
import * as sniffer from "../../../lib/sequenceSnifferWeb";

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

  describe("inspected file card", () => {
    const base = {
      fileSizeBytes: 1024,
      format: "FASTQ" as const,
      compression: "GZIP" as const,
      phredScale: "Phred+33" as const,
      estimatedReadLength: 150,
      humanContaminationDetected: false,
      issues: [] as string[],
    };

    async function dropWith(result: Partial<typeof base> & { fileName: string }) {
      vi.spyOn(sniffer, "inspectSequenceFileWeb").mockResolvedValue({ ...base, ...result });
      render(<SequenceDropzone />);
      const input = screen.getByLabelText(/Drop sequence files for pre-flight validation/i);
      const file = new File(["@r\nACGT\n+\nIIII\n"], result.fileName, { type: "application/gzip" });
      fireEvent.change(input, { target: { files: [file] } });
      await waitFor(() => expect(screen.getByText(result.fileName)).toBeDefined());
    }

    it("labels the column 'Status' and the clean result 'Passed (Non-Human)'", async () => {
      await dropWith({ fileName: "clean_R1.fastq.gz" });
      expect(screen.getByRole("columnheader", { name: "Status" })).toBeDefined();
      expect(screen.queryByRole("columnheader", { name: "Safety Status" })).toBeNull();
      expect(screen.getByText("Passed (Non-Human)")).toBeDefined();
      expect(screen.queryByText(/Passed Pre-Flight/)).toBeNull();
    });

    it("keeps the human-marker and issue states distinct from the passed state", async () => {
      await dropWith({ fileName: "human.fastq.gz", humanContaminationDetected: true });
      expect(screen.getByText(/Human Marker Detected/)).toBeDefined();
      expect(screen.queryByText("Passed (Non-Human)")).toBeNull();
    });

    it("shows the first issue for files with warnings", async () => {
      await dropWith({ fileName: "odd.fastq.gz", issues: ["Unrecognised quality encoding"] });
      expect(screen.getByText(/Unrecognised quality encoding/)).toBeDefined();
      expect(screen.queryByText("Passed (Non-Human)")).toBeNull();
    });
  });
});
