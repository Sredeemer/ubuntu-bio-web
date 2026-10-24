import React from "react";
import type { Metadata } from "next";
import { Navbar } from "../../../../../components/navbar/Navbar";
import { Footer } from "../../../../../components/footer/Footer";
import { DatasetTreePage } from "../../../../../components/tree/DatasetTreePage";
import { fetchRepository } from "../../../../../lib/api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{
    namespace: string;
    datasetId: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { namespace, datasetId } = await params;
  const dataset = await fetchRepository(namespace, datasetId);
  if (!dataset) {
    return {
      title: "Files Tree — UbuntuBio",
    };
  }
  return {
    title: `File Tree: ${dataset.name} — UbuntuBio`,
    description: `Explore CAS content hashes, chunks, and sequence headers for ${dataset.name}.`,
  };
}

export default async function Page({ params }: PageProps) {
  const { namespace, datasetId } = await params;
  const dataset = await fetchRepository(namespace, datasetId);

  return (
    <div className="ubio-landing-wrapper ubio-band-light">
      <Navbar />
      <main id="main-content">
        <DatasetTreePage
          dataset={dataset}
          namespace={namespace}
          datasetId={datasetId}
        />
      </main>
      <Footer />
    </div>
  );
}

