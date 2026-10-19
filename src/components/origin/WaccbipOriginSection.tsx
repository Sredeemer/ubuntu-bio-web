"use client";

import React from "react";
import { GraduationCap, HeartHandshake, Database, Sparkles, ArrowRight, Mail } from "lucide-react";
import "./WaccbipOriginSection.css";

export function WaccbipOriginSection() {
  return (
    <section className="ubio-origin-section" id="story" aria-labelledby="origin-heading">
      <div className="ubio-origin-container">
        {/* Origin Header */}
        <div className="ubio-origin-header">
          <div className="ubio-origin-badge">
            <GraduationCap size={16} className="text-green" />
            <span>University of Ghana &bull; WACCBIP</span>
          </div>

          <h2 id="origin-heading" className="ubio-origin-title ubio-display-condensed">
            Founded at WACCBIP by Africa’s First Cohort of Bioinformatics MSc Scholars
          </h2>

          <p className="ubio-origin-lead">
            UbuntuBio was born out of the lecture halls and laboratories of the{" "}
            <strong>West African Centre for Cell Biology of Infectious Pathogens (WACCBIP)</strong> at
            the University of Ghana, Legon.
          </p>

          <p className="ubio-origin-text">
            As scholars in the inaugural Master of Science in Bioinformatics program, we experienced
            firsthand the friction of African genomic research: vital pathogen, AMR, and agricultural
            sequence data scattered across external foreign repositories, hindered by bandwidth
            constraints, and isolated from African health priorities.
          </p>

          <div className="ubio-origin-quote-card">
            <Sparkles size={20} className="quote-sparkle" />
            <p className="quote-statement">
              &ldquo;We are institutionalizing Africa&rsquo;s first sovereign, open-source bioinformatics database.
              As student founders and early-career researchers, <em>we can only do a little on our own</em>.
              Building a lasting continental platform requires collective partnership.&rdquo;
            </p>
            <span className="quote-attribution">
              &mdash; First Cohort of MSc Bioinformatics Scholars &bull; WACCBIP, University of Ghana
            </span>
          </div>
        </div>

        {/* Partnership / Invitation Bento Grid */}
        <div className="ubio-invitation-grid">
          {/* Card 1: Donors & Funders */}
          <div className="ubio-invitation-card">
            <div className="invitation-icon-wrapper">
              <HeartHandshake size={24} className="text-green" />
            </div>
            <h3 className="invitation-card-title">Donors &amp; Philanthropies</h3>
            <p className="invitation-card-desc">
              Help fund sovereign compute nodes, cloud storage capacity, and student research
              fellowships so African biological data stays permanently hosted, governed, and
              accessible on the continent.
            </p>
            <a
              href="mailto:contact@ubuntubio.org?subject=Support%20UbuntuBio%20Infrastructure"
              className="invitation-card-link"
            >
              <span>Partner as a Supporter</span>
              <Mail size={15} />
            </a>
          </div>

          {/* Card 2: Biocurators */}
          <div className="ubio-invitation-card">
            <div className="invitation-icon-wrapper">
              <Database size={24} className="text-green" />
            </div>
            <h3 className="invitation-card-title">Biocurators &amp; Researchers</h3>
            <p className="invitation-card-desc">
              Volunteer your expertise to curate African pathogen strains, review MIxS metadata
              standards, annotate consensus assemblies, and ensure FAIR scientific rigor across
              all published datasets.
            </p>
            <a href="/docs/governance" className="invitation-card-link">
              <span>Join Biocuration Circle</span>
              <ArrowRight size={15} />
            </a>
          </div>

          {/* Card 3: Institutions & Labs */}
          <div className="ubio-invitation-card">
            <div className="invitation-icon-wrapper">
              <GraduationCap size={24} className="text-green" />
            </div>
            <h3 className="invitation-card-title">African Research Labs</h3>
            <p className="invitation-card-desc">
              Deposit your non-human sequencing runs and viral callsets with guaranteed data
              provenance, Nagoya Protocol benefit-sharing tracking, and instant sub-50ms search
              visibility across the continent.
            </p>
            <a href="/submit" className="invitation-card-link">
              <span>Deposit a Dataset</span>
              <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
