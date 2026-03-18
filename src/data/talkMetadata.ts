export const VENUE_TAG_OPTIONS = [
  "Conference",
  "Symposium",
  "Internal Meeting",
  "Non-Academic Event",
] as const;

export const TOPIC_TAG_OPTIONS = [
  "Semantic Web",
  "Bioinformatics",
  "Genomics",
  "Data Science",
] as const;

export const AUDIENCE_SIZE_TAG_OPTIONS = [
  "Small",
  "Medium",
  "Large",
] as const;

export const AUDIENCE_GROUP_TAG_OPTIONS = [
  "Bioinformaticians",
  "Computer Scientists",
  "Clinical Researchers",
  "Semantic Web Researchers",
  "Corporate Representatives",
  "Funding Reviewers",
  "Students / Trainees",
  "Interdisciplinary Researchers",
] as const;

export type VenueTag = (typeof VENUE_TAG_OPTIONS)[number] | string;
export type TopicTag = (typeof TOPIC_TAG_OPTIONS)[number] | string;
export type AudienceSizeTag = (typeof AUDIENCE_SIZE_TAG_OPTIONS)[number];
export type AudienceGroupTag = (typeof AUDIENCE_GROUP_TAG_OPTIONS)[number] | string;

export interface TalkMetadata {
  // Optional display overrides.
  title?: string;
  dateIso?: string; // YYYY-MM-DD
  dateLabel?: string; // Optional display label, e.g. "April 2025"

  // Required content used in the list/detail UIs and homepage update aggregation.
  summary: string;
  abstract: string;
  goal: string;
  audienceExpertise: string;
  audienceGroups: AudienceGroupTag[];
  durationMinutes?: number;
  audienceSizeApprox?: number;
  venueTags: VenueTag[];
  topicTags: TopicTag[];
}

// Edit this object to quickly update talk titles, dates, summaries, and detail metadata.
// Keys must match talk "slug" values in src/data/talksData.ts.
export const talkMetadataBySlug: Record<string, TalkMetadata> = {
  "sphn-pengquin-talk": {
    title: "Swiss Public Health Network (SPHN)",
    dateIso: "2025-04-29",
    summary:
      "Introduced the PENGQUIN approach for privacy-aware clinical genomics integration using RDF and decentralized data pods.",
    abstract:
      "This talk presented an architectural approach for representing and querying patient-level genomic information across distributed systems while preserving privacy constraints. I outlined how RDF modeling choices, policy-aware access patterns, and federated querying can be combined in practical workflows relevant to translational medicine. The session also discussed trade-offs between interoperability, query performance, and governance requirements in public-health contexts.",
    goal:
      "Demonstrate how semantic modeling plus decentralized infrastructure can support interoperable and privacy-aware genomic data sharing.",
    audienceExpertise:
      "Public health informatics researchers, biomedical data integration specialists, and semantic web practitioners.",
    audienceGroups: ["Clinical Researchers", "Bioinformaticians", "Computer Scientists"],
    durationMinutes: 45,
    audienceSizeApprox: 10,
    venueTags: ["Research Stay Presentation"],
    topicTags: ["Clinical Genomics", "Data Science", "Semantic Web", "Data Privacy"],
  },
  "sib-vital-it-talk": {
    title: "SIB Vital-IT",
    dateIso: "2025-04-04",
    summary:
      "Reviewed client-side federated SPARQL strategies for combining private Solid pod data with public knowledge graphs.",
    abstract:
      "The presentation examined practical query federation patterns for bioinformatics workflows that combine protected, patient-centric data with public linked data sources. I compared source-selection behavior, execution trade-offs, and endpoint characteristics observed in prototype evaluations. The discussion focused on where decentralized querying currently works well and where optimization work is still needed for production-scale workloads.",
    goal:
      "Evaluate realistic federation strategies for combining Solid data and public RDF endpoints in genomics-adjacent analyses.",
    audienceExpertise:
      "Bioinformatics infrastructure engineers, computational biologists, and semantic data platform developers.",
    audienceGroups: ["Bioinformaticians", "Computer Scientists", "Semantic Web Researchers"],
    durationMinutes: 45,
    audienceSizeApprox: 30,
    venueTags: ["Internal Meeting"],
    topicTags: ["Data Science", "Genomics", "Semantic Web"],
  },
  "dph-day-talk": {
    title: "Digital Precision Health Day",
    dateIso: "2025-10-10",
    summary:
      "Presented progress on decentralized clinical-genomics workflows and interoperability priorities in precision health.",
    abstract:
      "This talk summarized ongoing research toward robust data interoperability for precision health applications using semantic web technologies. I highlighted progress across data representation, policy-aware sharing, and cross-source query workflows, with emphasis on clinical utility. The session connected technical decisions to broader implementation constraints in multidisciplinary healthcare environments.",
    goal:
      "Communicate practical progress and roadmap priorities for applying semantic technologies in digital precision health settings.",
    audienceExpertise:
      "Precision health researchers, clinicians collaborating with data teams, and applied data scientists.",
    audienceGroups: ["Clinical Researchers", "Computer Scientists"],
    durationMinutes: 20,
    audienceSizeApprox: 30,
    venueTags: ["Internal Meeting"],
    topicTags: ["Clinical Genomics", "Semantic Web", "Data Science"],
  },
  "fwo-interview": {
    title: "FWO Interview",
    dateIso: "2024-09-05",
    summary:
      "Funding interview pitch describing the PENGQUIN PhD vision, feasibility, and expected impact.",
    abstract:
      "In this interview presentation, I introduced the research motivation, technical novelty, and staged execution plan for the PENGQUIN project. The talk emphasized risk management, measurable milestones, and expected contributions to privacy-aware genomic data interoperability. I also framed the anticipated scientific and translational impact for both semantic-web and health-data communities.",
    goal:
      "Convince the funding panel of the scientific relevance, technical feasibility, and societal value of the proposed PhD project.",
    audienceExpertise:
      "12-member interdisciplinary research-funding jury from academia and industry with backgrounds in data science, biomedicine, and policy-maker backgrounds.",
    audienceGroups: ["Funding Reviewers", "Interdisciplinary Researchers"],
    durationMinutes: 10,
    audienceSizeApprox: 20,
    venueTags: ["Fellowship Interview"],
    topicTags: ["Clinical Genomics", "Semantic Web", "Semantic Querying", "Data Privacy"],
  },
  "isws-group-project-presentation": {
    title: "International Semantic Web Summer School (ISWS) 2024: Group Project",
    dateIso: "2024-06-15",
    summary:
      "Final group project presentation from ISWS 2024 highlighting design choices and implementation outcomes.",
    abstract:
      "This project presentation described a collaborative semantic-web prototype developed during ISWS 2024. We documented the problem framing, data-model choices, and implementation architecture, then reflected on evaluation outcomes and limitations. The talk emphasized team-based design trade-offs and lessons that transfer to larger linked-data projects.",
    goal:
      "Summarize project outcomes and demonstrate the reasoning behind key technical choices made during the summer school project.",
    audienceExpertise:
      "Semantic web students, early-stage researchers, and instructors with mixed theoretical and applied semantic web backgrounds.",
    audienceGroups: ["Students / Trainees", "Computer Scientists", "Semantic Web Researchers"],
    durationMinutes: 15,
    audienceSizeApprox: 60,
    venueTags: ["Summer School"],
    topicTags: ["Semantic Web", "Data Science", "Knowledge Representation"],
  },
  "eswc-phdsymp-pangquin": {
    title: "ESWC - PhD Symposium",
    dateIso: "2024-05-28",
    summary:
      "PhD symposium talk on the PENGQUIN research agenda for decentralized and policy-aware genomic data use.",
    abstract:
      "This PhD symposium presentation outlined the end-to-end PENGQUIN research framework, from RDF representation of genomic data to policy-constrained decentralized querying. I detailed the central research questions, methodological plan, and validation strategy across realistic data-sharing scenarios. Feedback from the symposium was incorporated into subsequent prioritization of federation, policy modeling, and interoperability tasks.",
    goal:
      "Present and validate my PhD research roadmap for the semantic web research community.",
    audienceExpertise:
      "Semantic web researchers, PhD supervisors, and conference participants focused on the semantic web.",
    audienceGroups: ["Semantic Web Researchers", "Computer Scientists"],
    durationMinutes: 15,
    audienceSizeApprox: 50,
    venueTags: ["Conference"],
    topicTags: ["Semantic Web", "Clinical Genomics", "Data Privacy", "Semantic Querying"],
  },
  "solidsymp-genomepods": {
    title: "Solid Symposium",
    dateIso: "2024-04-02",
    summary:
      "Explored how Solid pods can host and govern personal genomic data for privacy-preserving analytics.",
    abstract:
      "The talk introduced a Solid-based approach for storing and sharing personal genomic data with stronger user control over access and policy constraints. I showed how this approach can interoperate with linked-data standards to support fine-grained querying and selective disclosure. The session also covered practical barriers to adoption, including policy complexity and execution-performance considerations.",
    goal:
      "Show that Solid-compatible data pods can provide a practical foundation for controlled genomic data access workflows.",
    audienceExpertise:
      "Solid ecosystem contributors, web standards practitioners, and researchers in decentralized data systems.",
    audienceGroups: ["Semantic Web Researchers", "Computer Scientists", "Industry Representatives"],
    durationMinutes: 15,
    audienceSizeApprox: 90,
    venueTags: ["Symposium"],
    topicTags: ["Semantic Web", "Solid", "Personalized Medicine"],
  },
  "18m-vito-internal-jury": {
    title: "18-Month Internal VITO PhD Jury",
    dateIso: "2025-11-20",
    summary:
      "Internal PhD milestone review covering completed work, validation status, and the next research phase.",
    abstract:
      "This internal jury talk presented a structured review of progress against the first 18 months of the PhD trajectory. I summarized technical deliverables, empirical observations, and unresolved methodological risks across modeling, querying, and integration work packages. The presentation concluded with a revised execution plan for the next phase based on committee feedback and project constraints.",
    goal:
      "Provide a rigorous progress assessment and align the next-phase plan with internal supervision priorities.",
    audienceExpertise:
      "Internal PhD jury members and supervisors with expertise in data science, semantic technologies, and digital health.",
    audienceGroups: ["Clinical Researchers"],
    durationMinutes: 10,
    audienceSizeApprox: 4,
    venueTags: ["Internal Meeting"],
    topicTags: ["Data Science", "Clinical Genomics"],
  },
  "sib-researchstay-reflection": {
    title: "SIB Research Stay Reflection",
    dateIso: "2025-05-15",
    summary:
      "Reflected on outcomes from the SIB research stay, including technical gains and collaboration opportunities.",
    abstract:
      "This reflection talk synthesized the primary outcomes of a focused research stay, including prototype results, methodological lessons, and areas for follow-up collaboration. I discussed what approaches translated well into practice and what bottlenecks remained when integrating decentralized data and federation tooling. The presentation also mapped concrete next steps into the broader PhD research timeline.",
    goal:
      "Translate research-stay outcomes into actionable follow-up work and shared priorities with host collaborators.",
    audienceExpertise:
      "UGent ID-Lab researchers and colleagues.",
    audienceGroups: ["Semantic Web Researchers", "Computer Scientists"],
    durationMinutes: 30,
    audienceSizeApprox: 20,
    venueTags: ["Internal Meeting"],
    topicTags: ["Semantic Web", "Data Science", "Knowledge Respresentation"],
  },
  "solid-intro-triple-consortium": {
    title: "TRIPLE Consortium: Intro to Solid",
    dateIso: "2024-10-10",
    summary:
      "Introductory consortium session on Solid concepts, architecture, and relevance to TRIPLE project goals.",
    abstract:
      "This consortium talk provided an implementation-oriented introduction to Solid, with focus on identity, access control, and decentralized data interoperability. I connected Solid primitives to TRIPLE project objectives around federation and reusable data infrastructures. The session included concrete examples of how Solid-based resources can integrate with existing RDF and SPARQL workflows.",
    goal:
      "Build shared understanding of Solid fundamentals and position them within consortium-level technical planning.",
    audienceExpertise:
      "Consortium researchers and developers spanning semantic web, bioinformatics, and database engineering.",
    audienceGroups: ["Computer Scientists", "Biologists"],
    durationMinutes: 20,
    audienceSizeApprox: 12,
    venueTags: ["Consortium Meeting"],
    topicTags: ["Semantic Web", "Data Science"],
  },
  "swissprot-talk": {
    title: "SIB / SwissProt",
    dateIso: "2025-03-25",
    summary:
      "Presented semantic integration opportunities between curated protein resources and decentralized query workflows.",
    abstract:
      "This presentation examined how curated protein knowledge resources can be linked more effectively with distributed semantic data workflows. I discussed interoperability opportunities at the schema, identifier, and query orchestration levels, along with caveats around curation assumptions and endpoint behavior. The talk emphasized practical pathways for incremental integration rather than disruptive platform changes.",
    goal:
      "Identify realistic integration points between curated bioinformatics resources and decentralized semantic querying approaches.",
    audienceExpertise:
      "Bioinformatics database curators, SPARQL endpoint knowledge graph maintainers, and biological knowledge representation researchers.",
    audienceGroups: ["Bioinformaticians", "Semantic Web Researchers"],
    durationMinutes: 45,
    audienceSizeApprox: 25,
    venueTags: ["Research Stay Presentation"],
    topicTags: ["Bioinformatics", "Semantic Web", "Genomics"],
  },
  "ugent-genomics-talk": {
    title: "KNoWS: An Intro to Genomics for Computer Scientists",
    dateIso: "2024-03-04",
    summary:
      "Foundational genomics overview tailored to computer science researchers entering health-data domains.",
    abstract:
      "This talk introduced genomics concepts most relevant to computational audiences, including sequencing outputs, variant interpretation, and common data structures used in analysis pipelines. I mapped these foundations to challenges in representation, interoperability, and reproducibility that are central to modern data engineering. The session served as a bridge from domain fundamentals to semantic and decentralized research directions.",
    goal:
      "Provide a domain foundation that enables computer scientists to contribute effectively to genomics data problems.",
    audienceExpertise:
      "Semantic web / computer science colleagues and researchers with limited prior exposure to biology and/or genomics.",
    audienceGroups: ["Computer Scientists", "Semantic Web Researchers"],
    durationMinutes: 60,
    audienceSizeApprox: 20,
    venueTags: ["Internal Meeting"],
    topicTags: ["Genomics", "Clinical Genomics", "Knowledge Representation"],
  },
  "e-i-xchange24-poster-edc": {
    title: "PENGQUIN: Personal Genome Query in Healthcare and Clinical Practice",
    dateIso: "2024-10-05",
    summary:
      "Poster overview of the PENGQUIN research direction, focusing on privacy-aware storage, RDF representation, and distributed querying for personal genomic data.",
    abstract:
      "This poster frames the core PENGQUIN research challenge around making personal genomic data more interoperable and usable without giving up privacy protections. It highlights engineering work on storing genomic data in Solid pods, managing access and privacy constraints, representing variant data as RDF, linking genomic and health information, and supporting both single-pod and multi-pod querying workflows. The poster positions these tasks as a practical semantic-web response to current barriers in clinical genomics data use.",
    goal:
      "Introduce the broader PENGQUIN research agenda and show how semantic-web technologies can support privacy-aware genomic data management and querying.",
    audienceExpertise:
      "Interdisciplinary attendees interested in applied data sharing, privacy-aware web technologies, and translational genomics.",
    audienceGroups: ["Interdisciplinary Researchers", "Corporate Representatives", "Computer Scientists"],
    venueTags: ["Non-Academic Event", "E(I)Xchange"],
    topicTags: ["Semantic Web", "Genomics", "Bioinformatics", "Data Privacy"],
  },
  "edc-poster-isws2024-award-winner": {
    title: "PENGQUIN: Personal Genome Query in Healthcare and Clinical Practice",
    dateIso: "2024-06-15",
    summary:
      "Award-winning poster introducing the PENGQUIN research problem space around personal genomic data storage, privacy, semantic representation, and distributed querying.",
    abstract:
      "This poster presents the motivating research questions behind PENGQUIN, centered on using semantic-web technologies to support genomic data use in healthcare and clinical practice. It identifies major technical challenges such as governance, privacy granularity, data formatting, RDF conversion, data linkage, and scalable querying. The poster also outlines the engineering work needed to store genomic data in Solid pods, manage privacy-aware access, represent variant data in RDF, and support querying across one or many patient-controlled data pods.",
    goal:
      "Communicate the PENGQUIN research vision clearly to a semantic-web training audience and motivate the main technical work packages.",
    audienceExpertise:
      "Semantic-web students, trainees, and researchers with interest in applying linked-data methods to sensitive biomedical data.",
    audienceGroups: ["Students / Trainees", "Semantic Web Researchers", "Computer Scientists"],
    venueTags: ["Symposium", "ISWS"],
    topicTags: ["Semantic Web", "Genomics", "Bioinformatics", "Data Privacy"],
  },
  "eswc-24-poster-edc": {
    title: "PENGQUIN: Personal Genome Query in Healthcare and Clinical Practice",
    dateIso: "2024-05-28",
    summary:
      "Conference poster summarizing the PENGQUIN approach for privacy-aware genomic data storage, RDF conversion, and patient-centric query workflows.",
    abstract:
      "This ESWC poster presents PENGQUIN as a patient-centric semantic-web approach to handling personal genomic data in healthcare settings. It highlights challenges in governance, privacy granularity, data formatting, RDF conversion, data linkage, and querying performance, then sketches a solution space built around Solid pods, RDF representations, and link-traversal querying. The poster also introduces a patient-centric storage model that connects genomic data, health data, and controlled access pathways across distributed resources.",
    goal:
      "Summarize the PENGQUIN PhD direction for the semantic-web research community and position its main technical challenges and solution strategy.",
    audienceExpertise:
      "Semantic-web researchers and technically oriented conference attendees familiar with linked-data, web architecture, and knowledge graph methods.",
    audienceGroups: ["Semantic Web Researchers", "Computer Scientists", "Interdisciplinary Researchers"],
    venueTags: ["Conference", "ESWC"],
    topicTags: ["Semantic Web", "Genomics", "Bioinformatics", "Data Privacy"],
  },
  "swat4hcls-2025": {
    title: "Semantifying Genomic Variant Data: VCF to RDF Conversion Framework",
    dateIso: "2025-02-24",
    summary:
      "Poster presenting a framework for semantically converting VCF genomic variant data into RDF using a dedicated ontology, HDT-based storage, and reusable mapping specifications.",
    abstract:
      "This poster argues that VCF files remain difficult to integrate, query, and interpret semantically in their native form, then presents a conversion framework based on RDF to address those limitations. It introduces a VCF-focused ontology, an HDT-backed storage strategy, and the use of the RDF Mapping Language (RML) to express a reusable conversion pipeline that is not locked into a single hard-coded script. The poster also positions the work relative to existing VCF-to-RDF approaches and emphasizes future directions around ontology publication and pharmacogenomic data linkage.",
    goal:
      "Show that a richer semantic representation of VCF data can improve interoperability, data linking, and downstream genomic data use.",
    audienceExpertise:
      "Semantic-web researchers, bioinformaticians, and genomics data practitioners interested in semantically interoperable variant data.",
    audienceGroups: ["Bioinformaticians", "Semantic Web Researchers", "Interdisciplinary Researchers"],
    venueTags: ["Conference", "SWAT4HCLS"],
    topicTags: ["Semantic Web", "Bioinformatics", "Genomics", "Knowledge Representation"],
  },
  "swat4hcls-24-poster-edc": {
    title: "Personalized Medicine Through Personal Data Pods",
    dateIso: "2024-02-26",
    summary:
      "Poster describing how patient-controlled data pods could improve privacy, transparency, and data sharing for genomic medicine workflows.",
    abstract:
      "This poster examines how personal data pods could support more scalable and privacy-aware personalized medicine workflows. It motivates the need for a patient-centric approach by pointing to data duplication, poor transparency, limited sharing, and fragmented control in current institution-centric systems. The poster then frames the main research and engineering challenges around governance, consent, privacy granularity, data linkage, and querying performance, while presenting a unified framework for giving patients more direct control over sensitive genome data.",
    goal:
      "Present a patient-centric storage and access model for genomic medicine and clarify the key technical barriers to making it practical.",
    audienceExpertise:
      "Life-science and semantic-web researchers interested in privacy, interoperability, and data infrastructure for personalized medicine.",
    audienceGroups: ["Bioinformaticians", "Semantic Web Researchers", "Interdisciplinary Researchers"],
    venueTags: ["Conference", "SWAT4HCLS"],
    topicTags: ["Semantic Web", "Genomics", "Bioinformatics", "Personalized Medicine"],
  },
  "swat4hcls-2026": {
    title: "SWAT4HCLS 2026 Poster: From VCF to RDF",
    dateIso: "2026-03-24",
    summary:
      "Poster presenting an RML-based method for converting full VCF variant files into RDF with stronger structure, provenance, interoperability, and privacy-aware semantics.",
    abstract:
      "This poster introduces an RML-based approach for representing Variant Call Format (VCF) data in RDF in a way that preserves both the structural richness of VCF and compatibility with established semantic technologies. It frames the main challenges of VCF conversion around structural irregularity, weak semantics, limited interoperability, and constrained access-control patterns, then positions an RDF-based representation as a response. The proposed approach emphasizes complete file representation, explicit provenance and structure at header, record, and call levels, and ontology alignment with established genomic vocabularies such as SO, FALDO, and GENO. It also highlights the role of RML and RMLStreamer in expressing reusable declarative mappings that can scale to larger datasets.",
    goal:
      "Demonstrate that VCF-to-RDF conversion using declarative RML mappings is feasible and useful for interoperable, machine-actionable genomic variant data workflows.",
    audienceExpertise:
      "Semantic web researchers, bioinformaticians, and life-science data practitioners interested in genomic data interoperability and FAIR representation.",
    audienceGroups: ["Bioinformaticians", "Semantic Web Researchers", "Interdisciplinary Researchers"],
    durationMinutes: 8,
    audienceSizeApprox: 70,
    venueTags: ["Conference", "SWAT4HCLS"],
    topicTags: ["Semantic Web", "Bioinformatics", "Genomics", "Knowledge Representation"],
  },
};
