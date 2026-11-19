"use client";

import React, { useEffect } from "react";
import { reloadOnceForChunkError } from "../lib/chunkRecovery";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // A stale-build chunk failure is fixed by one automatic reload; anything else is shown.
    if (reloadOnceForChunkError(error)) return;
    console.error("[ubuntubio] route error:", error);
  }, [error]);

  return (
    <main
      id="main-content"
      tabIndex={-1}
      style={{ minHeight: "60vh", display: "grid", placeItems: "center", padding: "48px 24px", textAlign: "center" }}
    >
      <div role="alert" style={{ maxWidth: 480 }}>
        <h1 style={{ fontSize: "1.5rem", marginBottom: 12 }}>This page didn&apos;t load correctly</h1>
        <p style={{ color: "#64748b", marginBottom: 20 }}>
          Something went wrong while loading this page. Trying again usually fixes it.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button type="button" className="btn-pill-primary" onClick={() => reset()}>
            Try again
          </button>
          <button type="button" className="btn-pill-secondary" onClick={() => window.location.reload()}>
            Reload page
          </button>
        </div>
      </div>
    </main>
  );
}
