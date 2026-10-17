import React from "react";
import type { Metadata } from "next";
import { DocsLayout } from "../../../components/docs/DocsLayout";
import { Code2, Server } from "lucide-react";

export const metadata: Metadata = {
  title: "REST & CAS API Reference — UbuntuBio Docs",
  description: "RESTful endpoints and OpenXet content-addressable storage specifications for UbuntuBio.",
};

export default function DocsApiPage() {
  return (
    <DocsLayout currentPath="/docs/api">
      <div className="docs-content-body">
        <div className="docs-badge">API Reference</div>
        <h1 className="docs-page-title">REST & OpenXet CAS API</h1>
        <p className="docs-page-lead">
          The UbuntuBio backend provides standard RESTful endpoints for metadata queries and sub-50ms search,
          alongside high-performance CAS chunk streaming for sequence datasets.
        </p>

        {/* Endpoint: GET /v1/datasets */}
        <section className="docs-section">
          <h2>Datasets Query API</h2>
          <div className="api-endpoint-badge">
            <span className="method-get">GET</span>
            <code className="endpoint-path">/v1/datasets</code>
          </div>
          <p>Retrieve a paginated list of sovereign genomic datasets with multi-facet filters.</p>

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
                <tr>
                  <td><code>limit</code></td>
                  <td>integer</td>
                  <td>Results per page (default: 20, max: 100)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h4>Example Response:</h4>
          <div className="docs-code-block">
            <pre>
{`{
  "total": 6,
  "page": 1,
  "limit": 20,
  "items": [
    {
      "id": "pasteur-dakar/lassa-surveillance-2026",
      "namespace": "pasteur-dakar",
      "datasetId": "lassa-surveillance-2026",
      "name": "Lassa Mammarenavirus Genomic Surveillance (West Africa)",
      "countryCode": "SN",
      "countryName": "Senegal",
      "taxonId": 11620,
      "taxonName": "Lassa mammarenavirus",
      "pathogenType": "Virus",
      "samplesCount": 142,
      "totalSizeMb": 48200,
      "biocontainment": "BSL-4",
      "accessGate": "public",
      "updatedAt": "2026-10-12"
    }
  ]
}`}
            </pre>
          </div>
        </section>

        {/* Endpoint: GET /v1/datasets/{namespace}/{datasetId} */}
        <section className="docs-section">
          <h2>Dataset Manifest & Detail</h2>
          <div className="api-endpoint-badge">
            <span className="method-get">GET</span>
            <code className="endpoint-path">/v1/datasets/&#123;namespace&#125;/&#123;datasetId&#125;</code>
          </div>
          <p>Returns complete MIxS bioinformatics metadata, provenance credentials, and file manifests.</p>
        </section>

        {/* Endpoint: GET /v1/cas/chunks/{hash} */}
        <section className="docs-section">
          <h2>OpenXet CAS Content Chunk Stream</h2>
          <div className="api-endpoint-badge">
            <span className="method-get">GET</span>
            <code className="endpoint-path">/v1/cas/chunks/&#123;sha256_hash&#125;</code>
          </div>
          <p>
            Streams raw deduplicated chunk bytes directly from content-addressable storage (OpenXet).
            Chunks are indexed by their SHA-256 hash.
          </p>

          <h4>Response Headers:</h4>
          <div className="docs-code-block">
            <pre>
{`HTTP/1.1 200 OK
Content-Type: application/octet-stream
X-CAS-Chunk-Hash: sha256:44001928ba0100ccff8491028300ff1984aa9102
Content-Length: 1048576`}
            </pre>
          </div>
        </section>
      </div>
    </DocsLayout>
  );
}
