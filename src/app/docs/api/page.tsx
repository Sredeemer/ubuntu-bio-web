import React from "react";
import type { Metadata } from "next";
import { DocsLayout } from "../../../components/docs/DocsLayout";
import { DocsCopyButton } from "../../../components/docs/DocsCopyButton";
import { DocsCallout } from "../../../components/docs/DocsCallout";
import { DocsCodeBlock } from "../../../components/docs/DocsCodeBlock";
import { type TocItem } from "../../../components/docs/DocsRightRail";

export const metadata: Metadata = {
  title: "REST & CAS API Reference — UbuntuBio Docs",
  description: "RESTful endpoints and OpenXet content-addressable storage specifications for UbuntuBio.",
};

const TOC_ITEMS: TocItem[] = [
  { id: "api-datasets", label: "GET /v1/datasets", level: 2 },
  { id: "api-dataset-detail", label: "GET /v1/datasets/{id}", level: 2 },
  { id: "api-cas-chunks", label: "GET /v1/cas/chunks/{hash}", level: 2 },
];

export default function DocsApiPage() {
  return (
    <DocsLayout currentPath="/docs/api" tocItems={TOC_ITEMS}>
      <div className="docs-content-body">
        {/* Breadcrumb Navigation */}
        <nav className="docs-breadcrumb" aria-label="Breadcrumb">
          <a href="/docs">Docs Home</a>
          <span>/</span>
          <span>REST &amp; CAS API</span>
        </nav>

        {/* Title Header with Copy Page Dropdown */}
        <div className="docs-header-title-row">
          <div>
            <div className="docs-badge">API Reference</div>
            <h1 className="docs-page-title">REST &amp; OpenXet CAS API</h1>
          </div>
          <DocsCopyButton pageTitle="UbuntuBio REST & CAS API Reference" />
        </div>

        <p className="docs-page-lead">
          The UbuntuBio backend provides standard RESTful endpoints for metadata queries and sub-50ms search,
          alongside high-performance CAS chunk streaming for sequence datasets.
        </p>

        <DocsCallout type="note" title="OpenAPI & Schema Access">
          <p>
            Full OpenAPI 3.1 JSON schemas are published at <code>/openapi.json</code>. For automated SDK generators
            and AI agents, inspect <a href="/llms.txt" target="_blank" rel="noreferrer" className="text-green"><code>/llms.txt</code></a>.
          </p>
        </DocsCallout>

        {/* Endpoint: GET /v1/datasets */}
        <section className="docs-section" id="api-datasets">
          <h2>Datasets Query API</h2>
          <div className="api-endpoint-card">
            <div className="endpoint-header">
              <span className="http-method get">GET</span>
              <code className="endpoint-path">/v1/datasets</code>
            </div>
            <p>Retrieve a paginated list of sovereign genomic datasets with multi-facet filters.</p>
          </div>

          <h4>Query Parameters:</h4>
          <div className="params-table-wrapper">
            <table className="params-table">
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Type</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>q</code></td>
                  <td>string</td>
                  <td>Search term for pathogen name, institution, or description</td>
                </tr>
                <tr>
                  <td><code>country</code></td>
                  <td>string</td>
                  <td>Two-letter African Union ISO-3166-1 alpha-2 code (e.g. <code>NG</code>, <code>SN</code>)</td>
                </tr>
                <tr>
                  <td><code>taxon_id</code></td>
                  <td>integer</td>
                  <td>Filter by NCBI Taxonomy ID (excluding 9606)</td>
                </tr>
                <tr>
                  <td><code>bsl</code></td>
                  <td>string</td>
                  <td>Biosafety level: <code>BSL-1</code>, <code>BSL-2</code>, <code>BSL-3</code>, <code>BSL-4</code></td>
                </tr>
              </tbody>
            </table>
          </div>

          <DocsCodeBlock
            title="cURL Example"
            language="bash"
            code={`curl -X GET "https://hub.ubuntubio.org/v1/datasets?country=SN&bsl=BSL-3" \\
  -H "Authorization: Bearer $UBUNTUBIO_API_TOKEN" \\
  -H "Accept: application/json"`}
          />
        </section>

        {/* Endpoint: GET /v1/datasets/{id} */}
        <section className="docs-section" id="api-dataset-detail">
          <h2>Dataset Manifest &amp; Commit Tree</h2>
          <div className="api-endpoint-card">
            <div className="endpoint-header">
              <span className="http-method get">GET</span>
              <code className="endpoint-path">/v1/datasets/{`{id}`}</code>
            </div>
            <p>Returns the dataset metadata, provenance, AU sovereignty license, and Git commit hash.</p>
          </div>

          <DocsCodeBlock
            title="cURL Example"
            language="bash"
            code={`curl -X GET "https://hub.ubuntubio.org/v1/datasets/pasteur-dakar/lassa-surveillance-2026" \\
  -H "Accept: application/json"`}
          />
        </section>

        {/* Endpoint: GET /v1/cas/chunks/{hash} */}
        <section className="docs-section" id="api-cas-chunks">
          <h2>Content-Addressed Storage (CAS) Streaming</h2>
          <div className="api-endpoint-card">
            <div className="endpoint-header">
              <span className="http-method get">GET</span>
              <code className="endpoint-path">/v1/cas/chunks/{`{chunk_hash}`}</code>
            </div>
            <p>Streams a deduplicated binary chunk with cryptographic SHA-256 integrity verification.</p>
          </div>

          <DocsCodeBlock
            title="cURL Example"
            language="bash"
            code={`curl -X GET "https://hub.ubuntubio.org/v1/cas/chunks/a8f5f167f44f4964e6c998dee827110c" \\
  -H "Authorization: Bearer $UBUNTUBIO_API_TOKEN" \\
  --output chunk.bin`}
          />
        </section>
      </div>
    </DocsLayout>
  );
}
