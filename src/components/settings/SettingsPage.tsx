"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  KeyRound,
  ShieldCheck,
  Plus,
  Trash2,
  Copy,
  Check,
  AlertCircle,
  ExternalLink,
  Terminal,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  PersonalAccessToken,
  fetchUserTokens,
  createPersonalAccessToken,
  revokePersonalAccessToken,
} from "../../lib/api";
import "./SettingsPage.css";

export function SettingsPage() {
  const { user, token, isAuthenticated, isLoading } = useAuth();

  const [tokens, setTokens] = useState<PersonalAccessToken[]>([]);
  const [tokensLoading, setTokensLoading] = useState(false);
  const [newTokenName, setNewTokenName] = useState("");
  const [newTokenScope, setNewTokenScope] = useState<"read" | "write" | "admin">("write");
  const [createdRawToken, setCreatedRawToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const loadTokens = useCallback(async () => {
    if (!token) return;
    setTokensLoading(true);
    try {
      const list = await fetchUserTokens(token);
      setTokens(list);
    } catch {
      // Ignored
    } finally {
      setTokensLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      loadTokens();
    }
  }, [token, loadTokens]);

  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newTokenName.trim()) return;

    setErrorMsg("");
    const res = await createPersonalAccessToken(newTokenName.trim(), newTokenScope, token);
    if (res.success && res.raw_token) {
      setCreatedRawToken(res.raw_token);
      setNewTokenName("");
      loadTokens();
    } else {
      setErrorMsg(res.error || "Failed to generate token.");
    }
  };

  const handleRevokeToken = async (tokenId: string) => {
    if (!token) return;
    const ok = await revokePersonalAccessToken(tokenId, token);
    if (ok) {
      loadTokens();
    }
  };

  const handleCopy = () => {
    if (!createdRawToken) return;
    navigator.clipboard.writeText(createdRawToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="ubio-settings-container" style={{ textAlign: "center", padding: "80px 0" }}>
        <p style={{ color: "#9ca3af" }}>Loading researcher settings...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="ubio-settings-container" style={{ textAlign: "center", padding: "80px 0" }}>
        <h2 style={{ color: "#ffffff", marginBottom: "16px" }}>Authentication Required</h2>
        <p style={{ color: "#9ca3af", marginBottom: "24px" }}>
          Please sign in with your verified ORCID iD to view settings and manage tokens.
        </p>
        <a href="/login" className="btn-pill-primary">
          Sign In
        </a>
      </div>
    );
  }

  return (
    <div className="ubio-settings-container">
      <div className="ubio-settings-header">
        <h1 className="ubio-settings-title">Account & Security Settings</h1>
        <p className="ubio-settings-subtitle">
          Manage your verified researcher profile, institutional affiliations, and API Personal
          Access Tokens.
        </p>
      </div>

      {/* ── Card 1: Researcher Profile ─────────────────────────────────────── */}
      <div className="ubio-settings-card">
        <div className="ubio-settings-card-header">
          <div className="ubio-card-title-group">
            <ShieldCheck size={22} color="#00ed64" />
            <div>
              <h2 className="ubio-card-title">Researcher Identity</h2>
              <div className="ubio-card-desc">
                Verified via ORCID iD public researcher registry
              </div>
            </div>
          </div>
        </div>

        <div className="ubio-profile-grid">
          <div className="ubio-profile-stat-box">
            <div className="ubio-stat-label">Full Name</div>
            <div className="ubio-stat-value">{user.name}</div>
          </div>

          <div className="ubio-profile-stat-box">
            <div className="ubio-stat-label">ORCID iD</div>
            <div className="ubio-stat-value">
              <a
                href={`https://orcid.org/${user.orcid_id}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  color: "#a6ce39",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  textDecoration: "none",
                }}
              >
                <span>{user.orcid_id}</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>

          <div className="ubio-profile-stat-box">
            <div className="ubio-stat-label">User Identifier</div>
            <div className="ubio-stat-value" style={{ fontFamily: "monospace", fontSize: "13px" }}>
              {user.id}
            </div>
          </div>
        </div>
      </div>

      {/* ── Card 2: Personal Access Tokens ─────────────────────────────────── */}
      <div className="ubio-settings-card">
        <div className="ubio-settings-card-header">
          <div className="ubio-card-title-group">
            <KeyRound size={22} color="#00ed64" />
            <div>
              <h2 className="ubio-card-title">Personal Access Tokens (PATs)</h2>
              <div className="ubio-card-desc">
                Use PATs to authenticate the <code style={{ color: "#00ed64" }}>ubio</code> Python CLI
                and Git Smart HTTP operations.
              </div>
            </div>
          </div>
        </div>

        {createdRawToken && (
          <div className="token-generated-banner">
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#00ed64" }}>
              <Check size={18} />
              <strong>New Token Generated Successfully!</strong>
            </div>
            <p style={{ color: "#c1ccd6", fontSize: "13px", marginTop: "4px" }}>
              Make sure to copy your Personal Access Token now. You won&apos;t be able to see it again!
            </p>
            <div className="token-code-row">
              <span className="token-code-text">{createdRawToken}</span>
              <button type="button" className="btn-copy-token" onClick={handleCopy}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? "Copied!" : "Copy"}</span>
              </button>
            </div>
          </div>
        )}

        {errorMsg && (
          <div
            style={{
              padding: "12px",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#f87171",
              borderRadius: "8px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Generate Token Form */}
        <form
          onSubmit={handleCreateToken}
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "24px",
            background: "rgba(255, 255, 255, 0.02)",
            padding: "16px",
            borderRadius: "8px",
          }}
        >
          <input
            type="text"
            className="ubio-input-field"
            placeholder="Token description (e.g. Lab HPC Workstation)"
            value={newTokenName}
            onChange={(e) => setNewTokenName(e.target.value)}
            style={{ flex: "1 1 240px" }}
          />

          <select
            className="ubio-input-field"
            value={newTokenScope}
            onChange={(e) => setNewTokenScope(e.target.value as "read" | "write" | "admin")}
            style={{ width: "130px", cursor: "pointer" }}
          >
            <option value="write">write (Push)</option>
            <option value="read">read (Pull)</option>
            <option value="admin">admin (Full)</option>
          </select>

          <button
            type="submit"
            className="btn-pill-primary"
            disabled={!newTokenName.trim()}
            style={{ borderRadius: "8px", padding: "10px 18px", fontSize: "13px" }}
          >
            <Plus size={16} />
            <span>Generate Token</span>
          </button>
        </form>

        {/* Active Tokens Table */}
        {tokensLoading ? (
          <p style={{ color: "#9ca3af", fontSize: "13px" }}>Loading active tokens...</p>
        ) : tokens.length === 0 ? (
          <p style={{ color: "#9ca3af", fontSize: "14px", fontStyle: "italic" }}>
            No active personal access tokens found. Generate one above to use with the CLI.
          </p>
        ) : (
          <table className="ubio-tokens-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Scope</th>
                <th>Created</th>
                <th>Expires</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((t) => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 600 }}>{t.name}</td>
                  <td>
                    <span className="token-scope-badge">{t.scope}</span>
                  </td>
                  <td>{new Date(t.created_at).toLocaleDateString()}</td>
                  <td>{t.expires_at ? new Date(t.expires_at).toLocaleDateString() : "Never"}</td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      className="btn-revoke-token"
                      onClick={() => handleRevokeToken(t.id)}
                    >
                      <Trash2 size={13} style={{ display: "inline", marginRight: "4px" }} />
                      <span>Revoke</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Card 3: CLI Usage Instructions ─────────────────────────────────── */}
      <div className="ubio-settings-card">
        <div className="ubio-settings-card-header">
          <div className="ubio-card-title-group">
            <Terminal size={22} color="#00ed64" />
            <div>
              <h2 className="ubio-card-title">Authenticating the CLI</h2>
              <div className="ubio-card-desc">
                Log in to the UbuntuBio command-line interface on your local machine or compute cluster.
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            background: "#001e2b",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "8px",
            padding: "16px",
            fontFamily: "monospace",
            fontSize: "13px",
            color: "#e5e7eb",
          }}
        >
          <div style={{ color: "#9ca3af", marginBottom: "8px" }}>
            # Install the official Python CLI from PyPI:
          </div>
          <div style={{ color: "#00ed64", marginBottom: "14px" }}>pip install ubuntu-bio</div>

          <div style={{ color: "#9ca3af", marginBottom: "8px" }}>
            # Log in using your Personal Access Token:
          </div>
          <div style={{ color: "#00ed64" }}>ubio login</div>
        </div>
      </div>
    </div>
  );
}
