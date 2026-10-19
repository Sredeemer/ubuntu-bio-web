import React from "react";
import type { Metadata } from "next";
import { Navbar } from "../../components/navbar/Navbar";
import { Footer } from "../../components/footer/Footer";
import { SettingsPage } from "../../components/settings/SettingsPage";

export const metadata: Metadata = {
  title: "Account & Settings — UbuntuBio",
  description:
    "Manage your verified researcher profile, institutional affiliations, and Personal Access Tokens for CLI access.",
};

export default function Page() {
  return (
    <div className="ubio-landing-wrapper">
      <Navbar />
      <main id="main-content">
        <SettingsPage />
      </main>
      <Footer />
    </div>
  );
}
