"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Check,
  X,
  ShieldCheck,
  ShieldAlert,
  Info,
  ChevronDown,
  Dna,
  Bug,
  Sprout,
  RotateCcw,
} from "lucide-react";
import { suggestTaxa, TaxonSuggestion } from "../../lib/api";
import { AFRICAN_TAXA } from "../../data/africanTaxa";
import "./OrganismSelector.css";

export interface SelectedTaxon {
  taxonId: string;
  taxonName: string;
  rank?: string | undefined;
  genus?: string | undefined;
  family?: string | undefined;
  domain?: string | undefined;
  commonName?: string | undefined;
}

interface OrganismSelectorProps {
  valueTaxonId: string;
  valueTaxonName: string;
  onChange: (taxon: SelectedTaxon) => void;
  onHumanDetected?: ((isHuman: boolean) => void) | undefined;
  error?: string | undefined;
  required?: boolean | undefined;
}

// Priority African surveillance organisms for quick-pick chips
const PRIORITY_QUICK_PICKS = [
  { id: 10244, label: "Mpox", name: "Monkeypox virus", domain: "virus" },
  { id: 11620, label: "Lassa", name: "Lassa mammarenavirus", domain: "virus" },
  { id: 666, label: "Cholera", name: "Vibrio cholerae", domain: "bacteria" },
  { id: 1773, label: "TB", name: "Mycobacterium tuberculosis", domain: "bacteria" },
  { id: 562, label: "E. coli", name: "Escherichia coli", domain: "bacteria" },
  { id: 5833, label: "Malaria", name: "Plasmodium falciparum", domain: "parasite" },
  { id: 186538, label: "Ebola", name: "Zaire ebolavirus", domain: "virus" },
  { id: 11269, label: "Marburg", name: "Marburg virus", domain: "virus" },
  { id: 3983, label: "Cassava", name: "Manihot esculenta", domain: "plant" },
];

export const OrganismSelector: React.FC<OrganismSelectorProps> = ({
  valueTaxonId,
  valueTaxonName,
  onChange,
  onHumanDetected,
  error,
  required = true,
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<TaxonSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customTaxonId, setCustomTaxonId] = useState("");
  const [customTaxonName, setCustomTaxonName] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Check if current value or query is human (9606)
  const isHumanCurrent =
    parseInt(valueTaxonId, 10) === 9606 ||
    valueTaxonName.toLowerCase().includes("homo sapiens") ||
    valueTaxonName.trim().toLowerCase() === "human";

  const isHumanQuery =
    query.trim() === "9606" ||
    query.trim().toLowerCase() === "human" ||
    query.trim().toLowerCase() === "homo sapiens";

  // Notify parent component about human detection
  useEffect(() => {
    if (onHumanDetected) {
      onHumanDetected(isHumanCurrent || isHumanQuery);
    }
  }, [isHumanCurrent, isHumanQuery, onHumanDetected]);

  // Load initial suggestions and debounced search
  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await suggestTaxa(query, 12);
        if (active) {
          setSuggestions(results);
        }
      } catch {
        if (active) setSuggestions([]);
      } finally {
        if (active) setIsLoading(false);
      }
    }, 150);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  // Handle outside clicks to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSelectTaxon = (taxon: TaxonSuggestion) => {
    onChange({
      taxonId: taxon.taxon_id.toString(),
      taxonName: taxon.scientific_name,
      rank: taxon.rank,
      genus: taxon.genus || undefined,
      family: taxon.family || undefined,
      domain: taxon.domain || undefined,
      commonName: taxon.common_name || undefined,
    });
    setIsOpen(false);
    setQuery("");
  };

  const handleSelectQuickPick = (item: (typeof PRIORITY_QUICK_PICKS)[0]) => {
    const match = AFRICAN_TAXA.find((t) => t.taxon_id === item.id);
    onChange({
      taxonId: item.id.toString(),
      taxonName: match?.scientific_name || item.name,
      rank: match?.rank || "species",
      genus: match?.genus,
      family: match?.family,
      domain: match?.domain || item.domain,
      commonName: match?.common_name || item.label,
    });
    setIsOpen(false);
    setQuery("");
  };

  const handleClear = () => {
    onChange({
      taxonId: "",
      taxonName: "",
    });
    setQuery("");
    setIsCustomMode(false);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
  };

  const handleApplyCustom = () => {
    if (!customTaxonId.trim() || !customTaxonName.trim()) return;
    onChange({
      taxonId: customTaxonId.trim(),
      taxonName: customTaxonName.trim(),
      rank: "custom",
    });
    setIsCustomMode(false);
  };

  const getDomainIcon = (domain?: string | null) => {
    switch (domain) {
      case "plant":
        return <Sprout size={14} className="domain-icon-svg text-emerald-600" />;
      case "parasite":
      case "vector":
        return <Bug size={14} className="domain-icon-svg text-amber-600" />;
      default:
        return <Dna size={14} className="domain-icon-svg text-indigo-600" />;
    }
  };

  const hasSelectedValue = Boolean(valueTaxonId && valueTaxonName);

  return (
    <div className="organism-selector-container" ref={containerRef}>
      {/* Human Invariant Blocking Banner */}
      {(isHumanCurrent || isHumanQuery) && (
        <div className="organism-human-alert-banner" aria-live="polite">
          <div className="alert-banner-header">
            <ShieldAlert size={18} className="alert-icon-svg" />
            <span className="alert-title">Prohibited Target Organism: Human Genomic Data (Taxon ID 9606)</span>
          </div>
          <p className="alert-banner-body">
            African Union Data Sovereignty Invariant: Human genomics cannot be registered as target organism.
            Target organisms must be non-human pathogens, vectors, or agricultural crops.
          </p>
          <div className="alert-banner-clarification">
            <Info size={14} />
            <span>
              <strong>Clinical isolates permitted:</strong> If your pathogen (e.g. <em>Vibrio cholerae</em> or{" "}
              <em>Mycobacterium tuberculosis</em>) was isolated from a human patient, select the pathogen as the
              target organism and specify &quot;Clinical Specimen (Human Host)&quot; in the Host field below.
            </span>
          </div>
        </div>
      )}

      {/* Selected Organism Card View */}
      {hasSelectedValue && !isOpen && (
        <div className={`organism-selected-card ${isHumanCurrent ? "card-prohibited" : "card-verified"}`}>
          <div className="selected-card-main">
            <div className="selected-card-badge">
              {isHumanCurrent ? (
                <span className="badge-prohibited">
                  <ShieldAlert size={15} /> Prohibited Organism
                </span>
              ) : (
                <span className="badge-verified">
                  <ShieldCheck size={15} /> NCBI Verified Organism
                </span>
              )}
              <span className="badge-taxid font-mono">Taxon ID: {valueTaxonId}</span>
            </div>
            <div className="selected-card-details">
              <span className="selected-scientific-name font-mono">{valueTaxonName}</span>
            </div>
          </div>
          <div className="selected-card-actions">
            <button
              type="button"
              className="btn-change-organism"
              onClick={() => {
                setIsOpen(true);
                setTimeout(() => searchInputRef.current?.focus(), 50);
              }}
            >
              Change
            </button>
            <button
              type="button"
              className="btn-clear-organism"
              onClick={handleClear}
              aria-label="Clear selected organism"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Autocomplete Search & Dropdown (When unselected or editing) */}
      {(!hasSelectedValue || isOpen) && (
        <div className="organism-search-wrapper">
          <div className="organism-input-group">
            <Search size={16} className="organism-search-icon" />
            <input
              ref={searchInputRef}
              id="input-organism-search"
              type="text"
              className={`organism-search-input ${error || isHumanQuery ? "input-has-error" : ""}`}
              placeholder="Search African pathogens by name or NCBI Taxon ID (e.g. Cholera, 666, Mpox, 1773)..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              autoComplete="off"
            />
            {query && (
              <button
                type="button"
                className="btn-organism-input-clear"
                onClick={() => setQuery("")}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
            <button
              type="button"
              className="btn-organism-dropdown-toggle"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle organism list"
            >
              <ChevronDown size={16} />
            </button>
          </div>

          {/* Quick-Pick Surveillance Chips */}
          <div className="organism-quickpicks-rail">
            <span className="quickpicks-label">African Priority:</span>
            <div className="quickpicks-chips">
              {PRIORITY_QUICK_PICKS.map((qp) => (
                <button
                  key={qp.id}
                  type="button"
                  className={`chip-quickpick ${valueTaxonId === qp.id.toString() ? "active" : ""}`}
                  onClick={() => handleSelectQuickPick(qp)}
                >
                  <span className="chip-name">{qp.label}</span>
                  <span className="chip-id font-mono">{qp.id}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Autocomplete Dropdown List */}
          {isOpen && (
            <div className="organism-dropdown-menu">
              <div className="dropdown-header">
                <span>NCBI Taxonomy Suggestions</span>
                {isLoading && <span className="dropdown-loading-tag">Searching taxdump...</span>}
              </div>

              <div className="dropdown-items-scroll">
                {suggestions.length === 0 && !isLoading && (
                  <div className="dropdown-empty-state">
                    <p>No matching taxa found in local registry for &quot;{query}&quot;.</p>
                    <button
                      type="button"
                      className="btn-enter-custom-taxid"
                      onClick={() => {
                        setIsCustomMode(true);
                        setCustomTaxonId(query.replace(/\D/g, ""));
                        setCustomTaxonName(query.replace(/\d/g, "").trim());
                        setIsOpen(false);
                      }}
                    >
                      Enter custom NCBI Taxon ID manually
                    </button>
                  </div>
                )}

                {suggestions.map((item) => {
                  const isItemHuman = item.taxon_id === 9606 || item.is_prohibited;
                  const isSelected = valueTaxonId === item.taxon_id.toString();

                  return (
                    <button
                      key={item.taxon_id}
                      type="button"
                      className={`dropdown-taxon-item ${isSelected ? "item-selected" : ""} ${
                        isItemHuman ? "item-prohibited" : ""
                      }`}
                      onClick={() => handleSelectTaxon(item)}
                    >
                      <div className="item-icon-col">
                        {isItemHuman ? (
                          <ShieldAlert size={16} className="text-red-500" />
                        ) : (
                          getDomainIcon(item.domain)
                        )}
                      </div>
                      <div className="item-text-col">
                        <div className="item-title-row">
                          <span className="item-scientific-name font-mono">{item.scientific_name}</span>
                          {item.common_name && (
                            <span className="item-common-name">({item.common_name})</span>
                          )}
                        </div>
                        <div className="item-meta-row">
                          <span className="item-rank-pill">{item.rank}</span>
                          {item.genus && <span className="item-genus-pill">Genus: {item.genus}</span>}
                          {item.domain && <span className="item-domain-pill">{item.domain}</span>}
                          {isItemHuman && (
                            <span className="item-prohibited-pill">Prohibited Target</span>
                          )}
                        </div>
                      </div>
                      <div className="item-id-col font-mono">
                        <span className="item-id-pill">NCBI:{item.taxon_id}</span>
                        {isSelected && <Check size={14} className="item-check-icon text-emerald-600" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="dropdown-footer">
                <span className="dropdown-source-info">
                  Powered by local NCBI taxdump &bull; Self-hosted African pathogen registry
                </span>
                <button
                  type="button"
                  className="btn-toggle-custom"
                  onClick={() => {
                    setIsCustomMode(true);
                    setIsOpen(false);
                  }}
                >
                  Unlisted organism? Enter manually
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual Custom Entry Modal / Inline Form */}
      {isCustomMode && (
        <div className="organism-custom-entry-box">
          <div className="custom-box-header">
            <span className="custom-box-title">Enter Custom NCBI Taxonomy Metadata</span>
            <button
              type="button"
              className="btn-close-custom"
              onClick={() => setIsCustomMode(false)}
              aria-label="Close custom entry"
            >
              <X size={14} />
            </button>
          </div>
          <div className="custom-box-fields">
            <div className="custom-field">
              <label htmlFor="input-custom-taxid">NCBI Taxon ID</label>
              <input
                id="input-custom-taxid"
                type="number"
                className="form-input font-mono"
                placeholder="e.g. 28901"
                value={customTaxonId}
                onChange={(e) => setCustomTaxonId(e.target.value)}
              />
            </div>
            <div className="custom-field">
              <label htmlFor="input-custom-taxname">Scientific Name</label>
              <input
                id="input-custom-taxname"
                type="text"
                className="form-input"
                placeholder="e.g. Salmonella enterica"
                value={customTaxonName}
                onChange={(e) => setCustomTaxonName(e.target.value)}
              />
            </div>
          </div>
          <div className="custom-box-actions">
            <button
              type="button"
              className="btn-cancel-custom"
              onClick={() => setIsCustomMode(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-apply-custom"
              onClick={handleApplyCustom}
              disabled={!customTaxonId.trim() || !customTaxonName.trim()}
            >
              Apply Custom Organism
            </button>
          </div>
        </div>
      )}

      {/* Bottom error if present */}
      {error && <span className="organism-field-error">{error}</span>}
    </div>
  );
};
