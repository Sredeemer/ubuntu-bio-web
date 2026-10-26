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
  { id: "api-datasets", label: "GET /api/v1/datasets", level: 2 },
  { id: "api-dataset-detail", label: "GET /api/v1/datasets/{id}", level: 2 },
  { id: "api-taxonomy-suggest", label: "GET /api/v1/taxonomy/suggest", level: 2 },
  { id: "api-taxonomy-detail", label: "GET /api/v1/taxonomy/{id}", level: 2 },
  { id: "api-cas-chunks", label: "GET /api/v1/cas/chunks/{hash}", level: 2 },
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

        {/* Endpoint: GET /api/v1/taxonomy/suggest */}
        <section className="docs-section" id="api-taxonomy-suggest">
          <h2>Taxonomy Autocomplete &amp; Suggestion API</h2>
          <div className="api-endpoint-card">
            <div className="endpoint-header">
              <span className="http-method get">GET</span>
              <code className="endpoint-path">/api/v1/taxonomy/suggest</code>
            </div>
            <p>
              Queries the self-hosted NCBI taxdump index for biological organisms by scientific binomial name,
              common name, genus, family, or NCBI Taxon ID. Completely air-gapped and self-contained (zero external NCBI calls).
            </p>
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
                  <td>Search term (e.g. <code>cholera</code>, <code>mpox</code>, <code>vibrio</code>, or numeric Taxon ID <code>666</code>). When empty, returns top African priority surveillance organisms.</td>
                </tr>
                <tr>
                  <td><code>limit</code></td>
                  <td>integer</td>
                  <td>Maximum number of suggestions to return (1–50, default: <code>10</code>).</td>
                </tr>
              </tbody>
            </table>
          </div>

          <DocsCodeBlock
            title="cURL Example"
            language="bash"
            code={`curl -X GET "https://hub.ubuntubio.org/api/v1/taxonomy/suggest?q=cholera&limit=5" \\
  -H "Accept: application/json"`}
          />

          <h4>Response Payload (JSON):</h4>
          <DocsCodeBlock
            title="Taxonomy Suggestion Response"
            language="json"
            code={`{
  "query": "cholera",
  "count": 1,
  "taxa": [
    {
      "taxon_id": 666,
      "scientific_name": "Vibrio cholerae",
      "common_name": "Cholera",
      "rank": "species",
      "genus": "Vibrio",
      "family": "Vibrionaceae",
      "order": "Vibrionales",
      "domain": "bacteria",
      "is_prohibited": false
    }
  ]
}`}
          />
        </section>

        {/* Endpoint: GET /api/v1/taxonomy/{taxon_id} */}
        <section className="docs-section" id="api-taxonomy-detail">
          <h2>Taxon Lineage &amp; Verification Lookup</h2>
          <div className="api-endpoint-card">
            <div className="endpoint-header">
              <span className="http-method get">GET</span>
              <code className="endpoint-path">/api/v1/taxonomy/{`{taxon_id}`}</code>
            </div>
            <p>
              Retrieves authoritative taxonomy details and lineage for a specific numerical NCBI Taxon ID.
              Flags strictly prohibited human genomic data (Taxon ID <code>9606</code>) with <code>is_prohibited: true</code>.
            </p>
          </div>

          <DocsCodeBlock
            title="cURL Example"
            language="bash"
            code={`curl -X GET "https://hub.ubuntubio.org/api/v1/taxonomy/10244" \\
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
