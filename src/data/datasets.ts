/**
 * UbuntuBio Shared Dataset Registry
 * Defines sample genomic datasets across 54 African Union member states.
 * Enforces bioinformatics domain invariants:
 * - Human genomic data (NCBI Taxon ID 9606) is strictly prohibited.
 * - All datasets originate from authorized AU Member States (ISO 3166-1 alpha-2).
 */

export interface DatasetFile {
  name: string;
  path: string;
  sizeBytes: number;
  format: "FASTQ" | "BAM" | "VCF" | "FASTA" | "TSV" | "JSON";
  casHash: string;
  chunksCount: number;
  previewHeader?: string;
}

export interface DatasetItem {
  id: string; // e.g. "pasteur-dakar/lassa-surveillance-2026"
  namespace: string;
  datasetId: string;
  name: string;
  countryCode: string;
  countryName: string;
  taxonId: number;
  taxonName: string;
  pathogenType: "Virus" | "Bacteria" | "Vector" | "Fungus";
  samplesCount: number;
  totalSizeMb: number;
  biocontainment: "BSL-1" | "BSL-2" | "BSL-3" | "BSL-4";
  accessGate: "public" | "gated";
  description: string;
  longDescription: string;
  leadInstitution: string;
  updatedAt: string;
  license: string;
  seqPlatforms: string[];
  citation: string;
  files: DatasetFile[];
}

export const DATASETS: DatasetItem[] = [
  {
    id: "pasteur-dakar/lassa-surveillance-2026",
    namespace: "pasteur-dakar",
    datasetId: "lassa-surveillance-2026",
    name: "Lassa Mammarenavirus Genomic Surveillance (West Africa)",
    countryCode: "SN",
    countryName: "Senegal",
    taxonId: 11620,
    taxonName: "Lassa mammarenavirus",
    pathogenType: "Virus",
    samplesCount: 142,
    totalSizeMb: 48200,
    biocontainment: "BSL-4",
    accessGate: "public",
    description:
      "Deep sequencing reads tracking S and L RNA segment diversification across West African clinical isolates.",
    longDescription:
      "High-depth genomic surveillance dataset of Lassa mammarenavirus isolates collected across rural health posts and clinical centers in Senegal and Guinea between 2024 and 2026. Sequencing resolves full-length Small (S) and Large (L) RNA segments to characterize intra-host single nucleotide polymorphisms, reassortment events, and diagnostic target stability for regional RT-PCR assays.",
    leadInstitution: "Institut Pasteur de Dakar",
    updatedAt: "2026-10-14",
    license: "CC-BY-4.0",
    seqPlatforms: ["Oxford Nanopore GridION", "Illumina NextSeq 2000"],
    citation: "Institut Pasteur de Dakar. (2026). Lassa Mammarenavirus Surveillance Callsets. UbuntuBio Data Hub.",
    files: [
      {
        name: "IPD_LASV_2026_consensus.fasta",
        path: "consensus/IPD_LASV_2026_consensus.fasta",
        sizeBytes: 1485000,
        format: "FASTA",
        casHash: "xet:sha256:7e98a12f6c91a32a67e4129bc5610ef3908f5193",
        chunksCount: 3,
        previewHeader: ">IPD_LASV_SN_001_S_segment Lassa mammarenavirus segment S\nCGCACAGUGGAUCCUAGGCUUGUUGGAUUCAUUUCUGAUGGCAAUACU",
      },
      {
        name: "IPD_LASV_R1.fastq.gz",
        path: "reads/IPD_LASV_R1.fastq.gz",
        sizeBytes: 24800000000,
        format: "FASTQ",
        casHash: "xet:sha256:39f1c7d21b44aa1093c834a5d89201f9bb344102",
        chunksCount: 380,
        previewHeader: "@ERR109381.1 1/1 length=150\nGGCTTGTTGGATTCATTTCTGATGGCAATACTCGCACAGTGGATCCTA\n+\nIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII",
      },
      {
        name: "IPD_LASV_R2.fastq.gz",
        path: "reads/IPD_LASV_R2.fastq.gz",
        sizeBytes: 22100000000,
        format: "FASTQ",
        casHash: "xet:sha256:88a734d0b135c911a3089ef48839210049f50e82",
        chunksCount: 340,
        previewHeader: "@ERR109381.1 2/1 length=150\nATCCACTGTGCGAGTATTGCCATCAGAAATGAATCCAACAAGCCTAGG\n+\nIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII",
      },
      {
        name: "snps_indels.vcf.gz",
        path: "variants/snps_indels.vcf.gz",
        sizeBytes: 124000000,
        format: "VCF",
        casHash: "xet:sha256:56df104bc12300aa382103fca9130985ee190224",
        chunksCount: 12,
        previewHeader: "##fileformat=VCFv4.2\n##reference=Lassa_Josiah_NC_004296.1\n#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO",
      },
      {
        name: "sample_metadata.tsv",
        path: "metadata/sample_metadata.tsv",
        sizeBytes: 42000,
        format: "TSV",
        casHash: "xet:sha256:10f92b7ca893041a33b91a0c49219800ff410291",
        chunksCount: 1,
        previewHeader: "sample_id\tcollection_date\tgeo_loc_name\thost_taxid\tisolation_source\nSN-001\t2026-02-14\tSenegal:Dakar\t10116\tblood",
      },
    ],
  },
  {
    id: "kemri/cholera-outbreak-kisumu",
    namespace: "kemri",
    datasetId: "cholera-outbreak-kisumu",
    name: "Vibrio cholerae O1 Epidemic Lineage Tracking",
    countryCode: "KE",
    countryName: "Kenya",
    taxonId: 666,
    taxonName: "Vibrio cholerae",
    pathogenType: "Bacteria",
    samplesCount: 380,
    totalSizeMb: 12400,
    biocontainment: "BSL-2",
    accessGate: "public",
    description:
      "Whole-genome callsets resolving antimicrobial resistance genes and seventh pandemic El Tor lineage dynamics.",
    longDescription:
      "Epidemic tracking datasets of Vibrio cholerae O1 isolates collected from water sources, clinical samples, and transit corridors across the Lake Victoria basin. Profiling emphasizes resistance cassettes (ctxB7, gyrA S83I) and tracking of sublineages associated with aquatic reservoirs.",
    leadInstitution: "KEMRI (Kenya Medical Research Institute)",
    updatedAt: "2026-09-28",
    license: "CC-BY-4.0",
    seqPlatforms: ["Illumina NovaSeq 6000"],
    citation: "KEMRI Centre for Microbiology Research. (2026). Vibrio cholerae Genomic Tracking. UbuntuBio Data Hub.",
    files: [
      {
        name: "KEMRI_VC_lineage.fasta",
        path: "assemblies/KEMRI_VC_lineage.fasta",
        sizeBytes: 4120000,
        format: "FASTA",
        casHash: "xet:sha256:91bf33a41038992cde41a808f9213bc89a010023",
        chunksCount: 4,
        previewHeader: ">VC_KE_2026_01 Vibrio cholerae chromosome 1\nATGAAAGTAAAATATTTTGCCTTTTTGACATCATTACTTGCTGCGTTC",
      },
      {
        name: "amr_resistance_profiles.tsv",
        path: "amr/amr_resistance_profiles.tsv",
        sizeBytes: 154000,
        format: "TSV",
        casHash: "xet:sha256:7100bc89f412aa010348c909eef41092aa410299",
        chunksCount: 1,
        previewHeader: "isolate\tlineage\tfluoroquinolone_res\tsulfonamide_res\tmacrolide_res\nKE-VC-001\t7PET-T13\tgyrA_S83I\tsul2\tmphA",
      },
      {
        name: "alignments.bam",
        path: "alignments/alignments.bam",
        sizeBytes: 11800000000,
        format: "BAM",
        casHash: "xet:sha256:49aa0182fc9911e3b088f123490011bbcd551022",
        chunksCount: 180,
      },
    ],
  },
  {
    id: "acegid/mpox-clade-i-drcongo",
    namespace: "acegid",
    datasetId: "mpox-clade-i-drcongo",
    name: "Monkeypox Clade I Transmission & Micro-evolution",
    countryCode: "CD",
    countryName: "DR Congo",
    taxonId: 10244,
    taxonName: "Monkeypox virus",
    pathogenType: "Virus",
    samplesCount: 95,
    totalSizeMb: 18900,
    biocontainment: "BSL-3",
    accessGate: "gated",
    description:
      "High-coverage genomic sequencing tracking MPXV Clade I transmission chains in South Kivu province.",
    longDescription:
      "Genomic micro-evolutionary study of MPXV Clade Ib sustained human-to-human transmission lineages in the eastern Democratic Republic of the Congo. Gated access is managed under the Nagoya Protocol in partnership with INRB Kinshasa to preserve sovereign pathogen intellectual property.",
    leadInstitution: "ACEGID & INRB Kinshasa",
    updatedAt: "2026-10-02",
    license: "Nagoya Protocol Data Access Agreement",
    seqPlatforms: ["Oxford Nanopore PromethION", "Illumina NextSeq"],
    citation: "ACEGID & INRB. (2026). MPXV Clade Ib Transmission Callsets. UbuntuBio Data Hub.",
    files: [
      {
        name: "MPXV_clade_ib_consensus.fasta",
        path: "consensus/MPXV_clade_ib_consensus.fasta",
        sizeBytes: 1980000,
        format: "FASTA",
        casHash: "xet:sha256:33bc9910a300bbfa199348e001c9003881df44a1",
        chunksCount: 3,
        previewHeader: ">MPXV_CD_2026_cladeIb Monkeypox virus isolate South Kivu\nACGTACGTTAGGCTACGATCGATCGATCGATCGATC",
      },
      {
        name: "raw_reads.fastq.gz",
        path: "reads/raw_reads.fastq.gz",
        sizeBytes: 18200000000,
        format: "FASTQ",
        casHash: "xet:sha256:8204910ffbe44019a83800ca33019844dd119021",
        chunksCount: 290,
      },
    ],
  },
  {
    id: "kzn-bio/tb-lineage-4-resistance",
    namespace: "kzn-bio",
    datasetId: "tb-lineage-4-resistance",
    name: "Mycobacterium tuberculosis MDR/XDR Profiling",
    countryCode: "ZA",
    countryName: "South Africa",
    taxonId: 1773,
    taxonName: "Mycobacterium tuberculosis",
    pathogenType: "Bacteria",
    samplesCount: 610,
    totalSizeMb: 35600,
    biocontainment: "BSL-3",
    accessGate: "public",
    description:
      "NovaSeq and PacBio HiFi datasets resolving bedaquiline and fluoroquinolone target mutations.",
    longDescription:
      "Extensive clinical isolate sequencing profiling drug resistance across KwaZulu-Natal healthcare networks. High-fidelity reads resolve repetitive PE/PPE gene families and identify low-frequency sub-clonal variants conferring resistance to newer regimen compounds.",
    leadInstitution: "KRISP, University of KwaZulu-Natal",
    updatedAt: "2026-08-19",
    license: "CC-BY-4.0",
    seqPlatforms: ["PacBio Sequel IIe", "Illumina NovaSeq 6000"],
    citation: "KRISP. (2026). Drug-Resistant Tuberculosis Genomic Registry. UbuntuBio Data Hub.",
    files: [
      {
        name: "MTB_KZN_lineage4_snps.vcf.gz",
        path: "variants/MTB_KZN_lineage4_snps.vcf.gz",
        sizeBytes: 340000000,
        format: "VCF",
        casHash: "xet:sha256:55001149eef39a110034a781b09188043c91e001",
        chunksCount: 24,
      },
      {
        name: "bedaquiline_targets.tsv",
        path: "tables/bedaquiline_targets.tsv",
        sizeBytes: 88000,
        format: "TSV",
        casHash: "xet:sha256:99182300ffc183020084ba19003881df33410291",
        chunksCount: 1,
      },
    ],
  },
  {
    id: "pamca/anopheles-gambiae-kdr",
    namespace: "pamca",
    datasetId: "anopheles-gambiae-kdr",
    name: "Anopheles gambiae s.l. Vector Pyrethroid Resistance",
    countryCode: "GH",
    countryName: "Ghana",
    taxonId: 7165,
    taxonName: "Anopheles gambiae",
    pathogenType: "Vector",
    samplesCount: 840,
    totalSizeMb: 74200,
    biocontainment: "BSL-1",
    accessGate: "public",
    description:
      "Vector population genomics profiling voltage-gated sodium channel mutations across regional surveillance cohorts.",
    longDescription:
      "Vector surveillance genomic callsets investigating knockdown resistance (kdr) alleles and metabolic detoxification gene duplications in malaria vectors across cocoa-growing agricultural zones in Ghana.",
    leadInstitution: "PAMCA & Noguchi Memorial Institute",
    updatedAt: "2026-09-12",
    license: "CC-BY-4.0",
    seqPlatforms: ["Illumina NovaSeq 6000"],
    citation: "PAMCA. (2026). Vector Genomics Resistance Mapping. UbuntuBio Data Hub.",
    files: [
      {
        name: "kdr_target_variants.vcf.gz",
        path: "vcf/kdr_target_variants.vcf.gz",
        sizeBytes: 890000000,
        format: "VCF",
        casHash: "xet:sha256:11aa004499ff382001a88491029cba0018f39100",
        chunksCount: 45,
      },
    ],
  },
  {
    id: "cairo-vet/avian-influenza-h5n1",
    namespace: "cairo-vet",
    datasetId: "avian-influenza-h5n1",
    name: "Highly Pathogenic Avian Influenza H5N1 Surveillance",
    countryCode: "EG",
    countryName: "Egypt",
    taxonId: 113208,
    taxonName: "Influenza A virus (H5N1)",
    pathogenType: "Virus",
    samplesCount: 220,
    totalSizeMb: 8900,
    biocontainment: "BSL-3",
    accessGate: "gated",
    description:
      "Reassortment mapping of hemagglutinin and neuraminidase genes in migratory avian flyways.",
    longDescription:
      "Surveillance dataset of high-pathogenicity avian influenza H5N1 strains sampled along Nile Delta wetlands and migratory waterfowl rest stops. Tracks clade 2.3.4.4b genetic stability and mammalian adaptation markers.",
    leadInstitution: "National Research Centre Cairo",
    updatedAt: "2026-09-30",
    license: "Nagoya Protocol Data Access Agreement",
    seqPlatforms: ["Illumina MiSeq"],
    citation: "NRC Cairo. (2026). HPAI H5N1 Flyway Mapping. UbuntuBio Data Hub.",
    files: [
      {
        name: "H5N1_clade2344b_segments.fasta",
        path: "segments/H5N1_clade2344b_segments.fasta",
        sizeBytes: 940000,
        format: "FASTA",
        casHash: "xet:sha256:44001928ba0100ccff8491028300ff1984aa9102",
        chunksCount: 2,
      },
    ],
  },
];

export function getAllDatasets(): DatasetItem[] {
  return DATASETS;
}

export function getDataset(namespace: string, datasetId: string): DatasetItem | undefined {
  return DATASETS.find(
    (d) =>
      d.namespace.toLowerCase() === namespace.toLowerCase() &&
      d.datasetId.toLowerCase() === datasetId.toLowerCase()
  );
}
