"use client";

import React from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { Layers, Server, GitPullRequest, Bot, Compass, ArrowRight } from "lucide-react";
import { DocsCallout } from "../docs/DocsCallout";
import { DocsCodeBlock } from "../docs/DocsCodeBlock";

const STORAGE_TREE = `/srv/ubuntubio/data/
├── ubuntubio.db   # SQLite WAL database (relational catalog, FTS5 BM25 search, audit_log)
├── xet/           # Two-level prefix-sharded SHA-256 CAS blobs (<aa>/<bb>/<oid>.bin)
├── git/           # Bare Git repositories (<owner>/<repo>.git) with pre-receive hook
└── tmp/           # Ephemeral staging area for streaming LFS PUT SHA-256 verification`;

const HOST_PREP_CMD = `# 1. Create the single-root storage directory on your Linux host
sudo mkdir -p /srv/ubuntubio/data/{xet,git,tmp,caddy_data,caddy_config}
sudo chown -R $USER:$USER /srv/ubuntubio/data

# 2. Clone the institutional repositories (obtain access from WACCBIP maintainers)
git clone <institutional-hub-repo-url> bioinf-db
git clone <institutional-web-repo-url> bioinf-db/web

# 3. Copy the environment template and configure production values
cd bioinf-db/deploy
cp .env.example .env`;

const ENV_PRODUCTION_SNIPPET = `# Single Root Storage Path
UBUNTUBIO_DATA_DIR=/srv/ubuntubio/data

# Public Hostnames (replace with your institutional domain)
UBUNTUBIO_DOMAIN=hub.example.edu.gh
UBUNTUBIO_API_URL=https://hub.example.edu.gh
UBUNTUBIO_WEB_URL=https://hub.example.edu.gh
CAS_URL=https://hub.example.edu.gh

# Embedded SQLite WAL Database
DATABASE_URL=sqlite+aiosqlite:////srv/data/ubuntubio.db

# Generate a 64-byte random secret: python3 -c "import secrets; print(secrets.token_urlsafe(48))"
JWT_SECRET_KEY=<replace-with-generated-secret>
JWT_ALGORITHM=RS256
UBUNTUBIO_ADMIN_ORCID_IDS=["0000-0000-0000-0000"]

# Production ORCID OAuth (register at https://orcid.org/developer-tools)
UBUNTUBIO_ORCID_CLIENT_ID=<your-orcid-app-id>
UBUNTUBIO_ORCID_CLIENT_SECRET=<your-orcid-app-secret>
UBUNTUBIO_ORCID_BASE_URL=https://orcid.org
UBUNTUBIO_ORCID_TOKEN_URL=https://orcid.org/oauth/token
UBUNTUBIO_ORCID_AUTHORIZE_URL=https://orcid.org/oauth/authorize
UBUNTUBIO_ORCID_REDIRECT_URI=https://hub.example.edu.gh/api/auth/orcid/callback`;

const DOCKER_START_CMD = `# Build and launch the FastAPI hub server and Caddy reverse proxy
cd bioinf-db/deploy
docker compose -f compose.yaml up -d --build server caddy

# Verify server health and RS256 JWKS key discovery
curl -fsS http://localhost:8000/healthz
curl -fsS http://localhost:8000/.well-known/jwks.json`;

const WEB_DEPLOY_CMD = `# Build and run the Next.js 15 standalone container
cd bioinf-db/web
docker build -t ubuntubio-web:latest .
docker run -d --name ubuntubio_web --restart unless-stopped \\
  -p 3000:3000 \\
  -e INTERNAL_API_URL=http://host.docker.internal:8000 \\
  -e NEXT_PUBLIC_SITE_URL=https://hub.example.edu.gh \\
  ubuntubio-web:latest

# Or run locally during development
npm ci && npm run dev`;

const OPS_MAINTENANCE_CMD = `# 1. Online SQLite WAL backup (safe while the server handles live traffic)
sqlite3 /srv/ubuntubio/data/ubuntubio.db ".backup '/srv/ubuntubio/backups/ubuntubio-$(date +%F).db'"

# 2. Install the public CLI for institutional maintenance and verification
pip install ubuntu-bio

# 3. Archive an RS256-signed audit checkpoint off-host (cron / WORM storage)
ubio audit checkpoint waccbip/your-cohort --save /secure/offhost/audit-anchors.jsonl

# 4. Verify an exported audit log against your retained off-host anchor
ubio audit checkpoint waccbip/your-cohort --verify-against /secure/offhost/audit-anchors.jsonl`;

const CONTRIB_WORKFLOW_CMD = `# 1. Branch from main using a descriptive prefix
git checkout main && git pull origin main
git checkout -b feat/fungal-rdna-panel-filter

# 2. Install pre-commit hooks once per clone
pip install pre-commit && pre-commit install

# 3. Run package checks before opening a Pull Request
cd server && uv run ruff check . && uv run ruff format --check . && uv run mypy src tests && uv run pytest
cd ../client-py && uv run ruff check . && uv run ruff format --check . && uv run mypy src tests && uv run pytest
cd ../web && npx tsc --noEmit && npm test`;

const COHORT_HANDOVER_TEMPLATE = `# Cohort Handover Brief: Class of [YEAR] -> Class of [YEAR + 1]
Date: [YYYY-MM-DD]
Outgoing Maintainers: [Names & ORCID iDs]
10-Year Milestone Target: [e.g., Year 2 — WACCBIP Campus Production + v1.1 Screening]

## 1. What Our Cohort Shipped
- [PR / Release tag]: [Short description of feature, fix, or dataset milestone]

## 2. Current Production Status
- Hosted URL & Server Host: [Hostname, OS, Docker Compose status]
- Storage Root Footprint: [Size of /srv/ubuntubio/data/xet, git, ubuntubio.db]
- Active Admin ORCIDs & Domain Custodians: [List institutional stewards]
- Last Verified Backup & Off-Host Audit Anchor: [Date + storage location]

## 3. Known Issues & Technical Debt
- [Issue #]: [Exact file/module, reproduction steps, and current workaround]

## 4. Credentials & Ownership Transfer Checklist
- [ ] Domain DNS & TLS ownership verified under institutional account
- [ ] ORCID OAuth developer app transferred to incoming maintainers
- [ ] PyPI maintainer access for \`ubuntu-bio\` updated
- [ ] Off-host audit checkpoint ledger handed over and verified

## 5. Assigned Tasks for the Incoming Cohort (Class of [YEAR + 1])
1. [Scoped Priority Task 1 — e.g., Implement fungal rDNA 25-mer subtraction in v1.1]
2. [Scoped Priority Task 2 — e.g., Add full CRAM stream parsing in validator/sniffer.py]
3. [Scoped Priority Task 3 — e.g., Benchmark PostgreSQL migration under multi-writer load]
4. Before graduating, update this brief and write the next task list for the Class of [YEAR + 2].`;

export function TechnicalHandoverTabs(): React.ReactElement {
  return (
    <Tabs.Root defaultValue="architecture" className="docs-tabs-root">
      <Tabs.List className="docs-tabs-list" aria-label="Technical Handover Sections">
        <Tabs.Trigger value="architecture" className="docs-tab-trigger">
          <Layers size={15} aria-hidden="true" />
          <span>System Map</span>
        </Tabs.Trigger>
        <Tabs.Trigger value="self-hosting" className="docs-tab-trigger">
          <Server size={15} aria-hidden="true" />
          <span>Self-Hosting Guide</span>
        </Tabs.Trigger>
        <Tabs.Trigger value="contributing" className="docs-tab-trigger">
          <GitPullRequest size={15} aria-hidden="true" />
          <span>Contributing</span>
        </Tabs.Trigger>
        <Tabs.Trigger value="ai-policy" className="docs-tab-trigger">
          <Bot size={15} aria-hidden="true" />
          <span>AI Policy</span>
        </Tabs.Trigger>
        <Tabs.Trigger value="roadmap" className="docs-tab-trigger">
          <Compass size={15} aria-hidden="true" />
          <span>What&apos;s Next &amp; 10-Year Plan</span>
        </Tabs.Trigger>
      </Tabs.List>

      {/* TAB 1: SYSTEM MAP */}
      <Tabs.Content value="architecture" className="docs-tab-panel">
        <section className="docs-section" id="components">
          <h2>Platform Components You Inherit</h2>
          <p>
            UbuntuBio is split into four focused modules. Keeping each piece small lets a student
            team run the full stack on one campus server without managing a Kubernetes cluster.
          </p>

          <div className="docs-table-wrap">
            <table className="docs-table">
              <thead>
                <tr>
                  <th>Module</th>
                  <th>Stack</th>
                  <th>What It Owns</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>server/</code>
                  </td>
                  <td>Python 3.12, FastAPI, SQLAlchemy, SQLite WAL + FTS5</td>
                  <td>
                    Git Smart-HTTP, Git LFS batch router, prefix-sharded SHA-256 CAS, 3-tier policy
                    gate (AU-55 Natural Earth polygons, Taxon <code>9606</code> ban, 9,350-probe
                    human-marker screen), RS256 capability JWTs, hash-chained audit log, and
                    four-phase commit reconciliation (<code>storage.py</code>).
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>web/</code>
                  </td>
                  <td>Next.js 15 App Router, React 19, TypeScript strict, Vanilla CSS</td>
                  <td>
                    Public catalog, MapLibre GL + PMTiles visualization, ORCID &amp; RFC 8628 device
                    login UI, dataset submission wizard, gated DUA workflow, and reverse-proxy
                    rewrites to the FastAPI backend.
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>client-py/</code>
                  </td>
                  <td>Python 3.12, Typer, Rich, Pydantic v2 (PyPI: <code>ubuntu-bio</code>)</td>
                  <td>
                    Local pre-commit validation (<code>ubio check</code>), dataset scaffolding (
                    <code>ubio init</code>), deduplicated LFS uploads, RFC 8628 CLI authentication,
                    and off-host audit checkpoint verification (<code>ubio audit checkpoint</code>).
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>curation/</code> &amp; <code>deploy/</code>
                  </td>
                  <td>Python harvesters, Docker Compose v2, Caddy 2</td>
                  <td>
                    ENA/NCBI metadata harvesters, single-root Docker Compose stack (
                    <code>deploy/compose.yaml</code>), automatic TLS proxy (
                    <code>deploy/Caddyfile</code>), and environment templates.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="docs-section" id="storage-layout">
          <h2>Single-Root Storage Invariant</h2>
          <p>
            All persistent runtime state lives inside one directory root. Nothing is scattered
            across arbitrary host paths, which makes campus backups and server migrations
            predictable.
          </p>
          <DocsCodeBlock code={STORAGE_TREE} language="text" title="Single-Root Data Directory" />
          <DocsCallout type="note" title="Four-Phase Commit &amp; Recovery">
            <p>
              Uploads stage in <code>tmp/</code>, pass Tier 1–3 validation, promote atomically into{" "}
              <code>xet/</code>, update bare Git refs, and finally write SQLite + FTS5 rows. If a
              crash interrupts any step, administrative <code>reconcile_cas_storage</code> inspects
              bare Git trees, protects all committed blobs, repairs missing database links, and
              prunes expired orphans.
            </p>
          </DocsCallout>
        </section>
      </Tabs.Content>

      {/* TAB 2: SELF-HOSTING GUIDE */}
      <Tabs.Content value="self-hosting" className="docs-tab-panel">
        <section className="docs-section" id="prerequisites">
          <h2>Prerequisites</h2>
          <ul>
            <li>
              <strong>Host machine:</strong> Ubuntu/Debian Linux VM or campus server (minimum 2
              vCPUs, 4 GiB RAM, SSD storage sized for your sequence cohorts).
            </li>
            <li>
              <strong>Runtime tools:</strong> Docker + Docker Compose v2, Git with{" "}
              <code>git-lfs</code>, Python 3.12+ (<code>uv</code>), Node.js 20+ LTS, and{" "}
              <code>sqlite3</code>.
            </li>
            <li>
              <strong>Network &amp; identity:</strong> A DNS record pointing ports <code>80</code>{" "}
              and <code>443</code> to your host for Caddy automatic HTTPS, plus ORCID OAuth client
              credentials.
            </li>
          </ul>

          <DocsCallout type="warning" title="Private Institutional Repositories">
            <p>
              While the <code>ubuntu-bio</code> CLI is public on PyPI (
              <code>pip install ubuntu-bio</code>), the server and portal repositories are kept
              under institutional stewardship prior to archival release. Incoming WACCBIP cohorts
              request Git access from the outgoing maintainers or faculty custodians.
            </p>
          </DocsCallout>
        </section>

        <section className="docs-section" id="step-prep">
          <h2 className="docs-step-heading">
            <span className="docs-step-number">1</span> Prepare Storage &amp; Clone Repositories
          </h2>
          <DocsCodeBlock code={HOST_PREP_CMD} language="bash" title="Host Preparation" />

          <h2 className="docs-step-heading">
            <span className="docs-step-number">2</span> Configure <code>deploy/.env</code>
          </h2>
          <p>
            Replace every placeholder secret and domain below. Never commit <code>.env</code>,
            private RSA <code>.pem</code> keys, or live <code>.db</code> files to Git.
          </p>
          <DocsCodeBlock
            code={ENV_PRODUCTION_SNIPPET}
            language="bash"
            title="deploy/.env (Production Template)"
          />

          <h2 className="docs-step-heading">
            <span className="docs-step-number">3</span> Start Backend Hub &amp; Caddy TLS Proxy
          </h2>
          <p>
            Update <code>deploy/Caddyfile</code> from <code>:80</code> to your public hostname so
            Caddy automatically provisions and renews Let&apos;s Encrypt certificates, then boot the
            stack:
          </p>
          <DocsCodeBlock code={DOCKER_START_CMD} language="bash" title="Launch Backend &amp; Verify" />

          <h2 className="docs-step-heading">
            <span className="docs-step-number">4</span> Build &amp; Run the Web Portal
          </h2>
          <p>
            <code>web/next.config.ts</code> builds in <code>standalone</code> mode and proxies{" "}
            <code>/api/*</code>, <code>/healthz</code>, and <code>/:owner/:name.git*</code> to{" "}
            <code>INTERNAL_API_URL</code>.
          </p>
          <DocsCodeBlock code={WEB_DEPLOY_CMD} language="bash" title="Web Frontend Container" />

          <h2 className="docs-step-heading">
            <span className="docs-step-number">5</span> Routine Backups &amp; Audit Anchoring
          </h2>
          <p>
            Schedule nightly SQLite WAL backups, run <code>reconcile_cas_storage</code> during
            low-traffic maintenance windows (respecting the default 3,600 s grace window), and store
            RS256 audit checkpoints off-host so any database tampering is immediately detectable.
          </p>
          <DocsCodeBlock
            code={OPS_MAINTENANCE_CMD}
            language="bash"
            title="Backups &amp; Off-Host Audit Checkpoints"
          />
        </section>
      </Tabs.Content>

      {/* TAB 3: CONTRIBUTING GUIDE */}
      <Tabs.Content value="contributing" className="docs-tab-panel">
        <section className="docs-section" id="invariants">
          <h2>Non-Negotiable Project Invariants</h2>
          <p>
            Every Pull Request is reviewed against five core rules documented in{" "}
            <code>AGENTS.md</code> and <code>docs/guidelines/</code>:
          </p>
          <ul>
            <li>
              <strong>Open-source dependencies only:</strong> Never introduce closed cloud vendor
              lock-in or proprietary services. Use Valkey, MapLibre GL + self-hosted PMTiles, and
              open-weight models.
            </li>
            <li>
              <strong>Human data ban (v1):</strong> NCBI Taxon ID <code>9606</code> remains
              blocked at both CLI and server validators. Clinical microbial isolates from human
              hosts are supported via <code>host: Homo sapiens</code> paired with the pathogen taxon
              ID.
            </li>
            <li>
              <strong>AU-55 geographic enforcement:</strong> Default <code>geo_policy: au_strict</code>{" "}
              validates all 55 African Union member states (including <code>EH</code>) against
              offline Natural Earth 1:50m polygons. Comparative studies using{" "}
              <code>allow_outgroups</code> must still anchor to at least one AU state.
            </li>
            <li>
              <strong>Zero auth bypasses:</strong> Never mint CAS capability JWTs or presigned URLs
              for gated or private datasets without verified authorization and DUA acceptance.
            </li>
            <li>
              <strong>Tests required for every change:</strong> No feature or bug fix merges without
              automated tests covering the new path and edge cases.
            </li>
          </ul>
        </section>

        <section className="docs-section" id="workflow">
          <h2>Open-Source Contribution Workflow</h2>
          <ol>
            <li>
              <strong>Open an issue first</strong> for new features or architectural changes. Small
              bug fixes and doc improvements can go straight to a Pull Request.
            </li>
            <li>
              <strong>Use descriptive branch names:</strong> <code>feat/map-clustering</code>,{" "}
              <code>fix/sniffer-cram-header</code>, <code>docs/update-handover</code>,{" "}
              <code>refactor/cas-locking</code>, or <code>test/audit-anchor-edge-cases</code>.
            </li>
            <li>
              <strong>Write Conventional Commits (1.0.0):</strong> Prefix commits with{" "}
              <code>feat(scope):</code>, <code>fix(scope):</code>, <code>docs(scope):</code>,{" "}
              <code>test(scope):</code>, or <code>chore(scope):</code>. Mark breaking changes with{" "}
              <code>!</code> or a <code>BREAKING CHANGE:</code> footer.
            </li>
            <li>
              <strong>Pass all local CI gates</strong> before pushing so GitHub Actions stays green.
            </li>
          </ol>

          <DocsCodeBlock
            code={CONTRIB_WORKFLOW_CMD}
            language="bash"
            title="Local Quality Gates (Matches CI)"
          />
        </section>

        <section className="docs-section" id="dod">
          <h2>Pull Request Definition of Done &amp; Security</h2>
          <ul>
            <li>Code follows language standards in <code>docs/guidelines/</code> (strict Mypy, Ruff, strict TypeScript, Vanilla CSS).</li>
            <li>Unit and integration tests pass across <code>server/</code>, <code>client-py/</code>, and <code>web/</code>.</li>
            <li>Documentation, OpenAPI schemas, and <code>llms.txt</code> are updated when behavior changes.</li>
            <li>Zero secrets, tokens, private keys, or large cached sequencing files are staged.</li>
          </ul>
          <DocsCallout type="important" title="Responsible Security Disclosure">
            <p>
              Do not file public GitHub issues for authentication, CAS token, or access-control
              vulnerabilities. Report security issues privately to the institutional maintainers at
              WACCBIP following <code>SECURITY.md</code>.
            </p>
          </DocsCallout>
        </section>
      </Tabs.Content>

      {/* TAB 4: AI POLICY */}
      <Tabs.Content value="ai-policy" className="docs-tab-panel">
        <section className="docs-section" id="ai-development">
          <h2>AI-Assisted Development &amp; Human Accountability</h2>
          <p>
            AI coding assistants (such as Antigravity, Cursor, GitHub Copilot, and open-weight local
            coding models) are permitted for scaffolding, refactoring, writing tests, and drafting
            documentation. Use them as engineering tools, not as unaccountable authors.
          </p>
          <ul>
            <li>
              <strong>Human ownership of every line:</strong> The contributor who opens a Pull
              Request is fully responsible for understanding, explaining, and defending every line
              in the diff. &ldquo;The AI wrote it&rdquo; is not an acceptable review response.
            </li>
            <li>
              <strong>Repository rules apply to agents too:</strong> Any AI agent working in this
              codebase must follow <code>AGENTS.md</code> and the language guides in{" "}
              <code>docs/guidelines/</code>.
            </li>
            <li>
              <strong>Mandatory verification:</strong> AI-assisted changes must pass strict typing
              (<code>mypy</code>, <code>tsc --noEmit</code>), linting (<code>ruff</code>), and the
              full automated test suites (<code>pytest</code>, <code>vitest</code>) before review.
            </li>
            <li>
              <strong>No weakened policy gates:</strong> Never accept an AI suggestion that
              bypasses, relaxes, or mocks away the human-data ban (Taxon <code>9606</code>), AU
              sovereignty geometry checks, CAS read-token authorization, or the single-root storage
              invariant.
            </li>
            <li>
              <strong>Transparent PR disclosure:</strong> When AI tools generate a substantial part
              of a Pull Request, note the tool used and which areas you verified manually in the PR
              description.
            </li>
          </ul>
        </section>

        <section className="docs-section" id="ai-data-sovereignty">
          <h2>Data Sovereignty &amp; Confidentiality Boundary</h2>
          <DocsCallout type="warning" title="Never Paste Protected Data Into External AI Tools">
            <p>
              Do not paste private or gated genomic sequences, unpublished institutional datasets,
              clinical or human-associated metadata, <code>.env</code> files, ORCID OAuth client
              secrets, JWT signing keys, or internal host IP addresses into third-party commercial
              AI chats or hosted LLM APIs.
            </p>
          </DocsCallout>
          <p>
            External AI providers operate outside institutional and African Union data jurisdictions.
            When debugging ingestion or metadata bugs with an external coding assistant, always use
            synthetic fixtures or already-public test records rather than real private or gated
            submissions.
          </p>
        </section>

        <section className="docs-section" id="ai-runtime-policy">
          <h2>Open-Weight &amp; Self-Hosted Runtime Standard</h2>
          <p>
            Any AI capability integrated directly into the UbuntuBio platform itself (such as
            metadata curation assistants, literature extraction, or natural-language search) must
            obey the project&apos;s open-source-only architecture:
          </p>
          <ul>
            <li>
              <strong>Open-weight models only:</strong> Serve models locally or on institutional
              hardware using open-source inference engines such as <code>vLLM</code> or{" "}
              <code>Ollama</code>. Do not introduce hard dependencies on closed commercial LLM APIs.
            </li>
            <li>
              <strong>Open observability:</strong> If prompt or workflow tracing is needed, use
              self-hosted open-source tooling (such as self-hosted <code>Langfuse</code>) rather
              than proprietary SaaS telemetry.
            </li>
            <li>
              <strong>Graceful degradation:</strong> Core repository functions (upload, validation,
              Git/LFS versioning, search, and audit verification) must remain 100% operational even
              when no LLM service is attached.
            </li>
          </ul>
        </section>

        <section className="docs-section" id="ai-scientific-integrity">
          <h2>Scientific &amp; Metadata Integrity</h2>
          <p>
            Language models can fabricate plausible-looking identifiers and citations. Contributors
            and curators must never use AI to invent or guess MIxS metadata fields, NCBI Taxon IDs,
            collection dates, geographic coordinates, sequence quality metrics, or biological
            conclusions. Any AI-assisted metadata suggestion must be verified against the original
            laboratory records and flagged for human sign-off before publication.
          </p>
        </section>
      </Tabs.Content>

      {/* TAB 5: WHAT'S NEXT & 10-YEAR COHORT PLAN */}
      <Tabs.Content value="roadmap" className="docs-tab-panel">
        <section className="docs-section" id="v2-improvements">
          <h2>What You Can Build Next (v1.1 → v2.0)</h2>
          <p>
            UbuntuBio v1.0.0 is intentionally compact so one small team can run it reliably. Here
            are the highest-leverage engineering projects waiting for the next cohort, taken directly
            from our v1.0.0 evaluation boundaries:
          </p>

          <div className="docs-table-wrap">
            <table className="docs-table">
              <thead>
                <tr>
                  <th>Target</th>
                  <th>Engineering Track</th>
                  <th>Concrete Scope</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <span className="docs-type-badge">v1.1</span>
                  </td>
                  <td>Fungal rDNA Subtraction &amp; CRAM Parsing</td>
                  <td>
                    Subtract conserved fungal 18S/28S rDNA 25-mers from{" "}
                    <code>human_kmers.txt.gz</code> (eliminating the 0.113%{" "}
                    <em>Candida albicans</em> cross-match) and add real read/header inspection for
                    CRAM streams beyond magic-byte checks.
                  </td>
                </tr>
                <tr>
                  <td>
                    <span className="docs-type-badge">v2.0</span>
                  </td>
                  <td>Sub-File Chunk Deduplication (GearHash CDC)</td>
                  <td>
                    Upgrade whole-file SHA-256 deduplication to content-defined chunking (OpenXet
                    CDC) so re-compressed or trimmed FASTQ cohorts share unchanged byte blocks.
                  </td>
                </tr>
                <tr>
                  <td>
                    <span className="docs-type-badge">v2.0</span>
                  </td>
                  <td>PostgreSQL + Valkey Multi-Writer Scale</td>
                  <td>
                    Activate PostgreSQL through the existing SQLAlchemy models and add Valkey for
                    rate-limiting and distributed locks when campus traffic outgrows single-node
                    SQLite WAL.
                  </td>
                </tr>
                <tr>
                  <td>
                    <span className="docs-type-badge">v2.0</span>
                  </td>
                  <td>Reconciliation Locks &amp; Grace Separation</td>
                  <td>
                    Add repository-level mutex locks around <code>reconcile_cas_storage</code> and
                    decouple CAS blob grace windows from <code>git prune --expire</code>.
                  </td>
                </tr>
                <tr>
                  <td>
                    <span className="docs-type-badge">v2.0</span>
                  </td>
                  <td>Ontology-Aware Search &amp; Automated Curation</td>
                  <td>
                    Pair FTS5 BM25 with medical/taxonomic synonym expansion (closing lexical gaps
                    like <em>diarrhea</em> vs. <em>gastroenteritis</em>) and expand ENA/NCBI
                    harvesters in <code>curation/</code>.
                  </td>
                </tr>
                <tr>
                  <td>
                    <span className="docs-type-badge">v2.0+</span>
                  </td>
                  <td>Multi-Institution Federation</td>
                  <td>
                    Connect independent UbuntuBio nodes across partner African research centers with
                    federated catalog search and cross-institution audit checkpoint witnessing.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="docs-section" id="ten-year-goal">
          <h2>The 10-Year Goal (2026–2036)</h2>
          <p>
            One graduating class can only push the system so far. Our ten-year target is a
            self-sustaining, federated network of African-hosted genomic repositories run by
            universities and reference laboratories across the continent, where every incoming
            bioinformatics cohort inherits production infrastructure and leaves it stronger than
            they found it.
          </p>

          <div className="handover-horizon-grid">
            <div className="charter-card">
              <span className="handover-horizon-badge">Years 1–2 (2026–2028)</span>
              <h3>Campus Production &amp; v1.1</h3>
              <p>
                Move UbuntuBio onto permanent WACCBIP campus infrastructure, close v1.1 biological
                screening gaps, onboard initial West African pathogen cohorts, and complete the
                first full cohort-to-cohort handover.
              </p>
            </div>
            <div className="charter-card">
              <span className="handover-horizon-badge">Years 3–5 (2028–2031)</span>
              <h3>Regional Federation &amp; v2.0</h3>
              <p>
                Ship GearHash chunking, PostgreSQL scaling, and federated discovery linking partner
                universities and public health reference labs with shared off-host audit anchoring.
              </p>
            </div>
            <div className="charter-card">
              <span className="handover-horizon-badge">Years 6–10 (2031–2036)</span>
              <h3>Continental Institutional Utility</h3>
              <p>
                Operate as a durable, institutionally funded pan-African genomic repository network
                governed under African custodianship and maintained by successive generations of
                African bioinformaticians.
              </p>
            </div>
          </div>
        </section>

        <section className="docs-section" id="graduating-protocol">
          <h2>Graduating Cohort Handover Rule</h2>
          <DocsCallout type="tip" title="Every Graduating Cohort Writes the Next Cohort's Tasks">
            <p>
              Before your class graduates, you must publish an updated{" "}
              <strong>Cohort Handover Brief</strong> containing live system status, credential
              transfers, unresolved bugs, and <strong>3–5 concrete starter tasks</strong> for the
              incoming class aligned to the 10-year roadmap. Never hand over an undocumented server.
            </p>
          </DocsCallout>

          <h3>Requirements &amp; Review Gate Before Website Roll Recognition</h3>
          <p>
            Consistent with Article V (Section 5.7) of the Founding Charter, incoming cohorts are
            not added to the website&apos;s public Cohort Roll automatically. Before a Pull Request
            adding a cohort&apos;s names and ORCID iDs to the website can be merged, three
            conditions must be verified:
          </p>
          <ol>
            <li>
              <strong>Completed deliverables:</strong> The cohort has shipped and merged its
              assigned backlog items (code, pipelines, curation, governance, or docs) with all
              automated tests, type checks, and sovereignty policy gates green.
            </li>
            <li>
              <strong>Verified handover state:</strong> Production backups, off-host audit
              checkpoints, and institutional accounts/secrets have been audited and transferred off
              personal accounts.
            </li>
            <li>
              <strong>Published next-cohort brief:</strong> The cohort has committed an updated
              Cohort Handover Brief with 3–5 concrete tasks for the class that follows.
            </li>
          </ol>
          <p>
            <strong>Who reviews and approves:</strong> The handover Pull Request requires{" "}
            <strong>two-party sign-off</strong> before merge: (1) technical and documentation
            approval from the <strong>outgoing cohort&apos;s designated maintainers</strong>, and
            (2) institutional approval from the{" "}
            <strong>WACCBIP faculty or institutional steward</strong> (initially{" "}
            <strong>Dr. Abiola Isawumi</strong>, or an appointed institutional custodian).
          </p>

          <DocsCodeBlock
            code={COHORT_HANDOVER_TEMPLATE}
            language="markdown"
            title="Graduating Cohort Handover &amp; Next-Cohort Task Template"
          />

          <div className="docs-next-links">
            <a href="/founding-charter" className="docs-next-card">
              <span className="docs-next-label">Governance Foundation</span>
              <span className="docs-next-title">
                Read the Founding Charter <ArrowRight size={15} />
              </span>
            </a>
            <a href="/docs" className="docs-next-card">
              <span className="docs-next-label">Platform Reference</span>
              <span className="docs-next-title">
                UbuntuBio Documentation <ArrowRight size={15} />
              </span>
            </a>
          </div>
        </section>
      </Tabs.Content>
    </Tabs.Root>
  );
}
