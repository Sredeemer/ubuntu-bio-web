"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { FlagGlobe, type FlagGlobeMarker } from "@/components/ui/flag-globe";
import { AU_COUNTRIES } from "@/data/auCountries";
import { Globe, RotateCw, Pause, Play, ShieldCheck, Compass, ArrowRight, Layers } from "lucide-react";
import "./AfricaGlobeSection.css";

const REGIONS: Record<string, { label: string; codes: string[]; phi: number }> = {
  all: {
    label: "All 54 AU Member States",
    codes: AU_COUNTRIES.map((c) => c.code),
    phi: 0.35, // Centered on Africa
  },
  west: {
    label: "West Africa",
    codes: ["SN", "NG", "GH", "CI", "ML", "BF", "NE", "GN", "SL", "LR", "TG", "BJ", "GM", "GW", "CV"],
    phi: 0.1, // Facing West Africa / Atlantic
  },
  east: {
    label: "East Africa",
    codes: ["KE", "ET", "TZ", "UG", "RW", "BI", "SO", "DJ", "ER", "SS", "SD", "SC", "MU", "KM"],
    phi: 0.65, // Facing East Africa & Horn
  },
  southern: {
    label: "Southern Africa",
    codes: ["ZA", "BW", "NA", "ZM", "ZW", "MZ", "AO", "MW", "LS", "SZ"],
    phi: 0.45, // Facing Southern Africa
  },
  central: {
    label: "Central Africa",
    codes: ["CD", "CG", "CM", "CF", "GA", "GQ", "TD", "ST"],
    phi: 0.3, // Facing Congo Basin
  },
  north: {
    label: "North Africa",
    codes: ["EG", "MA", "DZ", "TN", "LY", "MR"],
    phi: 0.3, // Facing Sahara & North
  },
};

export function AfricaGlobeSection() {
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [rotationSpeed, setRotationSpeed] = useState<number>(0.12);

  const activeRegion = REGIONS[selectedRegion] ?? REGIONS.all!;

  const markers: FlagGlobeMarker[] = useMemo(() => {
    return activeRegion.codes.map((code) => {
      const country = AU_COUNTRIES.find((c) => c.code === code);
      return {
        code,
        label: country ? country.name : code,
      };
    });
  }, [activeRegion]);

  return (
    <section className="ubio-globe-section" aria-label="African Genomic Coverage 3D Globe">
      <div className="ubio-globe-container">
        {/* Section Header */}
        <div className="ubio-globe-header">
          <div className="ubio-globe-badge">
            <span className="ubio-globe-dot" />
            <Globe size={14} className="ubio-globe-badge-icon" />
            <span>Interactive 3D Coverage Network</span>
          </div>
          <h2 className="ubio-globe-title">
            Pan-African Genomic Observatory
          </h2>
          <p className="ubio-globe-subtitle">
            Explore 54 African Union sovereign data nodes in interactive 3D space. Drag the globe to inspect regional pathogen surveillance repositories, vector callsets, and biodiversity nodes.
          </p>
        </div>

        {/* Region Filter Controls */}
        <div className="ubio-globe-controls">
          <div className="ubio-region-filters" role="tablist" aria-label="Select African Region">
            {Object.entries(REGIONS).map(([key, reg]) => (
              <button
                key={key}
                role="tab"
                aria-selected={selectedRegion === key}
                onClick={() => setSelectedRegion(key)}
                className={`ubio-region-pill ${selectedRegion === key ? "active" : ""}`}
              >
                {reg.label}
                <span className="ubio-pill-count">{reg.codes.length}</span>
              </button>
            ))}
          </div>

          <div className="ubio-globe-actions">
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className="ubio-action-btn"
              title={autoRotate ? "Pause auto-rotation" : "Resume auto-rotation"}
              aria-label={autoRotate ? "Pause rotation" : "Play rotation"}
            >
              {autoRotate ? <Pause size={14} /> : <Play size={14} />}
              <span>{autoRotate ? "Pause" : "Spin"}</span>
            </button>
            <button
              onClick={() => {
                setRotationSpeed((s) => (s >= 0.24 ? 0.08 : s + 0.08));
              }}
              className="ubio-action-btn"
              title="Toggle rotation speed"
            >
              <RotateCw size={14} />
              <span>Speed {Math.round((rotationSpeed / 0.12) * 100)}%</span>
            </button>
          </div>
        </div>

        {/* 3D Globe Stage */}
        <div className="ubio-globe-stage">
          {/* Subtle Radial Glow */}
          <div className="ubio-globe-radial-glow" aria-hidden="true" />

          {/* Interactive Flag Globe */}
          <div className="ubio-globe-viewport">
            <FlagGlobe
              markers={markers}
              size={560}
              flagSize={26}
              altitude={0.16}
              autoRotate={autoRotate}
              rotationSpeed={rotationSpeed}
              phi={activeRegion.phi}
              theta={0.24}
              markerDots={true}
              stars={true}
              className="ubio-3d-globe"
            />
          </div>

          {/* Floating Metric Badges */}
          <div className="ubio-globe-floating-badge badge-left">
            <ShieldCheck size={18} className="badge-icon-accent" />
            <div>
              <strong>100% African Data Sovereignty</strong>
              <span>AU Member States • Nagoya Protocol Compliant</span>
            </div>
          </div>

          <div className="ubio-globe-floating-badge badge-right">
            <Compass size={18} className="badge-icon-accent" />
            <div>
              <strong>{markers.length} Active Nodes</strong>
              <span>Click & Drag to Rotate Globe</span>
            </div>
          </div>
        </div>

        {/* Footer Meta & Catalog CTA */}
        <div className="ubio-globe-footer">
          <div className="ubio-globe-stats">
            <div className="ubio-globe-stat-item">
              <span className="stat-number">54</span>
              <span className="stat-label">AU Member States Covered</span>
            </div>
            <div className="ubio-globe-stat-divider" />
            <div className="ubio-globe-stat-item">
              <span className="stat-number">&lt; 50ms</span>
              <span className="stat-label">Global Content-Addressed Queries</span>
            </div>
            <div className="ubio-globe-stat-divider" />
            <div className="ubio-globe-stat-item">
              <span className="stat-number">Taxon 9606</span>
              <span className="stat-label">Strict Human Data Exclusion</span>
            </div>
          </div>

          <div className="ubio-globe-cta">
            <Link href="/datasets" className="btn-pill-primary ubio-cta-button">
              <span>Browse Full Dataset Catalog</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
export default AfricaGlobeSection;
