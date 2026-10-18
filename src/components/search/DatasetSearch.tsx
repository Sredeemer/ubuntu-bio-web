"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Search, Check, Copy, ArrowRight } from "lucide-react";
import { AU_COUNTRIES } from "../../data/auCountries";
import { searchDatasets } from "../../lib/api";

export interface DatasetItem {
  id: string;
  name: string;
  countryCode: string;
  countryName: string;
  taxonId: number;
  taxonName: string;
  pathogenType: "Virus" | "Bacteria" | "Vector" | "Fungus";
  samplesCount: number;
  totalSizeMb: number;
  biocontainment: string;
  accessGate: "public" | "gated";
  description: string;
  leadInstitution: string;
  updatedAt: string;
}

const SAMPLE_DATASETS: DatasetItem[] = [
  {
    id: "pasteur-dakar/lassa-surveillance-2026",
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
    description: "Deep sequencing reads tracking S and L RNA segment diversification across West African clinical isolates.",
    leadInstitution: "Institut Pasteur de Dakar",
    updatedAt: "2026-10-14",
  },
  {
    id: "kemri/cholera-outbreak-kisumu",
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
    description: "Whole-genome callsets resolving antimicrobial resistance genes and seventh pandemic El Tor lineage dynamics.",
    leadInstitution: "KEMRI (Kenya Medical Research Institute)",
    updatedAt: "2026-09-28",
  },
  {
    id: "acegid/mpox-clade-i-drcongo",
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
    description: "High-coverage genomic sequencing tracking MPXV Clade I transmission chains in South Kivu province.",
    leadInstitution: "ACEGID & INRB Kinshasa",
    updatedAt: "2026-10-02",
  },
  {
    id: "kzn-bio/tb-lineage-4-resistance",
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
    description: "NovaSeq and PacBio HiFi datasets resolving bedaquiline and fluoroquinolone target mutations.",
    leadInstitution: "KRISP, University of KwaZulu-Natal",
    updatedAt: "2026-08-19",
  },
  {
    id: "pamca/anopheles-gambiae-kdr",
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
    description: "Vector population genomics profiling voltage-gated sodium channel mutations across regional surveillance programs.",
    leadInstitution: "PAMCA & Noguchi Memorial Institute",
    updatedAt: "2026-09-12",
  },
  {
    id: "cairo-vet/avian-influenza-h5n1",
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
    description: "Reassortment mapping of hemagglutinin and neuraminidase genes in migratory avian flyways.",
    leadInstitution: "National Research Centre Cairo",
    updatedAt: "2026-09-30",
  },
];

export function DatasetSearch() {
  const [datasetsList, setDatasetsList] = useState<DatasetItem[]>(SAMPLE_DATASETS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sync with live FastAPI hub search
  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      searchDatasets(searchQuery, {
        country: selectedCountry !== "all" ? selectedCountry : undefined,
      }).then((result) => {
        if (!active) return;
        if (result.isLive && result.items.length > 0) {
          const liveIds = new Set(result.items.map((i) => i.id));
          const merged = [
            ...result.items,
            ...SAMPLE_DATASETS.filter((d) => !liveIds.has(d.id)),
          ];
          setDatasetsList(merged);
        }
      });
    }, 200);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchQuery, selectedCountry]);

  const filteredDatasets = useMemo(() => {
    return datasetsList.filter((item) => {
      const matchesSearch =
        searchQuery === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.countryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.countryCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = selectedType === "all" || item.pathogenType === selectedType;
      const matchesCountry =
        selectedCountry === "all" || item.countryCode === selectedCountry;

      return matchesSearch && matchesType && matchesCountry;
    });
  }, [datasetsList, searchQuery, selectedType, selectedCountry]);

  const copyPullCommand = (id: string) => {
    navigator.clipboard.writeText(`ubio pull ${id}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="ubio-band-light">
    <section className="ubio-catalog-section" id="catalog" aria-label="Dataset Catalog">
      <div className="ubio-catalog-header">
        <div className="ubio-catalog-heading">
          <span className="ubio-eyebrow ubio-eyebrow--ink">Dataset catalog</span>
          <h2 className="ubio-catalog-title">African Bioinformatics Datasets</h2>
          <p className="ubio-catalog-subtitle">
            Curated pathogen isolates, antimicrobial resistance profiles, and disease vector
            sequences from the 54 African Union member states.
          </p>
        </div>
        <a href="#coverage" className="ubio-link-chevron catalog-header-link">
          <span>View regional coverage</span>
          <ArrowRight size={18} aria-hidden="true" />
        </a>
      </div>

      {/* MongoDB-Style Search & Filter Toolbar */}
      <div className="ubio-search-toolbar">
        <div className="ubio-search-input-box">
          <Search size={18} className="search-icon" aria-hidden="true" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by pathogen, NCBI taxon, country, or dataset..."
            className="ubio-search-input"
            aria-label="Search datasets"
          />
        </div>

        {/* Segmented Control Bar & Country Dropdown */}
        <div className="ubio-filter-row">
          <div className="filter-segmented-control" role="radiogroup" aria-label="Pathogen Type">
            {["all", "Virus", "Bacteria", "Vector"].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`segmented-pill ${selectedType === t ? "active" : ""}`}
              >
                {t === "all" ? "All Pathogens" : t}
              </button>
            ))}
          </div>

          <div className="ubio-country-filter">
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="ubio-country-select"
              aria-label="Filter by African Union nation"
            >
              <option value="all">All 54 AU Nations</option>
              {AU_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Dataset Cards Grid */}
      <div className="ubio-dataset-grid">
        {filteredDatasets.length === 0 ? (
          <div className="ubio-empty-state">
            <p>No matching African datasets found for your criteria.</p>
          </div>
        ) : (
          filteredDatasets.map((ds) => (
            <article key={ds.id} className="ubio-dataset-card">
              {/* Top Meta Bar */}
              <div className="dataset-header-row">
                <div className="dataset-badge-cluster">
                  <span className="dataset-category-pill">
                    {ds.pathogenType}
                  </span>
                  <span className="dataset-country-pill">
                    {ds.countryCode} • {ds.countryName}
                  </span>
                </div>

                <div className="dataset-gate-wrapper">
                  {ds.accessGate === "public" ? (
                    <span className="gate-pill gate-public">
                      <span className="status-dot green" />
                      Open Access
                    </span>
                  ) : (
                    <span className="gate-pill gate-gated">
                      <span className="status-dot amber" />
                      Nagoya Gated
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Scientific Taxonomy */}
              <div className="dataset-title-block">
                <h3 className="dataset-name">{ds.name}</h3>
                <div className="dataset-taxon-row">
                  <span className="taxon-scientific">NCBI:{ds.taxonId}</span>
                  <span className="taxon-id-chip">Verified BioProject</span>
                </div>
              </div>

              <p className="dataset-description">{ds.description}</p>

              {/* Streamlined Stats Ribbon (MongoDB Specification Bar) */}
              <div className="dataset-stats-ribbon">
                <div className="stat-unit">
                  <span className="stat-label">Isolates</span>
                  <span className="stat-number">{ds.samplesCount}</span>
                </div>
                <div className="stat-divider" />
                <div className="stat-unit">
                  <span className="stat-label">Data Volume</span>
                  <span className="stat-number">{(ds.totalSizeMb / 1024).toFixed(1)} GB</span>
                </div>
                <div className="stat-divider" />
                <div className="stat-unit">
                  <span className="stat-label">Biocontainment</span>
                  <span className="stat-number">{ds.biocontainment}</span>
                </div>
              </div>

              {/* Pull Command Action Bar */}
              <div className="dataset-footer-strip">
                <span className="dataset-institution-name" title={ds.leadInstitution}>
                  {ds.leadInstitution}
                </span>
                <button
                  onClick={() => copyPullCommand(ds.id)}
                  className="btn-pull-action"
                  title="Copy CLI command"
                  aria-label={`Copy pull command for ${ds.id}`}
                >
                  <code className="pull-code">ubio pull {ds.id.split("/")[1]}</code>
                  {copiedId === ds.id ? (
                    <Check size={13} className="action-icon icon-copied" />
                  ) : (
                    <Copy size={13} className="action-icon" />
                  )}
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
    </div>
  );
}
