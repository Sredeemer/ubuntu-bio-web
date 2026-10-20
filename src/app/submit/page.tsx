import React from "react";
import type { Metadata } from "next";
import { Navbar } from "../../components/navbar/Navbar";
import { Footer } from "../../components/footer/Footer";
import { SubmitDatasetPage } from "../../components/submit/SubmitDatasetPage";

export const metadata: Metadata = {
  title: "Submit Genomic Dataset — UbuntuBio",
  description:
    "Register sovereign pathogen or biodiversity data for fast sequence synchronization, sub-50ms search indexing, and African Union member state federation.",
};

export default function Page() {
  return (
    <div className="ubio-landing-wrapper ubio-band-light ubio-submit-white-wrapper">
      <Navbar />
      <main id="main-content">
        <SubmitDatasetPage />
      </main>
      <Footer />
    </div>
  );
}
