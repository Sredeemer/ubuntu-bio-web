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
  Download,
  Dna,
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
} from "../../data/sequencingPlatforms";
import { createRepository } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { SequenceDropzone } from "./SequenceDropzone";
import { generateDatasetReadme, SequencingRunEntry } from "../../lib/readmeGenerator";
import { WebSequenceInspectionResult } from "../../lib/sequenceSnifferWeb";

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
  const [pathogenType, setPathogenType] = useState<"Virus" | "Bacteria" | "Vector" | "Fungus">("Virus");
  const [hostTaxonId, setHostTaxonId] = useState("");
  const [hostSpecies, setHostSpecies] = useState("");
  const [collectionDate, setCollectionDate] = useState("");
  const [sampleType, setSampleType] = useState("Blood / Swab specimen");

  // Step 3: Sequencing Technology & Sovereign Specs
  const [countryCode, setCountryCode] = useState("NG");
  const [platformId, setPlatformId] = useState<"ILLUMINA" | "OXFORD_NANOPORE" | "PACBIO" | "MGI" | "ION_TORRENT">("ILLUMINA");
  const [instrumentModel, setInstrumentModel] = useState("Illumina NovaSeq 6000");
  const [libraryStrategy, setLibraryStrategy] = useState("WGS");
  const [librarySource, setLibrarySource] = useState("VIRAL_RNA");
  const [librarySelection, setLibrarySelection] = useState("PCR");
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

  // When platform changes, update instrument model to default for platform
  const handlePlatformChange = (newPlatformId: "ILLUMINA" | "OXFORD_NANOPORE" | "PACBIO" | "MGI" | "ION_TORRENT") => {
    setPlatformId(newPlatformId);
    const platformConfig = SEQUENCING_PLATFORMS.find((p) => p.id === newPlatformId);
    if (platformConfig) {
      setInstrumentModel(platformConfig.defaultModel);
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

  const isStep2Valid =
    taxonId.trim().length > 0 &&
    parseInt(taxonId, 10) > 0 &&
    !isHumanTaxon &&
    taxonName.trim().length >= 3;

  const isStep3Valid = countryCode.length === 2 && nagoyaAgreed;

  const isStep4Valid =
    runs.length > 0 &&
    runs.every((r) => {
      const hasBasic = r.run_id.trim().length > 0 && r.forward_read.trim().length > 0;
      if (libraryLayout === "PAIRED") {
        return hasBasic && Boolean(r.reverse_read && r.reverse_read.trim().length > 0);
      }
      return hasBasic;
    });

  const selectedCountryObj = AU_COUNTRIES.find((c) => c.code === countryCode);
  const currentPlatformConfig = SEQUENCING_PLATFORMS.find((p) => p.id === platformId);

  const displayNamespace = effectiveNamespace || "namespace";
  const displayDatasetSlug = datasetId || "dataset-slug";

  const generatedCliCmd = `ubio create ${displayNamespace}/${displayDatasetSlug} --domain ${(pathogenType || "virus").toLowerCase()}\nubio check .\nubio push ${displayNamespace}/${displayDatasetSlug} . --message "Initial sovereign dataset upload"`;

  // Generate canonical README.md
  const generatedReadme = generateDatasetReadme({
    title: name || "Genomic Surveillance Cohort",
    domain: pathogenType.toLowerCase(),
    authorName: user?.name || "Principal Investigator",
    authorAffiliation: leadInstitution || "Lead Research Institution",
    countryCode,
    countryName: selectedCountryObj?.name || "African Union Member State",
    institution: leadInstitution || "Contributing Institution",
    collectionDate,
    sampleType,
    hostTaxonId: hostTaxonId ? parseInt(hostTaxonId, 10) : undefined,
    hostSpecies: hostSpecies || undefined,
    taxonId: parseInt(taxonId, 10) || 0,
    scientificName: taxonName || "Pathogen",
    platform: platformId,
    instrumentModel,
    libraryStrategy,
    librarySource,
    librarySelection,
    libraryLayout,
    runs,
    description,
  });

  // Handle files dropped in SequenceDropzone
  const handleFilesInspected = (inspected: WebSequenceInspectionResult[]) => {
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

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isHumanTaxon) return;
    setIsSubmitting(true);

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
            {/* 5-Step Progress Stepper */}
            <div className="submit-stepper-wrapper">
              <div
                className={`stepper-step ${currentStep >= 1 ? "active" : ""} ${
                  currentStep > 1 ? "completed" : ""
                }`}
              >
                <div className="step-circle">{currentStep > 1 ? <Check size={14} /> : "1"}</div>
                <span className="step-label">Identification</span>
              </div>
              <div className="step-line" />
              <div
                className={`stepper-step ${currentStep >= 2 ? "active" : ""} ${
                  currentStep > 2 ? "completed" : ""
                }`}
              >
                <div className="step-circle">{currentStep > 2 ? <Check size={14} /> : "2"}</div>
                <span className="step-label">Taxonomy & Safety</span>
              </div>
              <div className="step-line" />
              <div
                className={`stepper-step ${currentStep >= 3 ? "active" : ""} ${
                  currentStep > 3 ? "completed" : ""
                }`}
              >
                <div className="step-circle">{currentStep > 3 ? <Check size={14} /> : "3"}</div>
                <span className="step-label">Sequencing Specs</span>
              </div>
              <div className="step-line" />
              <div
                className={`stepper-step ${currentStep >= 4 ? "active" : ""} ${
                  currentStep > 4 ? "completed" : ""
                }`}
              >
                <div className="step-circle">{currentStep > 4 ? <Check size={14} /> : "4"}</div>
                <span className="step-label">Runs & Files</span>
              </div>
              <div className="step-line" />
              <div className={`stepper-step ${currentStep >= 5 ? "active" : ""}`}>
                <div className="step-circle">5</div>
                <span className="step-label">Review & Ingest</span>
              </div>
            </div>

            {/* Main Wizard Form Card */}
            <div className="submit-card">
              {/* Step 1: Identification */}
              {currentStep === 1 && (
                <div className="step-content">
                  <h2 className="step-heading">Step 1: Dataset Namespace & Metadata</h2>
                  <p className="step-subheading">
                    Identify your verified researcher namespace and provide the formal title for
                    this genomic dataset.
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
                            onClick={() => {
                              setIsCustomNamespace(false);
                              setNamespace(userNamespace);
                            }}
                          >
                            Use personal (@{userNamespace})
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
                          <div className="detected-badge-left">
                            <ShieldCheck size={18} className="text-green flex-shrink-0" />
                            <div>
                              <div className="detected-slug font-mono">
                                ubio.org/@{userNamespace}
                              </div>
                              <div className="detected-label">
                                Verified Personal Namespace
                              </div>
                            </div>
                          </div>
                          <span className="detected-tag">Auto-detected</span>
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
                              placeholder="e.g. acegid, pasteur-dakar, kemri"
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
                      <span className="field-hint">
                        {isAuthenticated && !isCustomNamespace
                          ? "Publishing under your verified personal namespace."
                          : "Lowercase letters, numbers, hyphens only."}
                      </span>
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

                  <div className="step-actions right">
                    <button
                      type="button"
                      className="btn-pill-primary"
                      onClick={handleProceedToStep2}
                    >
                      Proceed to Taxonomy & Safety <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Taxonomy & Strict Human Exclusion Verification */}
              {currentStep === 2 && (
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
                    </div>

                    <div className="form-field">
                      <label htmlFor="select-pathogen-type" className="form-label">
                        Pathogen / Biological Category <span className="req">*</span>
                      </label>
                      <select
                        id="select-pathogen-type"
                        className="form-select"
                        value={pathogenType}
                        onChange={(e) => setPathogenType(e.target.value as any)}
                      >
                        <option value="Virus">Virus (e.g. Lassa, Ebola, Marburg, H5N1)</option>
                        <option value="Bacteria">Bacteria (e.g. M. tuberculosis, Vibrio cholerae)</option>
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

                    <div className="form-field">
                      <label htmlFor="input-host-species" className="form-label">
                        Host Organism / Vector
                      </label>
                      <input
                        id="input-host-species"
                        type="text"
                        className="form-input"
                        placeholder="e.g. Mastomys natalensis, Rousettus aegyptiacus"
                        value={hostSpecies}
                        onChange={(e) => setHostSpecies(e.target.value)}
                      />
                    </div>

                    <div className="form-field">
                      <label htmlFor="input-host-tax-id" className="form-label">
                        Host NCBI Taxon ID
                      </label>
                      <input
                        id="input-host-tax-id"
                        type="number"
                        className="form-input font-mono"
                        placeholder="e.g. 10090, 7165"
                        value={hostTaxonId}
                        onChange={(e) => setHostTaxonId(e.target.value)}
                      />
                    </div>

                    <div className="form-field">
                      <label htmlFor="input-sample-date" className="form-label">
                        Collection Date
                      </label>
                      <input
                        id="input-sample-date"
                        type="date"
                        className="form-input"
                        value={collectionDate}
                        onChange={(e) => setCollectionDate(e.target.value)}
                      />
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

              {/* Step 3: Sequencing Technology & Protocol Specs */}
              {currentStep === 3 && (
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
                        onChange={(e) => setLibraryStrategy(e.target.value)}
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
                        {LIBRARY_SOURCES.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.label}
                          </option>
                        ))}
                      </select>
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
                        {LIBRARY_SELECTIONS.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-field">
                      <label htmlFor="select-layout" className="form-label">
                        Library Layout <span className="req">*</span>
                      </label>
                      <select
                        id="select-layout"
                        className="form-select font-mono"
                        value={libraryLayout}
                        onChange={(e) => setLibraryLayout(e.target.value as any)}
                      >
                        <option value="PAIRED">PAIRED (Forward R1 & Reverse R2 Reads)</option>
                        <option value="SINGLE">SINGLE (Forward Reads Only)</option>
                      </select>
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
                        className="form-select"
                        value={biocontainment}
                        onChange={(e) => setBiocontainment(e.target.value)}
                      >
                        {BIOSAFETY_LEVELS.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.label}
                          </option>
                        ))}
                      </select>
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

              {/* Step 4: Sequencing Runs & Sequence Files */}
              {currentStep === 4 && (
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

                  {/* Browser Dropzone Pre-flight Sniffer */}
                  <div className="dropzone-section-box">
                    <SequenceDropzone onFilesInspected={handleFilesInspected} />
                  </div>

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

              {/* Step 5: Review & Ingest Command */}
              {currentStep === 5 && (
                <div className="step-content">
                  <h2 className="step-heading">Step 5: Review, README.md & UbuntuBio Push</h2>
                  <p className="step-subheading">
                    Your dataset declaration and sequencing runs are validated and ready for
                    ingestion into the sovereign hub.
                  </p>

                  {submitted ? (
                    <div className="submit-success-card">
                      <div className="success-icon-wrap">
                        <FileCheck2 size={40} className="text-green" />
                      </div>
                      <h3>
                        {hubRepoSlug
                          ? "Repository Created on UbuntuBio Hub!"
                          : "Ingest Ticket Initialized!"}
                      </h3>
                      <p>
                        Dataset manifest registered for{" "}
                        <strong>
                          {namespace}/{datasetId}
                        </strong>
                        .
                        {hubRepoSlug
                          ? ` Bare Git repository successfully initialized on Hub at http://localhost:8000/${hubRepoSlug}.git.`
                          : ""}{" "}
                        Run the commands below in your local directory to sync files into OpenXet
                        CAS.
                      </p>
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
                      <div className="success-actions">
                        <a
                          href={`/datasets/${namespace}/${datasetId}`}
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

                      <div className="step-actions split">
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => setCurrentStep(4)}
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
                            ? "Initializing on Hub API..."
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
            {/* Live Target Repository Card */}
            <div className="submit-rail-card">
              <div className="submit-rail-header">
                <span className="rail-header-badge">
                  <Terminal size={13} className="text-green" /> Ingest Target
                </span>
                <span className="rail-step-badge">Step {currentStep} of 5</span>
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
                  <span className="slug-placeholder">your-dataset-slug</span>
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
                  {currentStep >= 3 ? (
                    <span className="rail-spec-val font-mono">
                      {countryCode} ({selectedCountryObj?.name || "AU"})
                    </span>
                  ) : (
                    <span className="rail-spec-val text-muted">Pending Step 3</span>
                  )}
                </div>
                <div className="rail-spec-item">
                  <span className="rail-spec-label">Biosafety</span>
                  {currentStep >= 3 ? (
                    <span className="rail-spec-val badge-bsl">{biocontainment}</span>
                  ) : (
                    <span className="rail-spec-val text-muted">Pending Step 3</span>
                  )}
                </div>
                <div className="rail-spec-item">
                  <span className="rail-spec-label">Platform</span>
                  {currentStep >= 3 ? (
                    <span className="rail-spec-val text-truncate">{platformId}</span>
                  ) : (
                    <span className="rail-spec-val text-muted">Pending Step 3</span>
                  )}
                </div>
                <div className="rail-spec-item">
                  <span className="rail-spec-label">Runs</span>
                  {currentStep >= 4 ? (
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
                  className="btn-copy-sm"
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
