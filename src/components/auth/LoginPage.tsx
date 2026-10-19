"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, AlertCircle, Loader2, KeyRound, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { devLogin } from "../../lib/api";
import { UbuntuBioLogo } from "../icons/UbuntuBioLogo";
import "./LoginPage.css";

export function LoginPage() {
  const router = useRouter();
  const { loginWithOrcid, loginWithToken } = useAuth();

  const [tokenInput, setTokenInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim() || loading) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const success = await loginWithToken(tokenInput.trim());
      if (success) {
        router.push("/submit");
      } else {
        setErrorMessage("Invalid or expired Personal Access Token. Please verify and try again.");
      }
    } catch {
      setErrorMessage("Unable to connect to UbuntuBio Hub. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleDevLogin = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const res = await devLogin("0000-0002-1825-0097", "Dr. Chinedu Okafor");
      if (res.success && res.raw_token) {
        const success = await loginWithToken(res.raw_token);
        if (success) {
          router.push("/submit");
          return;
        }
      }
      setErrorMessage(res.error || "Sandbox login failed.");
    } catch {
      setErrorMessage("Failed to perform sandbox login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ubio-login-container">
      {/* ── LEFT PANE: Form Column (MongoDB Style) ────────────────────────── */}
      <div className="ubio-login-form-pane">
        <div>
          {/* Brand Logo */}
          <div className="ubio-login-header">
            <a href="/" className="ubio-login-brand" aria-label="UbuntuBio Home">
              <UbuntuBioLogo size={30} color="#00ed64" />
              <span className="ubio-login-brand-title">
                UbuntuBio<span className="brand-dot">.</span>
              </span>
            </a>

            <h1 className="ubio-login-title">Log in to your account</h1>
            <p className="ubio-login-subtitle">
              Don&apos;t have an account?{" "}
              <a
                href="https://orcid.org/register"
                target="_blank"
                rel="noreferrer"
              >
                Sign Up on ORCID
              </a>
            </p>
          </div>

          {errorMessage && (
            <div className="ubio-login-error-alert" role="alert">
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Social OAuth Buttons */}
          <div className="ubio-oauth-buttons">
            <button
              type="button"
              className="btn-oauth btn-oauth-orcid"
              onClick={() => loginWithOrcid()}
              disabled={loading}
              id="btn-login-orcid"
            >
              {/* ORCID iD Logo Icon */}
              <svg width="22" height="22" viewBox="0 0 256 256" fill="none">
                <circle cx="128" cy="128" r="128" fill="#A6CE39" />
                <path
                  d="M86.3 186.2H70.9V79.1h15.4v107.1zm-7.7-122c-5.4 0-9.8-4.4-9.8-9.8s4.4-9.8 9.8-9.8 9.8 4.4 9.8 9.8-4.4 9.8-9.8 9.8zm108.6 69.3c0 30.6-22.3 52.7-55.7 52.7H104V79.1h30.1c31.4 0 53.1 20.7 53.1 54.4zm-15.6 0c0-23.7-14.7-38.3-37.5-38.3h-13.6v76.5h13.6c23.2 0 37.5-14.8 37.5-38.2z"
                  fill="#ffffff"
                />
              </svg>
              <span>Continue with ORCID</span>
            </button>
          </div>

          <p className="oauth-note">
            Note: UbuntuBio verifies researcher identity through ORCID iD for sovereign African
            data governance, attribution, and Nagoya Protocol compliance.
          </p>

          {/* Divider */}
          <div className="ubio-login-divider">
            <span>Or with Personal Access Token</span>
          </div>

          {/* Personal Access Token Form */}
          <form onSubmit={handleTokenSubmit}>
            <div className="ubio-input-group">
              <label htmlFor="pat-input" className="ubio-input-label">
                Personal Access Token
              </label>
              <input
                id="pat-input"
                type="password"
                className="ubio-input-field"
                placeholder="ubp_..."
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className={`btn-login-submit ${tokenInput.trim() ? "active" : ""}`}
              disabled={!tokenInput.trim() || loading}
              id="btn-login-submit"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Sandbox / Dev Login Helper */}
          <div>
            <button
              type="button"
              className="btn-quick-dev"
              onClick={handleDevLogin}
              disabled={loading}
              title="Sign in with a sandbox test researcher account"
            >
              <Sparkles size={14} />
              <span>Quick Sandbox Login (Dr. Chinedu Okafor)</span>
            </button>
          </div>
        </div>

        {/* Form Footer */}
        <div className="ubio-login-footer">
          <a href="/docs/governance">Data Governance</a>
          <span>•</span>
          <a href="/docs">Documentation</a>
          <span>•</span>
          <a href="/#coverage">AU Sovereign Network</a>
        </div>
      </div>

      {/* ── RIGHT PANE: Deep Teal Showcase Column ─────────────────────────── */}
      <div className="ubio-login-hero-pane">
        <div className="hero-motif-braces">{`{ }`}</div>
        <div className="hero-motif-star">*</div>
        <div className="hero-motif-curve" />

        <div className="ubio-hero-content">
          <div className="ubio-hero-badge">
            <KeyRound size={14} color="#00ed64" />
            <span>Sovereign Data Federation</span>
          </div>

          <h2 className="ubio-hero-headline">
            Explore sovereign African genomics and pathogen surveillance
          </h2>

          <p className="ubio-hero-copy">
            Connect with bioinformaticians, AI researchers, and public health labs across 54
            African Union member states. Deposit, discover, and synchronize genomic datasets with
            sub-50ms search and cryptographic CAS token verification.
          </p>

          <a href="/datasets" className="ubio-hero-link">
            <span>Browse public datasets</span>
            <ArrowRight size={18} />
          </a>
        </div>
      </div>
    </div>
  );
}
