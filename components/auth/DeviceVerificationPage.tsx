"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  Terminal,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { verifyDeviceCode } from "../../lib/api";
import "./DeviceVerificationPage.css";

export function DeviceVerificationPage() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("user_code") || "";
  const autoParam = searchParams.get("auto");
  const portParam = searchParams.get("port");

  const { user, token, isAuthenticated, isLoading, loginWithOrcid } = useAuth();

  const [code, setCode] = useState(initialCode);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const autoTriggeredRef = useRef(false);

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    }
  }, [initialCode]);

  // Auto-verify when auto=1 is passed and user is authenticated
  useEffect(() => {
    if (
      autoParam === "1" &&
      initialCode &&
      isAuthenticated &&
      token &&
      !autoTriggeredRef.current
    ) {
      autoTriggeredRef.current = true;
      setSubmitting(true);
      setErrorMessage("");

      verifyDeviceCode(initialCode.trim(), token)
        .then((res) => {
          setSubmitting(false);
          if (res.success) {
            setSuccess(true);
            if (portParam) {
              try {
                window.location.href = `http://127.0.0.1:${portParam}/callback?token=${encodeURIComponent(token)}`;
              } catch {
                // fallback
              }
            }
          } else {
            setErrorMessage(res.error || "Failed to auto-authorize device. Please check the code.");
          }
        })
        .catch(() => {
          setSubmitting(false);
          setErrorMessage("Unexpected error authorizing device.");
        });
    }
  }, [autoParam, initialCode, isAuthenticated, token, portParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !code.trim() || submitting) return;

    setSubmitting(true);
    setErrorMessage("");

    const res = await verifyDeviceCode(code.trim(), token);
    setSubmitting(false);

    if (res.success) {
      setSuccess(true);
      if (portParam) {
        try {
          window.location.href = `http://127.0.0.1:${portParam}/callback?token=${encodeURIComponent(token)}`;
        } catch {
          // fallback
        }
      }
    } else {
      setErrorMessage(res.error || "Failed to authorize device. Please check the code.");
    }
  };

  const currentReturnUrl =
    typeof window !== "undefined"
      ? window.location.pathname + window.location.search
      : "/device";

  return (
    <div className="ubio-device-container">
      <div className="ubio-device-card">
        {success ? (
          <div className="ubio-device-success-view">
            <div className="ubio-device-success-icon">
              <CheckCircle2 size={36} color="#00ed64" />
            </div>
            <h2 className="ubio-device-title">Terminal Authorized!</h2>
            <p className="ubio-device-subtitle" style={{ marginBottom: "1.5rem" }}>
              Your CLI and Python SDK session has been authorized as{" "}
              <strong style={{ color: "#f3f4f6" }}>{user?.name}</strong>.
            </p>
            <div className="ubio-device-permissions-card" style={{ textAlign: "left" }}>
              <div className="ubio-device-permissions-title">Session Details</div>
              <ul className="ubio-device-permissions-list">
                <li>Personal Access Token minted with <strong>write</strong> scope</li>
                <li>Valid for 90 days (manageable in your Settings)</li>
                <li>You can now close this tab and return to your terminal</li>
              </ul>
            </div>
          </div>
        ) : (
          <>
            <div className="ubio-device-header">
              <div className="ubio-device-badge-icon">
                <Terminal size={28} color="#00ed64" />
              </div>
              <h1 className="ubio-device-title">Authorize Terminal Device</h1>
              <p className="ubio-device-subtitle">
                Enter the one-time verification code shown in your terminal or bioinformatics pipeline.
              </p>
            </div>

            {isLoading || (submitting && autoParam === "1") ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <Loader2 className="animate-spin" size={32} color="#00ed64" style={{ margin: "0 auto 1rem" }} />
                <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>
                  {submitting ? "Authorizing terminal session..." : "Checking session..."}
                </p>
              </div>
            ) : !isAuthenticated ? (
              <div>
                <div className="ubio-device-error" style={{ background: "rgba(245, 158, 11, 0.1)", borderColor: "rgba(245, 158, 11, 0.25)", color: "#fcd34d" }}>
                  <AlertCircle size={18} />
                  <span>Please sign in with your verified ORCID iD to authorize this device.</span>
                </div>
                <button
                  type="button"
                  className="ubio-device-btn-primary"
                  onClick={() => loginWithOrcid(currentReturnUrl)}
                  id="btn-device-orcid-login"
                >
                  <svg width="18" height="18" viewBox="0 0 256 256" fill="none">
                    <circle cx="128" cy="128" r="128" fill="#A6CE39" />
                    <path
                      d="M86.3 186.2H70.9V79.1h15.4v107.1zm-7.7-122c-5.4 0-9.8-4.4-9.8-9.8s4.4-9.8 9.8-9.8 9.8 4.4 9.8 9.8-4.4 9.8-9.8 9.8zm108.6 69.3c0 30.6-22.3 52.7-55.7 52.7H104V79.1h30.1c31.4 0 53.1 20.7 53.1 54.4zm-15.6 0c0-23.7-14.7-38.3-37.5-38.3h-13.6v76.5h13.6c23.2 0 37.5-14.8 37.5-38.2z"
                      fill="#ffffff"
                    />
                  </svg>
                  <span>Sign In with ORCID to Continue</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="ubio-device-user-badge">
                  <div className="ubio-device-user-info">
                    <span className="ubio-device-user-name">{user?.name}</span>
                    <a
                      href={`https://orcid.org/${user?.orcid_id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="ubio-device-orcid-tag"
                    >
                      <svg width="12" height="12" viewBox="0 0 256 256" fill="none">
                        <circle cx="128" cy="128" r="128" fill="#A6CE39" />
                        <path
                          d="M86.3 186.2H70.9V79.1h15.4v107.1zm-7.7-122c-5.4 0-9.8-4.4-9.8-9.8s4.4-9.8 9.8-9.8 9.8 4.4 9.8 9.8-4.4 9.8-9.8 9.8zm108.6 69.3c0 30.6-22.3 52.7-55.7 52.7H104V79.1h30.1c31.4 0 53.1 20.7 53.1 54.4zm-15.6 0c0-23.7-14.7-38.3-37.5-38.3h-13.6v76.5h13.6c23.2 0 37.5-14.8 37.5-38.2z"
                          fill="#ffffff"
                        />
                      </svg>
                      <span>{user?.orcid_id}</span>
                      <ExternalLink size={10} />
                    </a>
                  </div>
                  <ShieldCheck size={20} color="#00ed64" />
                </div>

                {errorMessage && (
                  <div className="ubio-device-error" role="alert">
                    <AlertCircle size={18} />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="ubio-device-input-group">
                  <label htmlFor="user-code-input" className="ubio-device-label">
                    One-Time Code
                  </label>
                  <input
                    id="user-code-input"
                    type="text"
                    className="ubio-device-input"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="UBIO-XXXX-XX"
                    maxLength={16}
                    required
                    autoFocus
                  />
                </div>

                <div className="ubio-device-permissions-card">
                  <div className="ubio-device-permissions-title">Requested Permissions</div>
                  <ul className="ubio-device-permissions-list">
                    <li>Create & publish pathogen dataset repositories</li>
                    <li>Upload raw files & CAS chunks via OpenXet</li>
                    <li>Download public & authorized gated cohorts</li>
                  </ul>
                </div>

                <button
                  type="submit"
                  className="ubio-device-btn-primary"
                  disabled={!code.trim() || submitting}
                  id="btn-submit-device-auth"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      <span>Authorizing...</span>
                    </>
                  ) : (
                    <>
                      <span>Authorize Terminal</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
