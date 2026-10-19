import React from "react";
import type { Metadata } from "next";
import { LoginPage } from "../../components/auth/LoginPage";

export const metadata: Metadata = {
  title: "Log In — UbuntuBio Hub",
  description:
    "Sign in to UbuntuBio Hub using your verified ORCID iD or Personal Access Token (PAT) for sovereign genomic dataset deposition and access.",
};

export default function Page() {
  return <LoginPage />;
}
