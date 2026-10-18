"use client";

import React, { useEffect, useState } from "react";
import { Server, CheckCircle2, AlertCircle } from "lucide-react";
import { checkBackendHealth, API_BASE_URL, HealthResponse } from "../../lib/api";

export function HubStatusBadge() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    checkBackendHealth()
      .then((res) => {
        if (mounted) {
          setHealth(res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setHealth(null);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const isConnected = !!health;

  return (
    <div
      className={`hub-status-badge ${isConnected ? "connected" : "offline"}`}
      title={`UbuntuBio Hub API: ${API_BASE_URL} (${isConnected ? `v${health.version}` : "offline/fallback"})`}
      role="status"
      aria-label={isConnected ? `Hub API connected version ${health.version}` : "Hub API offline fallback active"}
    >
      <span className="hub-status-dot" />
      <Server size={13} className="hub-status-icon" />
      <span className="hub-status-text">
        {loading
          ? "Checking Hub API..."
          : isConnected
          ? `Hub API v${health.version}`
          : "Local Cache Active"}
      </span>
    </div>
  );
}
