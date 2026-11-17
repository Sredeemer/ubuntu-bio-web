"use client";

import React, { useEffect } from "react";
import { reloadOnceForChunkError } from "../lib/chunkRecovery";

/** Last-resort boundary: replaces the root layout, so it must render its own <html>/<body>. */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (reloadOnceForChunkError(error)) return;
    console.error("[ubuntubio] global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0 }}>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, textAlign: "center" }}>
          <div role="alert" style={{ maxWidth: 480 }}>
            <h1 style={{ fontSize: "1.5rem" }}>UbuntuBio couldn&apos;t load</h1>
            <p style={{ color: "#64748b" }}>Please try again. If the problem continues, reload the page.</p>
            <button type="button" onClick={() => reset()} style={{ padding: "10px 20px", marginRight: 12 }}>
              Try again
            </button>
            <button type="button" onClick={() => window.location.reload()} style={{ padding: "10px 20px" }}>
              Reload page
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
