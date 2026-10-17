"use client";

import React, { useState } from "react";
import { ArrowRight, ChevronRight, Copy, Check } from "lucide-react";

export function HeroHeader() {
  const [copied, setCopied] = useState(false);
  const pipCommand = "pip install ubuntu-bio";

  const handleCopy = () => {
    navigator.clipboard.writeText(pipCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="ubio-hero-header ubio-art-host" aria-labelledby="hero-title">
      {/* Decorative globe mesh (Circle-2) — self-clipping layer */}
      <div className="ubio-art-layer" aria-hidden="true">
        <div className="ubio-art hero-art-globe" />
      </div>

      <div className="ubio-hero-inner">
        <span className="ubio-eyebrow">Open-source African genomics hub · v0.1.0</span>

        <h1 id="hero-title" className="ubio-hero-h1 ubio-display-condensed">
          African Data. African Discoveries.
          <br />
          Global Impact.
        </h1>

        <p className="ubio-hero-subtext">
          Upload once. Discover more. Advance science. The open database built to push and access African genomics data with ease.
        </p>

        <div className="ubio-hero-cta-row">
          <a href="#catalog" className="btn-pill-primary">
            <span>Explore datasets</span>
            <ArrowRight size={16} aria-hidden="true" />
          </a>
          <a href="#coverage" className="ubio-link-chevron">
            <span>View AU member state coverage</span>
            <ChevronRight size={16} aria-hidden="true" />
          </a>
        </div>

        <div className="ubio-cli-install-box">
          <span className="cli-prompt-symbol">$</span>
          <code className="cli-install-code">{pipCommand}</code>
          <button
            onClick={handleCopy}
            className="btn-copy-install"
            title="Copy install command"
            aria-label="Copy install command"
          >
            {copied ? <Check size={14} className="icon-green" /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      {/* Bento (mirrors mongodb.com hero: one spotlight + two stacked) */}
      <div className="ubio-hero-bento">
        <article className="bento-card bento-spotlight ubio-art-host">
          <div className="ubio-art-layer" aria-hidden="true">
            <div className="ubio-art bento-art-orbit" />
          </div>
          <div className="bento-body">
            <span className="ubio-eyebrow ubio-eyebrow--violet">Optimized Sequence Sync</span>
            <h2 className="bento-title ubio-display-condensed">Fast Sequence Synchronization</h2>
            <p className="bento-desc">
              Intelligent sequence transfer synchronizes biological reads without re-downloading
              redundant data, cutting transfer times over African internet connections by up to 75%.
            </p>
            <a href="#architecture" className="ubio-link-chevron">
              <span>How it works</span>
              <ChevronRight size={16} aria-hidden="true" />
            </a>
          </div>
        </article>

        <div className="bento-stack">
          <article className="bento-card">
            <span className="ubio-eyebrow">Available now</span>
            <h2 className="bento-title ubio-display-condensed">Pathogen Surveillance</h2>
            <p className="bento-desc">
              Lassa, Mpox, cholera and vector isolates indexed with MIxS metadata and sub-50ms
              faceted search.
            </p>
            <a href="#catalog" className="ubio-link-chevron">
              <span>Browse the catalog</span>
              <ChevronRight size={16} aria-hidden="true" />
            </a>
          </article>

          <article className="bento-card">
            <span className="ubio-eyebrow">Governance</span>
            <h2 className="bento-title ubio-display-condensed">AU Data Sovereignty</h2>
            <p className="bento-desc">
              Human data (NCBI 9606) is rejected at ingest. Gated datasets enforce Nagoya Protocol
              benefit-sharing agreements.
            </p>
            <a href="#coverage" className="ubio-link-chevron">
              <span>Read the policy</span>
              <ChevronRight size={16} aria-hidden="true" />
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}
