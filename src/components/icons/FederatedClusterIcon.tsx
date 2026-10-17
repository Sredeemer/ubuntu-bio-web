import React from "react";

export function FederatedClusterIcon({ className = "", size = 48 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="cluster-mesh" cx="32" cy="32" r="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00ED64" stopOpacity="0.2" />
          <stop offset="1" stopColor="#001E2B" stopOpacity="0.95" />
        </radialGradient>
      </defs>

      {/* Outer Circle Mesh */}
      <circle cx="32" cy="32" r="26" fill="url(#cluster-mesh)" stroke="#1C2D38" strokeWidth="1" />

      {/* Network Edge Lines */}
      <line x1="32" y1="14" x2="16" y2="28" stroke="#38BDF8" strokeWidth="1.2" strokeOpacity="0.6" />
      <line x1="32" y1="14" x2="48" y2="28" stroke="#00ED64" strokeWidth="1.2" strokeOpacity="0.6" />
      <line x1="16" y1="28" x2="22" y2="48" stroke="#00ED64" strokeWidth="1.2" strokeOpacity="0.6" />
      <line x1="48" y1="28" x2="42" y2="48" stroke="#38BDF8" strokeWidth="1.2" strokeOpacity="0.6" />
      <line x1="22" y1="48" x2="42" y2="48" stroke="#F59E0B" strokeWidth="1.2" strokeOpacity="0.6" />
      <line x1="16" y1="28" x2="48" y2="28" stroke="#FFFFFF" strokeWidth="0.8" strokeOpacity="0.3" strokeDasharray="3 3" />
      <line x1="32" y1="14" x2="32" y2="34" stroke="#00ED64" strokeWidth="1.2" />

      {/* Regional Nodes (Dakar, Lagos, Nairobi, Cape Town, Cairo) */}
      <circle cx="32" cy="14" r="4" fill="#00ED64" stroke="#FFFFFF" strokeWidth="1.5" />
      <circle cx="16" cy="28" r="3.5" fill="#38BDF8" stroke="#001E2B" strokeWidth="1" />
      <circle cx="48" cy="28" r="3.5" fill="#00ED64" stroke="#001E2B" strokeWidth="1" />
      <circle cx="22" cy="48" r="3.5" fill="#F59E0B" stroke="#001E2B" strokeWidth="1" />
      <circle cx="42" cy="48" r="3.5" fill="#38BDF8" stroke="#001E2B" strokeWidth="1" />
      <circle cx="32" cy="34" r="2.5" fill="#FFFFFF" />
    </svg>
  );
}
