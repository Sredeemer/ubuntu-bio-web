import React from "react";
import type { Metadata } from "next";
import { Navbar } from "../../../../components/navbar/Navbar";
import { Footer } from "../../../../components/footer/Footer";
import { DatasetDetailPage } from "../../../../components/detail/DatasetDetailPage";
import { fetchRepository } from "../../../../lib/api";
import { JsonLd } from "../../../../components/seo/JsonLd";
import { datasetJsonLd, isIndexableDataset } from "../../../../lib/seo";

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
      title: "Dataset Not Found — UbuntuBio",
    };
  }
  return {
    title: `${dataset.name} — UbuntuBio`,
    description: dataset.description,
    alternates: { canonical: `/datasets/${namespace}/${datasetId}` },
    ...(dataset.accessGate === "public" ? {} : { robots: { index: false, follow: true } }),
  };
}

export default async function Page({ params }: PageProps) {
  const { namespace, datasetId } = await params;
  const dataset = await fetchRepository(namespace, datasetId);

  return (
    <div className="ubio-landing-wrapper ubio-band-light">
      {dataset && isIndexableDataset(dataset) && <JsonLd data={datasetJsonLd(dataset)} />}
      <Navbar />
      <main id="main-content" tabIndex={-1}>
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

