"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Database,
  Check,
  Copy,
  ArrowRight,
  FolderTree,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { getAllDatasets } from "../../data/datasets";
import { AU_COUNTRIES } from "../../data/auCountries";

export function DatasetsCatalogPage() {
  const allDatasets = getAllDatasets();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedBSLs, setSelectedBSLs] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [countryFilterText, setCountryFilterText] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredDatasets = useMemo(() => {
    return allDatasets.filter((d) => {
      // Type filter (checkboxes)
      if (selectedTypes.length > 0 && !selectedTypes.includes(d.pathogenType)) {
        return false;
      }
      // BSL filter (checkboxes)
      if (selectedBSLs.length > 0 && !selectedBSLs.includes(d.biocontainment)) {
        return false;
      }
      // Country filter (checkboxes)
      if (
        selectedCountries.length > 0 &&
        !selectedCountries.includes(d.countryCode)
      ) {
        return false;
      }
      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        d.name.toLowerCase().includes(q) ||
        d.taxonName.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q) ||
        d.leadInstitution.toLowerCase().includes(q) ||
        d.countryName.toLowerCase().includes(q) ||
        d.taxonId.toString().includes(q) ||
        d.description.toLowerCase().includes(q)
      );
    });
  }, [allDatasets, searchQuery, selectedTypes, selectedBSLs, selectedCountries]);

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleBSL = (bsl: string) => {
    setSelectedBSLs((prev) =>
      prev.includes(bsl) ? prev.filter((b) => b !== bsl) : [...prev, bsl]
    );
  };

  const toggleCountry = (code: string) => {
    setSelectedCountries((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleCopyPull = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(`ubio pull ${id}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedTypes([]);
    setSelectedBSLs([]);
    setSelectedCountries([]);
    setCountryFilterText("");
  };

  const visibleCountries = useMemo(() => {
    if (!countryFilterText.trim()) return AU_COUNTRIES;
    const q = countryFilterText.toLowerCase().trim();
    return AU_COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [countryFilterText]);

  const activeFiltersCount =
    selectedTypes.length + selectedBSLs.length + selectedCountries.length;
  const hasActiveFilters =
    activeFiltersCount > 0 || searchQuery.trim() !== "";

  return (
    <div className="ubio-catalog-container">
      {/* Catalog Hero Banner */}
      <section className="ubio-catalog-hero">
        <div className="ubio-catalog-hero-inner">
          <div className="ubio-catalog-badge">
            <Database size={14} />
            <span>Open Sovereign Genomic Index</span>
          </div>
          <h1 className="ubio-catalog-title">
            African Pathogen &amp; Genomic Catalog
          </h1>
          <p className="ubio-catalog-subtitle">
            Explore peer-validated non-human genomic datasets across 54 African
            Union member states with sub-50ms search and fast sequence
            synchronization.
          </p>

          {/* Quick Metrics Bar */}
          <div className="ubio-catalog-metrics-bar">
            <div className="metric-item">
              <span className="metric-val">{allDatasets.length}</span>
              <span className="metric-lbl">Indexed Datasets</span>
            </div>
            <div className="metric-divider" />
            <div className="metric-item">
              <span className="metric-val">54</span>
              <span className="metric-lbl">AU States Permitted</span>
            </div>
            <div className="metric-divider" />
            <div className="metric-item">
              <span className="metric-val">
                {allDatasets
                  .reduce((acc, d) => acc + d.samplesCount, 0)
                  .toLocaleString()}
              </span>
              <span className="metric-lbl">Sequenced Samples</span>
            </div>
            <div className="metric-divider" />
            <div className="metric-item">
              <span className="metric-val">
                {(
                  allDatasets.reduce((acc, d) => acc + d.totalSizeMb, 0) / 1024
                ).toFixed(1)}{" "}
                GB
              </span>
              <span className="metric-lbl">Total Volume</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Two-Column Layout */}
      <div className="ubio-catalog-layout">
        {/* Collapsible Sidebar Filter Panel */}
        <aside
          className={`ubio-catalog-sidebar ${isSidebarOpen ? "open" : "collapsed"}`}
          aria-label="Dataset filters"
        >
          <div className="sidebar-inner">
            <div className="sidebar-header">
              <div className="sidebar-header-title">
                <Filter size={16} />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="filter-count-badge">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              {hasActiveFilters && (
                <button
                  type="button"
                  className="btn-sidebar-reset"
                  onClick={handleResetFilters}
                >
                  Reset all
                </button>
              )}
            </div>

            {/* Pathogen Type Section */}
            <div className="filter-section">
              <h3 className="filter-section-title">Pathogen Type</h3>
              <div className="catalog-filter-list">
                {["Virus", "Bacteria", "Vector", "Fungus"].map((type) => (
                  <label
                    key={type}
                    className="catalog-filter-label"
                    htmlFor={`filter-type-${type}`}
                  >
                    <input
                      type="checkbox"
                      id={`filter-type-${type}`}
                      name={`filter-type-${type}`}
                      checked={selectedTypes.includes(type)}
                      onChange={() => toggleType(type)}
                      className="catalog-filter-checkbox"
                    />
                    <span className="catalog-filter-text">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Biocontainment Level Section */}
            <div className="filter-section">
              <h3 className="filter-section-title">Biocontainment Level</h3>
              <div className="catalog-filter-list">
                {["BSL-4", "BSL-3", "BSL-2", "BSL-1"].map((bsl) => (
                  <label
                    key={bsl}
                    className="catalog-filter-label"
                    htmlFor={`filter-bsl-${bsl}`}
                  >
                    <input
                      type="checkbox"
                      id={`filter-bsl-${bsl}`}
                      name={`filter-bsl-${bsl}`}
                      checked={selectedBSLs.includes(bsl)}
                      onChange={() => toggleBSL(bsl)}
                      className="catalog-filter-checkbox"
                    />
                    <span className="catalog-filter-text">{bsl}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* AU Member States Section */}
            <div className="filter-section">
              <div className="filter-section-header">
                <h3 className="filter-section-title">AU Member State</h3>
                {selectedCountries.length > 0 && (
                  <button
                    type="button"
                    className="btn-clear-group"
                    onClick={() => setSelectedCountries([])}
                  >
                    Clear ({selectedCountries.length})
                  </button>
                )}
              </div>
              <input
                type="text"
                placeholder="Search countries..."
                value={countryFilterText}
                onChange={(e) => setCountryFilterText(e.target.value)}
                className="country-filter-input"
                aria-label="Filter countries"
              />
              <div className="country-scroll-list">
                {visibleCountries.map((c) => (
                  <label
                    key={c.code}
                    className="catalog-filter-label"
                    htmlFor={`filter-country-${c.code}`}
                  >
                    <input
                      type="checkbox"
                      id={`filter-country-${c.code}`}
                      name={`filter-country-${c.code}`}
                      checked={selectedCountries.includes(c.code)}
                      onChange={() => toggleCountry(c.code)}
                      className="catalog-filter-checkbox"
                    />
                    <span className="catalog-filter-text">
                      <span className="country-code-chip">{c.code}</span>
                      {c.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="ubio-catalog-main-content">
          <div className="catalog-toolbar">
            <button
              type="button"
              className="btn-toggle-sidebar"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label={isSidebarOpen ? "Hide Filters" : "Show Filters"}
            >
              <SlidersHorizontal size={16} />
              <span>{isSidebarOpen ? "Hide Filters" : "Show Filters"}</span>
            </button>

            <div className="catalog-search-box">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                className="catalog-search-input"
                placeholder="Search by pathogen name, taxon ID, institution, country, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search datasets"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="btn-clear-search"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="results-count-pill">
              Showing <strong>{filteredDatasets.length}</strong> of{" "}
              {allDatasets.length} datasets
            </div>
          </div>

          {filteredDatasets.length === 0 ? (
            <div className="ubio-catalog-empty">
              <Filter size={36} className="empty-icon" />
              <h3>No matching datasets found</h3>
              <p>Try adjusting your search query or unchecking filters.</p>
              <button
                type="button"
                className="btn-pill-primary"
                onClick={handleResetFilters}
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="ubio-catalog-grid">
              {filteredDatasets.map((dataset) => {
                const sizeFormatted =
                  dataset.totalSizeMb >= 1000
                    ? `${(dataset.totalSizeMb / 1024).toFixed(1)} GB`
                    : `${dataset.totalSizeMb} MB`;

                return (
                  <article key={dataset.id} className="ubio-dataset-card">
                    <div className="dataset-card-header">
                      <div className="dataset-badges">
                        <span className="badge-country">
                          <span className="flag-code">
                            {dataset.countryCode}
                          </span>
                          {dataset.countryName}
                        </span>
                        <span
                          className={`badge-type badge-${dataset.pathogenType.toLowerCase()}`}
                        >
                          {dataset.pathogenType}
                        </span>
                        <span
                          className={`badge-bsl badge-${dataset.biocontainment.toLowerCase()}`}
                        >
                          {dataset.biocontainment}
                        </span>
                      </div>
                      <span className="badge-gate">
                        <ShieldCheck size={12} />
                        Open Sovereign
                      </span>
                    </div>

                    <h2 className="dataset-card-title">
                      <a
                        href={`/datasets/${dataset.namespace}/${dataset.datasetId}`}
                      >
                        {dataset.name}
                      </a>
                    </h2>

                    <div className="dataset-card-meta">
                      <span className="institution-tag">
                        {dataset.leadInstitution}
                      </span>
                      <span className="meta-sep">·</span>
                      <span className="taxon-tag">
                        Taxon <strong>{dataset.taxonId}</strong> (
                        <em>{dataset.taxonName}</em>)
                      </span>
                    </div>

                    <div className="dataset-card-stats">
                      <div className="stat">
                        <span className="stat-label">Samples</span>
                        <span className="stat-value">
                          {dataset.samplesCount} isolates
                        </span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Data Volume</span>
                        <span className="stat-value">{sizeFormatted}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Sequencing</span>
                        <span className="stat-value">
                          {dataset.seqPlatforms[0] || "Illumina"}
                        </span>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="dataset-card-actions">
                      <div className="action-links">
                        <a
                          href={`/datasets/${dataset.namespace}/${dataset.datasetId}`}
                          className="btn-inspect"
                        >
                          Inspect Dataset <ArrowRight size={14} />
                        </a>
                        <a
                          href={`/datasets/${dataset.namespace}/${dataset.datasetId}/tree`}
                          className="btn-tree"
                          title="Browse File Tree & Sequences"
                        >
                          <FolderTree size={14} />
                          Files ({dataset.files.length})
                        </a>
                      </div>

                      <button
                        type="button"
                        className="btn-copy-pull"
                        onClick={(e) => handleCopyPull(dataset.id, e)}
                        title={`Copy 'ubio pull ${dataset.id}'`}
                      >
                        {copiedId === dataset.id ? (
                          <>
                            <Check size={13} className="text-green" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={13} />
                            <code>ubio pull</code>
                          </>
                        )}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
