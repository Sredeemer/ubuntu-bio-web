import React from "react";

export function CasChunkIcon({ className = "", size = 48 }: { className?: string; size?: number }) {
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
        <linearGradient id="cas-top" x1="16" y1="8" x2="48" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00ED64" stopOpacity="0.8" />
          <stop offset="1" stopColor="#06B6D4" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="cas-left" x1="12" y1="26" x2="32" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#06B6D4" stopOpacity="0.3" />
          <stop offset="1" stopColor="#001E2B" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="cas-right" x1="32" y1="26" x2="52" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00ED64" stopOpacity="0.25" />
          <stop offset="1" stopColor="#001E2B" stopOpacity="0.95" />
        </linearGradient>
      </defs>

      {/* Isometric Cube Shell */}
      <g>
        {/* Top Face */}
        <path d="M32 8L52 20L32 32L12 20L32 8Z" fill="url(#cas-top)" stroke="#00ED64" strokeWidth="1.2" strokeLinejoin="round" />
        {/* Left Face */}
        <path d="M12 20L32 32V56L12 44V20Z" fill="url(#cas-left)" stroke="#06B6D4" strokeWidth="1.2" strokeOpacity="0.6" strokeLinejoin="round" />
        {/* Right Face */}
        <path d="M32 32L52 20V44L32 56V32Z" fill="url(#cas-right)" stroke="#00ED64" strokeWidth="1.2" strokeOpacity="0.6" strokeLinejoin="round" />
      </g>

      {/* Internal Deduplicated Sub-chunk Nodes */}
      <circle cx="32" cy="20" r="2.5" fill="#FFFFFF" />
      <circle cx="24" cy="38" r="2" fill="#38BDF8" />
      <circle cx="40" cy="38" r="2" fill="#00ED64" />
      <circle cx="32" cy="44" r="2" fill="#F59E0B" />

      {/* Internal Hash Vectors */}
      <path d="M32 20L24 38M32 20L40 38M24 38L32 44M40 38L32 44" stroke="#FFFFFF" strokeWidth="0.8" strokeOpacity="0.4" strokeDasharray="2 2" />
    </svg>
  );
}
