import React from "react";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { DocsLayout } from "../../components/docs/DocsLayout";
import { DocsCopyButton } from "../../components/docs/DocsCopyButton";
import { DocsCallout } from "../../components/docs/DocsCallout";
import { type TocItem } from "../../components/docs/DocsRightRail";

export const metadata: Metadata = {
  title: "Founding Charter — UbuntuBio",
  description:
    "Founding Cohort Charter for the African Genomic Database Initiative: intergenerational scientific contribution, data stewardship, and institutional continuity.",
};

const TOC_ITEMS: TocItem[] = [
  { id: "preamble", label: "Preamble", level: 2 },
  { id: "article-1", label: "I. Name, Identity & Scope", level: 2 },
  { id: "article-2", label: "II. Vision, Mission & Objectives", level: 2 },
  { id: "article-3", label: "III. Founding Principles", level: 2 },
  { id: "article-4", label: "IV. The Founding Cohort", level: 2 },
  { id: "article-5", label: "V. Successive Cohorts", level: 2 },
  { id: "article-6", label: "VI. Institutional Governance", level: 2 },
  { id: "article-7", label: "VII. Data Stewardship", level: 2 },
  { id: "article-8", label: "VIII. Partnerships", level: 2 },
  { id: "article-9", label: "IX. Sustainability", level: 2 },
  { id: "article-10", label: "X. Scientific Legacy", level: 2 },
  { id: "article-11", label: "XI. Adoption & Amendments", level: 2 },
  { id: "article-12", label: "XII. Founding Declaration", level: 2 },
  { id: "founding-cohort-roll", label: "Founding Cohort Roll", level: 2 },
];

interface FoundingMember {
  readonly number: number;
  readonly name: string;
  readonly orcid?: string;
}

const FOUNDING_MEMBERS: readonly FoundingMember[] = [
  { number: 1, name: "Addo Stephen Tetteh", orcid: "0009-0001-5560-5774" },
  { number: 2, name: "Richard Owusu Ansah", orcid: "0000-0002-3219-9320" },
  { number: 3, name: "Kwame Boamah Buabeng", orcid: "0009-0008-9367-224X" },
  { number: 4, name: "Kwasi Agyenkwa-Mawuli", orcid: "0009-0001-7308-1177" },
  { number: 5, name: "Daniel Baah", orcid: "0009-0003-4234-7088" },
  { number: 6, name: "Kofi Sarpong", orcid: "0009-0003-3966-500X" },
  { number: 7, name: "Anjali Rathod", orcid: "0009-0005-9184-6363" },
  { number: 8, name: "Juliet Naa Otua Hodgson", orcid: "0009-0008-8370-6477" },
  { number: 9, name: "Rachel Ama Adadziwa Akorful", orcid: "0009-0004-4810-0569" },
  { number: 10, name: "Baakwa De-graft Miah", orcid: "0009-0009-4780-6101" },
  { number: 11, name: "Adwoa Ayewa Ayimadu", orcid: "0009-0002-1793-7169" },
  { number: 12, name: "E. K. Amoako", orcid: "0009-0005-6035-9220" },
  { number: 13, name: "Samuel Mawuli Kumordzi", orcid: "0009-0009-9340-8905" },
  { number: 14, name: "Arnold Abakah", orcid: "0009-0000-4163-7612" },
  { number: 15, name: "Nana Yaw Tawiah-Yingar", orcid: "0009-0000-3141-9240" },
  { number: 16, name: "Doreen Akakpo", orcid: "0009-0001-9407-4398" },
  { number: 17, name: "Redeemer Salami Okekale", orcid: "0009-0000-2900-592X" },
  { number: 18, name: "Rexford Adade" },
];

export default function FoundingCharterPage(): React.ReactElement {
  return (
    <DocsLayout currentPath="/founding-charter" tocItems={TOC_ITEMS}>
      <div className="docs-content-body">
        <nav className="docs-breadcrumb" aria-label="Breadcrumb">
          <a href="/">UbuntuBio</a>
          <span>/</span>
          <span>Founding Charter</span>
        </nav>

        <div className="docs-header-title-row">
          <div>
            <div className="docs-badge">Charter · Version 1.0</div>
            <h1 className="docs-page-title">
              Founding Cohort Charter for the African Genomic Database
            </h1>
          </div>
          <DocsCopyButton pageTitle="Founding Cohort Charter for the African Genomic Database" />
        </div>

        <p className="docs-page-lead">
          A framework for intergenerational scientific contribution, responsible data stewardship, and
          institutional continuity across successive cohorts.
        </p>

        <div className="charter-meta-grid" aria-label="Charter Metadata">
          <div className="charter-meta-item">
            <span className="charter-meta-label">Original Conception</span>
            <span className="charter-meta-value">Dr. Abiola Isawumi</span>
          </div>
          <div className="charter-meta-item">
            <span className="charter-meta-label">Established By</span>
            <span className="charter-meta-value">
              Founding Cohort of the African Genomic Database Initiative (Class of 2026)
            </span>
          </div>
          <div className="charter-meta-item">
            <span className="charter-meta-label">Initial Platform</span>
            <span className="charter-meta-value">
              <code>UbuntuBio</code> (v1.0.0)
            </span>
          </div>
          <div className="charter-meta-item">
            <span className="charter-meta-label">Institutional Affiliation</span>
            <span className="charter-meta-value">
              West African Centre for Cell Biology of Infectious Pathogens (WACCBIP), University of
              Ghana
            </span>
          </div>
          <div className="charter-meta-item">
            <span className="charter-meta-label">Established &amp; Version</span>
            <span className="charter-meta-value">November 2026 · Version 1.0</span>
          </div>
        </div>

        {/* Preamble */}
        <section className="docs-section" id="preamble">
          <h2>Preamble</h2>
          <p>
            Africa holds immense biological and genomic diversity across its populations, pathogens,
            and ecosystems. That genetic record matters directly for public health, disease
            surveillance, antimicrobial resistance, conservation, and biological research worldwide.
          </p>
          <p>
            Sequencing capacity across the continent has grown faster than the local infrastructure
            needed to keep, organize, and govern the resulting datasets. Many African laboratories
            still deal with scattered files, tight compute budgets, inconsistent metadata habits,
            and long-term dependence on external servers outside their institutional and national
            jurisdictions.
          </p>
          <p>
            Generating sequences is only half the work. Their lasting scientific value depends on
            preserving, governing, finding, and reusing them responsibly inside systems that stay
            accountable to originating institutions and communities.
          </p>
          <p>
            Growing out of an original idea conceived by <strong>Dr. Abiola Isawumi</strong>, the
            founding cohort establishes the{" "}
            <strong>African Genomic Database Initiative</strong>, with <strong>UbuntuBio</strong> as
            its initial software and operational platform. This Charter records our intentions,
            rules, and commitments so future students, researchers, engineers, and institutional
            partners can inherit the work, improve it, and carry it past the academic tenure of its
            founders.
          </p>
        </section>

        {/* Article I */}
        <section className="docs-section" id="article-1">
          <h2>Article I: Name, Identity, and Scope</h2>

          <h3>1.1 Name</h3>
          <p>
            The effort is named the <strong>African Genomic Database Initiative</strong>.
          </p>

          <h3>1.2 Technical Platform</h3>
          <p>
            <strong>UbuntuBio</strong> serves as the initial software platform for the initiative.
            It provides an institutionally hosted repository for organizing, versioning, validating,
            searching, and sharing genomic datasets under clear access rules.
          </p>

          <h3>1.3 Scientific Scope</h3>
          <p>
            The initiative supports the management and reuse of genomic and related biological data
            across seven core areas, which may expand as regional needs change:
          </p>
          <ul>
            <li>Pathogen genomics and infectious disease surveillance.</li>
            <li>Antimicrobial resistance research.</li>
            <li>Microbial and environmental genomics.</li>
            <li>Biodiversity and conservation genomics.</li>
            <li>One Health research.</li>
            <li>Comparative and population genomics.</li>
            <li>Bioinformatics training, capacity building, and cross-institution collaboration.</li>
          </ul>

          <h3>1.4 Institutional Character</h3>
          <DocsCallout type="note" title="Institutional Authority Boundary">
            <p>
              This initiative begins as a collaborative scientific infrastructure project. Its formal
              institutional home, governance structure, and legal recognition will be developed with
              the appropriate academic and university authorities. Nothing in this Charter claims
              institutional authority, ownership, or legal status that has not been formally granted.
            </p>
          </DocsCallout>
        </section>

        {/* Article II */}
        <section className="docs-section" id="article-2">
          <h2>Article II: Vision, Mission, and Objectives</h2>

          <div className="charter-two-col">
            <div className="charter-card">
              <h3>2.1 Vision</h3>
              <p>
                An African research ecosystem where genomic data generated on the continent is
                preserved, governed, discovered, and reused locally to answer African and global
                scientific questions.
              </p>
            </div>
            <div className="charter-card">
              <h3>2.2 Mission</h3>
              <p>
                Build and maintain an accessible, secure, interoperable, and institutionally
                governed genomic data platform that grows African research capacity and supports
                responsible collaboration.
              </p>
            </div>
          </div>

          <h3>2.3 Strategic Objectives</h3>
          <ul>
            <li>
              <strong>Build durable infrastructure:</strong> Maintain reliable systems for genomic
              storage, version control, metadata validation, cataloguing, and search.
            </li>
            <li>
              <strong>Strengthen African data stewardship:</strong> Keep preservation and access
              decisions close to African research institutions under clear agreements.
            </li>
            <li>
              <strong>Advance scientific discovery:</strong> Support active work in pathogen
              surveillance, antimicrobial resistance, biodiversity, public health, and One Health.
            </li>
            <li>
              <strong>Promote reproducibility:</strong> Keep traceable provenance, versioned files,
              and reproducible analysis records.
            </li>
            <li>
              <strong>Enable fair collaboration:</strong> Give African institutions and global
              partners a clear, auditable path for sharing datasets.
            </li>
            <li>
              <strong>Develop local technical capacity:</strong> Give students, scientists, and
              engineers hands-on experience in bioinformatics infrastructure and data governance.
            </li>
            <li>
              <strong>Preserve institutional memory:</strong> Document engineering decisions,
              governance choices, and operational steps so knowledge passes cleanly between cohorts.
            </li>
          </ul>
        </section>

        {/* Article III */}
        <section className="docs-section" id="article-3">
          <h2>Article III: Founding Principles</h2>

          <h3>3.1 African Scientific Leadership</h3>
          <p>
            African researchers and institutions must shape the priorities, governance, and
            technical direction of infrastructure built for African genomic data.
          </p>

          <h3>3.2 Responsible Data Stewardship</h3>
          <p>
            Genomic datasets carry consent terms, ethical duties, and legal rules from the studies
            that produced them. Making a file technically reachable does not grant open permission
            to copy, redistribute, or reuse it.
          </p>

          <h3>3.3 Open Science with Controlled Access</h3>
          <p>
            The initiative encourages open sharing where appropriate while enforcing controlled
            access, institutional approval, and Data Use Agreements (DUAs) whenever privacy, ethics,
            or sovereignty require them.
          </p>

          <h3>3.4 Scientific Integrity and Reproducibility</h3>
          <p>
            Data uploads, metadata updates, access approvals, and derived outputs must remain
            documented and auditable.
          </p>

          <h3>3.5 Institutional Continuity Over Personal Control</h3>
          <p>
            Systems, accounts, and procedures must work independently of any single founder or
            maintainer. Institutional continuity always outranks personal control.
          </p>

          <h3>3.6 Intergenerational Responsibility</h3>
          <p>
            Every cohort inherits a working system from the previous class, protects it during its
            tenure, and prepares the next class to take over.
          </p>

          <h3>3.7 Fair Credit and Attribution</h3>
          <p>
            Data generators, students, maintainers, and partner institutions must receive proper
            credit. Hosting data on the platform never weakens the intellectual claims of the
            originating team.
          </p>

          <h3>3.8 FAIR- and CARE-Informed Practice</h3>
          <p>
            Daily stewardship draws on both FAIR and CARE frameworks. Software checks alone cannot
            satisfy CARE; meaningful compliance depends on real institutional and community
            oversight.
          </p>
          <div className="charter-two-col">
            <div className="charter-card">
              <h3>FAIR Principles</h3>
              <ul>
                <li>Findable</li>
                <li>Accessible</li>
                <li>Interoperable</li>
                <li>Reusable</li>
              </ul>
            </div>
            <div className="charter-card">
              <h3>CARE Principles</h3>
              <ul>
                <li>Collective Benefit</li>
                <li>Authority to Control</li>
                <li>Responsibility</li>
                <li>Ethics</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Article IV */}
        <section className="docs-section" id="article-4">
          <h2>Article IV: The Founding Cohort</h2>

          <h3>4.1 Recognition</h3>
          <p>
            Everyone who helped establish the initiative and its initial platform is recognized as
            part of the founding cohort, whether their contribution was conceptual, software
            engineering, bioinformatics, data governance, documentation, or coordination.
          </p>

          <h3>4.2 Founding Responsibilities</h3>
          <ul>
            <li>Record the motivation, vision, and goals of the initiative.</li>
            <li>Build and document the initial UbuntuBio platform.</li>
            <li>Establish baseline metadata validation and access-governance practices.</li>
            <li>Write reproducible deployment, backup, and maintenance procedures.</li>
            <li>Document known limitations, open bugs, and next-step priorities candidly.</li>
            <li>Prepare the codebase and operational records for transfer to incoming cohorts.</li>
          </ul>

          <h3>4.3 Limits of Founding Credit</h3>
          <p>
            Founding contributors will be credited in institutional records, publications, and
            project documentation. Founding status never grants permanent exclusive control over the
            platform or its future roadmap.
          </p>

          <h3>4.4 The Founding Record</h3>
          <p>
            A permanent founding record will list each contributor&apos;s name, role, institutional
            affiliation at establishment, the date of establishment, and any formal institutional
            endorsements.
          </p>
        </section>

        {/* Article V */}
        <section className="docs-section" id="article-5">
          <h2>Article V: Responsibilities of Successive Cohorts</h2>
          <p>
            The initiative must never rely on the continued presence of its founders. Each incoming
            cohort takes over responsibility for running, improving, and handing off the system.
          </p>

          <h3>5.1 Inheritance and Onboarding</h3>
          <p>
            Incoming cohorts must receive full access to source code, architecture guides,
            deployment configs, operational logs, and governance records needed to run the platform.
          </p>

          <h3>5.2 Continuous Improvement</h3>
          <p>
            Each cohort is expected to leave the platform stronger through software updates,
            bioinformatics pipelines, dataset curation, clearer documentation, publications,
            training, or new regional partnerships.
          </p>

          <h3>5.3 No Undocumented Dependencies</h3>
          <p>
            Significant technical and policy changes must be written down. Contributors should never
            tie critical services, domains, or credentials to personal accounts or undocumented
            workarounds.
          </p>

          <h3>5.4 Active Knowledge Transfer</h3>
          <p>
            Outgoing cohorts must run live walkthroughs, review documentation with incoming
            maintainers, and flag unresolved technical or governance issues before stepping back.
          </p>

          <h3>5.5 Mandatory Handover Record</h3>
          <DocsCallout type="tip" title="Required Before Every Cohort Transition">
            <p>
              Before graduating or rotating off, each cohort must leave a written handover record
              covering: completed work, live system status, open technical and scientific issues,
              hosting dependencies, known risks, accounts or keys requiring transfer, and a clear
              list of starter priorities for the next cohort.
            </p>
          </DocsCallout>

          <h3>5.6 Duty to Successors</h3>
          <p>
            Leave the repository and server in a state where the next class can understand, deploy,
            and improve it without guessing why past decisions were made.
          </p>

          <h3>5.7 Cohort Review &amp; Website Recognition Gate</h3>
          <p>
            Successive cohorts are added to the public Cohort Roll on the UbuntuBio website only
            after verified contribution and handover — never automatically by enrollment alone.
            Before a cohort&apos;s names and ORCID iDs are published on the website, the cohort
            must:
          </p>
          <ol>
            <li>
              <strong>Ship verified work:</strong> Complete and merge their assigned deliverables
              from the active handover backlog (software features, pipelines, dataset curation,
              security fixes, governance updates, or documentation) with all automated tests and
              sovereignty policy checks passing.
            </li>
            <li>
              <strong>Confirm operational health:</strong> Verify backups, off-host audit
              checkpoints, and institutional credential custody so nothing is tied to personal
              accounts.
            </li>
            <li>
              <strong>Deliver the next handover brief:</strong> Publish an updated Cohort Handover
              Brief and 3–5 scoped starter tasks for the class that follows them.
            </li>
          </ol>
          <p>
            <strong>Review authority:</strong> Every cohort&apos;s deliverables and handover brief
            must be reviewed and jointly approved by (1) the{" "}
            <strong>outgoing cohort&apos;s designated maintainers</strong> (technical and
            documentation sign-off via Pull Request) and (2) the{" "}
            <strong>WACCBIP faculty or institutional steward</strong> (initially{" "}
            <strong>Dr. Abiola Isawumi</strong>, or an appointed institutional custodian). Only
            after both approvals are recorded may the Pull Request adding the cohort&apos;s names
            to the website be merged.
          </p>
        </section>

        {/* Article VI */}
        <section className="docs-section" id="article-6">
          <h2>Article VI: Institutional Governance and Custodianship</h2>

          <h3>6.1 Institutional Custodianship</h3>
          <p>
            The initiative should operate under a formal custodianship arrangement developed with{" "}
            <strong>WACCBIP</strong> and the appropriate <strong>University of Ghana</strong>{" "}
            authorities, defining clear institutional accountability and infrastructure support.
          </p>

          <h3>6.2–6.5 Stewardship Roles</h3>
          <ul>
            <li>
              <strong>Academic oversight:</strong> Guides scientific priorities, research integrity,
              ethical data use, partnerships, and long-term alignment with institutional goals.
            </li>
            <li>
              <strong>Technical stewardship:</strong> Maintains source code, security patches,
              automated tests, releases, server monitoring, documentation, and technical handovers.
            </li>
            <li>
              <strong>Scientific stewardship:</strong> Reviews dataset quality, metadata standards,
              and biological validation rules.
            </li>
            <li>
              <strong>Administrative stewardship:</strong> Oversees institutional accounts, domains,
              DUAs, and formal access authorizations.
            </li>
          </ul>

          <h3>6.6 Decision-Making and 6.7 Dispute Resolution</h3>
          <p>
            Major changes to mission, governance, partnerships, or access policies require
            documented consultation under the adopted institutional governance framework. Concerns
            over credit, access, data stewardship, or conduct must be handled transparently under
            applicable institutional policies.
          </p>
        </section>

        {/* Article VII */}
        <section className="docs-section" id="article-7">
          <h2>Article VII: Data Stewardship and Responsible Use</h2>

          <h3>7.1–7.2 Ownership and Custodianship</h3>
          <p>
            Genomic datasets carry public health, social, and legal implications. Hosting a dataset
            on UbuntuBio never transfers ownership of that data to the initiative. Ownership and
            access rights remain governed by applicable law, institutional policy, and signed
            research or Data Use Agreements.
          </p>

          <h3>7.3 Required Submission Context</h3>
          <p>Contributors should document:</p>
          <ul>
            <li>Dataset provenance, organism identity, and sample metadata.</li>
            <li>Originating institution and relevant ethics approvals or exemptions.</li>
            <li>Consent boundaries, access tier (public, gated, or private), and reuse limits.</li>
            <li>Publication and attribution requirements.</li>
          </ul>

          <h3>7.4–7.7 Human Privacy, Pathogens, and Compliance</h3>
          <DocsCallout type="warning" title="Human Genomic Data Safeguards">
            <p>
              Human genomic data carries re-identification and privacy risks. Any future acceptance
              of human genomic datasets requires explicit consent verification, ethics approval, and
              strict controlled-access safeguards. Under UbuntuBio v1.0.0, human organism
              submissions (NCBI Taxon ID <code>9606</code>) remain prohibited while clinical
              pathogen isolates from human hosts are supported with host-marker screening.
            </p>
          </DocsCallout>
          <p>
            Pathogen and biodiversity data should be shared responsibly with respect for public
            health needs, national regulations, institutional policies, and international
            agreements.
          </p>
        </section>

        {/* Article VIII */}
        <section className="docs-section" id="article-8">
          <h2>Article VIII: Partnerships and Collaboration</h2>
          <p>
            The initiative welcomes collaboration with African universities, reference laboratories,
            public health agencies, scientific networks, and international partners. Priority goes
            to partnerships among African institutions that build regional capacity and cut down on
            fragmented datasets.
          </p>
          <p>
            External or international partners who provide funding, compute, training, or technical
            support will be credited transparently in project records. Financial or technical
            support never grants ownership or unilateral authority over hosted data or governance.
          </p>
          <p>
            Every partnership must uphold mutual benefit, transparency, scientific integrity, fair
            attribution, compliance with data-use terms, and long-term local capacity building.
          </p>
        </section>

        {/* Article IX */}
        <section className="docs-section" id="article-9">
          <h2>Article IX: Sustainability and Continuity</h2>
          <ul>
            <li>
              <strong>Technical sustainability:</strong> Use open, documented, reproducible tools.
              Keep servers, domains, and code repositories under institutional control rather than
              personal accounts.
            </li>
            <li>
              <strong>Financial sustainability:</strong> Pursue institutional budgets, research
              grants, and infrastructure partnerships that protect scientific independence.
            </li>
            <li>
              <strong>Institutional sustainability:</strong> Establish formal university and center
              support for hosting, administration, and cohort succession.
            </li>
            <li>
              <strong>Knowledge preservation &amp; review:</strong> Store key engineering and
              governance records in institutional repositories, and review this Charter periodically
              as the initiative matures.
            </li>
          </ul>
        </section>

        {/* Article X */}
        <section className="docs-section" id="article-10">
          <h2>Article X: Scientific Legacy and Recognition</h2>
          <p>
            The project will preserve a clear historical record of its founding motivations,
            contributors, milestones, and major architectural decisions. Contributors will receive
            academic credit—authorship, acknowledgements, or maintainer records—proportional to
            their work.
          </p>
          <p>
            Software and documentation follow their assigned open-source licenses and institutional
            intellectual property policies while respecting third-party licenses. The measure of this
            initiative is not what one class ships in a single year, but the scientific value it
            keeps delivering across future cohorts.
          </p>
        </section>

        {/* Article XI */}
        <section className="docs-section" id="article-11">
          <h2>Article XI: Charter Adoption, Review, and Amendment</h2>
          <p>
            This Charter takes effect upon adoption by the founding cohort, subject to institutional
            review or endorsement where formal institutional custodianship is sought.
          </p>
          <p>
            Amendments must be proposed in writing and reviewed through an agreed consultation
            process. Changes affecting institutional duties, data governance, or formal authority
            require institutional approval. No amendment may erase the historical record of the
            founding cohort or earlier generations of contributors.
          </p>
        </section>

        {/* Article XII */}
        <section className="docs-section" id="article-12">
          <h2>Article XII: Founding Declaration</h2>
          <div className="charter-declaration">
            <p>
              We, the founding contributors to the African Genomic Database Initiative, commit to
              building scientific infrastructure that serves future researchers, institutions, and
              communities long after our own tenure ends.
            </p>
            <p>
              Code alone does not keep scientific infrastructure alive. It lasts through steady
              stewardship, clear accountability, honest documentation, open collaboration, and the
              willingness of each new cohort to care for work it did not start.
            </p>
            <p>
              We adopt this Charter to record our shared commitments: to build carefully, document
              faithfully, collaborate openly, and hand over our work deliberately.
            </p>
            <p className="charter-closing-oath">
              We build what we may not finish. We preserve what we inherit. We improve what we
              build. And we pass it on.
            </p>
          </div>
        </section>

        {/* Founding Cohort Roll */}
        <section className="docs-section" id="founding-cohort-roll">
          <h2>Founding Cohort Roll (Class of 2026)</h2>
          <p>
            The original concept for an African-led, institutionally governed genomic database was
            initiated by <strong>Dr. Abiola Isawumi</strong>. The founding cohort members listed
            below (Class of 2026) established the African Genomic Database Initiative and built the
            initial UbuntuBio platform at WACCBIP, University of Ghana.
          </p>

          <div className="docs-table-wrap">
            <table className="docs-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Founding Member</th>
                  <th>ORCID iD</th>
                </tr>
              </thead>
              <tbody>
                {FOUNDING_MEMBERS.map((member) => (
                  <tr key={member.number}>
                    <td>{member.number}</td>
                    <td>{member.name}</td>
                    <td>
                      {member.orcid ? (
                        <a
                          href={`https://orcid.org/${member.orcid}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <code>{member.orcid}</code>
                        </a>
                      ) : (
                        <span>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <DocsCallout type="note" title="Adding Successive Cohorts (Class of 2027 Onward)">
            <p>
              Future cohorts are appended below this founding roll after completing their assigned
              handover deliverables, publishing the next cohort&apos;s task brief, and receiving
              joint approval from the outgoing cohort&apos;s maintainers and the WACCBIP faculty or
              institutional steward (Article V, Section 5.7).
            </p>
          </DocsCallout>

          <div className="docs-next-links">
            <a href="/technical-handover" className="docs-next-card">
              <span className="docs-next-label">Next Guide</span>
              <span className="docs-next-title">
                Technical Handover &amp; Self-Hosting <ArrowRight size={15} />
              </span>
            </a>
            <a href="/docs/governance" className="docs-next-card">
              <span className="docs-next-label">Related Policy</span>
              <span className="docs-next-title">
                AU Sovereignty &amp; Governance <ArrowRight size={15} />
              </span>
            </a>
          </div>
        </section>
      </div>
    </DocsLayout>
  );
}
