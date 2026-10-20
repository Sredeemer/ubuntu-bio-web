import React from "react";
import Link from "next/link";
import { UbuntuBioLogo } from "../icons/UbuntuBioLogo";
import { HubStatusBadge } from "../common/HubStatusBadge";
import "./Footer.css";

export function Footer() {
  return (
    <footer className="ubio-footer">
      <div className="ubio-footer-container">
        <div className="ubio-footer-grid">
          {/* Brand Info */}
          <div className="ubio-footer-col brand-col">
            <Link href="/" className="footer-brand-header">
              <div className="footer-logo-box">
                <UbuntuBioLogo size={28} color="#00ed64" spin={true} />
              </div>
              <span className="footer-brand-title">
                UbuntuBio<span className="brand-dot">.</span>
              </span>
            </Link>
            <p className="footer-mandate-text">
              Open-source biological data infrastructure engineered for African pathogen, vector,
              and biodiversity genomics.
            </p>
          </div>

          {/* Platform Links */}
          <div className="ubio-footer-col">
            <h4 className="footer-col-title">Platform</h4>
            <ul className="footer-link-list">
              <li>
                <Link href="/datasets" className="footer-link">
                  Browse Datasets
                </Link>
              </li>
              <li>
                <Link href="/submit" className="footer-link">
                  Deposit Data
                </Link>
              </li>
              <li>
                <Link href="/#story" className="footer-link">
                  Our Story
                </Link>
              </li>
            </ul>
          </div>

          {/* Documentation Links */}
          <div className="ubio-footer-col">
            <h4 className="footer-col-title">Developers</h4>
            <ul className="footer-link-list">
              <li>
                <Link href="/docs/cli" className="footer-link">
                  Python CLI (<code>ubio</code>)
                </Link>
              </li>
              <li>
                <Link href="/docs/api" className="footer-link">
                  REST API Reference
                </Link>
              </li>
              <li>
                <Link href="/docs/governance" className="footer-link">
                  Data Governance
                </Link>
              </li>
            </ul>
          </div>

          {/* Community Links */}
          <div className="ubio-footer-col">
            <h4 className="footer-col-title">Community</h4>
            <ul className="footer-link-list">
              <li>
                <a
                  href="https://www.waccbip.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link"
                >
                  WACCBIP, University of Ghana
                </a>
              </li>
              <li>
                <a
                  href="mailto:contact@ubuntubio.org?subject=UbuntuBio%20Partnership"
                  className="footer-link"
                >
                  Contact &amp; Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="ubio-footer-bottom">
          <div className="footer-legal-group">
            <p className="footer-legal">
              &copy; {new Date().getFullYear()} UbuntuBio Initiative &bull; Open Source under Apache-2.0 / MIT.
            </p>
            <a
              href="https://www.waccbip.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-subtext"
            >
              Founded at WACCBIP, University of Ghana &bull; Legon
            </a>
          </div>
          <div className="footer-status-pill">
            <HubStatusBadge />
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
