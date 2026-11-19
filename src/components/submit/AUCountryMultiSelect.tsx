"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { AU_COUNTRIES } from "../../data/auCountries";

export interface AUCountryMultiSelectProps {
  id?: string;
  selectedCodes: readonly string[];
  onChange: (codes: string[]) => void;
  placeholder?: string;
}

export function AUCountryMultiSelect({
  id = "input-batch-country",
  selectedCodes,
  onChange,
  placeholder = "Select one or more AU member states...",
}: AUCountryMultiSelectProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const normalizedSelected = useMemo(
    () => selectedCodes.map((c) => c.trim().toUpperCase()).filter((c) => c.length === 2),
    [selectedCodes]
  );

  const selectedSet = useMemo(() => new Set(normalizedSelected), [normalizedSelected]);

  const filteredCountries = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return AU_COUNTRIES;
    return AU_COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;
    searchInputRef.current?.focus();

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const toggleCode = (code: string): void => {
    const upper = code.toUpperCase();
    if (selectedSet.has(upper)) {
      const next = normalizedSelected.filter((c) => c !== upper);
      onChange(next);
    } else {
      onChange([...normalizedSelected, upper]);
    }
  };

  const removeCode = (code: string, event: React.MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation();
    const upper = code.toUpperCase();
    onChange(normalizedSelected.filter((c) => c !== upper));
  };

  return (
    <div className="au-multiselect" ref={containerRef}>
      <div
        id={id}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={`${id}-listbox`}
        aria-label="AU Countries of Origin"
        tabIndex={0}
        className={`au-multiselect-control ${isOpen ? "is-open" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen((prev) => !prev);
          }
        }}
      >
        <div className="au-multiselect-chips">
          {normalizedSelected.length === 0 ? (
            <span className="au-multiselect-placeholder">{placeholder}</span>
          ) : (
            normalizedSelected.map((code) => {
              const match = AU_COUNTRIES.find((c) => c.code === code);
              const label = match ? `${match.name} (${code})` : code;
              return (
                <span key={code} className="au-country-chip">
                  <span>{label}</span>
                  <button
                    type="button"
                    className="au-country-chip-remove"
                    aria-label={`Remove ${label}`}
                    onClick={(e) => removeCode(code, e)}
                  >
                    <X size={12} aria-hidden="true" />
                  </button>
                </span>
              );
            })
          )}
        </div>
        <ChevronDown
          size={16}
          className={`au-multiselect-chevron ${isOpen ? "is-open" : ""}`}
          aria-hidden="true"
        />
      </div>

      {isOpen && (
        <div className="au-multiselect-popover">
          <div className="au-multiselect-search-wrap">
            <Search size={14} className="au-multiselect-search-icon" aria-hidden="true" />
            <input
              ref={searchInputRef}
              type="text"
              className="au-multiselect-search"
              placeholder="Search 55 AU member states (e.g. Ghana, NG)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Filter AU member states"
            />
          </div>

          <div
            id={`${id}-listbox`}
            role="listbox"
            aria-multiselectable="true"
            className="au-multiselect-list"
          >
            {filteredCountries.length === 0 ? (
              <div className="au-multiselect-empty">No matching AU member states</div>
            ) : (
              filteredCountries.map((country) => {
                const isSelected = selectedSet.has(country.code);
                return (
                  <button
                    key={country.code}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={`au-multiselect-option ${isSelected ? "is-selected" : ""}`}
                    onClick={() => toggleCode(country.code)}
                  >
                    <span className={`au-multiselect-checkbox ${isSelected ? "is-checked" : ""}`}>
                      {isSelected && <Check size={12} aria-hidden="true" />}
                    </span>
                    <span className="au-multiselect-option-name">{country.name}</span>
                    <span className="au-multiselect-option-code font-mono">{country.code}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
