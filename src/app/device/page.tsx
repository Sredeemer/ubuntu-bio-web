import type { Metadata } from "next";
import React, { Suspense } from "react";
import { Navbar } from "../../components/navbar/Navbar";
import { Footer } from "../../components/footer/Footer";
import { DeviceVerificationPage } from "../../components/auth/DeviceVerificationPage";

export const metadata: Metadata = {
  title: "Authorize Terminal Device | UbuntuBio",
  description: "Authorize command-line CLI and Python SDK access using your verified ORCID iD.",
};

export default function DevicePage() {
  return (
    <div className="ubio-landing-wrapper">
      <Navbar />
      <main id="main-content">
        <Suspense fallback={<div style={{ minHeight: "80vh" }} />}>
          <DeviceVerificationPage />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
