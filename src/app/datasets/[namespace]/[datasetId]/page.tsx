import React from "react";
import type { Metadata } from "next";
import { Navbar } from "../../../../components/navbar/Navbar";
import { Footer } from "../../../../components/footer/Footer";
import { DatasetDetailPage } from "../../../../components/detail/DatasetDetailPage";
import { getDataset } from "../../../../data/datasets";

interface PageProps {
  params: Promise<{
    namespace: string;
    datasetId: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { namespace, datasetId } = await params;
  const dataset = getDataset(namespace, datasetId);
  if (!dataset) {
    return {
      title: "Dataset Not Found — UbuntuBio",
    };
  }
  return {
    title: `${dataset.name} — UbuntuBio`,
    description: dataset.description,
  };
}

export default async function Page({ params }: PageProps) {
  const { namespace, datasetId } = await params;
  const dataset = getDataset(namespace, datasetId);

  return (
    <div className="ubio-landing-wrapper ubio-band-light">
      <Navbar />
      <main id="main-content">
        <DatasetDetailPage
          dataset={dataset}
          namespace={namespace}
          datasetId={datasetId}
        />
      </main>
      <Footer />
    </div>
  );
}
