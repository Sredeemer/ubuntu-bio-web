import React from "react";
import type { Metadata } from "next";
import { DocsLayout } from "../../../components/docs/DocsLayout";
import { ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "CLI Command Reference — UbuntuBio Docs",
  description: "Complete command-line interface documentation for the official UbuntuBio CLI (ubio).",
};

export default function DocsCliPage() {
  return (
    <DocsLayout currentPath="/docs/cli">
      <div className="docs-content-body">
        <div className="docs-badge">CLI Reference</div>
        <h1 className="docs-page-title">UbuntuBio CLI (<code>ubio</code>)</h1>
        <p className="docs-page-lead">
          The <code>ubio</code> CLI tool connects researchers and HPC pipelines to the UbuntuBio Hub,
          providing authentication, dataset versioning, full-text catalog search, and content-addressed downloads.
        </p>

        {/* Installation */}
        <section className="docs-section">
          <h2>Installation</h2>
          <div className="docs-code-block">
            <div className="code-block-header">
              <span>Install via PyPI</span>
              <span className="code-lang">bash</span>
            </div>
            <pre>
{`pip install ubuntu-bio
# Or with uv:
uv add ubuntu-bio

# Both 'ubio' and 'ubuntu-bio' entrypoints are installed`}
            </pre>
          </div>
        </section>

        {/* Global Flags */}
        <section className="docs-section">
          <h2>Global Flags &amp; Environment Variables</h2>
          <div className="docs-code-block">
            <pre>
{`ubio [OPTIONS] <COMMAND>

GLOBAL OPTIONS:
  --server <URL>      Override Hub API server [default: https://hub.ubuntubio.org]
  --help              Show help menu and exit

ENVIRONMENT VARIABLES:
  UBUNTUBIO_SERVER_URL   Override Hub API server URL
  UBUNTUBIO_API_TOKEN    Personal Access Token for non-interactive / CI pipelines
  UBUNTUBIO_CONFIG_DIR   Config directory [default: ~/.config/ubuntubio]`}
            </pre>
          </div>
        </section>

        {/* Command: ubio login */}
        <section className="docs-section">
          <h2><code>ubio login</code></h2>
          <p>
            Authenticates your session with ORCID. Opens a 1-step browser authorization loopback or falls back to an RFC 8628 device verification code.
          </p>
          <div className="docs-code-block">
            <pre>
{`# Interactive browser authorization
ubio login

# Non-interactive / headless CI authentication
ubio login --token ubp_your_personal_access_token`}
            </pre>
          </div>
        </section>

        {/* Command: ubio whoami */}
        <section className="docs-section">
          <h2><code>ubio whoami</code></h2>
          <p>
            Displays your active researcher identity, ORCID iD, and verified personal namespace handle.
          </p>
          <div className="docs-code-block">
            <pre>
{`ubio whoami

# Output in JSON format for automated scripting
ubio whoami --json`}
            </pre>
          </div>
        </section>

        {/* Command: ubio create */}
        <section className="docs-section">
          <h2><code>ubio create</code></h2>
          <p>
            Creates a new dataset repository. If a bare slug is passed, <code>ubio</code> automatically prefixes your verified personal handle.
          </p>
          <div className="docs-code-block">
            <pre>
{`# Creates @your-username/lassa-surveillance-2026
ubio create lassa-surveillance-2026 --domain virus --access public

# Creates under an organization namespace
ubio create pasteur-dakar/cholera-2026 --domain bacteria --access public --description "Vibrio cholerae surveillance"`}
            </pre>
          </div>
          <h4>Options:</h4>
          <ul>
            <li><code>--domain</code>, <code>-d</code> (Required): Biological domain (<code>bacteria</code>, <code>virus</code>, <code>parasite</code>, <code>fungus</code>, <code>plant</code>, <code>animal</code>, <code>vector</code>, <code>metagenome</code>, <code>environmental</code>)</li>
            <li><code>--access</code>, <code>-a</code>: Access tier (<code>public</code>, <code>gated</code>, <code>private</code>) [default: public]</li>
            <li><code>--description</code>: Human-readable study description</li>
            <li><code>--license</code>: Data license SPDX identifier [default: cc-by-4.0]</li>
          </ul>
        </section>

        {/* Command: ubio upload */}
        <section className="docs-section">
          <h2><code>ubio upload</code></h2>
          <p>
            Walks a local folder and uploads FASTA sequences, BAM alignments, and metadata to the target repository.
          </p>

          <div className="docs-alert-box alert-warning">
            <ShieldAlert size={18} className="alert-icon" />
            <div>
              <strong>Non-Human Data Requirement:</strong>
              <p>
                In compliance with UbuntuBio v1 data governance, human genomic data (NCBI Taxon ID 9606) is strictly prohibited.
              </p>
            </div>
          </div>

          <div className="docs-code-block">
            <pre>
{`ubio upload pasteur-dakar/cholera-2026 ./data-dir --message "Initial release of consensus assemblies"`}
            </pre>
          </div>
          <h4>Options:</h4>
          <ul>
            <li><code>--message</code>, <code>-m</code>: Git commit message [default: "Upload dataset"]</li>
            <li><code>--branch</code>, <code>-b</code>: Destination branch [default: "main"]</li>
          </ul>
        </section>

        {/* Command: ubio search */}
        <section className="docs-section">
          <h2><code>ubio search</code></h2>
          <p>
            Performs full-text search across pathogen titles, descriptions, and African Union member states.
          </p>
          <div className="docs-code-block">
            <pre>
{`# Search for cholera studies in Kenya
ubio search "cholera" --country KE

# Search for antimicrobial resistance studies in bacteria
ubio search "antimicrobial resistance" --domain bacteria --limit 10`}
            </pre>
          </div>
        </section>

        {/* Command: ubio download */}
        <section className="docs-section">
          <h2><code>ubio download</code></h2>
          <p>
            Downloads a dataset snapshot to a local directory with content deduplication and local caching.
          </p>
          <div className="docs-code-block">
            <pre>
{`# Download complete snapshot into ./local-data
ubio download pasteur-dakar/cholera-2026 --output-dir ./local-data

# Force re-download bypassing local cache
ubio download pasteur-dakar/cholera-2026 --force`}
            </pre>
          </div>
        </section>

        {/* Command: ubio download-remote */}
        <section className="docs-section">
          <h2><code>ubio download-remote</code></h2>
          <p>
            Downloads external raw sequence assets listed in a <code>remote_files.tsv</code> manifest with parallel MD5 verification.
          </p>
          <div className="docs-code-block">
            <pre>
{`ubio download-remote ./remote_files.tsv --output-dir ./raw_fastq --workers 8`}
            </pre>
          </div>
        </section>

        {/* Command: ubio logout */}
        <section className="docs-section">
          <h2><code>ubio logout</code></h2>
          <p>
            Clears locally cached session tokens from <code>~/.config/ubuntubio/credentials.json</code>.
          </p>
          <div className="docs-code-block">
            <pre>
{`ubio logout`}
            </pre>
          </div>
        </section>
      </div>
    </DocsLayout>
  );
}
