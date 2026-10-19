"use client";

import React, { useState, useRef, useEffect } from "react";
import { Menu, X, User, Settings, LogOut, FileText, UploadCloud, ChevronDown } from "lucide-react";
import { UbuntuBioLogo } from "../icons/UbuntuBioLogo";
import { HubStatusBadge } from "../common/HubStatusBadge";
import { useAuth } from "../../context/AuthContext";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user, isAuthenticated, logout } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ").filter(Boolean);
    const first = parts[0];
    const second = parts[1];
    if (first && second && first[0] && second[0]) {
      return `${first[0]}${second[0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

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

          {isAuthenticated && user ? (
            <div className="ubio-profile-menu-wrapper" ref={dropdownRef}>
              <button
                type="button"
                className="ubio-profile-btn"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                aria-expanded={profileDropdownOpen}
                aria-label="User Profile Menu"
                id="btn-user-profile"
              >
                <div className="ubio-avatar-circle">{getInitials(user.name)}</div>
                <span className="ubio-profile-btn-name">{user.name}</span>
                <ChevronDown size={14} color="#9ca3af" />
              </button>

              {profileDropdownOpen && (
                <div className="ubio-profile-dropdown" role="menu">
                  <div className="ubio-profile-dropdown-header">
                    <div className="ubio-dropdown-user-name">{user.name}</div>
                    <a
                      href={`https://orcid.org/${user.orcid_id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="ubio-dropdown-orcid-badge"
                      title="View verified ORCID profile"
                    >
                      <svg width="12" height="12" viewBox="0 0 256 256" fill="none">
                        <circle cx="128" cy="128" r="128" fill="#A6CE39" />
                        <path
                          d="M86.3 186.2H70.9V79.1h15.4v107.1zm-7.7-122c-5.4 0-9.8-4.4-9.8-9.8s4.4-9.8 9.8-9.8 9.8 4.4 9.8 9.8-4.4 9.8-9.8 9.8zm108.6 69.3c0 30.6-22.3 52.7-55.7 52.7H104V79.1h30.1c31.4 0 53.1 20.7 53.1 54.4zm-15.6 0c0-23.7-14.7-38.3-37.5-38.3h-13.6v76.5h13.6c23.2 0 37.5-14.8 37.5-38.2z"
                          fill="#ffffff"
                        />
                      </svg>
                      <span>{user.orcid_id}</span>
                    </a>
                  </div>

                  <div className="ubio-profile-dropdown-items">
                    <a
                      href="/submit"
                      className="ubio-dropdown-item"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <UploadCloud size={16} color="#00ed64" />
                      <span>Submit Dataset</span>
                    </a>
                    <a
                      href="/settings"
                      className="ubio-dropdown-item"
                      onClick={() => setProfileDropdownOpen(false)}
                      id="nav-link-settings"
                    >
                      <Settings size={16} />
                      <span>Settings & Tokens</span>
                    </a>
                    <a
                      href="/docs"
                      className="ubio-dropdown-item"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <FileText size={16} />
                      <span>Documentation</span>
                    </a>

                    <div className="ubio-dropdown-divider" />

                    <button
                      type="button"
                      className="ubio-dropdown-item ubio-dropdown-item-logout"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      id="btn-logout"
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <a href="/login" className="btn-pill-secondary" id="btn-nav-login">
              Sign In
            </a>
          )}

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

          {isAuthenticated ? (
            <>
              <a
                href="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-nav-item"
              >
                Settings & API Tokens
              </a>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="mobile-nav-item"
                style={{ textAlign: "left", color: "#f87171" }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <a
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="mobile-nav-item"
              style={{ color: "#00ed64" }}
            >
              Sign In
            </a>
          )}
        </div>
      )}
    </header>
  );
}
