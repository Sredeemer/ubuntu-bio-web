"use client";

import React, { useState } from "react";
import { Terminal, ExternalLink, Menu, X } from "lucide-react";
import { UbuntuBioLogo } from "../icons/UbuntuBioLogo";
import { HubStatusBadge } from "../common/HubStatusBadge";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="ubio-navbar-header">
      <div className="ubio-navbar-container">
        {/* Brand Identity */}
        <a href="/" className="ubio-brand-link" aria-label="UbuntuBio Home">
          <UbuntuBioLogo size={26} color="#00ed64" />
          <div className="ubio-brand-name-group">
            <span className="ubio-brand-title">
              UbuntuBio<span className="brand-dot">.</span>
            </span>
            <span className="ubio-brand-tag">African Genomics</span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="ubio-nav-links" aria-label="Main Navigation">
          <a href="/datasets" className="ubio-nav-item">
            Datasets
          </a>
          <a href="/submit" className="ubio-nav-item">
            Submit
          </a>
          <a href="/docs" className="ubio-nav-item">
            Documentation
          </a>
          <a href="/#coverage" className="ubio-nav-item">
            AU Coverage
          </a>
          <a
            href="https://github.com/Sredeemer/bioinf-db"
            target="_blank"
            rel="noreferrer"
            className="ubio-nav-item"
          >
            GitHub
          </a>
        </nav>

        {/* Action Controls */}
        <div className="ubio-nav-actions">
          <HubStatusBadge />
          <a href="/datasets" className="btn-pill-primary">
            Explore Datasets
          </a>
          <button
            className="ubio-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="ubio-mobile-drawer">
          <a
            href="/datasets"
            onClick={() => setMobileMenuOpen(false)}
            className="mobile-nav-item"
          >
            Datasets
          </a>
          <a
            href="/submit"
            onClick={() => setMobileMenuOpen(false)}
            className="mobile-nav-item"
          >
            Submit
          </a>
          <a
            href="/docs"
            onClick={() => setMobileMenuOpen(false)}
            className="mobile-nav-item"
          >
            Documentation
          </a>
          <a
            href="/#coverage"
            onClick={() => setMobileMenuOpen(false)}
            className="mobile-nav-item"
          >
            AU Coverage
          </a>
          <a
            href="https://github.com/Sredeemer/bioinf-db"
            target="_blank"
            rel="noreferrer"
            className="mobile-nav-item"
          >
            GitHub
          </a>
        </div>
      )}
    </header>
  );
}
