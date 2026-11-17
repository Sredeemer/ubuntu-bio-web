"use client";

import React, { useEffect, useState } from "react";
import { Server, CheckCircle2, AlertCircle } from "lucide-react";
import { checkBackendHealth, HealthResponse } from "../../lib/api";

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
      // Must render identically on server and client: API_BASE_URL differs between the two
      // (empty in the browser, the backend URL during SSR), which broke hydration.
      title={`UbuntuBio Hub API (${isConnected ? `v${health.version}` : "offline/fallback"})`}
      role="status"
      aria-label={isConnected ? `Hub API connected version ${health.version}` : "Hub API offline fallback active"}
    >
      <span className="hub-status-dot" />
      <span className="hub-status-text">
        {loading
          ? "checking systems..."
          : isConnected
          ? "all systems working"
          : "local cache active"}
      </span>
    </div>
  );
}
