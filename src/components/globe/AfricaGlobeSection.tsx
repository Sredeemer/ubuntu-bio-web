"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { FlagGlobe, type FlagGlobeMarker } from "@/components/ui/flag-globe";
import { AU_COUNTRIES } from "@/data/auCountries";
import { Globe, ShieldCheck, Compass, ArrowRight } from "lucide-react";
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
  const [parallaxY, setParallaxY] = useState<number>(0);
  const sectionRef = useRef<HTMLElement | null>(null);

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

  // Smooth Scroll Parallax
  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;

    let rafId = 0;
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowH = window.innerHeight;
      // Parallax applies when the section is within viewport range
      if (rect.top < windowH && rect.bottom > 0) {
        const center = rect.top + rect.height / 2;
        const distFromCenter = center - windowH / 2;
        // Subtle, smooth vertical displacement between -35px and +35px
        const offset = Math.round(distFromCenter * -0.07);
        setParallaxY(offset);
      }
    };

    const onScroll = () => {
      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          handleScroll();
          rafId = 0;
        });
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="ubio-globe-section"
      aria-label="African Genomic Coverage 3D Globe"
    >
      <div className="ubio-globe-container">
        {/* 1. Section Header */}
        <div className="ubio-globe-header">
          <div className="ubio-globe-badge">
            <span className="ubio-globe-dot" />
            <Globe size={14} className="ubio-globe-badge-icon" />
            <span>African Union Coverage • 54 Sovereign Member States</span>
          </div>
          <h2 className="ubio-globe-title">
            Pan-African Genomic Observatory
          </h2>
          <p className="ubio-globe-subtitle">
            Explore 54 sovereign sequencing nodes in interactive 3D space. Drag the globe to inspect regional pathogen surveillance repositories, vector callsets, and biodiversity nodes.
          </p>
        </div>

        {/* 2. 3D Globe Stage with Scroll Parallax */}
        <div className="ubio-globe-stage">
          {/* Radial Nebula Glow with inverse Parallax */}
          <div
            className="ubio-globe-radial-glow"
            style={{
              transform: `translate(-50%, -50%) translateY(${parallaxY * -0.4}px)`,
            }}
            aria-hidden="true"
          />

          {/* Interactive 3D Flag Globe with Parallax */}
          <div
            className="ubio-globe-viewport"
            style={{
              transform: `translateY(${parallaxY}px)`,
              transition: "transform 0.1s ease-out",
            }}
          >
            <FlagGlobe
              markers={markers}
              size={560}
              flagSize={26}
              altitude={0.16}
              autoRotate={true}
              rotationSpeed={0.12}
              phi={activeRegion.phi}
              theta={0.24}
              markerDots={true}
              stars={true}
              className="ubio-3d-globe"
            />
          </div>

          {/* Floating Badges with Staggered Parallax */}
          <div
            className="ubio-globe-floating-badge badge-left"
            style={{
              transform: `translateY(${parallaxY * -0.5}px)`,
              transition: "transform 0.15s ease-out",
            }}
          >
            <ShieldCheck size={18} className="badge-icon-accent" />
            <div>
              <strong>100% African Data Sovereignty</strong>
              <span>AU Member States • Nagoya Protocol Compliant</span>
            </div>
          </div>

          <div
            className="ubio-globe-floating-badge badge-right"
            style={{
              transform: `translateY(${parallaxY * 0.4}px)`,
              transition: "transform 0.15s ease-out",
            }}
          >
            <Compass size={18} className="badge-icon-accent" />
            <div>
              <strong>{markers.length} Sovereign Nodes</strong>
              <span>Click & Drag to Rotate in 3D</span>
            </div>
          </div>
        </div>

        {/* 3. Reordered Region Filter Controls (Clean, non-distorted glass pill bar) */}
        <div className="ubio-region-bar-container">
          <div className="ubio-region-label-heading">
            <span>Explore Regional Coverage</span>
          </div>
          <div className="ubio-region-filters" role="tablist" aria-label="Select African Region">
            {Object.entries(REGIONS).map(([key, reg]) => (
              <button
                key={key}
                role="tab"
                aria-selected={selectedRegion === key}
                onClick={() => setSelectedRegion(key)}
                className={`ubio-region-pill ${selectedRegion === key ? "active" : ""}`}
              >
                <span>{reg.label}</span>
                <span className="ubio-pill-count">{reg.codes.length}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 4. Footer Meta & Catalog CTA */}
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
