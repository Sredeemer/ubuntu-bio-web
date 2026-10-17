import React from "react";

export function Footer() {
  return (
    <footer className="ubio-footer">
      <div className="ubio-footer-container">
        <div className="ubio-footer-grid">
          {/* Brand Info */}
          <div className="ubio-footer-col brand-col">
            <div className="footer-brand-header">
              <span className="footer-brand-title">
                UbuntuBio<span className="brand-dot">.</span>
              </span>
            </div>
            <p className="footer-mandate-text">
              Decentralized, open-source bioinformatics repository engineered exclusively for African pathogen, vector, and agricultural genomics.
            </p>
            <div className="footer-status-pill">
              <span className="footer-beacon" />
              <span>54 AU Member States Active</span>
            </div>
          </div>

          {/* Core Technologies */}
          <div className="ubio-footer-col">
            <h4 className="footer-col-title">Architecture</h4>
            <ul className="footer-link-list">
              <li>Bandwidth-Optimized Sequence Sync</li>
              <li>Git LFS Pointer Trees</li>
              <li>Meilisearch Geospatial Index</li>
              <li>ORCID PKCE Authentication</li>
              <li>MapLibre Vector Cartography</li>
            </ul>
          </div>

          {/* Domain Governance */}
          <div className="ubio-footer-col">
            <h4 className="footer-col-title">Governance</h4>
            <ul className="footer-link-list">
              <li>Nagoya Protocol Compliance</li>
              <li>AU Scientific Data Policy</li>
              <li>Strict Human 9606 Filter</li>
              <li>MIxS Minimum Metadata</li>
              <li>Open Access Licensing</li>
            </ul>
          </div>

          {/* CLI & Client */}
          <div className="ubio-footer-col">
            <h4 className="footer-col-title">Python Ecosystem</h4>
            <ul className="footer-link-list">
              <li>pip install ubuntu-bio</li>
              <li>CLI Binary: ubio</li>
              <li>POSIX 0600 Token Security</li>
              <li>FastAPI Async Hub Server</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="ubio-footer-bottom">
          <p className="footer-legal">
            © {new Date().getFullYear()} UbuntuBio Initiative. Open Source under Apache-2.0 / MIT.
          </p>
          <div className="footer-compliance-badge">
            <span>Human Data (Taxon 9606) Strictly Prohibited</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
