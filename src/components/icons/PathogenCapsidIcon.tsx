import React from "react";

export function PathogenCapsidIcon({ className = "", size = 48 }: { className?: string; size?: number }) {
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
        <radialGradient id="capsid-core" cx="32" cy="32" r="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FA6E39" stopOpacity="0.3" />
          <stop offset="0.8" stopColor="#001E2B" stopOpacity="0.95" />
        </radialGradient>
      </defs>

      {/* Outer Halo */}
      <circle cx="32" cy="32" r="22" fill="url(#capsid-core)" stroke="#FA6E39" strokeWidth="0.8" strokeOpacity="0.3" />

      {/* Geodesic Hexagonal Lattice */}
      <polygon points="32,14 46,22 46,42 32,50 18,42 18,22" stroke="#FA6E39" strokeWidth="1.2" fill="none" />
      <polygon points="32,14 42,32 32,50 22,32" stroke="#F59E0B" strokeWidth="1" strokeOpacity="0.6" fill="rgba(250,110,57,0.06)" />

      {/* Spike Glycoproteins */}
      <path d="M32 14V6M46 22L53 17M46 42L53 47M32 50V58M18 42L11 47M18 22L11 17" stroke="#FA6E39" strokeWidth="1.5" strokeLinecap="round" />

      {/* Inner Viral RNA Ring */}
      <circle cx="32" cy="32" r="4.5" stroke="#00ED64" strokeWidth="1.5" strokeDasharray="3 2" fill="none" />
    </svg>
  );
}
