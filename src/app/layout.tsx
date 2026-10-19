import type { Metadata } from "next";
import { AuthProvider } from "../context/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://ubuntubio.org"),
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
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/icon.svg"],
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "UbuntuBio — Decentralized African Bioinformatics & Pathogen Hub",
    description:
      "Open-source data hub for African pathogen surveillance, veterinary genomics, and crop biodiversity with sub-50ms search and strict African Union data sovereignty.",
    url: "https://ubuntubio.org",
    siteName: "UbuntuBio",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "UbuntuBio Logo & African Genomic Network",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "UbuntuBio — Decentralized African Bioinformatics & Pathogen Hub",
    description:
      "Open-source data hub for African pathogen surveillance, veterinary genomics, and crop biodiversity with sub-50ms search.",
    images: ["/og-image.png"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#001e2b",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" sizes="any" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#001e2b" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
