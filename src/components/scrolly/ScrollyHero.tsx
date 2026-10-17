"use client";

import React, { useState, useEffect, useRef } from "react";
import { InteractiveTerminal } from "../terminal/InteractiveTerminal";

interface ScrollyStep {
  id: string;
  tabKey: "auth" | "push" | "search";
  badge: string;
  title: string;
  description: string;
  metricLabel: string;
  metricValue: string;
}

const STEPS: ScrollyStep[] = [
  {
    id: "step-1",
    tabKey: "push",
    badge: "Bandwidth-Optimized Transfer",
    title: "Streamlined Sequence Uploads Over Limited Uplinks",
    description:
      "African research teams frequently work under constrained bandwidth. UbuntuBio identifies previously indexed sequence segments and uploads only novel mutations, skipping redundant data and dramatically speeding up FASTQ and VCF transfers.",
    metricLabel: "Average Bandwidth Saved",
    metricValue: "75%",
  },
  {
    id: "step-2",
    tabKey: "auth",
    badge: "African Genomic Sovereignty",
    title: "Enforcing AU Country Verification & Nagoya Compliance",
    description:
      "Every dataset submitted to the hub is validated against the 54 African Union member state standards and the Nagoya Protocol on Access and Benefit Sharing. Human genomic sequences (NCBI Taxon ID 9606) are strictly blocked at the client and server levels to prevent unconsented exploitation.",
    metricLabel: "Authorized AU Member States",
    metricValue: "54",
  },
  {
    id: "step-3",
    tabKey: "search",
    badge: "Sub-50ms Discovery",
    title: "Federated Pathogen Sequence Indexing Across AU Member States",
    description:
      "Instant faceted search across viral, bacterial, and vector samples. Researchers in Dakar, Nairobi, Cape Town, and Ibadan discover matching isolates with granular filters for biocontainment level, host organism, and sequencing instruments.",
    metricLabel: "Search Response Latency",
    metricValue: "< 30ms",
  },
];

export function ScrollyHero() {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const stepRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-step-index"));
            if (!isNaN(index)) {
              setActiveStepIndex(index);
            }
          }
        });
      },
      {
        rootMargin: "-35% 0px -35% 0px",
        threshold: 0.1,
      }
    );

    stepRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const activeStep = STEPS[activeStepIndex] ?? STEPS[0]!;

  return (
    <section className="ubio-scrolly-section" id="architecture" aria-label="UbuntuBio Technology Overview">
      <div className="ubio-scrolly-grid">
        {/* Sticky Visual Stage (Modal Style) */}
        <div className="ubio-sticky-column">
          <div className="ubio-sticky-viewport">
            {/* Floating Satellite Orbiting Pill */}
            <div className="ubio-satellite-pill floating-node" aria-live="polite">
              <span className="satellite-beacon" />
              <span className="satellite-text">{activeStep.badge}</span>
              <span className="satellite-metric">{activeStep.metricValue}</span>
            </div>

            {/* Central Interactive Terminal */}
            <InteractiveTerminal activeTabOverride={activeStep.tabKey} />

            {/* Bottom Micro-Dashboard */}
            <div className="ubio-stage-footer">
              <div className="ubio-footer-card">
                <div className="card-text-group">
                  <span className="card-label">{activeStep.metricLabel}</span>
                  <span className="card-value">{activeStep.metricValue}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Narrative Flow Track */}
        <div className="ubio-narrative-column">
          {STEPS.map((step, idx) => {
            const isActive = activeStepIndex === idx;

            return (
              <article
                key={step.id}
                data-step-index={idx}
                ref={(el) => { stepRefs.current[idx] = el; }}
                className={`ubio-narrative-step ${isActive ? "is-active" : ""}`}
              >
                <div className="ubio-step-badge-row">
                  <span className="ubio-step-number">0{idx + 1}</span>
                  <span className="ubio-step-badge-title">{step.badge}</span>
                </div>

                <h3 className="ubio-step-heading">{step.title}</h3>

                <p className="ubio-step-paragraph">{step.description}</p>

                <div className="ubio-step-footer">
                  <div className="metric-chip">
                    <span className="chip-label">{step.metricLabel}</span>
                    <span className="chip-stat">{step.metricValue}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
