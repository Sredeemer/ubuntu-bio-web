"use client";

import React, { useState, useEffect, useRef, useId, useCallback } from "react";
import { Search, X, Check, Plus, AlertCircle } from "lucide-react";
import { suggestTaxa } from "../../lib/api";
import "./HostOrganismSelector.css";

export interface HostEntry {
  readonly id: string;
  readonly name: string;
  readonly commonName?: string | undefined;
  readonly taxonId?: number | null | undefined;
}

export interface HostOrganismSelectorProps {
  readonly id?: string | undefined;
  readonly value: readonly HostEntry[];
  readonly onChange: (hosts: HostEntry[]) => void;
  readonly error?: string | undefined;
  readonly placeholder?: string | undefined;
  readonly maxHosts?: number | undefined;
}

export const PRIORITY_AFRICAN_HOSTS: readonly HostEntry[] = [
  {
    id: "9606",
    name: "Homo sapiens",
    commonName: "Human Patient",
    taxonId: 9606,
  },
  {
    id: "7165",
    name: "Anopheles gambiae",
    commonName: "African Malaria Mosquito",
    taxonId: 7165,
  },
  {
    id: "7159",
    name: "Aedes aegypti",
    commonName: "Yellow Fever Mosquito",
    taxonId: 7159,
  },
  {
    id: "10090",
    name: "Mastomys natalensis",
    commonName: "Natal Multimammate Mouse (Lassa reservoir)",
    taxonId: 10090,
  },
  {
    id: "9913",
    name: "Bos taurus",
    commonName: "Bovine / Cattle (Livestock)",
    taxonId: 9913,
  },
  {
    id: "9407",
    name: "Rousettus aegyptiacus",
    commonName: "Egyptian Fruit Bat (Marburg reservoir)",
    taxonId: 9407,
  },
  {
    id: "9925",
    name: "Capra hircus",
    commonName: "Goat (Livestock)",
    taxonId: 9925,
  },
  {
    id: "9940",
    name: "Ovis aries",
    commonName: "Sheep (Livestock)",
    taxonId: 9940,
  },
  {
    id: "77218",
    name: "Eidolon helvum",
    commonName: "Straw-coloured Fruit Bat",
    taxonId: 77218,
  },
  {
    id: "60711",
    name: "Chlorocebus aethiops",
    commonName: "African Green Monkey",
    taxonId: 60711,
  },
  {
    id: "9823",
    name: "Sus scrofa",
    commonName: "Pig / Swine",
    taxonId: 9823,
  },
  {
    id: "9031",
    name: "Gallus gallus",
    commonName: "Poultry / Chicken",
    taxonId: 9031,
  },
  {
    id: "9615",
    name: "Canis lupus familiaris",
    commonName: "Domestic Dog (Rabies vector)",
    taxonId: 9615,
  },
  {
    id: "env-isolate",
    name: "Environmental specimen",
    commonName: "Water / Soil / Sewage matrix",
    taxonId: null,
  },
];

export function HostOrganismSelector({
  id = "input-host-organisms",
  value,
  onChange,
  error,
  placeholder = "Search or type host organism (e.g. human, mosquito, rodent, cattle)...",
  maxHosts = 10,
}: HostOrganismSelectorProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [dynamicSuggestions, setDynamicSuggestions] = useState<HostEntry[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  // Filter priority hosts based on search query
  const filteredPriority = query.trim()
    ? PRIORITY_AFRICAN_HOSTS.filter((h) => {
        const q = query.toLowerCase();
        return (
          h.name.toLowerCase().includes(q) ||
          (h.commonName && h.commonName.toLowerCase().includes(q)) ||
          (h.taxonId && String(h.taxonId).includes(q))
        );
      })
    : PRIORITY_AFRICAN_HOSTS;

  // Search backend taxonomy engine for query
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setDynamicSuggestions([]);
      return;
    }

    let active = true;
    setIsLoading(true);

    const timer = setTimeout(async () => {
      try {
        const taxa = await suggestTaxa(q, 8);
        if (!active) return;
        const mapped: HostEntry[] = taxa.map((t) => ({
          id: String(t.taxon_id),
          name: t.scientific_name,
          commonName: t.common_name ?? undefined,
          taxonId: t.taxon_id,
        }));
        setDynamicSuggestions(mapped);
      } catch {
        if (active) setDynamicSuggestions([]);
      } finally {
        if (active) setIsLoading(false);
      }
    }, 200);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  // Combine and deduplicate suggestions
  const allSuggestions: HostEntry[] = [];
  const seenIds = new Set<string>();

  for (const h of filteredPriority) {
    if (!seenIds.has(h.id)) {
      seenIds.add(h.id);
      allSuggestions.push(h);
    }
  }

  for (const h of dynamicSuggestions) {
    if (!seenIds.has(h.id)) {
      seenIds.add(h.id);
      allSuggestions.push(h);
    }
  }

  // Check if query is an exact match or custom entry
  const hasExactMatch = allSuggestions.some(
    (s) =>
      s.name.toLowerCase() === query.trim().toLowerCase() ||
      (s.commonName && s.commonName.toLowerCase() === query.trim().toLowerCase())
  );
  const showCustomOption = query.trim().length > 1 && !hasExactMatch;

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSelectHost = useCallback(
    (host: HostEntry) => {
      if (value.some((h) => h.id === host.id)) {
        // Already selected - toggle/remove
        onChange(value.filter((h) => h.id !== host.id));
      } else {
        if (value.length >= maxHosts) return;
        onChange([...value, host]);
      }
      setQuery("");
      setHighlightedIndex(-1);
      inputRef.current?.focus();
    },
    [value, onChange, maxHosts]
  );

  const handleRemoveHost = (hostId: string) => {
    onChange(value.filter((h) => h.id !== hostId));
    inputRef.current?.focus();
  };

  const handleAddCustomHost = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    const custom: HostEntry = {
      id: `custom-${trimmed.toLowerCase().replace(/\s+/g, "-")}`,
      name: trimmed,
      commonName: "Custom host",
      taxonId: null,
    };
    handleSelectHost(custom);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && query === "" && value.length > 0) {
      // Remove last host on Backspace in empty input
      const lastHost = value[value.length - 1];
      if (lastHost) {
        handleRemoveHost(lastHost.id);
      }
      return;
    }

    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    const totalOptions = allSuggestions.length + (showCustomOption ? 1 : 0);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1 < totalOptions ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : totalOptions - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < allSuggestions.length) {
        const selected = allSuggestions[highlightedIndex];
        if (selected) handleSelectHost(selected);
      } else if (showCustomOption && highlightedIndex === allSuggestions.length) {
        handleAddCustomHost();
      } else if (allSuggestions.length > 0) {
        const first = allSuggestions[0];
        if (first) handleSelectHost(first);
      } else if (showCustomOption) {
        handleAddCustomHost();
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  return (
    <div className={`host-selector-root ${error ? "has-error" : ""}`} ref={containerRef}>
      {/* Combobox Tag Container */}
      <div
        className={`host-combobox-box ${isOpen ? "is-focused" : ""}`}
        onClick={() => {
          inputRef.current?.focus();
          setIsOpen(true);
        }}
      >
        <Search size={16} className="host-combobox-icon" />

        <div className="host-pills-wrap">
          {value.map((host) => (
            <span key={host.id} className="host-pill-chip">
              <span className="host-pill-text">
                {host.commonName ? `${host.commonName} (${host.name})` : host.name}
              </span>
              {host.taxonId ? (
                <span className="host-pill-taxid">#{host.taxonId}</span>
              ) : null}
              <button
                type="button"
                className="host-pill-remove"
                aria-label={`Remove ${host.commonName || host.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveHost(host.id);
                }}
              >
                <X size={12} />
              </button>
            </span>
          ))}

          <input
            ref={inputRef}
            id={id}
            type="text"
            className="host-search-inline-input"
            value={query}
            placeholder={value.length === 0 ? placeholder : "Add another host..."}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
              setHighlightedIndex(-1);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            role="combobox"
            aria-expanded={isOpen}
            aria-controls={listboxId}
            aria-autocomplete="list"
          />
        </div>
      </div>

      {/* Suggestion Dropdown */}
      {isOpen && (
        <div className="host-dropdown-popover" id={listboxId} role="listbox">
          <div className="host-dropdown-header">
            <span>
              {query.trim()
                ? `Matching Host Organisms (${allSuggestions.length})`
                : "African Pathogen Hosts & Reservoirs (Search or Pick)"}
            </span>
            {isLoading && <span className="host-loading-tag">Searching...</span>}
          </div>

          <div className="host-dropdown-options-list">
            {allSuggestions.map((item, idx) => {
              const isSelected = value.some((v) => v.id === item.id);
              const isHighlighted = idx === highlightedIndex;

              return (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`host-dropdown-option ${isSelected ? "is-selected" : ""} ${
                    isHighlighted ? "is-highlighted" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectHost(item);
                  }}
                >
                  <div className="host-option-main">
                    <span className="host-option-title">
                      {item.commonName ? (
                        <>
                          <strong className="host-common-name">{item.commonName}</strong>
                          <span className="host-scientific-name">({item.name})</span>
                        </>
                      ) : (
                        <strong className="host-scientific-name">{item.name}</strong>
                      )}
                    </span>
                    {item.taxonId ? (
                      <span className="host-option-taxid">NCBI Taxon: {item.taxonId}</span>
                    ) : (
                      <span className="host-option-taxid non-tax">Environmental</span>
                    )}
                  </div>

                  {isSelected && <Check size={16} className="host-option-check" />}
                </button>
              );
            })}

            {showCustomOption && (
              <button
                type="button"
                role="option"
                aria-selected={false}
                className={`host-dropdown-option custom-add ${
                  highlightedIndex === allSuggestions.length ? "is-highlighted" : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddCustomHost();
                }}
              >
                <Plus size={15} />
                <span>Add custom host: &ldquo;{query.trim()}&rdquo;</span>
              </button>
            )}

            {allSuggestions.length === 0 && !showCustomOption && (
              <div className="host-empty-notice">
                <span>No matching host organisms found. Press Enter to add custom host.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <span className="field-error-msg" id={`${id}-error`}>
          <AlertCircle size={13} /> {error}
        </span>
      )}
    </div>
  );
}
