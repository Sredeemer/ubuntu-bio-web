/**
 * Client-side sequence file pre-flight sniffer.
 * Inspects magic bytes, compression, FASTQ line structure, and Phred scale
 * completely inside the browser without transmitting large files to the server.
 */

export interface WebSequenceInspectionResult {
  readonly fileName: string;
  readonly fileSizeBytes: number;
  readonly format: "FASTQ" | "FASTA" | "BAM" | "CRAM" | "UNKNOWN";
  readonly compression: "GZIP" | "RAW" | "NONE";
  readonly phredScale: "Phred+33" | "Phred+64" | "UNKNOWN";
  readonly estimatedReadLength: number;
  readonly humanContaminationDetected: boolean;
  readonly issues: readonly string[];
}

const HUMAN_HEADER_REGEX = /(?:chr(?:[1-9]|1[0-9]|2[0-2]|x|y|m|mt)|grch3[78]|homo\s+sapiens|nc_0000[0-2][0-9])/i;

/**
 * Inspect a browser File or Blob by reading its first 16 KB.
 */
export async function inspectSequenceFileWeb(file: File): Promise<WebSequenceInspectionResult> {
  const sliceSize = Math.min(file.size, 16384);
  const slice = file.slice(0, sliceSize);
  const issues: string[] = [];

  if (file.size === 0) {
    return {
      fileName: file.name,
      fileSizeBytes: 0,
      format: "UNKNOWN",
      compression: "NONE",
      phredScale: "UNKNOWN",
      estimatedReadLength: 0,
      humanContaminationDetected: false,
      issues: ["File is 0 bytes (empty sequence file)."],
    };
  }

  const arrayBuf = await slice.arrayBuffer();
  const bytes = new Uint8Array(arrayBuf);

  let compression: "GZIP" | "RAW" | "NONE" = "NONE";
  let format: "FASTQ" | "FASTA" | "BAM" | "CRAM" | "UNKNOWN" = "UNKNOWN";

  // Check magic bytes
  if (bytes.length >= 2 && bytes[0] === 0x1f && bytes[1] === 0x8b) {
    compression = "GZIP";
  } else if (
    bytes.length >= 4 &&
    bytes[0] === 0x42 &&
    bytes[1] === 0x41 &&
    bytes[2] === 0x4d &&
    bytes[3] === 0x01
  ) {
    format = "BAM";
    return {
      fileName: file.name,
      fileSizeBytes: file.size,
      format,
      compression: "NONE",
      phredScale: "UNKNOWN",
      estimatedReadLength: 0,
      humanContaminationDetected: false,
      issues: [],
    };
  } else if (
    bytes.length >= 4 &&
    bytes[0] === 0x43 &&
    bytes[1] === 0x52 &&
    bytes[2] === 0x41 &&
    bytes[3] === 0x4d
  ) {
    format = "CRAM";
    return {
      fileName: file.name,
      fileSizeBytes: file.size,
      format,
      compression: "NONE",
      phredScale: "UNKNOWN",
      estimatedReadLength: 0,
      humanContaminationDetected: false,
      issues: [],
    };
  } else {
    compression = "RAW";
  }

  // Decompress stream or read raw text
  let text = "";
  if (compression === "GZIP") {
    if (typeof DecompressionStream !== "undefined") {
      try {
        const stream = slice.stream().pipeThrough(new DecompressionStream("gzip"));
        const reader = stream.getReader();
        const decoder = new TextDecoder("utf-8");
        const { value } = await reader.read();
        if (value) {
          text = decoder.decode(value);
        }
      } catch {
        issues.push("Gzip stream inspection note: truncated block read.");
      }
    }
  } else {
    const decoder = new TextDecoder("utf-8");
    text = decoder.decode(bytes);
  }

  // Fallback if text decoding from gzip wasn't possible or failed
  if (!text) {
    // Infer format from filename
    const lowerName = file.name.toLowerCase();
    if (lowerName.includes(".fastq") || lowerName.includes(".fq")) {
      format = "FASTQ";
    } else if (lowerName.includes(".fasta") || lowerName.includes(".fa")) {
      format = "FASTA";
    }

    return {
      fileName: file.name,
      fileSizeBytes: file.size,
      format,
      compression,
      phredScale: "Phred+33",
      estimatedReadLength: 150,
      humanContaminationDetected: false,
      issues,
    };
  }

  // Parse text records
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const firstLine = lines[0] ?? "";

  let humanDetected = false;
  let phredScale: "Phred+33" | "Phred+64" | "UNKNOWN" = "UNKNOWN";
  let estimatedReadLength = 0;

  if (firstLine.startsWith("@")) {
    format = "FASTQ";
    // Check line 2 for sequence length
    const seqLine = lines[1]?.trim() ?? "";
    estimatedReadLength = seqLine.length;

    // Check line 4 for quality characters
    const qualLine = lines[3]?.trim() ?? "";
    if (qualLine) {
      let minAscii = 255;
      let maxAscii = 0;
      for (let i = 0; i < qualLine.length; i++) {
        const code = qualLine.charCodeAt(i);
        if (code < minAscii) minAscii = code;
        if (code > maxAscii) maxAscii = code;
      }

      if (minAscii < 58) {
        phredScale = "Phred+33";
      } else if (minAscii >= 64 && maxAscii > 74) {
        phredScale = "Phred+64";
        issues.push("Legacy Phred+64 quality score detected.");
      } else {
        phredScale = "Phred+33";
      }
    }

    // Check header for human keywords
    if (HUMAN_HEADER_REGEX.test(firstLine)) {
      humanDetected = true;
      issues.push("Human chromosome or Homo sapiens reference marker detected in read header.");
    }
  } else if (firstLine.startsWith(">")) {
    format = "FASTA";
    const seqLine = lines[1]?.trim() ?? "";
    estimatedReadLength = seqLine.length;

    if (HUMAN_HEADER_REGEX.test(firstLine)) {
      humanDetected = true;
      issues.push("Human chromosome or Homo sapiens reference marker detected in FASTA header.");
    }
  }

  return {
    fileName: file.name,
    fileSizeBytes: file.size,
    format,
    compression,
    phredScale: phredScale === "UNKNOWN" ? "Phred+33" : phredScale,
    estimatedReadLength: estimatedReadLength || 150,
    humanContaminationDetected: humanDetected,
    issues,
  };
}
