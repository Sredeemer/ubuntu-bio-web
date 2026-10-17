import React from "react";
import { ChevronRight } from "lucide-react";

const RESOURCES = [
  { label: "Python client (ubuntu-bio)", href: "#architecture" },
  { label: "Submission guidelines", href: "#catalog" },
  { label: "Data governance policy", href: "#coverage" },
  { label: "Regional coverage & member states", href: "#coverage" },
] as const;

export function StartToday() {
  return (
    <div className="ubio-band-light">
      <section className="ubio-start-section" aria-labelledby="start-title">
        <h2 id="start-title" className="ubio-start-title ubio-display-condensed">
          The sovereign data platform for African genomics
        </h2>

        <div className="ubio-start-grid">
          <article className="start-card-dark">
            <div className="start-card-copy">
              <span className="ubio-eyebrow">Start today</span>
              <h3 className="start-card-title ubio-display-condensed">
                Publish your first isolate
              </h3>
              <p className="start-card-desc">
                Register your institution, validate MIxS metadata against AU country codes, and
                push callsets with deduplicated, resumable uploads.
              </p>
              <a href="#catalog" className="btn-pill-primary start-card-cta">
                Get started
              </a>
            </div>
            <pre className="start-card-code" aria-label="Example upload commands">
              <code>
                <span className="code-dim">$</span> pip install ubuntu-bio{"\n"}
                <span className="code-dim">$</span> ubio login{"\n"}
                <span className="code-dim">$</span> ubio push ./lassa-2026 \{"\n"}
                {"    "}--country SN --taxon 11620{"\n"}
                <span className="code-ok">validated · 142 samples · 48.2 GB</span>
              </code>
            </pre>
          </article>

          <aside className="start-card-light" aria-label="More information">
            <span className="ubio-eyebrow ubio-eyebrow--ink">More information</span>
            <ul className="start-resource-list">
              {RESOURCES.map((r) => (
                <li key={r.label}>
                  <a href={r.href} className="start-resource-link">
                    <span className="resource-dot" aria-hidden="true" />
                    <span>{r.label}</span>
                    <ChevronRight size={16} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>
    </div>
  );
}
