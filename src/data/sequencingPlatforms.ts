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
  { id: "GENOMIC", label: "GENOMIC (Bacterial / Parasite / Vector Genomic DNA)" },
  { id: "METAGENOMIC", label: "METAGENOMIC (Host Swab / Environmental Pool)" },
  { id: "TRANSCRIPTOMIC", label: "TRANSCRIPTOMIC (Host & Pathogen Expression)" },
] as const;

export const LIBRARY_SELECTIONS = [
  { id: "RANDOM", label: "RANDOM (Shotgun Tagmentation / Random Priming)" },
  { id: "PCR", label: "PCR (Target Multiplex Amplification - e.g. ARTIC)" },
  { id: "POLYA", label: "POLYA (PolyA Oligo-dT Selection for mRNA)" },
  { id: "SIZE_FRACTIONATION", label: "SIZE_FRACTIONATION (Size-Selected Native DNA)" },
  { id: "OTHER", label: "OTHER (Direct PCR-Free / Bait Capture / Hybrid)" },
] as const;

export const BIOSAFETY_LEVELS = [
  { id: "BSL-1", label: "BSL-1 (Minimal Hazard / Benign)" },
  { id: "BSL-2", label: "BSL-2 (Moderate Hazard / Bloodborne)" },
  { id: "BSL-3", label: "BSL-3 (High Risk Aerosols - TB, Mpox)" },
  { id: "BSL-4", label: "BSL-4 (Maximum Biohazard / VHF)" },
] as const;

export type PlatformId = (typeof SEQUENCING_PLATFORMS)[number]["id"];
export type StrategyId = (typeof LIBRARY_STRATEGIES)[number]["id"];
export type SelectionId = (typeof LIBRARY_SELECTIONS)[number]["id"];
export type SourceId = (typeof LIBRARY_SOURCES)[number]["id"];

/**
 * Returns allowed library layouts for a sequencing platform.
 * Long-read platforms (ONT, PacBio) and semiconductor (Ion Torrent) generate
 * single continuous reads; Illumina and MGI support paired-end and single-end.
 */
export function getValidLayoutsForPlatform(platformId: PlatformId): ("PAIRED" | "SINGLE")[] {
  if (platformId === "OXFORD_NANOPORE" || platformId === "PACBIO" || platformId === "ION_TORRENT") {
    return ["SINGLE"];
  }
  return ["PAIRED", "SINGLE"];
}

/**
 * Returns allowed library selection methods for a given strategy.
 * Prevents metadata contradictions like WGS + PCR (which should be AMPLICON).
 */
export function getValidSelectionsForStrategy(strategyId: StrategyId): SelectionId[] {
  switch (strategyId) {
    case "WGS":
      return ["RANDOM", "SIZE_FRACTIONATION", "OTHER"];
    case "AMPLICON":
      return ["PCR"];
    case "RNA-SEQ":
      return ["POLYA", "RANDOM", "OTHER"];
    case "TARGETED-CAPTURE":
      return ["OTHER", "RANDOM"];
    case "METAGENOMIC":
      return ["RANDOM", "SIZE_FRACTIONATION", "OTHER"];
    default:
      return ["RANDOM", "OTHER"];
  }
}

/**
 * Returns allowed library sources based on pathogen domain and sequencing strategy.
 * Restricts VIRAL_RNA to viral pathogens and enforces RNA sources for RNA-Seq.
 */
export function getValidSourcesForPathogenAndStrategy(
  pathogenType: "Virus" | "Bacteria" | "Parasite" | "Vector" | "Fungus",
  strategyId: StrategyId
): SourceId[] {
  if (strategyId === "RNA-SEQ") {
    return ["TRANSCRIPTOMIC", "VIRAL_RNA"];
  }
  if (pathogenType === "Virus") {
    return ["VIRAL_RNA", "GENOMIC", "METAGENOMIC"];
  }
  // Bacteria, Parasite, Vector, Fungus genomes are dsDNA
  return ["GENOMIC", "METAGENOMIC", "TRANSCRIPTOMIC"];
}

/**
 * Checks if a taxon is a known Viral Hemorrhagic Fever / BSL-4 pathogen.
 */
export function isBSL4Pathogen(taxonId: number, taxonName: string): boolean {
  const bsl4Taxa = new Set([
    11620,   // Lassa mammarenavirus
    186538,  // Zaire ebolavirus
    186540,  // Sudan ebolavirus
    186539,  // Reston ebolavirus
    186541,  // Tai Forest ebolavirus
    186542,  // Bundibugyo ebolavirus
    11269,   // Marburg virus
    1980519, // Crimean-Congo hemorrhagic fever orthonairovirus
  ]);

  if (bsl4Taxa.has(taxonId)) return true;
  const lower = taxonName.toLowerCase();
  return (
    lower.includes("lassa") ||
    lower.includes("ebola") ||
    lower.includes("marburg") ||
    lower.includes("crimean-congo") ||
    lower.includes("cchf")
  );
}
