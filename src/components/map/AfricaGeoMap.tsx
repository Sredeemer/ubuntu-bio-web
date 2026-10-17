"use client";

import React, { useState } from "react";
import { Server, Activity, ShieldAlert, Cpu } from "lucide-react";

interface CoverageNode {
  id: string;
  city: string;
  country: string;
  countryCode: string;
  institution: string;
  instruments: string[];
  capacityGb: number;
  status: "Online" | "Active Sequencing" | "Syncing Sequences";
  activeSurveillance: string[];
}

const NODES: CoverageNode[] = [
  {
    id: "node-dakar",
    city: "Dakar",
    country: "Senegal",
    countryCode: "SN",
    institution: "Institut Pasteur de Dakar",
    instruments: ["Illumina NextSeq 2000", "Oxford Nanopore GridION"],
    capacityGb: 120000,
    status: "Active Sequencing",
    activeSurveillance: ["Yellow fever virus", "Lassa mammarenavirus", "Crimean-Congo hemorrhagic fever"],
  },
  {
    id: "node-ibadan",
    city: "Ede / Ibadan",
    country: "Nigeria",
    countryCode: "NG",
    institution: "ACEGID (Redeemer's University)",
    instruments: ["Illumina NovaSeq 6000", "PacBio Sequel IIe", "MinION Mk1C"],
    capacityGb: 350000,
    status: "Active Sequencing",
    activeSurveillance: ["Lassa virus", "Mpox Clade II", "Ebola virus (Zaire)"],
  },
  {
    id: "node-nairobi",
    city: "Nairobi",
    country: "Kenya",
    countryCode: "KE",
    institution: "KEMRI (Kenya Medical Research Institute)",
    instruments: ["Illumina MiSeq", "Oxford Nanopore PromethION 24"],
    capacityGb: 180000,
    status: "Syncing Sequences",
    activeSurveillance: ["Vibrio cholerae", "Rift Valley fever virus", "Plasmodium falciparum"],
  },
  {
    id: "node-capetown",
    city: "Cape Town",
    country: "South Africa",
    countryCode: "ZA",
    institution: "CERI & KRISP, Stellenbosch / UKZN",
    instruments: ["Illumina NovaSeq X Plus", "Oxford Nanopore PromethION 48"],
    capacityGb: 500000,
    status: "Online",
    activeSurveillance: ["Mycobacterium tuberculosis MDR", "Respiratory syncytial virus", "HIV-1 Subtype C"],
  },
];

export function AfricaGeoMap() {
  const [selectedNodeId, setSelectedNodeId] = useState<string>("node-ibadan");

  const activeNode = NODES.find((n) => n.id === selectedNodeId) ?? NODES[0]!;

  return (
    <div className="ubio-map-band ubio-art-host">
    <div className="ubio-art-layer" aria-hidden="true">
      <div className="ubio-art map-art-fan" />
    </div>
    <section className="ubio-map-section" id="coverage" aria-label="Regional Genomic Coverage">
      <div className="ubio-map-header">
        <span className="ubio-eyebrow">Distributed federation</span>
        <h2 className="ubio-map-title ubio-display-condensed">Regional Genomic Datasets &amp; AU Coverage</h2>
        <p className="ubio-map-subtitle">
          Real-time pathogen surveillance and genomic dataset coverage across the 54 African Union member states.
        </p>
      </div>

      <div className="ubio-network-container glass-card">
        {/* Node Selectors */}
        <div className="ubio-node-selector-bar" role="tablist" aria-label="African Hubs">
          {NODES.map((node) => (
            <button
              key={node.id}
              role="tab"
              aria-selected={node.id === selectedNodeId}
              onClick={() => setSelectedNodeId(node.id)}
              className={`ubio-node-tab ${node.id === selectedNodeId ? "active" : ""}`}
            >
              <span className="node-flag">{node.countryCode}</span>
              <span className="node-city">{node.city}</span>
            </button>
          ))}
        </div>

        {/* Selected Hub Detail Card */}
        <div className="ubio-node-detail-panel">
          <div className="node-detail-header">
            <div>
              <h3 className="node-inst-title">{activeNode.institution}</h3>
              <p className="node-location-text">
                {activeNode.city}, {activeNode.country} ({activeNode.countryCode})
              </p>
            </div>
            <div className="node-status-indicator">
              <span className="pulse-indicator" />
              <span>{activeNode.status}</span>
            </div>
          </div>

          <div className="node-specs-grid">
            <div className="node-spec-box">
              <span className="spec-box-label">Storage Capacity</span>
              <span className="spec-box-val">{(activeNode.capacityGb / 1024).toFixed(1)} TB Indexed</span>
            </div>
            <div className="node-spec-box">
              <span className="spec-box-label">Data Reduction</span>
              <span className="spec-box-val">74.2% Bandwidth Saved</span>
            </div>
            <div className="node-spec-box">
              <span className="spec-box-label">AU Member State</span>
              <span className="spec-box-val">ISO-3166-1: {activeNode.countryCode}</span>
            </div>
          </div>

          <div className="node-instruments-row">
            <span className="row-title">Active Sequencing Fleet:</span>
            <div className="instrument-chips">
              {activeNode.instruments.map((inst, i) => (
                <span key={i} className="instrument-chip">
                  {inst}
                </span>
              ))}
            </div>
          </div>

          <div className="node-surveillance-row">
            <span className="row-title">Live Pathogen Surveillance Programs:</span>
            <div className="surveillance-chips">
              {activeNode.activeSurveillance.map((pathogen, i) => (
                <span key={i} className="surveillance-chip">
                  {pathogen}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
    </div>
  );
}
