"use client";

import React from "react";
import { Navbar } from "../components/navbar/Navbar";
import { HeroHeader } from "../components/hero/HeroHeader";
import { ScrollyHero } from "../components/scrolly/ScrollyHero";
import { AfricaGlobeSection } from "../components/globe/AfricaGlobeSection";
import { AfricaGeoMap } from "../components/map/AfricaGeoMap";
import { StartToday } from "../components/start/StartToday";
import { Footer } from "../components/footer/Footer";

export default function HomePage() {
  return (
    <div className="ubio-landing-wrapper">
      <Navbar />
      <main id="main-content">
        <HeroHeader />
        <ScrollyHero />
        <AfricaGlobeSection />
        <AfricaGeoMap />
        <StartToday />
      </main>
      <Footer />
    </div>
  );
}
