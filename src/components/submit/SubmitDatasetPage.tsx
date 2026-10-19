"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Check,
  Copy,
  Terminal,
  UploadCloud,
  FileCheck2,
  ArrowRight,
  ArrowLeft,
  Info
} from "lucide-react";
import { AU_COUNTRIES, PROHIBITED_HUMAN_TAXON_ID } from "../../data/auCountries";
import { createRepository } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

export function SubmitDatasetPage() {
  const { token } = useAuth();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [namespace, setNamespace] = useState("");
  const [datasetId, setDatasetId] = useState("");
  const [name, setName] = useState("");
  const [leadInstitution, setLeadInstitution] = useState("");
  const [description, setDescription] = useState("");

  // Taxonomy State
  const [taxonId, setTaxonId] = useState("");
  const [taxonName, setTaxonName] = useState("");
  const [pathogenType, setPathogenType] = useState<"Virus" | "Bacteria" | "Vector" | "Fungus">("Virus");

  // Sovereign Provenance & MIxS State
  const [countryCode, setCountryCode] = useState("NG");
  const [seqPlatform, setSeqPlatform] = useState("Illumina NovaSeq");
  const [biocontainment, setBiocontainment] = useState("BSL-3");
  const [nagoyaAgreed, setNagoyaAgreed] = useState(false);

  // Submission result state
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hubRepoSlug, setHubRepoSlug] = useState<string | null>(null);
  const [copiedCli, setCopiedCli] = useState(false);
  const [copiedManifest, setCopiedManifest] = useState(false);

  // Validation checks
  const isHumanTaxon =
    parseInt(taxonId, 10) === PROHIBITED_HUMAN_TAXON_ID ||
    taxonName.toLowerCase().includes("homo sapiens") ||
    taxonName.toLowerCase().includes("human");

  const isStep1Valid =
    namespace.trim().length >= 2 &&
    datasetId.trim().length >= 2 &&
    name.trim().length >= 5 &&
    leadInstitution.trim().length >= 3;

  const isStep2Valid =
    taxonId.trim().length > 0 &&
    parseInt(taxonId, 10) > 0 &&
    !isHumanTaxon &&
    taxonName.trim().length >= 3;

  const isStep3Valid = countryCode.length === 2 && nagoyaAgreed;

  const selectedCountryObj = AU_COUNTRIES.find((c) => c.code === countryCode);

  const generatedCliCmd = `ubio create ${namespace || "namespace"}/${datasetId || "dataset-id"} --domain ${(pathogenType || "virus").toLowerCase()}\nubio upload ${namespace || "namespace"}/${datasetId || "dataset-id"} ./data --message "Initial dataset upload"`;

  const manifestJson = JSON.stringify(
    {
      schema: "ubuntubio.org/v1",
      namespace: namespace || "my-institution",
      datasetId: datasetId || "sample-study",
      name: name || "Genomic Study",
      leadInstitution: leadInstitution || "Lead Research Institution",
      description: description || "Pathogen surveillance cohort",
      taxonomy: {
        ncbiTaxonId: parseInt(taxonId, 10) || 0,
        scientificName: taxonName || "Taxon",
        humanExclusionVerified: true,
      },
      provenance: {
        countryCode: countryCode,
        countryName: selectedCountryObj?.name || "",
        governance: "African Union Sovereign Data Framework",
        nagoyaProtocolPermit: true,
      },
      mixs: {
        biocontainment: biocontainment,
        sequencingPlatforms: [seqPlatform],
      },
    },
    null,
    2
  );

  const handleCopyCli = () => {
    navigator.clipboard.writeText(generatedCliCmd);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  const handleCopyManifest = () => {
    navigator.clipboard.writeText(manifestJson);
    setCopiedManifest(true);
    setTimeout(() => setCopiedManifest(false), 2000);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isHumanTaxon) return;
    setIsSubmitting(true);

    try {
      const res = await createRepository(
        {
          owner_slug: namespace.trim().toLowerCase(),
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
      }
    } catch {
      // Proceed gracefully with local instructions
    } finally {
      setIsSubmitting(false);
      setSubmitted(true);
    }
  };

  return (
    <div className="ubio-submit-container">
      {/* Submit Hero Header */}
      <div className="ubio-submit-hero">
        <div className="submit-badge">
          <UploadCloud size={14} /> Sovereign Genomic Ingest Assistant
        </div>
        <h1 className="ubio-submit-title">Submit African Genomic Dataset</h1>
        <p className="ubio-submit-subtitle">
          Register sovereign pathogen or biodiversity data for sub-50ms search indexing,
          fast sequence synchronization, and African Union member state federation.
        </p>

        {/* Invariant Banner */}
        <div className="invariants-callout">
          <div className="invariant-badge-pill">
            <ShieldCheck size={14} className="text-green" />
            <span>54 AU Member States Supported</span>
          </div>
          <div className="invariant-badge-pill prohibited-pill">
            <ShieldAlert size={14} className="text-amber" />
            <span>NCBI Taxon 9606 (Human) Strictly Prohibited</span>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="submit-stepper-wrapper">
        <div className={`stepper-step ${currentStep >= 1 ? "active" : ""} ${currentStep > 1 ? "completed" : ""}`}>
          <div className="step-circle">{currentStep > 1 ? <Check size={14} /> : "1"}</div>
          <span className="step-label">Identification</span>
        </div>
        <div className="step-line" />
        <div className={`stepper-step ${currentStep >= 2 ? "active" : ""} ${currentStep > 2 ? "completed" : ""}`}>
          <div className="step-circle">{currentStep > 2 ? <Check size={14} /> : "2"}</div>
          <span className="step-label">Taxonomy & Safety</span>
        </div>
        <div className="step-line" />
        <div className={`stepper-step ${currentStep >= 3 ? "active" : ""} ${currentStep > 3 ? "completed" : ""}`}>
          <div className="step-circle">{currentStep > 3 ? <Check size={14} /> : "3"}</div>
          <span className="step-label">Sovereign Specs</span>
        </div>
        <div className="step-line" />
        <div className={`stepper-step ${currentStep >= 4 ? "active" : ""}`}>
          <div className="step-circle">4</div>
          <span className="step-label">Ingest & Push</span>
        </div>
      </div>

      {/* Main Wizard Form Card */}
      <div className="submit-card">
        {/* Step 1: Identification */}
        {currentStep === 1 && (
          <div className="step-content">
            <h2 className="step-heading">Step 1: Dataset Namespace & Metadata</h2>
            <p className="step-subheading">
              Identify your research organization or namespace and provide the formal title for this genomic dataset.
            </p>

            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="input-namespace" className="form-label">
                  Namespace Identifier <span className="req">*</span>
                </label>
                <div className="input-group">
                  <span className="input-prefix">ubio.org/</span>
                  <input
                    id="input-namespace"
                    type="text"
                    className="form-input font-mono"
                    placeholder="e.g. acegid, pasteur-dakar, kemri"
                    value={namespace}
                    onChange={(e) => setNamespace(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ""))}
                  />
                </div>
                <span className="field-hint">Lowercase letters, numbers, hyphens only.</span>
              </div>

              <div className="form-field">
                <label htmlFor="input-dataset-id" className="form-label">
                  Dataset Slug ID <span className="req">*</span>
                </label>
                <input
                  id="input-dataset-id"
                  type="text"
                  className="form-input font-mono"
                  placeholder="e.g. lassa-surveillance-2026"
                  value={datasetId}
                  onChange={(e) => setDatasetId(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ""))}
                />
                <span className="field-hint">Unique identifier within your namespace.</span>
              </div>

              <div className="form-field full-width">
                <label htmlFor="input-dataset-name" className="form-label">
                  Formal Dataset Name <span className="req">*</span>
                </label>
                <input
                  id="input-dataset-name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Lassa Mammarenavirus Genomic Surveillance (West Africa)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-field full-width">
                <label htmlFor="input-lead-inst" className="form-label">
                  Contributing Institution / Organization <span className="req">*</span>
                </label>
                <input
                  id="input-lead-inst"
                  type="text"
                  className="form-input"
                  placeholder="e.g. ACEGID Redeemer's University, Ede, Nigeria"
                  value={leadInstitution}
                  onChange={(e) => setLeadInstitution(e.target.value)}
                />
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
                disabled={!isStep1Valid}
                onClick={() => setCurrentStep(2)}
              >
                Proceed to Taxonomy & Safety <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Taxonomy & Non-Human Biological Verification */}
        {currentStep === 2 && (
          <div className="step-content">
            <h2 className="step-heading">Step 2: Taxonomy & Strict Human Exclusion Verification</h2>
            <p className="step-subheading">
              UbuntuBio strictly permits pathogen, microbial, vector, and agricultural genomics.
              NCBI Taxon ID 9606 is prohibited.
            </p>

            {/* Human Taxon Violation Banner */}
            {isHumanTaxon && (
              <div className="violation-banner" role="alert">
                <ShieldAlert size={24} className="violation-icon" />
                <div className="violation-content">
                  <h4 className="violation-title">Prohibited Taxon Invariant Triggered!</h4>
                  <p className="violation-text">
                    Human genomic data (<strong>NCBI Taxon ID 9606 / <em>Homo sapiens</em></strong>) is strictly
                    prohibited in UbuntuBio v1 under the African Union Data Sovereignty & Genomic Privacy Invariants.
                    Submissions of human genomic DNA/RNA cannot proceed.
                  </p>
                </div>
              </div>
            )}

            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="input-taxon-id" className="form-label">
                  NCBI Taxonomy ID <span className="req">*</span>
                </label>
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
                <div className={`safety-verification-badge ${isHumanTaxon ? "failed" : "passed"}`}>
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
                Continue to Sovereign Specs <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Sovereign Provenance & MIxS Specs */}
        {currentStep === 3 && (
          <div className="step-content">
            <h2 className="step-heading">Step 3: Sovereign Provenance & MIxS Specifications</h2>
            <p className="step-subheading">
              Declare the African Union member state where biological samples were collected, and laboratory specs.
            </p>

            <div className="form-grid">
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
                <label htmlFor="select-platform" className="form-label">
                  Primary Sequencing Platform
                </label>
                <select
                  id="select-platform"
                  className="form-select"
                  value={seqPlatform}
                  onChange={(e) => setSeqPlatform(e.target.value)}
                >
                  <option value="Illumina NovaSeq">Illumina NovaSeq 6000 / X Plus</option>
                  <option value="Oxford Nanopore GridION">Oxford Nanopore GridION / PromethION</option>
                  <option value="Illumina MiSeq">Illumina MiSeq</option>
                  <option value="PacBio Revio">PacBio Revio (HiFi)</option>
                  <option value="MGI DNBSEQ">MGI DNBSEQ-G400</option>
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="select-bsl" className="form-label">
                  Biosafety Containment Level (BSL)
                </label>
                <select
                  id="select-bsl"
                  className="form-select"
                  value={biocontainment}
                  onChange={(e) => setBiocontainment(e.target.value)}
                >
                  <option value="BSL-1">BSL-1 (Minimal Risk Organisms)</option>
                  <option value="BSL-2">BSL-2 (Moderate Hazard Pathogens)</option>
                  <option value="BSL-3">BSL-3 (High Risk Indigenous Aerosols)</option>
                  <option value="BSL-4">BSL-4 (Maximum Biohazard / VHF)</option>
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
                      I certify that biological materials and digital sequence information (DSI) originate from{" "}
                      <strong>{selectedCountryObj?.name}</strong> and conform to national prior informed consent (PIC)
                      and mutually agreed terms (MAT) pursuant to the Nagoya Protocol and AU sovereign genomic frameworks.
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
                Review & Generate Ingest Command <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Review & Ingest Command */}
        {currentStep === 4 && (
          <div className="step-content">
            <h2 className="step-heading">Step 4: Dataset Manifest & UbuntuBio CLI Push</h2>
            <p className="step-subheading">
              Your dataset declaration is validated and ready for ingestion into the sovereign hub.
            </p>

            {submitted ? (
              <div className="submit-success-card">
                <div className="success-icon-wrap">
                  <FileCheck2 size={40} className="text-green" />
                </div>
                <h3>{hubRepoSlug ? "Repository Created on UbuntuBio Hub!" : "Ingest Ticket Initialized!"}</h3>
                <p>
                  Dataset manifest registered for{" "}
                  <strong>
                    {namespace}/{datasetId}
                  </strong>
                  .{hubRepoSlug ? ` Bare Git repository successfully initialized on Hub at http://localhost:8000/${hubRepoSlug}.git.` : ""} Run the command below in your local sequencing directory to push files into OpenXet CAS.
                </p>
                <div className="cli-box-large">
                  <code>{generatedCliCmd}</code>
                  <button type="button" className="btn-copy-cli" onClick={handleCopyCli}>
                    {copiedCli ? <Check size={16} className="text-green" /> : <Copy size={16} />}
                  </button>
                </div>
                <div className="success-actions">
                  <a href={`/datasets/${namespace}/${datasetId}`} className="btn-pill-primary">
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
                <div className="summary-review-card">
                  <div className="review-row">
                    <span className="review-lbl">Dataset Identifier:</span>
                    <span className="review-val font-mono">
                      {namespace}/{datasetId}
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
                    <span className="review-lbl">Taxonomy & Category:</span>
                    <span className="review-val">
                      NCBI:{taxonId} ({taxonName}) &bull; {pathogenType}
                    </span>
                  </div>
                  <div className="review-row">
                    <span className="review-lbl">Biocontainment / Platform:</span>
                    <span className="review-val">
                      {biocontainment} &bull; {seqPlatform}
                    </span>
                  </div>
                </div>

                {/* CLI Push Command Block */}
                <div className="cli-section-block">
                  <div className="cli-header-bar">
                    <span className="cli-bar-title">
                      <Terminal size={14} className="text-green" /> Execute Ingest via UbuntuBio CLI
                    </span>
                    <button type="button" className="btn-copy-sm" onClick={handleCopyCli}>
                      {copiedCli ? <Check size={13} className="text-green" /> : <Copy size={13} />}
                      <span>{copiedCli ? "Copied" : "Copy Command"}</span>
                    </button>
                  </div>
                  <div className="cli-terminal-body">
                    <span className="cli-prompt">$</span>
                    <code className="font-mono">{generatedCliCmd}</code>
                  </div>
                </div>

                {/* Manifest JSON Preview */}
                <div className="manifest-section-block">
                  <div className="cli-header-bar">
                    <span className="cli-bar-title">
                      <FileCheck2 size={14} className="text-green" /> Generated ubuntubio.json Manifest
                    </span>
                    <button type="button" className="btn-copy-sm" onClick={handleCopyManifest}>
                      {copiedManifest ? <Check size={13} className="text-green" /> : <Copy size={13} />}
                      <span>{copiedManifest ? "Copied" : "Copy JSON"}</span>
                    </button>
                  </div>
                  <pre className="manifest-code-body font-mono">{manifestJson}</pre>
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
                    disabled={isSubmitting}
                    onClick={handleFinalSubmit}
                  >
                    {isSubmitting ? "Initializing on Hub API..." : "Confirm & Initialize Ingest"}{" "}
                    <Check size={16} />
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
