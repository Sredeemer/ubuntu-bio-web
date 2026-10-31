"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ArrowRight, X } from "lucide-react";
import "./NotificationBanner.css";

interface AnnouncementItem {
  badge: string;
  text: string;
  linkText: string;
  href: string;
  external?: boolean;
}

const ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    badge: "LLMS.TXT",
    text: "Machine-readable documentation for LLMs & AI coding agents is available.",
    linkText: "Access /llms.txt",
    href: "/llms.txt",
    external: true,
  },
  {
    badge: "ANNOUNCEMENT",
    text: "ubuntu-bio Python SDK & ubio CLI v0.1.0 published on PyPI.",
    linkText: "Read more",
    href: "/docs/cli",
    external: false,
  },
];

export function NotificationBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    try {
      const dismissed = sessionStorage.getItem("ubio_banner_dismissed");
      if (dismissed === "true") {
        setIsVisible(false);
      }
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      sessionStorage.setItem("ubio_banner_dismissed", "true");
    } catch {
      // Ignore storage errors
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + ANNOUNCEMENTS.length) % ANNOUNCEMENTS.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
  };

  if (!isVisible || ANNOUNCEMENTS.length === 0) return null;

  const current = ANNOUNCEMENTS[currentIndex];
  if (!current) return null;

  return (
    <div
      className="ubio-announcement-banner"
      role="region"
      aria-label="Site Announcements"
    >
      <div className="ubio-announcement-container">
        <a
          href={current.href}
          target={current.external ? "_blank" : undefined}
          rel={current.external ? "noreferrer" : undefined}
          className="ubio-announcement-link"
        >
          <span className="ubio-announcement-badge">{current.badge}</span>
          <span className="ubio-announcement-text">{current.text}</span>
          <span className="ubio-announcement-action">
            {current.linkText} <ArrowRight size={13} className="inline-arrow" />
          </span>
        </a>

        <div className="ubio-announcement-controls">
          <button
            type="button"
            onClick={handlePrev}
            className="ubio-announcement-nav-btn"
            aria-label="Previous announcement"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="ubio-announcement-nav-btn"
            aria-label="Next announcement"
          >
            <ChevronRight size={14} />
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="ubio-announcement-dismiss-btn"
            aria-label="Dismiss banner"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
