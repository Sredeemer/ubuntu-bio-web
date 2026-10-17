import React from "react";

export function NanoporeIcon({ className = "", size = 48 }: { className?: string; size?: number }) {
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
        <linearGradient id="membrane-grad" x1="8" y1="32" x2="56" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#003D4F" />
          <stop offset="0.5" stopColor="#001E2B" />
          <stop offset="1" stopColor="#003D4F" />
        </linearGradient>
      </defs>

      {/* Lipid Bilayer Membrane Plates */}
      <rect x="8" y="28" width="18" height="8" rx="2" fill="url(#membrane-grad)" stroke="#38BDF8" strokeWidth="1" strokeOpacity="0.5" />
      <rect x="38" y="28" width="18" height="8" rx="2" fill="url(#membrane-grad)" stroke="#38BDF8" strokeWidth="1" strokeOpacity="0.5" />

      {/* Protein Nanopore Channel Funnel */}
      <path d="M26 24C26 28 28 36 29 40H35C36 36 38 28 38 24" stroke="#38BDF8" strokeWidth="1.5" fill="rgba(56,189,248,0.08)" strokeLinecap="round" />

      {/* Translocating Single-Stranded DNA Ribbon */}
      <path d="M32 8V22C32 26 31 34 32 44V56" stroke="#00ED64" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="3 3" />

      {/* Sensor Rings */}
      <circle cx="32" cy="32" r="9" stroke="#00ED64" strokeWidth="0.8" strokeOpacity="0.4" strokeDasharray="2 4" />
      <circle cx="32" cy="32" r="1.5" fill="#38BDF8" />
    </svg>
  );
}
