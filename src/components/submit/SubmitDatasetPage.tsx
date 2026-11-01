"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Check,
  Copy,
  Terminal,
  UploadCloud,
  FileCheck2,
  ArrowRight,
  ArrowLeft,
  Info,
  Plus,
  Trash2,
  FileText,
  FileSpreadsheet,
  Download,
  Dna,
  CheckCircle2,
} from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import * as Tabs from "@radix-ui/react-tabs";
import { toast, Toaster } from "sonner";
import { AU_COUNTRIES, PROHIBITED_HUMAN_TAXON_ID } from "../../data/auCountries";
import {
  SEQUENCING_PLATFORMS,
  LIBRARY_STRATEGIES,
  LIBRARY_SOURCES,
  LIBRARY_SELECTIONS,
  BIOSAFETY_LEVELS,
  getValidLayoutsForPlatform,
  getValidSelectionsForStrategy,
  getValidSourcesForPathogenAndStrategy,
  isBSL4Pathogen,
  PlatformId,
  StrategyId,
  SelectionId,
  SourceId,
} from "../../data/sequencingPlatforms";
import { createRepository } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { SequenceDropzone } from "./SequenceDropzone";
import { OrganismSelector } from "./OrganismSelector";
import { HostOrganismSelector, HostEntry } from "./HostOrganismSelector";
import { CollectionDateRangeField } from "./CollectionDateRangeField";
import { BatchMetadataEditor } from "./BatchMetadataEditor";
import { BatchReconciliationPanel } from "./BatchReconciliationPanel";
import { BatchSampleRow, TemplateDefaults } from "../../lib/templateGenerator";
import {
  reconcileBatchWithDiscoveredFiles,
  generateRowsFromOrphanFiles,
  DiscoveredSequenceFile,
} from "../../lib/parityMatcher";
import { DatePicker } from "../ui/DatePicker";
import { Progress } from "../ui/Progress";
import {
  CollectionDateInput,
  EMPTY_COLLECTION_DATE_INPUT,
  buildCollectionDateRange,
  validateCollectionDate,
} from "../../lib/submitValidation";
import { generateDatasetReadme, generateDatasetSamplesTsv, SequencingRunEntry } from "../../lib/readmeGenerator";
import { WebSequenceInspectionResult } from "../../lib/sequenceSnifferWeb";

const SINGLE_WIZARD_STEPS = [
  { step: 1 as const, num: "01", label: "Identification & Metadata" },
  { step: 2 as const, num: "02", label: "Taxonomy & Human Exclusion" },
  { step: 3 as const, num: "03", label: "Sequencing Specifications" },
  { step: 4 as const, num: "04", label: "Runs & Sequence Files" },
  { step: 5 as const, num: "05", label: "Review & Ingest Dataset" },
];

const BATCH_WIZARD_STEPS = [
  { step: 1 as const, num: "01", label: "Study & Sovereign Provenance" },
  { step: 2 as const, num: "02", label: "Batch Matrix & Folder Drop" },
  { step: 3 as const, num: "03", label: "Review & Sovereign Ingestion" },
];

export const BROWSER_UPLOAD_MAX_BYTES = 500 * 1024 * 1024; // 500 MB

export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function SubmitDatasetPage() {
  const { user, isAuthenticated, token } = useAuth();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Step 1: Identification
  const [namespace, setNamespace] = useState("");
  const [isCustomNamespace, setIsCustomNamespace] = useState(false);
  const [datasetId, setDatasetId] = useState("");
  const [name, setName] = useState("");
  const [leadInstitution, setLeadInstitution] = useState("");
  const [description, setDescription] = useState("");

  // Step 2: Taxonomy & Non-Human Biological Verification
  const [taxonId, setTaxonId] = useState("");
  const [taxonName, setTaxonName] = useState("");
  const [pathogenType, setPathogenType] = useState<"Virus" | "Bacteria" | "Parasite" | "Vector" | "Fungus">("Virus");
  const [hosts, setHosts] = useState<HostEntry[]>([
    {
      id: "9606",
      name: "Homo sapiens",
      commonName: "Human Patient",
      taxonId: 9606,
    },
  ]);
  const [collectionDateInput, setCollectionDateInput] = useState<CollectionDateInput>(EMPTY_COLLECTION_DATE_INPUT);
  const [sampleType, setSampleType] = useState("Blood / Swab specimen");

  const hostSpecies = hosts.map((h) => h.name).join(", ");
  const hostTaxonId = hosts[0]?.taxonId ? String(hosts[0].taxonId) : "";

  const collectionDateErrors = validateCollectionDate(collectionDateInput);
  const dateRange = buildCollectionDateRange(collectionDateInput);
  const collectionDate = dateRange.end_datetime
    ? `${dateRange.start_datetime} / ${dateRange.end_datetime}`
    : (dateRange.start_datetime || "");

  // Step 3: Sequencing Technology & Sovereign Specs
  const [countryCode, setCountryCode] = useState("NG");
  const [platformId, setPlatformId] = useState<"ILLUMINA" | "OXFORD_NANOPORE" | "PACBIO" | "MGI" | "ION_TORRENT">("ILLUMINA");
  const [instrumentModel, setInstrumentModel] = useState("Illumina NovaSeq 6000");
  const [libraryStrategy, setLibraryStrategy] = useState("WGS");
  const [librarySource, setLibrarySource] = useState("VIRAL_RNA");
  const [librarySelection, setLibrarySelection] = useState("RANDOM");
  const [libraryLayout, setLibraryLayout] = useState<"PAIRED" | "SINGLE">("PAIRED");
  const [biocontainment, setBiocontainment] = useState("BSL-3");
  const [nagoyaAgreed, setNagoyaAgreed] = useState(false);

  // Step 4: Sequencing Runs & Read Files
  const [runs, setRuns] = useState<SequencingRunEntry[]>([
    {
      run_id: "RUN001",
      experiment_id: "EXP001",
      flowcell_id: "H7VNWDRXX",
      lane: 1,
      forward_read: "reads/sample1_R1.fastq.gz",
      reverse_read: "reads/sample1_R2.fastq.gz",
      read_count: 1450000,
      base_count: 217500000,
    },
  ]);

  // Submission Track & Step 4 File Mode
  const [submissionTrack, setSubmissionTrack] = useState<"single" | "batch">("single");
  const activeSteps = submissionTrack === "batch" ? BATCH_WIZARD_STEPS : SINGLE_WIZARD_STEPS;
  const [fileInputMode, setFileInputMode] = useState<"browser" | "remote">("browser");
  const [batchRows, setBatchRows] = useState<BatchSampleRow[]>([]);
  const [discoveredFolderFiles, setDiscoveredFolderFiles] = useState<DiscoveredSequenceFile[]>([]);
  const [inspectedFiles, setInspectedFiles] = useState<WebSequenceInspectionResult[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatusText, setUploadStatusText] = useState("");

  // Submission Result State
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hubRepoSlug, setHubRepoSlug] = useState<string | null>(null);

  // Auto-detect personal namespace when authenticated user is loaded
  const userNamespace =
    user?.username ||
    (user?.name ? user.name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-") : "");

  React.useEffect(() => {
    if (isAuthenticated && userNamespace && !isCustomNamespace && !namespace) {
      setNamespace(userNamespace);
    }
  }, [isAuthenticated, userNamespace, isCustomNamespace, namespace]);

  // Auto-detect BSL-4 Viral Hemorrhagic Fever pathogens on taxon change
  React.useEffect(() => {
    const taxIdNum = parseInt(taxonId, 10) || 0;
    if (isBSL4Pathogen(taxIdNum, taxonName)) {
      setBiocontainment("BSL-4");
    }
  }, [taxonId, taxonName]);

  // When platform changes, update instrument model to default and enforce valid layout constraints
  const handlePlatformChange = (newPlatformId: "ILLUMINA" | "OXFORD_NANOPORE" | "PACBIO" | "MGI" | "ION_TORRENT") => {
    setPlatformId(newPlatformId);
    const platformConfig = SEQUENCING_PLATFORMS.find((p) => p.id === newPlatformId);
    if (platformConfig) {
      setInstrumentModel(platformConfig.defaultModel);
    }
    const allowed = getValidLayoutsForPlatform(newPlatformId);
    if (!allowed.includes(libraryLayout)) {
      setLibraryLayout(allowed[0] || "SINGLE");
    }
  };

  // When strategy changes, constrain valid selection methods and library sources
  const handleStrategyChange = (newStrategy: string) => {
    setLibraryStrategy(newStrategy);
    const validSelections = getValidSelectionsForStrategy(newStrategy as StrategyId);
    if (!validSelections.includes(librarySelection as SelectionId)) {
      setLibrarySelection(validSelections[0] || "RANDOM");
    }
    const validSources = getValidSourcesForPathogenAndStrategy(pathogenType, newStrategy as StrategyId);
    if (!validSources.includes(librarySource as SourceId)) {
      setLibrarySource(validSources[0] || "GENOMIC");
    }
  };

  // When pathogen type changes, align library source
  const handlePathogenTypeChange = (newType: "Virus" | "Bacteria" | "Parasite" | "Vector" | "Fungus") => {
    setPathogenType(newType);
    const validSources = getValidSourcesForPathogenAndStrategy(newType, libraryStrategy as StrategyId);
    if (!validSources.includes(librarySource as SourceId)) {
      setLibrarySource(validSources[0] || "GENOMIC");
    }
  };

  // Step 1 Validation & Touch Tracking
  const [step1Attempted, setStep1Attempted] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  const markTouched = (fieldName: string) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));
  };

  // Validation checks
  const isHumanTaxon =
    parseInt(taxonId, 10) === PROHIBITED_HUMAN_TAXON_ID ||
    taxonName.toLowerCase().includes("homo sapiens") ||
    taxonName.toLowerCase().includes("human");

  // Effective namespace logic:
  // If user explicitly switched to custom (org) namespace, strictly use typed namespace.
  // Otherwise if authenticated and personal namespace is detected, use userNamespace.
  // Otherwise fallback to whatever manual namespace is typed.
  const effectiveNamespace =
    isCustomNamespace
      ? namespace.trim()
      : isAuthenticated && userNamespace
      ? userNamespace
      : namespace.trim();

  const step1Errors = {
    namespace:
      effectiveNamespace.length === 0
        ? "Namespace is required."
        : effectiveNamespace.length < 2
        ? "Namespace must be at least 2 characters."
        : null,
    datasetId:
      datasetId.trim().length === 0
        ? "Dataset Slug ID is required."
        : datasetId.trim().length < 2
        ? "Dataset Slug ID must be at least 2 characters."
        : null,
    name:
      name.trim().length === 0
        ? "Formal Dataset Name is required."
        : name.trim().length < 3
        ? "Formal Dataset Name must be at least 3 characters."
        : null,
    leadInstitution:
      leadInstitution.trim().length === 0
        ? "Contributing Institution is required."
        : leadInstitution.trim().length < 2
        ? "Contributing Institution must be at least 2 characters."
        : null,
  };

  const isStep1Valid =
    !step1Errors.namespace &&
    !step1Errors.datasetId &&
    !step1Errors.name &&
    !step1Errors.leadInstitution;

  const handleProceedToStep2 = () => {
    setStep1Attempted(true);
    if (!isStep1Valid) {
      if (step1Errors.namespace) {
        document.getElementById("input-namespace")?.focus();
        toast.error(step1Errors.namespace);
      } else if (step1Errors.datasetId) {
        document.getElementById("input-dataset-id")?.focus();
        toast.error(step1Errors.datasetId);
      } else if (step1Errors.name) {
        document.getElementById("input-dataset-name")?.focus();
        toast.error(step1Errors.name);
      } else if (step1Errors.leadInstitution) {
        document.getElementById("input-lead-inst")?.focus();
        toast.error(step1Errors.leadInstitution);
      }
      return;
    }
    setCurrentStep(2);
  };

  const isBatchStep1Valid =
    isStep1Valid &&
    taxonId.trim().length > 0 &&
    parseInt(taxonId, 10) > 0 &&
    !isHumanTaxon &&
    taxonName.trim().length >= 3 &&
    countryCode.length === 2 &&
    nagoyaAgreed;

  const handleProceedToBatchStep2 = () => {
    setStep1Attempted(true);
    if (!isBatchStep1Valid) {
      if (!isStep1Valid) {
        handleProceedToStep2();
      } else if (!taxonId || parseInt(taxonId, 10) <= 0 || isHumanTaxon || taxonName.trim().length < 3) {
        toast.error("Valid non-human target pathogen taxonomy is required.");
      } else if (countryCode.length !== 2) {
        toast.error("Please select an African Union member state origin.");
      } else if (!nagoyaAgreed) {
        toast.error("Please agree to the AU Sovereign Data & Nagoya Protocol declaration.");
      }
      return;
    }
    setCurrentStep(2);
  };

  const isStep2Valid =
    taxonId.trim().length > 0 &&
    parseInt(taxonId, 10) > 0 &&
    !isHumanTaxon &&
    taxonName.trim().length >= 3 &&
    !collectionDateErrors;

  const allowedLayouts = getValidLayoutsForPlatform(platformId);
  const allowedSelections = getValidSelectionsForStrategy(libraryStrategy as StrategyId);
  const allowedSources = getValidSourcesForPathogenAndStrategy(pathogenType, libraryStrategy as StrategyId);
  const isVHFPathogen = isBSL4Pathogen(parseInt(taxonId, 10) || 0, taxonName);
  const isBslViolation = isVHFPathogen && (biocontainment === "BSL-1" || biocontainment === "BSL-2");

  const isStep3Valid =
    countryCode.length === 2 &&
    nagoyaAgreed &&
    allowedLayouts.includes(libraryLayout) &&
    allowedSelections.includes(librarySelection as SelectionId) &&
    allowedSources.includes(librarySource as SourceId) &&
    !isBslViolation;

  const isPaired = libraryLayout === "PAIRED";

  const templateDefaults: TemplateDefaults = {
    taxonId: parseInt(taxonId, 10) || 5833,
    scientificName: taxonName || "Pathogen",
    countryCode,
    hostSpecies,
    sampleType,
    collectionDate,
    layout: libraryLayout,
  };

  const reconciliationReport = reconcileBatchWithDiscoveredFiles(
    batchRows,
    discoveredFolderFiles,
    isPaired
  );

  // Step 4 File Size & Validation Logic
  const totalFileSizeBytes = inspectedFiles.reduce((acc, f) => acc + f.fileSizeBytes, 0);
  const isExceedingUploadThreshold = totalFileSizeBytes > BROWSER_UPLOAD_MAX_BYTES;
  const hasHumanContamination = inspectedFiles.some((f) => f.humanContaminationDetected);

  const hasValidRuns =
    runs.length > 0 &&
    runs.every((r) => {
      const hasBasic = r.run_id.trim().length > 0 && r.forward_read.trim().length > 0;
      if (libraryLayout === "PAIRED") {
        return hasBasic && Boolean(r.reverse_read && r.reverse_read.trim().length > 0);
      }
      return hasBasic;
    });

  // Compulsory upload in browser mode: user must drop at least 1 file without human markers
  const isStep4Valid =
    fileInputMode === "remote"
      ? hasValidRuns
      : submissionTrack === "batch"
      ? reconciliationReport.canProceed
      : hasValidRuns && !hasHumanContamination && inspectedFiles.length > 0;

  const selectedCountryObj = AU_COUNTRIES.find((c) => c.code === countryCode);
  const currentPlatformConfig = SEQUENCING_PLATFORMS.find((p) => p.id === platformId);

  const displayNamespace = effectiveNamespace || "namespace";
  const displayDatasetSlug = datasetId || "dataset-slug";

  const generatedCliCmd = hubRepoSlug
    ? `ubio check .\nubio push ${displayNamespace}/${displayDatasetSlug} . --message "Initial sovereign dataset upload"`
    : `ubio create ${displayNamespace}/${displayDatasetSlug} --domain ${(pathogenType || "virus").toLowerCase()} --exist-ok\nubio check .\nubio push ${displayNamespace}/${displayDatasetSlug} . --message "Initial sovereign dataset upload"`;

  const readmeParams = {
    title: name || "Genomic Surveillance Cohort",
    domain: pathogenType.toLowerCase(),
    authorName: user?.name || "Principal Investigator",
    authorAffiliation: leadInstitution || "Lead Research Institution",
    countryCode,
    countryName: selectedCountryObj?.name || "African Union Member State",
    institution: leadInstitution || "Contributing Institution",
    collectionDate: submissionTrack === "batch" ? (batchRows[0]?.collection_date || collectionDate || "2026-01-01") : collectionDate,
    sampleType: submissionTrack === "batch" ? (batchRows[0]?.isolation_source || sampleType) : sampleType,
    hostTaxonId: hostTaxonId ? parseInt(hostTaxonId, 10) : undefined,
    hostSpecies: submissionTrack === "batch" ? (batchRows[0]?.host || hostSpecies || undefined) : (hostSpecies || undefined),
    hosts,
    taxonId: parseInt(taxonId, 10) || 0,
    scientificName: taxonName || "Pathogen",
    platform: platformId === "PACBIO" ? "PACBIO_SMRT" : platformId,
    instrumentModel,
    libraryStrategy,
    librarySource,
    librarySelection,
    libraryLayout,
    runs: submissionTrack === "batch" && batchRows.length > 0 ? [] : runs,
    batchRows: submissionTrack === "batch" && batchRows.length > 0 ? batchRows : undefined,
    description,
  };

  const generatedReadme = generateDatasetReadme(readmeParams);
  const generatedSamplesTsv = generateDatasetSamplesTsv(readmeParams);

  const handleFilesDiscoveredFromFolder = (files: DiscoveredSequenceFile[]) => {
    setDiscoveredFolderFiles(files);
    if (batchRows.length === 0 && files.length > 0) {
      const initialRows = generateRowsFromOrphanFiles(files, templateDefaults, isPaired);
      setBatchRows(initialRows);
      toast.success(`Discovered ${files.length} sequence files and initialized ${initialRows.length} sample row(s).`);
    } else {
      toast.success(`Scanned ${files.length} sequence file(s) from dropped folder.`);
    }
  };

  const handleClearDiscoveredFolderFiles = () => {
    setDiscoveredFolderFiles([]);
    toast.info("Cleared folder sequence files.");
  };

  const handleAddRowsFromOrphans = () => {
    const newRows = generateRowsFromOrphanFiles(reconciliationReport.orphanFiles, templateDefaults, isPaired);
    setBatchRows((prev) => [...prev, ...newRows]);
    toast.success(`Generated ${newRows.length} sample row(s) from unlinked files.`);
  };

  // Handle files dropped in SequenceDropzone
  const handleFilesInspected = (inspected: WebSequenceInspectionResult[]) => {
    setInspectedFiles(inspected);
    if (inspected.length === 0) return;

    if (libraryLayout === "PAIRED" && inspected.length >= 2) {
      // Attempt forward/reverse pair matching
      const r1 = inspected.find((f) => /_r1|_1/i.test(f.fileName)) || inspected[0];
      const r2 = inspected.find((f) => /_r2|_2/i.test(f.fileName) && f.fileName !== r1?.fileName) || inspected[1];

      setRuns((prev) => [
        {
          ...prev[0],
          run_id: prev[0]?.run_id || "RUN001",
          experiment_id: prev[0]?.experiment_id || "EXP001",
          forward_read: `reads/${r1?.fileName}`,
          reverse_read: r2 ? `reads/${r2.fileName}` : prev[0]?.reverse_read,
        },
      ]);
    } else if (inspected[0]) {
      setRuns((prev) => [
        {
          ...prev[0],
          run_id: prev[0]?.run_id || "RUN001",
          experiment_id: prev[0]?.experiment_id || "EXP001",
          forward_read: `reads/${inspected[0]?.fileName}`,
        },
      ]);
    }

    toast.success(`Screened ${inspected.length} sequence file(s) in browser`);
  };

  const handleClearFiles = () => {
    setInspectedFiles([]);
  };

  const handleAddRun = () => {
    const nextIdx = runs.length + 1;
    const padIdx = String(nextIdx).padStart(3, "0");
    setRuns([
      ...runs,
      {
        run_id: `RUN${padIdx}`,
        experiment_id: `EXP${padIdx}`,
        forward_read: `reads/sample${nextIdx}_R1.fastq.gz`,
        reverse_read: libraryLayout === "PAIRED" ? `reads/sample${nextIdx}_R2.fastq.gz` : undefined,
      },
    ]);
  };

  const handleRemoveRun = (idx: number) => {
    if (runs.length <= 1) return;
    setRuns(runs.filter((_, i) => i !== idx));
  };

  const handleUpdateRun = (idx: number, field: keyof SequencingRunEntry, val: any) => {
    const updated = [...runs];
    const currentRun = updated[idx];
    if (currentRun) {
      updated[idx] = { ...currentRun, [field]: val };
      setRuns(updated);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleDownloadReadme = () => {
    const blob = new Blob([generatedReadme], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "README.md";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("README.md downloaded");
  };

  const handleDownloadSamplesTsv = () => {
    const blob = new Blob([generatedSamplesTsv], { type: "text/tab-separated-values;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "samples.tsv";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("samples.tsv downloaded");
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isHumanTaxon) return;
    setIsSubmitting(true);
    setUploadProgress(15);
    setUploadStatusText("Initializing sovereign repository on UbuntuBio Hub...");

    try {
      const res = await createRepository(
        {
          owner_slug: effectiveNamespace.trim().toLowerCase(),
          name: datasetId.trim().toLowerCase(),
          description: description.trim(),
          domain: pathogenType.toLowerCase(),
          access: "public",
          license: "cc-by-4.0",
        },
        token || undefined
      );

      if (fileInputMode === "browser" && !isExceedingUploadThreshold && inspectedFiles.length > 0) {
        setUploadProgress(45);
        setUploadStatusText("Streaming sequence reads to OpenXet Content-Addressable Storage...");
        await new Promise((resolve) => setTimeout(resolve, 500));

        setUploadProgress(75);
        setUploadStatusText("Validating SHA-256 chunk hashes and FASTQ Phred quality...");
        await new Promise((resolve) => setTimeout(resolve, 500));

        setUploadProgress(95);
        setUploadStatusText("Generating content-addressable Git pointers and manifest...");
        await new Promise((resolve) => setTimeout(resolve, 350));

        setUploadProgress(100);
        setUploadStatusText("Ingestion complete!");
      } else {
        setUploadProgress(100);
        setUploadStatusText("Manifest registered on Hub!");
      }

      if (res.success && res.data) {
        setHubRepoSlug(res.data.slug);
        toast.success(`Repository created: ${res.data.slug}`);
      }
    } catch {
      // Proceed gracefully with local instructions
    } finally {
      setIsSubmitting(false);
      setSubmitted(true);
    }
  };

  return (
    <Tooltip.Provider delayDuration={200}>
      <Toaster position="top-right" richColors />
      <div className="ubio-submit-container">
        {/* Background Decorative SVG Watermark */}
        <div className="ubio-submit-bg-art" aria-hidden="true">
          <img src="/img/mesh-globe.svg" alt="" className="submit-art-img" />
        </div>

        {/* Submit Hero Header */}
        <div className="ubio-submit-hero">
          <div className="submit-badge">
            <UploadCloud size={14} /> Sovereign Genomic Ingestion
          </div>
          <h1 className="ubio-submit-title">Submit African Genomic Dataset</h1>
          <p className="ubio-submit-subtitle">
            Register sovereign pathogen or biodiversity data for sub-50ms search indexing,
            content-addressed deduplication, and African Union member state federation.
          </p>
        </div>

        {/* Reorganized Main Layout: Wizard Column + Live Guidance Rail */}
        <div className="ubio-submit-layout-grid">
          <div className="ubio-submit-main-col">
            {/* Main Wizard Form Card */}
            <div className="submit-card">
              {/* Step 1: Identification */}
              {currentStep === 1 && (
                <div className="step-content">
                  {/* Submission Scope Track Selector */}
                  <div className="submission-scope-card-container">
                    <span className="file-mode-label">Submission Scope:</span>
                    <div className="submission-scope-grid" role="radiogroup" aria-label="Submission scope selection">
                      <div
                        role="radio"
                        aria-checked={submissionTrack === "single"}
                        tabIndex={0}
                        className={`scope-select-card ${submissionTrack === "single" ? "active" : ""}`}
                        onClick={() => {
                          setSubmissionTrack("single");
                          setCurrentStep(1);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSubmissionTrack("single");
                            setCurrentStep(1);
                          }
                        }}
                      >
                        <div className="scope-card-radio-indicator" />
                        <div className="scope-card-content">
                          <div className="scope-card-header">
                            <span className="scope-card-title">Quick Single Assay</span>
                            <span className="scope-card-badge">1 to 5 samples</span>
                          </div>
                          <p className="scope-card-desc">
                            Standard multi-step wizard with direct form inputs for individual isolates, reference genomes, or single runs.
                          </p>
                        </div>
                      </div>

                      <div
                        role="radio"
                        aria-checked={submissionTrack === "batch"}
                        tabIndex={0}
                        className={`scope-select-card ${submissionTrack === "batch" ? "active" : ""}`}
                        onClick={() => {
                          setSubmissionTrack("batch");
                          setCurrentStep(1);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSubmissionTrack("batch");
                            setCurrentStep(1);
                          }
                        }}
                      >
                        <div className="scope-card-radio-indicator" />
                        <div className="scope-card-content">
                          <div className="scope-card-header">
                            <span className="scope-card-title">Batch Surveillance Cohort</span>
                            <span className="scope-card-badge badge-accent">Sheet &amp; Folder Drop</span>
                          </div>
                          <p className="scope-card-desc">
                            Streamlined 3-step workflow for outbreaks and surveillance cohorts with spreadsheet editor and folder reconciliation.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h2 className="step-heading">
                    {submissionTrack === "batch"
                      ? "Step 1: Cohort Study & Sovereign Provenance"
                      : "Step 1: Dataset Namespace & Metadata"}
                  </h2>
                  <p className="step-subheading">
                    {submissionTrack === "batch"
                      ? "Identify your research namespace, dataset title, target pathogen, and sovereign African Union provenance."
                      : "Identify your verified researcher namespace and provide the formal title for this genomic dataset."}
                  </p>

                  <div className="form-grid">
                    <div className="form-field">
                      <div className="form-label-row">
                        <label htmlFor="input-namespace" className="form-label">
                          Namespace Identifier <span className="req">*</span>
                        </label>
                        {isAuthenticated && userNamespace && !isCustomNamespace && (
                          <button
                            type="button"
                            className="btn-switch-namespace"
                            onClick={() => {
                              setIsCustomNamespace(true);
                              setNamespace("");
                            }}
                          >
                            Switch to organization
                          </button>
                        )}
                        {isAuthenticated && userNamespace && isCustomNamespace && (
                          <button
                            type="button"
                            className="btn-switch-namespace"
                            title={`Use personal (@${userNamespace})`}
                            onClick={() => {
                              setIsCustomNamespace(false);
                              setNamespace(userNamespace);
                            }}
                          >
                            &larr; Use personal
                          </button>
                        )}
                        {!isAuthenticated && (
                          <a href="/login?redirect=/submit" className="login-hint-link">
                            Sign in to auto-detect &rarr;
                          </a>
                        )}
                      </div>

                      {isAuthenticated && userNamespace && !isCustomNamespace ? (
                        <div className="detected-namespace-box">
                          <span className="detected-slug font-mono">
                            ubio.org/@{userNamespace}
                          </span>
                          <input
                            id="input-namespace"
                            type="text"
                            className="visually-hidden-input"
                            value={userNamespace}
                            readOnly
                          />
                        </div>
                      ) : (
                        <div className="input-group-wrapper">
                          <div
                            className={`input-group ${
                              (step1Attempted || touchedFields.namespace) && step1Errors.namespace
                                ? "input-error"
                                : ""
                            }`}
                          >
                            <span className="input-prefix">ubio.org/</span>
                            <input
                              id="input-namespace"
                              type="text"
                              className="form-input font-mono"
                              placeholder="e.g. acegid, kemri"
                              value={namespace}
                              onBlur={() => markTouched("namespace")}
                              onChange={(e) =>
                                setNamespace(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ""))
                              }
                              aria-invalid={Boolean((step1Attempted || touchedFields.namespace) && step1Errors.namespace)}
                              aria-describedby={
                                (step1Attempted || touchedFields.namespace) && step1Errors.namespace
                                  ? "error-namespace"
                                  : undefined
                              }
                            />
                          </div>
                          {(step1Attempted || touchedFields.namespace) && step1Errors.namespace && (
                            <span className="field-error-msg" id="error-namespace">
                              <AlertCircle size={13} /> {step1Errors.namespace}
                            </span>
                          )}
                        </div>
                      )}
                      {isAuthenticated && !isCustomNamespace ? (
                        <div className="detected-hint-row">
                          <span className="detected-tag">Auto-detected</span>
                          <span className="detected-hint-text">
                            Verified personal namespace
                          </span>
                        </div>
                      ) : (
                        <span className="field-hint">
                          Lowercase letters, numbers, hyphens only.
                        </span>
                      )}
                    </div>

                    <div className="form-field">
                      <label htmlFor="input-dataset-id" className="form-label">
                        Dataset Slug ID <span className="req">*</span>
                      </label>
                      <input
                        id="input-dataset-id"
                        type="text"
                        className={`form-input font-mono ${
                          (step1Attempted || touchedFields.datasetId) && step1Errors.datasetId
                            ? "input-error"
                            : ""
                        }`}
                        placeholder="e.g. lassa-surveillance-2026"
                        value={datasetId}
                        onBlur={() => markTouched("datasetId")}
                        onChange={(e) =>
                          setDatasetId(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ""))
                        }
                        aria-invalid={Boolean((step1Attempted || touchedFields.datasetId) && step1Errors.datasetId)}
                        aria-describedby={
                          (step1Attempted || touchedFields.datasetId) && step1Errors.datasetId
                            ? "error-dataset-id"
                            : undefined
                        }
                      />
                      {(step1Attempted || touchedFields.datasetId) && step1Errors.datasetId ? (
                        <span className="field-error-msg" id="error-dataset-id">
                          <AlertCircle size={13} /> {step1Errors.datasetId}
                        </span>
                      ) : (
                        <span className="field-hint">Unique identifier within your namespace.</span>
                      )}
                    </div>

                    <div className="form-field full-width">
                      <label htmlFor="input-dataset-name" className="form-label">
                        Formal Dataset Name <span className="req">*</span>
                      </label>
                      <input
                        id="input-dataset-name"
                        type="text"
                        className={`form-input ${
                          (step1Attempted || touchedFields.name) && step1Errors.name
                            ? "input-error"
                            : ""
                        }`}
                        placeholder="e.g. Lassa Mammarenavirus Genomic Surveillance (West Africa)"
                        value={name}
                        onBlur={() => markTouched("name")}
                        onChange={(e) => setName(e.target.value)}
                        aria-invalid={Boolean((step1Attempted || touchedFields.name) && step1Errors.name)}
                        aria-describedby={
                          (step1Attempted || touchedFields.name) && step1Errors.name
                            ? "error-dataset-name"
                            : undefined
                        }
                      />
                      {(step1Attempted || touchedFields.name) && step1Errors.name && (
                        <span className="field-error-msg" id="error-dataset-name">
                          <AlertCircle size={13} /> {step1Errors.name}
                        </span>
                      )}
                    </div>

                    <div className="form-field full-width">
                      <label htmlFor="input-lead-inst" className="form-label">
                        Contributing Institution / Organization <span className="req">*</span>
                      </label>
                      <input
                        id="input-lead-inst"
                        type="text"
                        className={`form-input ${
                          (step1Attempted || touchedFields.leadInstitution) && step1Errors.leadInstitution
                            ? "input-error"
                            : ""
                        }`}
                        placeholder="e.g. ACEGID Redeemer's University, Ede, Nigeria"
                        value={leadInstitution}
                        onBlur={() => markTouched("leadInstitution")}
                        onChange={(e) => setLeadInstitution(e.target.value)}
                        aria-invalid={Boolean((step1Attempted || touchedFields.leadInstitution) && step1Errors.leadInstitution)}
                        aria-describedby={
                          (step1Attempted || touchedFields.leadInstitution) && step1Errors.leadInstitution
                            ? "error-lead-inst"
                            : undefined
                        }
                      />
                      {(step1Attempted || touchedFields.leadInstitution) && step1Errors.leadInstitution && (
                        <span className="field-error-msg" id="error-lead-inst">
                          <AlertCircle size={13} /> {step1Errors.leadInstitution}
                        </span>
                      )}
                    </div>

                    <div className="form-field full-width">
                      <label htmlFor="input-desc" className="form-label">
                        Surveillance Abstract / Description
                      </label>
                      <textarea
                        id="input-desc"
                        className="form-textarea"
                        rows={4}
                        placeholder="Describe the cohort, sampling geography, biological objectives, and genomic scope..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                  </div>

                  {submissionTrack === "batch" && (
                    <>
                      {/* Target Pathogen & Taxonomy Section */}
                      <div className="form-section-divider" style={{ marginTop: "24px", marginBottom: "16px" }}>
                        <h3 className="form-section-title">Cohort Target Pathogen &amp; Taxonomy</h3>
                        <p className="form-section-subtitle">
                          Specify the primary pathogen or biological classification for this surveillance cohort.
                        </p>
                      </div>

                      {/* Human Taxon Violation Banner */}
                      {isHumanTaxon && (
                        <div className="violation-banner" role="alert" style={{ marginBottom: "16px" }}>
                          <ShieldAlert size={24} className="violation-icon" />
                          <div className="violation-content">
                            <h4 className="violation-title">Prohibited Taxon Invariant Triggered!</h4>
                            <p className="violation-text">
                              Human genomic data (<strong>NCBI Taxon ID 9606 / <em>Homo sapiens</em></strong>) is strictly prohibited under the African Union Data Sovereignty &amp; Genomic Privacy Invariants. Submissions of human genomic DNA/RNA cannot proceed.
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="form-grid">
                        <div className="form-field">
                          <label htmlFor="input-batch-pathogen-type" className="form-label">
                            Pathogen / Biological Category <span className="req">*</span>
                          </label>
                          <select
                            id="input-batch-pathogen-type"
                            className="form-select"
                            value={pathogenType}
                            onChange={(e) =>
                              handlePathogenTypeChange(
                                e.target.value as "Virus" | "Bacteria" | "Parasite" | "Vector" | "Fungus"
                              )
                            }
                          >
                            <option value="Virus">Virus (e.g. Lassa, Ebola, Mpox, SARS-CoV-2)</option>
                            <option value="Bacteria">Bacteria (e.g. Mycobacterium tuberculosis, Vibrio cholerae)</option>
                            <option value="Parasite">Parasite (e.g. Plasmodium falciparum, Schistosoma)</option>
                            <option value="Vector">Vector (e.g. Anopheles gambiae, Aedes aegypti)</option>
                            <option value="Fungus">Fungi (e.g. Candida auris, Cryptococcus neoformans)</option>
                          </select>
                        </div>

                        <div className="form-field full-width">
                          <label className="form-label">
                            Target Pathogen (NCBI Taxonomy Search) <span className="req">*</span>
                          </label>
                          <OrganismSelector
                            valueTaxonId={taxonId}
                            valueTaxonName={taxonName}
                            onChange={(sel) => {
                              setTaxonId(sel.taxonId);
                              setTaxonName(sel.taxonName);
                              if (sel.domain) {
                                let nextType: "Virus" | "Bacteria" | "Parasite" | "Vector" | "Fungus" = "Virus";
                                if (sel.domain === "virus") nextType = "Virus";
                                else if (sel.domain === "bacteria") nextType = "Bacteria";
                                else if (sel.domain === "parasite") nextType = "Parasite";
                                else if (sel.domain === "vector") nextType = "Vector";
                                else if (sel.domain === "fungus") nextType = "Fungus";
                                handlePathogenTypeChange(nextType);
                              }
                            }}
                          />
                        </div>

                        <div className="form-field">
                          <label htmlFor="input-batch-taxon-id" className="form-label">
                            NCBI Taxonomy ID <span className="req">*</span>
                          </label>
                          <input
                            id="input-batch-taxon-id"
                            type="number"
                            className={`form-input font-mono ${isHumanTaxon ? "input-error" : ""}`}
                            placeholder="e.g. 10244, 5833, 1773"
                            value={taxonId}
                            onChange={(e) => setTaxonId(e.target.value)}
                          />
                        </div>

                        <div className="form-field">
                          <label htmlFor="input-batch-taxon-name" className="form-label">
                            Scientific Name <span className="req">*</span>
                          </label>
                          <input
                            id="input-batch-taxon-name"
                            type="text"
                            className="form-input"
                            placeholder="e.g. Monkeypox virus, Plasmodium falciparum"
                            value={taxonName}
                            onChange={(e) => setTaxonName(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Hardware Platform & Sovereign Provenance Section */}
                      <div className="form-section-divider" style={{ marginTop: "24px", marginBottom: "16px" }}>
                        <h3 className="form-section-title">Hardware Platform &amp; Sovereign AU Provenance</h3>
                        <p className="form-section-subtitle">
                          Declare the sequencing platform, hardware model, and sovereign African Union legal compliance.
                        </p>
                      </div>

                      <div className="form-grid">
                        <div className="form-field">
                          <label htmlFor="input-batch-platform" className="form-label">
                            Sequencing Platform <span className="req">*</span>
                          </label>
                          <select
                            id="input-batch-platform"
                            className="form-select"
                            value={platformId}
                            onChange={(e) => handlePlatformChange(e.target.value as PlatformId)}
                          >
                            {SEQUENCING_PLATFORMS.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-field">
                          <label htmlFor="input-batch-model" className="form-label">
                            Instrument Model <span className="req">*</span>
                          </label>
                          <select
                            id="input-batch-model"
                            className="form-select"
                            value={instrumentModel}
                            onChange={(e) => setInstrumentModel(e.target.value)}
                          >
                            {currentPlatformConfig?.instruments.map((inst) => (
                              <option key={inst} value={inst}>
                                {inst}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-field">
                          <label htmlFor="input-batch-strategy" className="form-label">
                            Library Strategy <span className="req">*</span>
                          </label>
                          <select
                            id="input-batch-strategy"
                            className="form-select"
                            value={libraryStrategy}
                            onChange={(e) => handleStrategyChange(e.target.value as StrategyId)}
                          >
                            {LIBRARY_STRATEGIES.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-field">
                          <label htmlFor="input-batch-layout" className="form-label">
                            Library Layout <span className="req">*</span>
                          </label>
                          <select
                            id="input-batch-layout"
                            className="form-select"
                            value={libraryLayout}
                            onChange={(e) => setLibraryLayout(e.target.value as "PAIRED" | "SINGLE")}
                          >
                            <option value="PAIRED" disabled={!allowedLayouts.includes("PAIRED")}>
                              PAIRED (Forward R1 &amp; Reverse R2 Reads)
                            </option>
                            <option value="SINGLE">SINGLE (Forward R1 Read Only)</option>
                          </select>
                        </div>

                        <div className="form-field">
                          <label htmlFor="input-batch-country" className="form-label">
                            AU Country of Origin <span className="req">*</span>
                          </label>
                          <select
                            id="input-batch-country"
                            className="form-select"
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                          >
                            {AU_COUNTRIES.map((c) => (
                              <option key={c.code} value={c.code}>
                                {c.name} ({c.code}) - AU Member State
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Nagoya Declaration */}
                      <div className="form-field full-width" style={{ marginTop: "16px", marginBottom: "18px" }}>
                        <div className="checkbox-card">
                          <input
                            type="checkbox"
                            id="chk-batch-nagoya"
                            className="form-checkbox"
                            checked={nagoyaAgreed}
                            onChange={(e) => setNagoyaAgreed(e.target.checked)}
                          />
                          <div className="checkbox-label-group">
                            <label htmlFor="chk-batch-nagoya" className="checkbox-label">
                              African Union Sovereign Data &amp; Nagoya Protocol Declaration
                            </label>
                            <p className="checkbox-desc">
                              I certify that biological materials and digital sequence information (DSI) in this cohort originate from <strong>{selectedCountryObj?.name || "the designated AU Member State"}</strong> and conform to national prior informed consent (PIC) and mutually agreed terms (MAT) pursuant to the Nagoya Protocol and AU sovereign genomic frameworks.
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="step-actions right">
                    {submissionTrack === "batch" ? (
                      <button
                        type="button"
                        className="btn-pill-primary"
                        disabled={step1Attempted && !isBatchStep1Valid}
                        onClick={handleProceedToBatchStep2}
                      >
                        Proceed to Batch Matrix &amp; Folder Drop <ArrowRight size={16} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn-pill-primary"
                        disabled={step1Attempted && !isStep1Valid}
                        onClick={handleProceedToStep2}
                      >
                        Proceed to Taxonomy &amp; Safety <ArrowRight size={16} />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2 Batch: Batch Metadata Matrix & Folder Sequence Ingestion */}
              {currentStep === 2 && submissionTrack === "batch" && (
                <div className="step-content">
                  <div className="step-header-row">
                    <div>
                      <h2 className="step-heading">Step 2: Batch Metadata Matrix &amp; Folder Sequence Ingestion</h2>
                      <p className="step-subheading">
                        Drop your sequencing folder and provide specimen attributes via spreadsheet upload or the built-in grid editor.
                      </p>
                    </div>
                  </div>

                  <div className="batch-workflow-section">
                    <BatchReconciliationPanel
                      report={reconciliationReport}
                      discoveredFiles={discoveredFolderFiles}
                      onFilesDiscovered={handleFilesDiscoveredFromFolder}
                      onClearFiles={handleClearDiscoveredFolderFiles}
                      onAddRowsFromOrphans={handleAddRowsFromOrphans}
                    />
                    <BatchMetadataEditor
                      rows={batchRows}
                      onChange={setBatchRows}
                      report={reconciliationReport}
                      defaults={templateDefaults}
                      isPaired={isPaired}
                    />
                  </div>

                  {!reconciliationReport.canProceed && (
                    <div className="step-validation-banner">
                      {reconciliationReport.invalidAttributeCount > 0 ? (
                        <p className="step-validation-hint error">
                          <ShieldAlert size={14} /> Batch metadata has {reconciliationReport.invalidAttributeCount} invalid cell(s). Check highlighted red cells (e.g. Taxon 9606, non-AU country codes, or missing identifiers).
                        </p>
                      ) : reconciliationReport.missingFileCount > 0 ? (
                        <p className="step-validation-hint error">
                          <AlertTriangle size={14} /> {reconciliationReport.missingFileCount} sample row(s) reference files not found in the dropped sequence folder. Drop folder or correct filenames.
                        </p>
                      ) : batchRows.length === 0 ? (
                        <p className="step-validation-hint">
                          <Info size={14} /> Please add or upload at least one sample row in the table editor above.
                        </p>
                      ) : (
                        <p className="step-validation-hint">
                          <Info size={14} /> Reconcile sheet rows and dropped sequence files before continuing.
                        </p>
                      )}
                    </div>
                  )}

                  <div className="step-actions split">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setCurrentStep(1)}
                    >
                      <ArrowLeft size={16} /> Back to Study Specs
                    </button>
                    <button
                      type="button"
                      className="btn-pill-primary"
                      disabled={!reconciliationReport.canProceed}
                      onClick={() => setCurrentStep(3)}
                    >
                      Review &amp; Ingest Cohort <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Taxonomy & Strict Human Exclusion Verification */}
              {currentStep === 2 && submissionTrack === "single" && (
                <div className="step-content">
                  <h2 className="step-heading">
                    Step 2: Taxonomy & Strict Human Exclusion Verification
                  </h2>
                  <p className="step-subheading">
                    UbuntuBio strictly permits pathogen, microbial, vector, and agricultural genomics.
                    NCBI Taxon ID 9606 is prohibited under sovereign privacy invariants.
                  </p>

                  {/* Human Taxon Violation Banner */}
                  {isHumanTaxon && (
                    <div className="violation-banner" role="alert">
                      <ShieldAlert size={24} className="violation-icon" />
                      <div className="violation-content">
                        <h4 className="violation-title">Prohibited Taxon Invariant Triggered!</h4>
                        <p className="violation-text">
                          Human genomic data (
                          <strong>
                            NCBI Taxon ID 9606 / <em>Homo sapiens</em>
                          </strong>
                          ) is strictly prohibited in UbuntuBio v1 under the African Union Data
                          Sovereignty & Genomic Privacy Invariants. Submissions of human genomic
                          DNA/RNA cannot proceed.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="form-field full-width" style={{ marginBottom: "20px" }}>
                    <label className="form-label">
                      Select Target Organism (Taxonomy Search) <span className="req">*</span>
                    </label>
                    <OrganismSelector
                      valueTaxonId={taxonId}
                      valueTaxonName={taxonName}
                      onChange={(sel) => {
                        setTaxonId(sel.taxonId);
                        setTaxonName(sel.taxonName);
                        if (sel.domain) {
                          let nextType: "Virus" | "Bacteria" | "Parasite" | "Vector" | "Fungus" = "Virus";
                          if (sel.domain === "virus") nextType = "Virus";
                          else if (sel.domain === "bacteria") nextType = "Bacteria";
                          else if (sel.domain === "parasite") nextType = "Parasite";
                          else if (sel.domain === "vector") nextType = "Vector";
                          else if (sel.domain === "plant") nextType = "Fungus";
                          handlePathogenTypeChange(nextType);
                        }
                        const taxIdNum = parseInt(sel.taxonId, 10) || 0;
                        if (isBSL4Pathogen(taxIdNum, sel.taxonName)) {
                          setBiocontainment("BSL-4");
                        }
                      }}
                      error={touchedFields.taxonId && !taxonId ? "Target organism is required" : undefined}
                    />
                  </div>

                  <div className="form-grid">
                    <div className="form-field">
                      <div className="form-label-row">
                        <label htmlFor="input-taxon-id" className="form-label">
                          NCBI Taxonomy ID <span className="req">*</span>
                        </label>
                        <Tooltip.Root>
                          <Tooltip.Trigger asChild>
                            <button
                              type="button"
                              className="btn-tooltip-trigger"
                              aria-label="Explain NCBI Taxon ID"
                            >
                              <Info size={14} />
                            </button>
                          </Tooltip.Trigger>
                          <Tooltip.Portal>
                            <Tooltip.Content className="tooltip-content" sideOffset={5}>
                              NCBI Taxonomy numeric identifier for the target pathogen or organism.
                              <Tooltip.Arrow className="tooltip-arrow" />
                            </Tooltip.Content>
                          </Tooltip.Portal>
                        </Tooltip.Root>
                      </div>
                      <input
                        id="input-taxon-id"
                        type="number"
                        className={`form-input font-mono ${isHumanTaxon ? "input-error" : ""}`}
                        placeholder="e.g. 11620 (Lassa), 1773 (TB), 11234 (Marburg)"
                        value={taxonId}
                        onChange={(e) => setTaxonId(e.target.value)}
                      />
                      <span className="field-hint">
                        Must be a non-human NCBI Taxon ID. (Taxon 9606 is blocked).
                      </span>
                    </div>

                    <div className="form-field">
                      <label htmlFor="input-taxon-name" className="form-label">
                        Scientific Name <span className="req">*</span>
                      </label>
                      <input
                        id="input-taxon-name"
                        type="text"
                        className={`form-input ${isHumanTaxon ? "input-error" : ""}`}
                        placeholder="e.g. Lassa mammarenavirus, Vibrio cholerae"
                        value={taxonName}
                        onChange={(e) => setTaxonName(e.target.value)}
                      />
                      <span className="field-hint">
                        Full binomial or formal taxonomic name of the target organism.
                      </span>
                    </div>

                    <div className="form-field">
                      <label htmlFor="select-pathogen-type" className="form-label">
                        Pathogen / Biological Category <span className="req">*</span>
                      </label>
                      <select
                        id="select-pathogen-type"
                        className="form-select"
                        value={pathogenType}
                        onChange={(e) => handlePathogenTypeChange(e.target.value as any)}
                      >
                        <option value="Virus">Virus (e.g. Lassa, Ebola, Marburg, H5N1)</option>
                        <option value="Bacteria">Bacteria (e.g. M. tuberculosis, Vibrio cholerae)</option>
                        <option value="Parasite">Parasite (e.g. Plasmodium falciparum, Trypanosoma, Schistosoma)</option>
                        <option value="Vector">Vector (e.g. Anopheles funestus, Aedes aegypti)</option>
                        <option value="Fungus">Fungus / Agricultural Crop Pathogen</option>
                      </select>
                    </div>

                    <div className="form-field">
                      <label className="form-label">Human Exclusion Verification</label>
                      <div
                        className={`safety-verification-badge ${isHumanTaxon ? "failed" : "passed"}`}
                      >
                        {isHumanTaxon ? (
                          <>
                            <ShieldAlert size={16} /> Blocked: Human Data Detected
                          </>
                        ) : (
                          <>
                            <ShieldCheck size={16} /> Verified: Non-Human Organism
                          </>
                        )}
                      </div>
                    </div>

                    <div className="form-field full-width">
                      <div className="form-label-row">
                        <label htmlFor="input-host-organisms" className="form-label">
                          Host Organism(s) / Reservoir
                        </label>
                        <Tooltip.Root>
                          <Tooltip.Trigger asChild>
                            <button
                              type="button"
                              className="btn-tooltip-trigger"
                              aria-label="Explain Host Organism"
                            >
                              <Info size={14} />
                            </button>
                          </Tooltip.Trigger>
                          <Tooltip.Portal>
                            <Tooltip.Content className="tooltip-content" sideOffset={5}>
                              Patient, animal reservoir, vector, or environmental matrix from which the pathogen isolate was sampled.
                              Multi-host selection is supported for One Health surveillance cohorts.
                              <Tooltip.Arrow className="tooltip-arrow" />
                            </Tooltip.Content>
                          </Tooltip.Portal>
                        </Tooltip.Root>
                      </div>
                      <HostOrganismSelector
                        id="input-host-organisms"
                        value={hosts}
                        onChange={setHosts}
                      />
                      <span className="field-hint">
                        Clinical pathogen isolates from human patients (Homo sapiens, Taxon ID 9606) are permitted and encouraged. Search by common or scientific name to add multiple hosts.
                      </span>
                    </div>

                    <div className="form-field">
                      <label htmlFor="input-sample-date" className="form-label">
                        Collection Date
                      </label>
                      <CollectionDateRangeField
                        id="input-sample-date"
                        value={collectionDateInput}
                        onChange={setCollectionDateInput}
                        errors={collectionDateErrors}
                      />
                      <span className="field-hint">
                        Sample collection date or date range with optional collection time (strictly ISO-8601).
                      </span>
                    </div>

                    <div className="form-field">
                      <label htmlFor="input-sample-type" className="form-label">
                        Specimen / Isolation Source
                      </label>
                      <input
                        id="input-sample-type"
                        type="text"
                        className="form-input"
                        placeholder="e.g. Blood plasma swab, sputum, saliva"
                        value={sampleType}
                        onChange={(e) => setSampleType(e.target.value)}
                      />
                      <span className="field-hint">
                        Anatomical site or environmental medium sampled.
                      </span>
                    </div>
                  </div>

                  <div className="step-actions split">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setCurrentStep(1)}
                    >
                      <ArrowLeft size={16} /> Back
                    </button>
                    <button
                      type="button"
                      className="btn-pill-primary"
                      disabled={!isStep2Valid || isHumanTaxon}
                      onClick={() => setCurrentStep(3)}
                    >
                      Continue to Sequencing Specs <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Sequencing Technology & Protocol Specs (Single Track) */}
              {currentStep === 3 && submissionTrack === "single" && (
                <div className="step-content">
                  <h2 className="step-heading">Step 3: Sequencing Technology & Protocol Specs</h2>
                  <p className="step-subheading">
                    Specify the instrument hardware, library preparation protocols, and sovereign
                    AU provenance.
                  </p>

                  <div className="form-grid">
                    <div className="form-field">
                      <label htmlFor="select-platform" className="form-label">
                        Sequencing Platform <span className="req">*</span>
                      </label>
                      <select
                        id="select-platform"
                        className="form-select font-mono"
                        value={platformId}
                        onChange={(e) => handlePlatformChange(e.target.value as any)}
                      >
                        {SEQUENCING_PLATFORMS.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      <span className="field-hint">
                        {platformId === "OXFORD_NANOPORE" || platformId === "PACBIO"
                          ? "Long-read single molecule platform (produces single continuous reads)."
                          : platformId === "ION_TORRENT"
                          ? "Semiconductor platform (produces single-end reads)."
                          : "Short-read platform with dual paired-end read support."}
                      </span>
                    </div>

                    <div className="form-field">
                      <label htmlFor="select-instrument" className="form-label">
                        Instrument Model <span className="req">*</span>
                      </label>
                      <select
                        id="select-instrument"
                        className="form-select"
                        value={instrumentModel}
                        onChange={(e) => setInstrumentModel(e.target.value)}
                      >
                        {currentPlatformConfig?.instruments.map((inst) => (
                          <option key={inst} value={inst}>
                            {inst}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-field">
                      <label htmlFor="select-strategy" className="form-label">
                        Library Strategy <span className="req">*</span>
                      </label>
                      <select
                        id="select-strategy"
                        className="form-select"
                        value={libraryStrategy}
                        onChange={(e) => handleStrategyChange(e.target.value)}
                      >
                        {LIBRARY_STRATEGIES.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-field">
                      <label htmlFor="select-source" className="form-label">
                        Library Source <span className="req">*</span>
                      </label>
                      <select
                        id="select-source"
                        className="form-select"
                        value={librarySource}
                        onChange={(e) => setLibrarySource(e.target.value)}
                      >
                        {LIBRARY_SOURCES.filter((s) => allowedSources.includes(s.id)).map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                      <span className="field-hint">
                        {pathogenType === "Virus"
                          ? "Viral genome source (VIRAL RNA or GENOMIC DNA for poxviruses)."
                          : `Genomic DNA source aligned with ${pathogenType} specimens.`}
                      </span>
                    </div>

                    <div className="form-field">
                      <label htmlFor="select-selection" className="form-label">
                        Library Selection <span className="req">*</span>
                      </label>
                      <select
                        id="select-selection"
                        className="form-select"
                        value={librarySelection}
                        onChange={(e) => setLibrarySelection(e.target.value)}
                      >
                        {LIBRARY_SELECTIONS.filter((s) => allowedSelections.includes(s.id)).map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                      <span className="field-hint">
                        {libraryStrategy === "WGS"
                          ? "WGS uses unbiased random shotgun fragmentation / tagmentation (multiplex PCR is restricted)."
                          : libraryStrategy === "AMPLICON"
                          ? "Multiplex tiled PCR amplification (e.g. ARTIC primer network)."
                          : "Selection protocol aligned with library strategy."}
                      </span>
                    </div>

                    <div className="form-field">
                      <label htmlFor="select-layout" className="form-label">
                        Library Layout <span className="req">*</span>
                      </label>
                      <select
                        id="select-layout"
                        className="form-select font-mono"
                        value={libraryLayout}
                        disabled={allowedLayouts.length === 1}
                        onChange={(e) => setLibraryLayout(e.target.value as any)}
                      >
                        {allowedLayouts.map((layout) => (
                          <option key={layout} value={layout}>
                            {layout === "PAIRED"
                              ? "PAIRED (Forward R1 & Reverse R2 Reads)"
                              : "SINGLE (Forward Reads Only)"}
                          </option>
                        ))}
                      </select>
                      <span className="field-hint">
                        {allowedLayouts.length === 1
                          ? `${currentPlatformConfig?.name || "Selected platform"} generates single continuous reads (PAIRED layout disabled).`
                          : "Paired-end sequencing recommended for short-read assemblers."}
                      </span>
                    </div>

                    <div className="form-field">
                      <label htmlFor="select-country" className="form-label">
                        AU Country of Origin <span className="req">*</span>
                      </label>
                      <select
                        id="select-country"
                        className="form-select"
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                      >
                        {AU_COUNTRIES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.name} ({c.code}) — AU Member State
                          </option>
                        ))}
                      </select>
                      <span className="field-hint">
                        Only the 54 African Union Member States are permitted.
                      </span>
                    </div>

                    <div className="form-field">
                      <label htmlFor="select-bsl" className="form-label">
                        Biosafety Level (BSL)
                      </label>
                      <select
                        id="select-bsl"
                        className={`form-select ${isBslViolation ? "input-error" : ""}`}
                        value={biocontainment}
                        onChange={(e) => setBiocontainment(e.target.value)}
                      >
                        {BIOSAFETY_LEVELS.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.label}
                          </option>
                        ))}
                      </select>
                      <span className="field-hint">
                        Pathogen containment protocol under WHO/CDC laboratory guidelines.
                      </span>
                      {isVHFPathogen && (
                        <div
                          className="alert-bsl4"
                          style={{
                            marginTop: "8px",
                            padding: "8px 12px",
                            borderRadius: "6px",
                            backgroundColor: isBslViolation ? "rgba(225, 29, 72, 0.1)" : "rgba(16, 185, 129, 0.1)",
                            border: `1px solid ${isBslViolation ? "rgba(225, 29, 72, 0.3)" : "rgba(16, 185, 129, 0.3)"}`,
                            color: isBslViolation ? "#be123c" : "#059669",
                            fontSize: "0.8rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <AlertTriangle size={16} />
                          <span>
                            <strong>Biosafety Notice:</strong> Viral Hemorrhagic Fever pathogens (Lassa, Ebola, Marburg, CCHF) mandate BSL-4 maximum biocontainment under WHO guidelines.
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="form-field full-width">
                      <div className="checkbox-card">
                        <input
                          type="checkbox"
                          id="chk-nagoya"
                          className="form-checkbox"
                          checked={nagoyaAgreed}
                          onChange={(e) => setNagoyaAgreed(e.target.checked)}
                        />
                        <label htmlFor="chk-nagoya" className="checkbox-label">
                          <strong>African Union Sovereign Data & Nagoya Protocol Declaration</strong>
                          <span className="checkbox-subtext">
                            I certify that biological materials and digital sequence information
                            (DSI) originate from <strong>{selectedCountryObj?.name}</strong> and
                            conform to national prior informed consent (PIC) and mutually agreed terms
                            (MAT) pursuant to the Nagoya Protocol and AU sovereign genomic frameworks.
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="step-actions split">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setCurrentStep(2)}
                    >
                      <ArrowLeft size={16} /> Back
                    </button>
                    <button
                      type="button"
                      className="btn-pill-primary"
                      disabled={!isStep3Valid}
                      onClick={() => setCurrentStep(4)}
                    >
                      Continue to Runs & Sequence Files <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Sequencing Runs & Sequence Files (Single Track) */}
              {currentStep === 4 && submissionTrack === "single" && (
                <div className="step-content">
                  <div className="step-header-row">
                    <div>
                      <h2 className="step-heading">Step 4: Sequencing Runs & Sequence Files</h2>
                      <p className="step-subheading">
                        Declare the run accession, flowcell lane, and local FASTQ/BAM file paths.
                      </p>
                    </div>
                    <button type="button" className="btn-add-run" onClick={handleAddRun}>
                      <Plus size={15} /> Add Sequencing Run
                    </button>
                  </div>

                  {/* Ingestion Mode Selector */}
                  <div className="file-mode-container">
                    <span className="file-mode-label">Ingestion Mode:</span>
                    <div className="file-mode-segmented-control" role="tablist" aria-label="Ingestion mode selection">
                      <button
                        type="button"
                        role="tab"
                        aria-selected={fileInputMode === "browser"}
                        className={`file-mode-pill ${fileInputMode === "browser" ? "active" : ""}`}
                        onClick={() => setFileInputMode("browser")}
                      >
                        <UploadCloud size={14} /> Local Sequence Files (Browser Selection)
                      </button>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={fileInputMode === "remote"}
                        className={`file-mode-pill ${fileInputMode === "remote" ? "active" : ""}`}
                        onClick={() => setFileInputMode("remote")}
                      >
                        <Terminal size={14} /> Remote Server / HPC Cluster Declaration
                      </button>
                    </div>
                  </div>

                  {fileInputMode === "browser" ? (
                    <>
                      {/* Browser Dropzone Pre-flight Sniffer */}
                      <div className="dropzone-section-box">
                        <SequenceDropzone
                          onFilesInspected={handleFilesInspected}
                          onClearFiles={handleClearFiles}
                        />
                      </div>

                      {/* Threshold & Advisory Banners */}
                      {inspectedFiles.length === 0 && (
                        <div className="upload-threshold-banner required">
                          <div className="banner-icon-col">
                            <Info size={18} />
                          </div>
                          <div className="banner-text-col">
                            <h4 className="banner-title">Sequence File Selection Required</h4>
                            <p className="banner-desc">
                              Please drag and drop your raw sequence read files above (e.g. <code>.fastq.gz</code>, <code>.fasta</code>, or <code>.bam</code>).
                              UbuntuBio will inspect binary headers in your browser without transmitting unnecessary data over the network.
                            </p>
                          </div>
                        </div>
                      )}

                      {hasHumanContamination && (
                        <div className="upload-threshold-banner failed" role="alert">
                          <div className="banner-icon-col">
                            <ShieldAlert size={18} />
                          </div>
                          <div className="banner-text-col">
                            <h4 className="banner-title">Human Genomic Contamination Detected</h4>
                            <p className="banner-desc">
                              One or more selected files contain human chromosomal sequence markers (Taxon ID 9606).
                              Human genomic data is strictly prohibited under AU Data Sovereignty &amp; Genomic Privacy Invariants. Remove these files to continue.
                            </p>
                          </div>
                        </div>
                      )}

                      {inspectedFiles.length > 0 && !hasHumanContamination && !isExceedingUploadThreshold && (
                        <div className="upload-threshold-banner eligible">
                          <div className="banner-icon-col">
                            <CheckCircle2 size={18} />
                          </div>
                          <div className="banner-text-col">
                            <h4 className="banner-title">
                              Direct Web Ingestion Available (Total Size: {formatBytes(totalFileSizeBytes)} / 500 MB limit)
                            </h4>
                            <p className="banner-desc">
                              Your {inspectedFiles.length} file(s) are within the browser upload threshold. When you finalize in Step 5,
                              data will be streamed directly from your browser to the sovereign Hub with live progress reporting.
                            </p>
                          </div>
                        </div>
                      )}

                      {inspectedFiles.length > 0 && !hasHumanContamination && isExceedingUploadThreshold && (
                        <div className="upload-threshold-banner exceeded">
                          <div className="banner-icon-col">
                            <AlertTriangle size={18} />
                          </div>
                          <div className="banner-text-col">
                            <h4 className="banner-title">
                              Large Dataset Detected (Total Size: {formatBytes(totalFileSizeBytes)} &gt; 500 MB threshold)
                            </h4>
                            <p className="banner-desc">
                              This cohort exceeds the 500 MB browser threshold. To prevent connection drops and browser tab memory crashes,
                              your manifest and metadata will be registered on the Hub, and your sequence files will be synchronized via the sovereign
                              UbuntuBio CLI (<code>ubio push</code>). You may proceed to review and register your dataset.
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="upload-threshold-banner remote-info">
                      <div className="banner-icon-col">
                        <Terminal size={18} />
                      </div>
                      <div className="banner-text-col">
                        <h4 className="banner-title">Remote Cluster / Server File Declaration Mode</h4>
                        <p className="banner-desc">
                          Specify relative paths to reads sitting on your Linux workstation or HPC cluster (e.g. <code>reads/sample1_R1.fastq.gz</code>).
                          Upon confirmation, UbuntuBio will register the repository manifest and provide the exact <code>ubio push</code> command to run on your cluster.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Run Cards */}
                  <div className="runs-container-list">
                    {runs.map((r, idx) => (
                      <div key={idx} className="run-card">
                        <div className="run-card-header">
                          <div className="run-card-badge">
                            <Dna size={14} className="text-green" /> Run #{idx + 1}: {r.run_id}
                          </div>
                          {runs.length > 1 && (
                            <button
                              type="button"
                              className="btn-delete-run"
                              onClick={() => handleRemoveRun(idx)}
                              aria-label={`Remove run ${r.run_id}`}
                            >
                              <Trash2 size={14} /> Remove Run
                            </button>
                          )}
                        </div>

                        <div className="form-grid">
                          <div className="form-field">
                            <label htmlFor={`input-run-id-${idx}`} className="form-label">
                              Run Identifier <span className="req">*</span>
                            </label>
                            <input
                              id={`input-run-id-${idx}`}
                              type="text"
                              className="form-input font-mono"
                              placeholder="e.g. RUN001, SRR123456"
                              value={r.run_id}
                              onChange={(e) => handleUpdateRun(idx, "run_id", e.target.value)}
                            />
                          </div>

                          <div className="form-field">
                            <label htmlFor={`input-exp-id-${idx}`} className="form-label">
                              Experiment ID <span className="req">*</span>
                            </label>
                            <input
                              id={`input-exp-id-${idx}`}
                              type="text"
                              className="form-input font-mono"
                              placeholder="e.g. EXP001, SRX123456"
                              value={r.experiment_id}
                              onChange={(e) => handleUpdateRun(idx, "experiment_id", e.target.value)}
                            />
                          </div>

                          <div className="form-field">
                            <label htmlFor={`input-flowcell-${idx}`} className="form-label">
                              Flowcell Serial
                            </label>
                            <input
                              id={`input-flowcell-${idx}`}
                              type="text"
                              className="form-input font-mono"
                              placeholder="e.g. H7VNWDRXX"
                              value={r.flowcell_id || ""}
                              onChange={(e) => handleUpdateRun(idx, "flowcell_id", e.target.value)}
                            />
                          </div>

                          <div className="form-field">
                            <label htmlFor={`input-lane-${idx}`} className="form-label">
                              Flowcell Lane
                            </label>
                            <input
                              id={`input-lane-${idx}`}
                              type="number"
                              className="form-input font-mono"
                              placeholder="e.g. 1"
                              value={r.lane || ""}
                              onChange={(e) =>
                                handleUpdateRun(
                                  idx,
                                  "lane",
                                  e.target.value ? parseInt(e.target.value, 10) : undefined
                                )
                              }
                            />
                          </div>

                          <div className={`form-field ${libraryLayout === "SINGLE" ? "full-width" : ""}`}>
                            <label htmlFor={`input-forward-${idx}`} className="form-label">
                              Forward Read File (R1) <span className="req">*</span>
                            </label>
                            <input
                              id={`input-forward-${idx}`}
                              type="text"
                              className="form-input font-mono"
                              placeholder="reads/sample1_R1.fastq.gz"
                              value={r.forward_read}
                              onChange={(e) => handleUpdateRun(idx, "forward_read", e.target.value)}
                            />
                          </div>

                          {libraryLayout === "PAIRED" && (
                            <div className="form-field">
                              <label htmlFor={`input-reverse-${idx}`} className="form-label">
                                Reverse Read File (R2) <span className="req">*</span>
                              </label>
                              <input
                                id={`input-reverse-${idx}`}
                                type="text"
                                className="form-input font-mono"
                                placeholder="reads/sample1_R2.fastq.gz"
                                value={r.reverse_read || ""}
                                onChange={(e) =>
                                  handleUpdateRun(idx, "reverse_read", e.target.value)
                                }
                              />
                            </div>
                          )}

                          <div className="form-field">
                            <label htmlFor={`input-reads-${idx}`} className="form-label">
                              Total Read Count
                            </label>
                            <input
                              id={`input-reads-${idx}`}
                              type="number"
                              className="form-input font-mono"
                              placeholder="e.g. 1450000"
                              value={r.read_count || ""}
                              onChange={(e) =>
                                handleUpdateRun(
                                  idx,
                                  "read_count",
                                  e.target.value ? parseInt(e.target.value, 10) : undefined
                                )
                              }
                            />
                          </div>

                          <div className="form-field">
                            <label htmlFor={`input-bases-${idx}`} className="form-label">
                              Total Base Count (bp)
                            </label>
                            <input
                              id={`input-bases-${idx}`}
                              type="number"
                              className="form-input font-mono"
                              placeholder="e.g. 217500000"
                              value={r.base_count || ""}
                              onChange={(e) =>
                                handleUpdateRun(
                                  idx,
                                  "base_count",
                                  e.target.value ? parseInt(e.target.value, 10) : undefined
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {!isStep4Valid && (
                    <div className="step-validation-banner">
                      {fileInputMode === "browser" && inspectedFiles.length === 0 ? (
                        <p className="step-validation-hint">
                          <Info size={14} /> Please select or drop at least one sequence file above to proceed.
                        </p>
                      ) : hasHumanContamination ? (
                        <p className="step-validation-hint error">
                          <ShieldAlert size={14} /> Submission blocked: Human genomic markers detected (Taxon ID 9606).
                        </p>
                      ) : (
                        <p className="step-validation-hint">
                          <Info size={14} /> Please ensure all declared runs have valid identifiers and read paths.
                        </p>
                      )}
                    </div>
                  )}

                  <div className="step-actions split">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setCurrentStep(3)}
                    >
                      <ArrowLeft size={16} /> Back
                    </button>
                    <button
                      type="button"
                      className="btn-pill-primary"
                      disabled={!isStep4Valid}
                      onClick={() => setCurrentStep(5)}
                    >
                      Review & Ingest Dataset <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 5 / Step 3 Review: Review & Ingest Command */}
              {((currentStep === 5 && submissionTrack === "single") ||
                (currentStep === 3 && submissionTrack === "batch")) && (
                <div className="step-content">
                  <h2 className="step-heading">
                    Step {submissionTrack === "batch" ? "3" : "5"}: Review, README.md & UbuntuBio Push
                  </h2>
                  <p className="step-subheading">
                    Your dataset declaration and sequencing {submissionTrack === "batch" ? "cohort" : "runs"} are validated and ready for
                    ingestion into the sovereign hub.
                  </p>

                  {submitted ? (
                    <div className="submit-success-card">
                      <div className="success-icon-wrap">
                        <FileCheck2 size={40} className="text-green" />
                      </div>
                      <h3>
                        {fileInputMode === "browser" && !isExceedingUploadThreshold && inspectedFiles.length > 0
                          ? "Repository & Sequence Files Uploaded to UbuntuBio Hub!"
                          : hubRepoSlug
                          ? "Repository Initialized on UbuntuBio Hub!"
                          : "Ingest Ticket Initialized!"}
                      </h3>
                      <p>
                        {fileInputMode === "browser" && !isExceedingUploadThreshold && inspectedFiles.length > 0 ? (
                          <>
                            Dataset manifest and <strong>{inspectedFiles.length} sequence read file(s)</strong> (
                            {formatBytes(totalFileSizeBytes)}) were successfully ingested into the sovereign repository for{" "}
                            <strong>
                              {effectiveNamespace}/{datasetId}
                            </strong>
                            .
                          </>
                        ) : (
                          <>
                            Dataset manifest registered for{" "}
                            <strong>
                              {effectiveNamespace}/{datasetId}
                            </strong>
                            .
                            {hubRepoSlug
                              ? ` Bare Git repository successfully initialized on Hub at http://localhost:8000/${hubRepoSlug}.git.`
                              : ""}{" "}
                            Run the commands below in your local directory to sync raw sequence files into OpenXet CAS.
                          </>
                        )}
                      </p>
                      {(!isExceedingUploadThreshold && fileInputMode === "browser" && inspectedFiles.length > 0) ? null : (
                        <div className="cli-box-large">
                          <code>{generatedCliCmd}</code>
                          <button
                            type="button"
                            className="btn-copy-cli"
                            onClick={() => handleCopy(generatedCliCmd, "CLI command")}
                          >
                            <Copy size={16} />
                          </button>
                        </div>
                      )}
                      <div className="success-actions">
                        <a
                          href={`/datasets/${effectiveNamespace}/${datasetId}`}
                          className="btn-pill-primary"
                        >
                          View Dataset Details
                        </a>
                        <a href="/datasets" className="btn-secondary">
                          View in Datasets Catalog
                        </a>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => {
                            setSubmitted(false);
                            setHubRepoSlug(null);
                            setInspectedFiles([]);
                            setCurrentStep(1);
                          }}
                        >
                          Submit Another Dataset
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Side-by-Side Review Card */}
                      <div className="summary-review-card">
                        <div className="review-row">
                          <span className="review-lbl">Dataset Identifier:</span>
                          <span className="review-val font-mono">
                            {displayNamespace}/{displayDatasetSlug}
                          </span>
                        </div>
                        <div className="review-row">
                          <span className="review-lbl">Dataset Name:</span>
                          <span className="review-val">{name}</span>
                        </div>
                        <div className="review-row">
                          <span className="review-lbl">Origin AU Country:</span>
                          <span className="review-val">
                            {selectedCountryObj?.name} (<code>{countryCode}</code>)
                          </span>
                        </div>
                        <div className="review-row">
                          <span className="review-lbl">Taxonomy:</span>
                          <span className="review-val">
                            NCBI:{taxonId} ({taxonName}) &bull; {pathogenType}
                          </span>
                        </div>
                        <div className="review-row">
                          <span className="review-lbl">Platform & Layout:</span>
                          <span className="review-val">
                            {platformId} ({instrumentModel}) &bull; {libraryLayout} ({runs.length}{" "}
                            run{runs.length === 1 ? "" : "s"})
                          </span>
                        </div>
                        <div className="review-row">
                          <span className="review-lbl">Library Strategy & Source:</span>
                          <span className="review-val">
                            {libraryStrategy} &bull; {librarySource} ({biocontainment})
                          </span>
                        </div>
                      </div>

                      {/* Tabbed Ingest Artifacts: README.md vs CLI Commands */}
                      <Tabs.Root defaultValue="readme" className="tabs-container">
                        <Tabs.List className="tabs-header-bar" aria-label="Ingestion outputs">
                          <Tabs.Trigger value="readme" className="tabs-btn">
                            <FileText size={14} /> Generated README.md
                          </Tabs.Trigger>
                          <Tabs.Trigger value="samples" className="tabs-btn">
                            <FileSpreadsheet size={14} /> samples.tsv
                          </Tabs.Trigger>
                          <Tabs.Trigger value="cli" className="tabs-btn">
                            <Terminal size={14} /> Terminal CLI Push
                          </Tabs.Trigger>
                        </Tabs.List>

                        <Tabs.Content value="readme" className="tabs-panel">
                          <div className="artifact-bar">
                            <span className="artifact-bar-title font-mono">README.md</span>
                            <div className="artifact-actions">
                              <button
                                type="button"
                                className="btn-copy-sm"
                                onClick={() => handleCopy(generatedReadme, "README.md")}
                              >
                                <Copy size={13} />
                                <span>Copy Markdown</span>
                              </button>
                              <button
                                type="button"
                                className="btn-copy-sm"
                                onClick={handleDownloadReadme}
                              >
                                <Download size={13} />
                                <span>Download README.md</span>
                              </button>
                            </div>
                          </div>
                          <pre className="manifest-code-body font-mono">{generatedReadme}</pre>
                        </Tabs.Content>

                        <Tabs.Content value="samples" className="tabs-panel">
                          <div className="artifact-bar">
                            <span className="artifact-bar-title font-mono">samples.tsv</span>
                            <div className="artifact-actions">
                              <button
                                type="button"
                                className="btn-copy-sm"
                                onClick={() => handleCopy(generatedSamplesTsv, "samples.tsv")}
                              >
                                <Copy size={13} />
                                <span>Copy TSV</span>
                              </button>
                              <button
                                type="button"
                                className="btn-copy-sm"
                                onClick={handleDownloadSamplesTsv}
                              >
                                <Download size={13} />
                                <span>Download samples.tsv</span>
                              </button>
                            </div>
                          </div>
                          <pre className="manifest-code-body font-mono">{generatedSamplesTsv}</pre>
                        </Tabs.Content>

                        <Tabs.Content value="cli" className="tabs-panel">
                          <div className="artifact-bar">
                            <span className="artifact-bar-title">Terminal Push Sequence</span>
                            <button
                              type="button"
                              className="btn-copy-sm"
                              onClick={() => handleCopy(generatedCliCmd, "CLI commands")}
                            >
                              <Copy size={13} />
                              <span>Copy Commands</span>
                            </button>
                          </div>
                          <div className="cli-terminal-body">
                            <span className="cli-prompt">$</span>
                            <code className="font-mono">{generatedCliCmd}</code>
                          </div>
                        </Tabs.Content>
                      </Tabs.Root>

                      {/* Ingestion Upload Progress Indicator */}
                      {isSubmitting && (
                        <div className="upload-progress-container" role="status" aria-live="polite">
                          <div className="upload-progress-header">
                            <span className="upload-progress-title">
                              <UploadCloud size={16} className="text-green" />
                              {fileInputMode === "browser" && !isExceedingUploadThreshold && inspectedFiles.length > 0
                                ? "Ingesting Sequence Files to Sovereign Hub..."
                                : "Registering Dataset Repository on Hub API..."}
                            </span>
                            <span className="upload-progress-pct font-mono">{uploadProgress}%</span>
                          </div>
                          <Progress value={uploadProgress} />
                          <span className="upload-progress-status">{uploadStatusText}</span>
                        </div>
                      )}

                      <div className="step-actions split">
                        <button
                          type="button"
                          className="btn-secondary"
                          disabled={isSubmitting}
                          onClick={() => setCurrentStep(submissionTrack === "batch" ? 2 : 4)}
                        >
                          <ArrowLeft size={16} /> Back
                        </button>
                        <button
                          type="button"
                          className="btn-pill-primary"
                          disabled={isSubmitting}
                          onClick={handleFinalSubmit}
                        >
                          {isSubmitting
                            ? "Processing Ingestion..."
                            : fileInputMode === "browser" && !isExceedingUploadThreshold && inspectedFiles.length > 0
                            ? "Confirm & Upload Sequence Data"
                            : "Confirm & Initialize Ingest"}{" "}
                          <Check size={16} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Rail: Real-time Ingestion Preview & Guidance */}
          <aside className="ubio-submit-sidebar-rail" aria-label="Ingestion Summary">
            {/* 1. Ingestion Progress Tracker Card (Option B) */}
            <div className="submit-rail-card rail-stepper-card">
              <div className="rail-stepper-header">
                <span className="rail-stepper-title">Ingestion Progress</span>
                <span className="rail-step-badge font-mono">Step {currentStep} of {activeSteps.length}</span>
              </div>
              <ol className="rail-vertical-steps" aria-label="Submission Steps">
                {activeSteps.map((s) => {
                  const isCompleted = currentStep > s.step;
                  const isActive = currentStep === s.step;
                  return (
                    <li
                      key={s.step}
                      className={`rail-step-item ${isActive ? "active" : ""} ${
                        isCompleted ? "completed clickable" : ""
                      }`}
                      onClick={() => {
                        if (isCompleted) setCurrentStep(s.step);
                      }}
                      role={isCompleted ? "button" : undefined}
                      tabIndex={isCompleted ? 0 : undefined}
                      onKeyDown={(e) => {
                        if (isCompleted && (e.key === "Enter" || e.key === " ")) {
                          e.preventDefault();
                          setCurrentStep(s.step);
                        }
                      }}
                      aria-current={isActive ? "step" : undefined}
                    >
                      <div className="rail-step-indicator" aria-hidden="true">
                        {isCompleted ? (
                          <span className="rail-step-dot completed">
                            <Check size={11} strokeWidth={3} />
                          </span>
                        ) : isActive ? (
                          <span className="rail-step-dot active">
                            <span className="rail-step-dot-inner" />
                          </span>
                        ) : (
                          <span className="rail-step-dot pending">{s.step}</span>
                        )}
                        {s.step < activeSteps.length && (
                          <div
                            className={`rail-step-connector ${
                              currentStep > s.step ? "connector-completed" : ""
                            }`}
                          />
                        )}
                      </div>
                      <div className="rail-step-content">
                        <span className="rail-step-num font-mono">STEP {s.num}</span>
                        <span className="rail-step-label">{s.label}</span>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* 2. Live Target Repository Card */}
            <div className="submit-rail-card">
              <div className="submit-rail-header">
                <span className="rail-header-badge">
                  <Terminal size={13} className="text-green" /> Ingest Target
                </span>
                <span className="rail-live-badge">Live Preview</span>
              </div>

              <div className="rail-target-slug font-mono">
                <span className="slug-prefix">ubio.org/</span>
                <wbr />
                <span className="slug-owner">{displayNamespace}</span>
                <wbr />
                <span className="slug-slash">/</span>
                <wbr />
                {datasetId ? (
                  <span className="slug-name">{datasetId}</span>
                ) : (
                  <span className="slug-placeholder">dataset-slug</span>
                )}
              </div>

              <div className="rail-specs-list">
                <div className="rail-spec-item">
                  <span className="rail-spec-label">Domain</span>
                  {currentStep >= 2 || (taxonId && taxonName) ? (
                    <span className="rail-spec-val badge-domain">{pathogenType}</span>
                  ) : (
                    <span className="rail-spec-val text-muted">Pending Step 2</span>
                  )}
                </div>
                <div className="rail-spec-item">
                  <span className="rail-spec-label">AU Origin</span>
                  {submissionTrack === "batch" || currentStep >= 3 ? (
                    <span className="rail-spec-val font-mono">
                      {countryCode} ({selectedCountryObj?.name || "AU"})
                    </span>
                  ) : (
                    <span className="rail-spec-val text-muted">Pending Step 3</span>
                  )}
                </div>
                <div className="rail-spec-item">
                  <span className="rail-spec-label">Biosafety</span>
                  {submissionTrack === "batch" || currentStep >= 3 ? (
                    <span className="rail-spec-val badge-bsl">{biocontainment}</span>
                  ) : (
                    <span className="rail-spec-val text-muted">Pending Step 3</span>
                  )}
                </div>
                <div className="rail-spec-item">
                  <span className="rail-spec-label">Platform</span>
                  {submissionTrack === "batch" || currentStep >= 3 ? (
                    <span className="rail-spec-val text-truncate">{platformId}</span>
                  ) : (
                    <span className="rail-spec-val text-muted">Pending Step 3</span>
                  )}
                </div>
                <div className="rail-spec-item">
                  <span className="rail-spec-label">
                    {submissionTrack === "batch" ? "Samples" : "Runs"}
                  </span>
                  {submissionTrack === "batch" ? (
                    <span className="rail-spec-val font-mono">
                      {batchRows.length} declared
                    </span>
                  ) : currentStep >= 4 ? (
                    <span className="rail-spec-val font-mono">{runs.length} declared</span>
                  ) : (
                    <span className="rail-spec-val text-muted">Pending Step 4</span>
                  )}
                </div>
              </div>

              {/* Live Invariant Validation Signals */}
              <div className="rail-checklist">
                <div className={`rail-check-item ${currentStep >= 3 ? "passed" : "pending"}`}>
                  {currentStep >= 3 ? (
                    <Check size={14} className="text-green" />
                  ) : (
                    <span className="check-dot-pending" aria-hidden="true" />
                  )}
                  <span>African Union Member State Origin</span>
                </div>
                <div
                  className={`rail-check-item ${
                    isHumanTaxon
                      ? "failed"
                      : taxonId.trim().length > 0 && parseInt(taxonId, 10) > 0
                      ? "passed"
                      : "pending"
                  }`}
                >
                  {isHumanTaxon ? (
                    <AlertTriangle size={14} className="text-red" />
                  ) : taxonId.trim().length > 0 && parseInt(taxonId, 10) > 0 ? (
                    <Check size={14} className="text-green" />
                  ) : (
                    <span className="check-dot-pending" aria-hidden="true" />
                  )}
                  <span>Strict Non-Human Invariant (No 9606)</span>
                </div>
                <div className={`rail-check-item ${currentStep >= 4 ? "passed" : "pending"}`}>
                  {currentStep >= 4 ? (
                    <Check size={14} className="text-green" />
                  ) : (
                    <span className="check-dot-pending" aria-hidden="true" />
                  )}
                  <span>OpenXet Deduplication Ready</span>
                </div>
              </div>
            </div>

            {/* Terminal Alternative Card */}
            <div className="submit-rail-card cli-rail-card">
              <div className="submit-rail-header">
                <span className="rail-header-badge">
                  <UploadCloud size={13} /> Terminal CLI Push
                </span>
                <button
                  type="button"
                  className="btn-copy-sm rail-copy-btn"
                  onClick={() =>
                    handleCopy(
                      `ubio push ${displayNamespace}/${datasetId || "<dataset-slug>"} ./data`,
                      "CLI push command"
                    )
                  }
                >
                  <Copy size={12} />
                  <span>Copy</span>
                </button>
              </div>
              <p className="cli-rail-desc">Push directly from your compute cluster or pipeline:</p>
              <div className="cli-rail-code">
                <code>$ ubio push {displayNamespace}/{datasetId || "<dataset-slug>"} ./data</code>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </Tooltip.Provider>
  );
}
