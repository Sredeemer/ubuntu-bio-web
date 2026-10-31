"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { FlagGlobe, type FlagGlobeMarker } from "@/components/ui/flag-globe";
import { AU_COUNTRIES } from "@/data/auCountries";
import { Globe, ShieldCheck, Compass } from "lucide-react";
import "./AfricaGlobeSection.css";

export function AfricaGlobeSection() {
  const [parallaxY, setParallaxY] = useState<number>(0);
  const sectionRef = useRef<HTMLElement | null>(null);

  // All 54 African Union Sovereign Member States
  const markers: FlagGlobeMarker[] = useMemo(() => {
    return AU_COUNTRIES.map((c) => ({
      code: c.code,
      label: c.name,
    }));
  }, []);

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
      if (rect.top < windowH && rect.bottom > 0) {
        const center = rect.top + rect.height / 2;
        const distFromCenter = center - windowH / 2;
        const offset = Math.round(distFromCenter * -0.06);
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
        {/* Section Header */}
        <div className="ubio-globe-header">
          <div className="ubio-globe-badge">
            <span className="ubio-globe-dot" />
            <Globe size={13} className="ubio-globe-badge-icon" />
            <span>African Union Coverage • 54 Sovereign Member States</span>
          </div>
          <h2 className="ubio-globe-title">
            Pan-African Genomic Observatory
          </h2>
          <p className="ubio-globe-subtitle">
            Explore 54 sovereign sequencing nodes in interactive 3D space. Drag the globe to inspect regional pathogen surveillance repositories, vector callsets, and biodiversity nodes.
          </p>
        </div>

        {/* 3D Globe Stage with Scroll Parallax */}
        <div className="ubio-globe-stage">
          {/* Radial Nebula Glow */}
          <div
            className="ubio-globe-radial-glow"
            style={{
              transform: `translate(-50%, -50%) translateY(${parallaxY * -0.4}px)`,
            }}
            aria-hidden="true"
          />

          {/* Interactive 3D Flag Globe */}
          <div
            className="ubio-globe-viewport"
            style={{
              transform: `translateY(${parallaxY}px)`,
              transition: "transform 0.1s ease-out",
            }}
          >
            <FlagGlobe
              markers={markers}
              size={640}
              flagSize={28}
              altitude={0.16}
              autoRotate={true}
              rotationSpeed={0.06}
              phi={0.35} // Centered on African continent
              theta={0.16} // Optimal tilt framing North, West, Central, East and Southern Africa
              markerDots={true}
              stars={false}
              className="ubio-3d-globe"
            />
          </div>

          {/* Floating Badges with Staggered Parallax */}
          <div
            className="ubio-globe-floating-badge badge-left"
            style={{
              transform: `translateY(${parallaxY * -0.4}px)`,
              transition: "transform 0.15s ease-out",
            }}
          >
            <ShieldCheck size={16} className="badge-icon-accent" />
            <div>
              <strong>100% African Data Sovereignty</strong>
              <span>AU Member States • Nagoya Protocol Compliant</span>
            </div>
          </div>

          <div
            className="ubio-globe-floating-badge badge-right"
            style={{
              transform: `translateY(${parallaxY * 0.35}px)`,
              transition: "transform 0.15s ease-out",
            }}
          >
            <Compass size={16} className="badge-icon-accent" />
            <div>
              <strong>54 Sovereign Nodes</strong>
              <span>Click & Drag to Rotate in 3D</span>
            </div>
          </div>
        </div>

        {/* Compact Footer Stats */}
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
        </div>
      </div>
    </section>
  );
}

export default AfricaGlobeSection;
