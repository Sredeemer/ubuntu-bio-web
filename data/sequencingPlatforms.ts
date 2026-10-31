/**
 * Sequencing platforms, instrument models, and library metadata vocabularies.
 * Conforms to NCBI SRA / ENA specifications and UbuntuBio sequencing schema.
 */

export interface SequencingPlatformConfig {
  id: "ILLUMINA" | "OXFORD_NANOPORE" | "PACBIO" | "MGI" | "ION_TORRENT";
  name: string;
  defaultModel: string;
  instruments: string[];
}

export const SEQUENCING_PLATFORMS: readonly SequencingPlatformConfig[] = [
  {
    id: "ILLUMINA",
    name: "Illumina",
    defaultModel: "Illumina NovaSeq 6000",
    instruments: [
      "Illumina NovaSeq 6000",
      "Illumina NovaSeq X Plus",
      "Illumina NextSeq 2000",
      "Illumina NextSeq 550",
      "Illumina MiSeq",
      "Illumina iSeq 100",
      "Illumina HiSeq 4000",
    ],
  },
  {
    id: "OXFORD_NANOPORE",
    name: "Oxford Nanopore Technologies",
    defaultModel: "Oxford Nanopore GridION",
    instruments: [
      "Oxford Nanopore GridION",
      "Oxford Nanopore PromethION 24",
      "Oxford Nanopore PromethION 48",
      "Oxford Nanopore MinION Mk1B",
      "Oxford Nanopore MinION Mk1C",
    ],
  },
  {
    id: "PACBIO",
    name: "Pacific Biosciences (PacBio)",
    defaultModel: "PacBio Revio",
    instruments: [
      "PacBio Revio",
      "PacBio Sequel IIe",
      "PacBio Sequel II",
    ],
  },
  {
    id: "MGI",
    name: "MGI Tech",
    defaultModel: "MGI DNBSEQ-G400",
    instruments: [
      "MGI DNBSEQ-G400",
      "MGI DNBSEQ-T7",
      "MGI DNBSEQ-G99",
    ],
  },
  {
    id: "ION_TORRENT",
    name: "Ion Torrent",
    defaultModel: "Ion GeneStudio S5",
    instruments: [
      "Ion GeneStudio S5",
      "Ion Torrent Genexus",
    ],
  },
] as const;

export const LIBRARY_STRATEGIES = [
  { id: "WGS", label: "WGS (Whole Genome Sequencing)" },
  { id: "AMPLICON", label: "AMPLICON (Targeted Amplicon - e.g. ARTIC)" },
  { id: "TARGETED-CAPTURE", label: "TARGETED-CAPTURE (Hybrid Selection)" },
  { id: "RNA-SEQ", label: "RNA-SEQ (Transcriptome Sequencing)" },
  { id: "METAGENOMIC", label: "METAGENOMIC (Shotgun Community Metagenomics)" },
] as const;

export const LIBRARY_SOURCES = [
  { id: "VIRAL_RNA", label: "VIRAL RNA (Pathogen Viral Genome)" },
  { id: "GENOMIC", label: "GENOMIC (Bacterial / Vector Genomic DNA)" },
  { id: "METAGENOMIC", label: "METAGENOMIC (Host Swab / Environmental Pool)" },
  { id: "TRANSCRIPTOMIC", label: "TRANSCRIPTOMIC (Host & Pathogen Expression)" },
] as const;

export const LIBRARY_SELECTIONS = [
  { id: "PCR", label: "PCR (Target Multiplex Amplification)" },
  { id: "RANDOM", label: "RANDOM (Random Hexamers / Primer Sets)" },
  { id: "HYBRID_SELECTION", label: "HYBRID_SELECTION (Bait Capture Probes)" },
  { id: "UNSELECTED", label: "UNSELECTED (Direct Native Sequencing)" },
] as const;

export const BIOSAFETY_LEVELS = [
  { id: "BSL-1", label: "BSL-1 (Minimal Hazard / Benign Microbes)" },
  { id: "BSL-2", label: "BSL-2 (Moderate Hazard / Bloodborne Pathogens)" },
  { id: "BSL-3", label: "BSL-3 (High Risk Indigenous Aerosols - e.g. TB, Mpox)" },
  { id: "BSL-4", label: "BSL-4 (Maximum Biohazard / VHF - e.g. Lassa, Ebola, Marburg)" },
] as const;
