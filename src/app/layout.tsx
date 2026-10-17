import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UbuntuBio — Decentralized African Bioinformatics & Pathogen Hub",
  description:
    "Open-source data hub for African pathogen surveillance, veterinary genomics, and crop biodiversity with sub-50ms search and strict African Union data sovereignty.",
  keywords: [
    "Bioinformatics",
    "African Union",
    "Genomics",
    "Pathogen Surveillance",
    "Lassa Virus",
    "Ebola",
    "Sequence Transfer",
    "MIxS",
  ],
  authors: [{ name: "UbuntuBio Initiative" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
