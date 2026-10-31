"use client";

import { COUNTRY_COORDINATES, FlagGlobe } from "@/components/ui/flag-globe";
import type { FlagGlobeMarker } from "@/components/ui/flag-globe";

const settings = {
  size: 440,
  allCountries: true,
  altitude: 0.2,
  autoRotate: true,
  rotationSpeed: 0.16,
  stars: false,
};

const ALL_COUNTRIES: FlagGlobeMarker[] = Object.keys(COUNTRY_COORDINATES).map((code) => ({ code }));

// Countries with developers on the CCgather leaderboard (ccgather.com/api/countries, Oct 2026).
const CCGATHER_COUNTRIES: FlagGlobeMarker[] = [
  "KR", "US", "TH", "IN", "AU", "CZ", "JP", "IT", "GB", "CA", "FR",
  "IL", "TW", "AE", "MY", "BR", "BD", "DE", "UA", "IS", "NO", "LA",
  "KH", "AZ", "CO", "CN", "NP", "UZ", "UY", "DK", "TR",
].map((code) => ({ code }));

const CCGATHER_URL = "https://ccgather.com/?utm_source=21st&utm_medium=component&utm_campaign=flag_globe";

export default function Demo(props: Partial<typeof settings>) {
  const s = { ...settings, ...props };
  const markers = s.allCountries ? ALL_COUNTRIES : CCGATHER_COUNTRIES;
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 overflow-hidden bg-background p-4">
      <FlagGlobe
        markers={markers}
        style={{ width: `min(${s.size}px, 100%, 72vh)` }}
        altitude={s.altitude}
        autoRotate={s.autoRotate}
        rotationSpeed={s.rotationSpeed}
        stars={s.stars}
      />
      <div className="space-y-1 text-center">
        <p className="text-sm font-medium text-foreground">
          {s.allCountries
            ? `All ${markers.length} countries, just pass ISO codes`
            : `Claude Code developers in ${markers.length} countries`}
        </p>
        <p className="text-xs text-muted-foreground">
          {s.allCountries ? "Built for the " : "Data from the "}
          <a
            href={CCGATHER_URL}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4 transition-colors hover:text-foreground"
          >
            CCgather
          </a>{" "}
          leaderboard
        </p>
      </div>
    </div>
  );
}
