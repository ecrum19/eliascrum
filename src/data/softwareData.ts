export interface SoftwareDetail {
  label: string;
  value: string;
  href?: string;
}

export interface SoftwareEntry {
  id: string;
  slug?: string;
  title: string;
  type: string;
  purpose: string;
  year: string;
  summary: string;
  description: string;
  repositoryUrl?: string;
  webUrl?: string;
  details?: SoftwareDetail[];
  mainTopics: string[];
  relatedPublicationIds?: string[];
  relatedTalkSlugs?: string[];
  relatedPosterSlugs?: string[];
}

export interface SoftwareSection {
  id: string;
  title: string;
  description: string;
  entries: SoftwareEntry[];
}

// Update this array to add/edit software, tools, specifications, and companion web resources.
export const softwareSections: SoftwareSection[] = [
  {
    id: "platforms-applications",
    title: "Platforms and Applications",
    description:
      "Interactive systems and research-facing applications used to explore, manage, or demonstrate linked-data workflows.",
    entries: [
      {
        id: "solid-cockpit",
        title: "Solid Cockpit",
        type: "Web Application",
        purpose: "Interface for Solid Pod Interaction",
        year: "Ongoing",
        summary:
          "Web application for interacting with Solid Pod resources in an integrated, user-friendly interface.",
        description:
          "Solid Cockpit is an application for exploring and interacting with Solid Pod resources. Specifically, it offers functionalities to upload data, manage the privacy of data, and query connected a Solid Pod. It is relevant to the broader semantic-web and decentralized-data tooling space because it provides a user-friendly interface for interacting with decentralized data.",
        repositoryUrl: "https://github.com/KNowledgeOnWebScale/solid-cockpit",
        mainTopics: ["Solid", "Semantic Web", "Data Privacy", "Web Application", "Federated Querying"],
        relatedPublicationIds: ["solid-cockpit-eswc-2026-demo"],
        relatedTalkSlugs: ["sosy2026"],
        relatedPosterSlugs: ["eswc-2026-print"],
      },
      {
        id: "genome-sharing-paper-webpage",
        title: "Genome Sharing Paper Webpage",
        type: "Companion Website",
        purpose: "Public Data Resource",
        year: "2026",
        summary:
          "Supporting website for the genomic sequence data sharing scoping review paper, intended to make national genome initiative data easier to browse, revisit, and update in the future.",
        description:
          "This repository contains the companion website that displays national genomic initiative data. It is meant to make the review outputs easier to revisit and communicate beyond the PDF publication itself.",
        repositoryUrl: "https://github.com/ecrum19/GenomeSharingPaper_Webpage",
        mainTopics: ["Clinical Genomics", "Research Communication", "Website", "Companion Resource"],
        relatedPublicationIds: ["genome-sharing-review-2026"],
      },
      {
        id: "fed-survey-results-explorer",
        title: "Federated Query Results Explorer",
        type: "Companion Website",
        purpose: "Experimental Results Exploration",
        year: "2026",
        summary:
          "Interactive results website for exploring longitudinal federation experiments over real-world biological SPARQL endpoints.",
        description:
          "This companion website exposes the outcome summaries, query-level views, endpoint breakdowns, and complexity analyses associated with the ISWC 2026 paper on real-world SPARQL federation. It is intended to make the experimental findings easier to inspect, revisit, and communicate beyond the static paper.",
        webUrl: "https://ecrum19.github.io/fed-survey-results",
        mainTopics: ["Semantic Web", "Federated Querying", "Semantic Querying", "Research Communication"],
        relatedPublicationIds: ["real-world-federation-iswc-2026"],
      },
    ],
  },
  {
    id: "tooling-pipelines",
    title: "Tooling and Pipelines",
    description:
      "Conversion frameworks and utilities for semantic data generation.",
    entries: [
      {
        id: "vcf-rdfizer",
        title: "VCF-RDFizer",
        type: "RDF Conversion Tool",
        purpose: "RDF Data Conversion",
        year: "2026",
        summary:
          "A CLI tool for converting genomic variant data from VCF into RDF, supporting semantically interoperable downstream workflows.",
        description:
          "VCF-RDFizer converts genomic variant data into RDF using the RML mapping language and the RMLStreamer conversion engine. It utilized the VCF-RDFizer Vocabulary to represent the data semantically while offering compression options to reduce the effects of semantic inflation.",
        repositoryUrl: "https://github.com/ecrum19/VCF-RDFizer",
        mainTopics: ["Genomics", "Semantic Web", "RDF", "Data Conversion", "Knowledge Graphs"],
        relatedPublicationIds: ["genomic-variant-representation-rdf-preprint-2025", "vcf2rdf-SWAT4HCLS-2025", "vcf-to-rdf-rml-swat4hcls-2026"],
        relatedPosterSlugs: ["swat4hcls-2025", "swat4hcls-2026"],
      },
      {
        id: "ontology-companion-generator",
        title: "Ontology Companion Generator",
        type: "Ontology Documentation Tool",
        purpose: "Ontology Documentation Generation",
        year: "2026",
        summary:
          "An npm-based generator that creates GitHub Pages companions for exploring, visualizing, and documenting ontologies with configurable output.",
        description:
          "Ontology Companion Generator is a tool for automatically generating a companion website for an ontology directly from the ontology's home GitHub repository. It runs as an npm package and can produce GitHub Pages-ready outputs for ontology exploration, visualization, and documentation, while allowing extensive customization through a configuration file.",
        repositoryUrl: "https://github.com/ecrum19/ocg",
        webUrl: "https://www.npmjs.com/package/ontology-companion-generator",
        details: [
          {
            label: "Package Registry",
            value: "ontology-companion-generator on npm",
            href: "https://www.npmjs.com/package/ontology-companion-generator",
          },
        ],
        mainTopics: ["Semantic Web", "Ontology Engineering", "Documentation", "Web Application"],
      },
    ],
  },
  {
    id: "utilities",
    title: "Utilities",
    description:
      "Small practical tools for day-to-day research and communication workflows.",
    entries: [
      {
        id: "qr-code-generator",
        title: "QR Code Generator",
        type: "Utility Tool",
        purpose: "Research Communication",
        year: "2026",
        summary:
          "Lightweight generator for producing QR codes that can be reused in posters, slides, and project materials.",
        description:
          "A utility project for quickly creating QR codes for links and references in research-facing assets such as conference posters, presentation slides, and supporting documentation.",
        repositoryUrl: "https://github.com/ecrum19/qr-code-generator",
        mainTopics: ["Utilities", "Research Communication", "Web Application"],
      },
    ],
  },
  {
    id: "websites-companion-resources",
    title: "Semantic Resources",
    description:
      "Vocabulary references and publication-facing web resources for semantic technologies.",
    entries: [
      {
        id: "vcf-rdfizer-vocabulary",
        title: "VCF-RDFizer Vocabulary",
        type: "Semantic Vocabulary",
        purpose: "Semantic Vocabulary Reference",
        year: "2026",
        summary:
          "Interactive vocabulary reference for the representation of VCF as semantic linked data with browsable documentation sections.",
        description:
          "This website exposes the VCF-RDFizer vocabulary in a navigable reference format so classes, properties, and ontology structure can be inspected more easily. It acts as a documentation layer for the semantic model underlying the conversion work.",
        webUrl: "https://ecrum19.github.io/VCF-RDFizer-vocabulary/ontology-reference.html",
        mainTopics: ["Semantic Web", "Genomics", "Ontology Engineering", "Documentation"],
        relatedPublicationIds: ["genomic-variant-representation-rdf-preprint-2025", "vcf2rdf-SWAT4HCLS-2025", "vcf-to-rdf-rml-swat4hcls-2026"],
        relatedPosterSlugs: ["swat4hcls-2025", "swat4hcls-2026"],
      },
      {
        id: "vord",
        title: "Vocabulary of Restrictive Datasets (VoRD)",
        type: "Semantic Vocabulary",
        purpose: "Semantic Vocabulary Reference",
        year: "2026",
        summary:
          "Semantic vocabulary resource for documenting and exploring VoRD in a browsable, companion-style format.",
        description:
          "This repository provides the VoRD vocabulary as a semantic resource intended for exploration, visualization, and documentation. It fits the same companion-resource pattern as other ontology-facing sites in the project and supports clearer inspection of vocabulary structure and intended usage.",
        repositoryUrl: "https://github.com/ecrum19/vord",
        mainTopics: ["Semantic Web", "Ontology Engineering", "Documentation"],
      },
    ],
  },
  {
    id: "specifications-standards",
    title: "Technical Specifications and Standards",
    description:
      "Protocol-oriented specification drafts related to linked-data.",
    entries: [
      {
        id: "sparql-view-materialization-containers",
        title: "SPARQL View Materialization Containers Specification",
        type: "Technical Specification Draft",
        purpose: "Reproducible Query Execution",
        year: "Ongoing",
        summary:
          "Container-based guidelines for reproducible SPARQL query view materialization for use in SPARQL query results provenance and caching.",
        description:
          "This technical specification outlines materialization of SPARQL query records into a containerized environment so they can be easily reproduced, executed, and used as a cache for future query executions. It is infrastructure-oriented work that supports semantic data engineering and repeatable query-processing.",
        repositoryUrl: "https://github.com/ecrum19/sparql-view-materialization-containers",
        mainTopics: ["SPARQL", "Semantic Web", "View Materialization", "Data Engineering"],
      },
      {
        id: "ldp-permissions-notifications-specification",
        title: "LDP Permissions Notifications Specification",
        type: "Technical Specification Draft",
        purpose: "Standards Design",
        year: "Ongoing",
        summary:
          "Permissions and notification semantics technical specification for Linked Data Platform resources.",
        description:
          "This work establishes guidelines for linked data privacy permission handling and notification semantics for Linked Data Platform resources. It is a standard to be used by developers for use in the broader ecosystem of interoperable linked-data infrastructure design.",
        repositoryUrl: "https://github.com/ecrum19/ldp-permissions-notifications-specification",
        mainTopics: ["Linked Data", "Permissions", "Notifications", "Semantic Web"],
      },
    ],
  },
];

export const softwareProjects: SoftwareEntry[] = softwareSections.flatMap(
  (section) => section.entries,
);

function slugifySoftwareValue(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getSoftwareSlug(entry: SoftwareEntry): string {
  if (entry.slug && entry.slug.trim().length > 0) {
    return entry.slug.trim();
  }

  const normalizedId = slugifySoftwareValue(entry.id);
  if (normalizedId.length > 0) {
    return normalizedId;
  }

  return slugifySoftwareValue(entry.title);
}

export function getSoftwarePagePath(entry: SoftwareEntry): string {
  return `/software/${getSoftwareSlug(entry)}`;
}

export function getSoftwareEntryById(softwareId: string): SoftwareEntry | undefined {
  return softwareProjects.find((entry) => entry.id === softwareId);
}

export function getSoftwareEntryBySlug(softwareSlug: string): SoftwareEntry | undefined {
  return softwareProjects.find((entry) => getSoftwareSlug(entry) === softwareSlug);
}
