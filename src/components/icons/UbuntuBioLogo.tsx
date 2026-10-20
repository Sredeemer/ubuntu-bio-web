import React from "react";

export interface UbuntuBioLogoProps {
  /** Size in pixels for both width and height (or width if aspect ratio applies). Defaults to 32. */
  size?: number;
  /** Width override if different from size. */
  width?: number;
  /** Height override if different from size. */
  height?: number;
  /** Fill color. Defaults to UbuntuBio brand green (#00ed64). */
  color?: string;
  /** Additional CSS class names. */
  className?: string;
  /** Accessibility label. If provided, role="img" will be added. */
  title?: string;
  /** Whether the logo should slowly spin continuously. Defaults to false. */
  spin?: boolean;
}

export function UbuntuBioLogo({
  size = 32,
  width,
  height,
  color = "#00ed64",
  className = "",
  title,
  spin = false,
}: UbuntuBioLogoProps) {
  const w = width ?? size;
  const h = height ?? Math.round((size * 48) / 40);
  const classes = [className, spin ? "ubio-logo-spin" : ""].filter(Boolean).join(" ");

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 40 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={classes}
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={!title}
    >
      {title && <title>{title}</title>}
      <g fill={color}>
        {/* Top Ray (North) */}
        <path d="m17.5 16.5c0 1.3807 1.1193 2.5 2.5 2.5s2.5-1.1193 2.5-2.5v-10c0-1.38071-1.1193-2.5-2.5-2.5s-2.5 1.11929-2.5 2.5z" />
        {/* Bottom Ray (South) */}
        <path d="m17.5 41.5c0 1.3807 1.1193 2.5 2.5 2.5s2.5-1.1193 2.5-2.5v-10c0-1.3807-1.1193-2.5-2.5-2.5s-2.5 1.1193-2.5 2.5z" />
        {/* Top-Right Ray (North-East) */}
        <path d="m23.5362 20.4645c-.9763-.9764-.9763-2.5593 0-3.5356l7.071-7.07105c.9763-.97631 2.5593-.97631 3.5356.00001.9763.97634.9763 2.55924 0 3.53554l-7.0711 7.0711c-.9763.9763-2.5592.9763-3.5355 0z" />
        {/* Bottom-Left Ray (South-West) */}
        <path d="m5.8585 34.6066c-.97631.9763-.97631 2.5592 0 3.5355s2.55922.9763 3.53553 0l7.07107-7.071c.9763-.9764.9763-2.5593 0-3.5356s-2.5592-.9763-3.5355 0z" />
        {/* Bottom-Right Ray (South-East) */}
        <path d="m23.5358 27.5356c.9763-.9764 2.5592-.9764 3.5355 0l7.0711 7.071c.9763.9763.9763 2.5592 0 3.5356-.9763.9763-2.5592.9763-3.5355 0l-7.0711-7.0711c-.9763-.9763-.9763-2.5592 0-3.5355z" />
        {/* Top-Left Ray (North-West) */}
        <path d="m9.39365 9.85789c-.97631-.97631-2.55922-.97631-3.53553 0s-.97631 2.55921 0 3.53551l7.07108 7.0711c.9763.9763 2.5592.9763 3.5355 0s.9763-2.5592 0-3.5355z" />
        {/* Right Ray (East) */}
        <path d="m25 24c0-1.3807 1.1193-2.5 2.5-2.5h10c1.3807 0 2.5 1.1193 2.5 2.5s-1.1193 2.5-2.5 2.5h-10c-1.3807 0-2.5-1.1193-2.5-2.5z" />
        {/* Left Ray (West) */}
        <path d="m2.5 21.5c-1.38071 0-2.5 1.1193-2.5 2.5s1.11929 2.5 2.5 2.5h10c1.3807 0 2.5-1.1193 2.5-2.5s-1.1193-2.5-2.5-2.5z" />
      </g>
    </svg>
  );
}

export default UbuntuBioLogo;
