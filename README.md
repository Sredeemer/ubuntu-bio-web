# ubuntu-bio-web

Next.js 15+ App Router frontend for UbuntuBio — open-source decentralized genomic data hub for African sovereign sequence datasets.

## Key Technical Decisions
- **Architecture**: React Server Components (RSC) by default; Client Components only where WebGL / MapLibre or interactivity is required.
- **Styling**: Vanilla CSS with CSS Modules and semantic design tokens (`src/styles/tokens.css`). No TailwindCSS bloat.
- **Geospatial Map**: MapLibre GL JS + self-hosted Protomaps PMTiles (no Mapbox API key or external telemetry).
- **Accessibility**: Strict WCAG 2.1 AA compliance with semantic HTML and keyboard navigation.

## Development Setup

```bash
npm install
npm run dev     # Starts Next.js dev server on http://localhost:3000
npm run lint    # ESLint
npm test        # Vitest component tests
```
