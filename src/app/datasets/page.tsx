import React from "react";
import type { Metadata } from "next";
import { Navbar } from "../../components/navbar/Navbar";
import { DatasetsCatalogPage } from "../../components/catalog/DatasetsCatalogPage";
import { Footer } from "../../components/footer/Footer";

export const metadata: Metadata = {
  title: "Genomic & Pathogen Datasets Catalog — UbuntuBio",
  description:
    "Explore peer-verified non-human genomic datasets across 54 AU member states, with fast sequence synchronization and sub-50ms search.",
};

export default function DatasetsPage() {
  return (
    <div className="ubio-landing-wrapper ubio-band-light">
      <Navbar />
      <main id="main-content">
        <DatasetsCatalogPage />
      </main>
      <Footer />
    </div>
  );
}
