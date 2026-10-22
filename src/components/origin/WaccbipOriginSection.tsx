"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  GraduationCap,
  HeartHandshake,
  Database,
  ArrowRight,
  Mail,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import "./WaccbipOriginSection.css";

interface PillarRole {
  id: string;
  tabLabel: string;
  icon: React.ReactNode;
  heading: string;
  category: string;
  description: string;
  linkText: string;
  linkHref: string;
  isExternal?: boolean;
}

const ROLES: PillarRole[] = [
  {
    id: "donors",
    tabLabel: "Donors",
    icon: <HeartHandshake size={22} className="role-icon-symbol" />,
    heading: "Donors & Philanthropies",
    category: "Infrastructure & Compute",
    description:
      "Help fund sovereign compute nodes, cloud storage capacity, and student fellowships so African biological data stays permanently hosted and accessible.",
    linkText: "Partner as a Supporter",
    linkHref: "mailto:contact@ubuntubio.org?subject=Support%20UbuntuBio%20Infrastructure",
    isExternal: true,
  },
  {
    id: "curators",
    tabLabel: "Curators",
    icon: <Database size={22} className="role-icon-symbol" />,
    heading: "Biocurators & Researchers",
    category: "Data Governance & Rigor",
    description:
      "Volunteer your expertise to curate African pathogen strains, review MIxS metadata standards, and ensure FAIR scientific rigor across published datasets.",
    linkText: "Join Biocuration Circle",
    linkHref: "/docs/governance",
  },
  {
    id: "labs",
    tabLabel: "Labs",
    icon: <GraduationCap size={22} className="role-icon-symbol" />,
    heading: "African Research Labs",
    category: "Sovereign Deposition",
    description:
      "Deposit your non-human sequencing runs and viral callsets with guaranteed data provenance, Nagoya Protocol tracking, and sub-50ms search visibility.",
    linkText: "Deposit a Dataset",
    linkHref: "/submit",
  },
];

export function WaccbipOriginSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  // Scroll-driven 3D animation for ring.svg
  useEffect(() => {
    const section = sectionRef.current;
    const ring = ringRef.current;
    if (!section || !ring) return;

    // Check user preference for reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!section || !ring) {
            ticking = false;
            return;
          }
          const rect = section.getBoundingClientRect();
          const winHeight = window.innerHeight;

          // Check if section is visible in viewport window
          if (rect.top < winHeight && rect.bottom > 0) {
            const totalRange = winHeight + rect.height;
            const currentOffset = winHeight - rect.top;
            const progress = Math.min(Math.max(currentOffset / totalRange, 0), 1);

            const isMobile = window.innerWidth <= 640;
            // Calculate subtle scroll parallax & 3D tilt (toned down on mobile so ring stays in frame)
            const translateY = (progress - 0.5) * (isMobile ? -20 : -70);
            const rotateZ = (progress - 0.5) * (isMobile ? 20 : 40);
            const rotateX = 14 + (progress - 0.5) * (isMobile ? 10 : 18);
            const rotateY = -14 + (progress - 0.5) * (isMobile ? 14 : 26);

            ring.style.transform = `perspective(1000px) translateY(${translateY.toFixed(
              1
            )}px) rotateZ(${rotateZ.toFixed(1)}deg) rotateX(${rotateX.toFixed(
              1
            )}deg) rotateY(${rotateY.toFixed(1)}deg)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // Run once initially

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Subtle carousel auto-advance when not paused by user
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % ROLES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + ROLES.length) % ROLES.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % ROLES.length);
  };

  return (
    <section
      ref={sectionRef}
      className="ubio-origin-section"
      id="story"
      aria-labelledby="origin-heading"
    >
      <div className="ubio-origin-container">
        <div className="ubio-origin-layout">
          {/* Left Column: Story + Floating 3D Ring */}
          <div className="ubio-origin-left">
            <div className="ubio-origin-badge">
              <GraduationCap size={15} className="text-green" />
              <span>University of Ghana &bull; WACCBIP</span>
            </div>

            <h2 id="origin-heading" className="ubio-origin-title ubio-display-condensed">
              Founded at WACCBIP by Ghana’s First Cohort of Bioinformatics MSc Scholars
            </h2>

            <p className="ubio-origin-lead">
              Born at WACCBIP to give African biological data a sovereign home.
              As student founders, <em>we can only do a little alone</em> — join us to institutionalize
              a continental open archive for African science.
            </p>

            {/* 3D Scroll-Animated Stage */}
            <div className="ubio-ring-stage" aria-hidden="true">
              <div className="ubio-ring-ambient-glow" />
              <div ref={ringRef} className="ubio-ring-wrapper">
                <img
                  src="/img/ring.svg"
                  alt=""
                  className="ubio-ring-img"
                  width={340}
                  height={340}
                  loading="lazy"
                />
              </div>
              <div className="ubio-ring-pedestal-blur" />
            </div>
          </div>

          {/* Right Column: High-Contrast Porcelain White Card */}
          <div
            className="ubio-origin-white-card"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocus={() => setIsPaused(true)}
            onBlur={() => setIsPaused(false)}
          >
            {/* White Card Top: Manifesto & Student Voice */}
            <div className="white-card-manifesto-header">
              <div className="white-card-pill">
                <span>Founders&rsquo; Manifesto</span>
              </div>
              <blockquote className="white-card-quote">
                &ldquo;As Ghana&rsquo;s first cohort of bioinformatics MSc scholars at WACCBIP,
                we experienced firsthand how African pathogen and biodiversity datasets are scattered
                abroad. Our hands are small, but our collective resolve is sovereign.&rdquo;
              </blockquote>
              <div className="white-card-attribution">
                <strong>Ghana&rsquo;s first cohort of bioinformatics MSc scholars</strong>
                <span>WACCBIP &bull; University of Ghana, Legon</span>
              </div>
            </div>

            <div className="white-card-divider" />

            {/* White Card Carousel Section */}
            <div className="white-card-carousel-section">
              <div className="carousel-nav-header">
                <span className="carousel-eyebrow">How to Partner With Us</span>
                <div className="carousel-controls">
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Previous role"
                    className="carousel-arrow-btn"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="Next role"
                    className="carousel-arrow-btn"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Segmented Tab Selectors */}
              <div
                className="carousel-tabs"
                role="tablist"
                aria-label="Community Partnership Roles"
              >
                {ROLES.map((role, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      className={`carousel-tab-btn ${isActive ? "active" : ""}`}
                      onClick={() => setActiveIndex(idx)}
                    >
                      <span className="tab-pill-number">{idx + 1}</span>
                      <span className="tab-pill-label">{role.tabLabel}</span>
                    </button>
                  );
                })}
              </div>

              {/* Carousel Slides Track */}
              <div className="carousel-track-viewport">
                <div
                  className="carousel-track"
                  style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                >
                  {ROLES.map((role, idx) => (
                    <div
                      key={role.id}
                      className={`carousel-slide ${idx === activeIndex ? "is-active" : ""}`}
                    >
                      <div className="role-slide-header">
                        <div className="role-icon-box">{role.icon}</div>
                        <div>
                          <span className="role-category-tag">{role.category}</span>
                          <h3 className="role-title">{role.heading}</h3>
                        </div>
                      </div>

                      <p className="role-desc">{role.description}</p>

                      <div className="role-action-row">
                        <a
                          href={role.linkHref}
                          className="role-cta-btn"
                          {...(role.isExternal
                            ? {}
                            : {})}
                        >
                          <span>{role.linkText}</span>
                          {role.id === "donors" ? (
                            <Mail size={15} />
                          ) : (
                            <ArrowRight size={15} />
                          )}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Carousel Dots Indicator */}
              <div className="carousel-dots-wrapper" aria-hidden="true">
                {ROLES.map((role, idx) => (
                  <button
                    key={role.id}
                    type="button"
                    tabIndex={-1}
                    className={`carousel-dot ${idx === activeIndex ? "active" : ""}`}
                    onClick={() => setActiveIndex(idx)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
