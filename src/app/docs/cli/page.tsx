import React from "react";
import type { Metadata } from "next";
import { DocsLayout } from "../../../components/docs/DocsLayout";
import { DocsCopyButton } from "../../../components/docs/DocsCopyButton";
import { DocsCallout } from "../../../components/docs/DocsCallout";
import { DocsCodeBlock } from "../../../components/docs/DocsCodeBlock";
import { type TocItem } from "../../../components/docs/DocsRightRail";

export const metadata: Metadata = {
  title: "CLI Command Reference — UbuntuBio Docs",
  description: "Complete command-line interface documentation for the official UbuntuBio CLI (ubio).",
};

const TOC_ITEMS: TocItem[] = [
  { id: "install", label: "Installation", level: 2 },
  { id: "flags", label: "Global Flags & Env", level: 2 },
  { id: "cmd-login", label: "ubio login", level: 2 },
  { id: "cmd-whoami", label: "ubio whoami", level: 2 },
  { id: "cmd-create", label: "ubio create", level: 2 },
  { id: "cmd-upload", label: "ubio upload", level: 2 },
  { id: "cmd-search", label: "ubio search", level: 2 },
  { id: "cmd-download", label: "ubio download", level: 2 },
];

export default function DocsCliPage() {
  return (
    <DocsLayout currentPath="/docs/cli" tocItems={TOC_ITEMS}>
      <div className="docs-content-body">
        {/* Breadcrumb Navigation */}
        <nav className="docs-breadcrumb" aria-label="Breadcrumb">
          <a href="/docs">Docs Home</a>
          <span>/</span>
          <span>CLI Reference</span>
        </nav>

        {/* Title Header with Copy Page Dropdown */}
        <div className="docs-header-title-row">
          <div>
            <div className="docs-badge">CLI Reference</div>
            <h1 className="docs-page-title">UbuntuBio CLI (<code>ubio</code>)</h1>
          </div>
          <DocsCopyButton pageTitle="UbuntuBio CLI Command Reference" />
        </div>

        <p className="docs-page-lead">
          The <code>ubio</code> CLI tool connects researchers and HPC pipelines to the UbuntuBio Hub,
          providing authentication, dataset versioning, full-text catalog search, and content-addressed downloads.
        </p>

        {/* Callout */}
        <DocsCallout type="note" title="AI Agent Integration">
          <p>
            For agents parsing command results programmatically, all CLI commands accept <code>--json</code> to output machine-readable payloads.
            Full specifications are published at <a href="/llms.txt" target="_blank" rel="noreferrer" className="text-green"><code>/llms.txt</code></a>.
          </p>
        </DocsCallout>

        {/* Installation */}
        <section className="docs-section" id="install">
          <h2>Installation</h2>
          <DocsCodeBlock
            title="Install via PyPI"
            language="bash"
            code={`pip install ubuntu-bio
# Or with uv:
uv add ubuntu-bio

# Both 'ubio' and 'ubuntu-bio' entrypoints are installed`}
          />
        </section>

        {/* Global Flags */}
        <section className="docs-section" id="flags">
          <h2>Global Flags &amp; Environment Variables</h2>
          <DocsCodeBlock
            title="CLI Options & Environment"
            language="bash"
            code={`ubio [OPTIONS] <COMMAND>

GLOBAL OPTIONS:
  --server <URL>      Override Hub API server [default: https://hub.ubuntubio.org]
  --help              Show help menu and exit

ENVIRONMENT VARIABLES:
  UBUNTUBIO_SERVER_URL   Override Hub API server URL
  UBUNTUBIO_API_TOKEN    Personal Access Token for non-interactive / CI pipelines
  UBUNTUBIO_CONFIG_DIR   Config directory [default: ~/.config/ubuntubio]`}
          />
        </section>

        {/* Command: ubio login */}
        <section className="docs-section" id="cmd-login">
          <h2><code>ubio login</code></h2>
          <p>
            Authenticates your session with ORCID. Opens a 1-step browser authorization loopback or falls back to an RFC 8628 device verification code.
          </p>
          <DocsCodeBlock
            title="ubio login"
            language="bash"
            code={`# Interactive browser authorization
ubio login

# Non-interactive / headless CI authentication
ubio login --token ubp_your_personal_access_token`}
          />
        </section>

        {/* Command: ubio whoami */}
        <section className="docs-section" id="cmd-whoami">
          <h2><code>ubio whoami</code></h2>
          <p>
            Displays your active researcher identity, ORCID iD, and verified personal namespace handle.
          </p>
          <DocsCodeBlock
            title="ubio whoami"
            language="bash"
            code={`ubio whoami

# Output in JSON format for automated scripting
ubio whoami --json`}
          />
        </section>

        {/* Command: ubio create */}
        <section className="docs-section" id="cmd-create">
          <h2><code>ubio create</code></h2>
          <p>
            Creates a new dataset repository. If a bare slug is passed, <code>ubio</code> automatically prefixes your verified personal handle.
          </p>
          <DocsCodeBlock
            title="ubio create"
            language="bash"
            code={`# Creates @your-username/lassa-surveillance-2026
ubio create lassa-surveillance-2026 --domain virus --access public

# Creates under an organization namespace
ubio create pasteur-dakar/cholera-2026 --domain bacteria --access public --description "Vibrio cholerae surveillance"`}
          />
          <h4>Options:</h4>
          <ul>
            <li><code>--domain</code>, <code>-d</code> (Required): Biological domain (<code>bacteria</code>, <code>virus</code>, <code>parasite</code>, <code>fungus</code>, <code>plant</code>, <code>animal</code>, <code>vector</code>, <code>metagenome</code>, <code>environmental</code>)</li>
            <li><code>--access</code>, <code>-a</code>: Access tier (<code>public</code>, <code>gated</code>, <code>private</code>) [default: public]</li>
            <li><code>--description</code>: Human-readable study description</li>
            <li><code>--license</code>: Data license SPDX identifier [default: cc-by-4.0]</li>
          </ul>
        </section>

        {/* Command: ubio upload */}
        <section className="docs-section" id="cmd-upload">
          <h2><code>ubio upload</code></h2>
          <p>
            Walks a local folder and uploads FASTA sequences, BAM alignments, and metadata to the target repository.
          </p>

          <DocsCallout type="warning" title="Strict Non-Human Data Policy">
            <p>
              In compliance with UbuntuBio v1 data governance, human genomic data (NCBI Taxon ID 9606) is strictly prohibited.
              Metadata with Taxon ID 9606 or containing human identifiable markers will be rejected at commit pre-validation.
            </p>
          </DocsCallout>

          <DocsCodeBlock
            title="ubio upload"
            language="bash"
            code={`ubio upload pasteur-dakar/cholera-2026 ./data-dir --message "Initial release of consensus assemblies"`}
          />
          <h4>Options:</h4>
          <ul>
            <li><code>--message</code>, <code>-m</code>: Git commit message [default: "Upload dataset"]</li>
            <li><code>--branch</code>, <code>-b</code>: Destination branch [default: "main"]</li>
          </ul>
        </section>

        {/* Command: ubio search */}
        <section className="docs-section" id="cmd-search">
          <h2><code>ubio search</code></h2>
          <p>
            Performs full-text search across pathogen titles, descriptions, and African Union member states.
          </p>
          <DocsCodeBlock
            title="ubio search"
            language="bash"
            code={`# Search by pathogen keyword
ubio search "Marburg"

# Filter by AU member state code and biological domain
ubio search "cholera" -c NG -d bacteria`}
          />
        </section>

        {/* Command: ubio download */}
        <section className="docs-section" id="cmd-download">
          <h2><code>ubio download</code></h2>
          <p>
            Downloads dataset snapshot with OpenXet content-addressed chunk caching.
          </p>
          <DocsCodeBlock
            title="ubio download"
            language="bash"
            code={`ubio download pasteur-dakar/lassa-surveillance-2026 --output-dir ./lassa-local`}
          />
        </section>
      </div>
    </DocsLayout>
  );
}
