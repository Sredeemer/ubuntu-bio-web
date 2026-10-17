import React from "react";

export function SovereignShieldIcon({ className = "", size = 48 }: { className?: string; size?: number }) {
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
        <linearGradient id="shield-grad" x1="32" y1="8" x2="32" y2="54" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00684A" stopOpacity="0.4" />
          <stop offset="1" stopColor="#001E2B" stopOpacity="0.95" />
        </linearGradient>
      </defs>

      {/* Security Shield Perimeter */}
      <path
        d="M32 8L50 16V30C50 42 42 51 32 56C22 51 14 42 14 30V16L32 8Z"
        fill="url(#shield-grad)"
        stroke="#00ED64"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />

      {/* African Continent Geometric Silhouette */}
      <path
        d="M26 20L35 19L39 24L38 31L34 35L33 42L31 43L30 36L26 32L24 25L26 20Z"
        fill="none"
        stroke="#00ED64"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Verified Sentinel Node Ring */}
      <circle cx="32" cy="28" r="11" stroke="#38BDF8" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.6" />
    </svg>
  );
}
