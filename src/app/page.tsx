"use client";

import React from "react";
import { Navbar } from "../components/navbar/Navbar";
import { HeroHeader } from "../components/hero/HeroHeader";
import { ScrollyHero } from "../components/scrolly/ScrollyHero";
import { AfricaGeoMap } from "../components/map/AfricaGeoMap";
import { DatasetSearch } from "../components/search/DatasetSearch";
import { StartToday } from "../components/start/StartToday";
import { Footer } from "../components/footer/Footer";

export default function HomePage() {
  return (
    <div className="ubio-landing-wrapper">
      <Navbar />
      <main id="main-content">
        <HeroHeader />
        <ScrollyHero />
        <DatasetSearch />
        <AfricaGeoMap />
        <StartToday />
      </main>
      <Footer />
    </div>
  );
}
