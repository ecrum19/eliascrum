import { type TopicTag, type VenueTag } from "./talkMetadata";

export const PUBLICATION_TYPE_TAG_OPTIONS = [
  "Conference Paper",
  "Journal Article",
  "Preprint",
  "Thesis",
] as const;

export type PublicationTypeTag = (typeof PUBLICATION_TYPE_TAG_OPTIONS)[number] | string;

export interface Publication {
  id: string;
  title: string;
  authors: string;
  venue: string;
  year: number;
  sortDate: string;
  type: PublicationTypeTag;
  venueTags: VenueTag[];
  topicTags: TopicTag[];
  url: string;
  summary: string;
  abstract?: string;
  bibtex: string;
  details: PublicationDetail[];
}

export interface PublicationDetail {
  label: string;
  value: string;
  href?: string;
}

export type PublicationPresentationLink =
  | {
      kind: "talk";
      talkSlug: string;
      label?: string;
    }
  | {
      kind: "file";
      filePath: string;
      label?: string;
    };

export interface ResolvedPublicationLink {
  key: string;
  publicationId: string;
  label: string;
  url: string;
}

export const scholarProfileUrl =
  "https://scholar.google.com/citations?user=fAJsN2kAAAAJ&hl=en";

export const semanticScholarUrl =
  "https://www.semanticscholar.org/search?q=Elias%20Crum&sort=relevance";

export const publications: Publication[] = [
  {
    id: "enriching-ontologies-disjointness-llm-2024",
    title: "Enriching Ontologies with Disjointness Axioms using Large Language Models",
    authors:
      "E. Crum, A. De Santis, M. Ovide, J. Pan, A. Pisu, N. Lazzari, S. Rudolph",
    venue: "arXiv preprint arXiv:2410.03235",
    year: 2024,
    sortDate: "2024-10-04",
    type: "Preprint",
    venueTags: [],
    topicTags: ["Semantic Web", "Data Science"],
    url: "https://doi.org/10.48550/arXiv.2410.03235",
    summary:
      "Investigates how large language models can propose class disjointness axioms for ontologies, with validation on DBpedia and a workflow that preserves logical consistency while reducing manual effort.",
    abstract:
      "Large language models can assist ontology engineers by proposing candidate disjointness axioms, but these suggestions must be validated against logical consistency constraints. This work evaluates an LLM-assisted workflow on DBpedia-focused scenarios, showing how curated prompts and post-hoc validation can reduce manual effort while maintaining coherent ontology design.",
    bibtex: `@article{crum2024enriching,
  title={Enriching Ontologies with Disjointness Axioms using Large Language Models},
  author={Crum, Elias and De Santis, Alberto and Ovide, Marta and Pan, Jeff and Pisu, Alberto and Lazzari, Nicole and Rudolph, Sebastian},
  journal={arXiv preprint arXiv:2410.03235},
  year={2024},
  url={https://doi.org/10.48550/arXiv.2410.03235}
}`,
    details: [
      { label: "Publication Type", value: "Preprint" },
      { label: "Year", value: "2024" },
      { label: "DOI", value: "10.48550/arXiv.2410.03235", href: "https://doi.org/10.48550/arXiv.2410.03235" },
    ],
  },
  {
    id: "pengquin-eswc-2024-paper",
    title: "PErsoNal Genome QUery IN healthcare and clinical practice (PENGQUIN)",
    authors: "E. Crum",
    venue:
      "European Semantic Web Conference 2024 (later published in ESWC 2024 Satellite Events proceedings)",
    year: 2024,
    sortDate: "2024-05-26",
    type: "Conference Paper",
    venueTags: ["Conference"],
    topicTags: ["Semantic Web", "Genomics", "Bioinformatics"],
    url: "https://doi.org/10.1007/978-3-031-78955-7_3",
    summary:
      "Presents the PENGQUIN PhD framework for privacy-preserving genomic data sharing and querying using Solid pods, RDF/Linked Data representations, policy attachments, and link-traversal querying.",
    abstract:
      "PENGQUIN proposes a privacy-aware architecture for personal genomic data sharing and querying in clinical contexts. The framework combines Solid pods, linked-data representations, and policy-linked resources to support controlled discovery and interoperability across distributed data sources.",
    bibtex: `@inproceedings{crum2024pengquin,
  title={PErsoNal Genome QUery IN healthcare and clinical practice (PENGQUIN)},
  author={Crum, Elias},
  booktitle={European Semantic Web Conference 2024 Satellite Events},
  year={2024},
  publisher={Springer},
  doi={10.1007/978-3-031-78955-7_3},
  url={https://doi.org/10.1007/978-3-031-78955-7_3}
}`,
    details: [
      { label: "Publication Type", value: "Conference Paper" },
      { label: "Conference", value: "European Semantic Web Conference (ESWC)" },
      { label: "Year", value: "2024" },
      { label: "DOI", value: "10.1007/978-3-031-78955-7_3", href: "https://doi.org/10.1007/978-3-031-78955-7_3" },
    ],
  },
  {
    id: "personalized-medicine-data-pods-2024",
    title: "Personalized medicine through personal data pods",
    authors: "E. Crum, R. Taelman, B. Buelens, G. Ertaylan, R. Verborgh",
    venue:
      "Proceedings of the 15th International SWAT4HCLS Conference (CEUR Workshop Proceedings)",
    year: 2024,
    sortDate: "2024-02-26",
    type: "Conference Paper",
    venueTags: ["Conference"],
    topicTags: ["Semantic Web", "Bioinformatics", "Genomics"],
    url: "https://ceur-ws.org/Vol-3890/paper-25.pdf",
    summary:
      "Describes how Solid-based personal data pods can address privacy and data-sharing bottlenecks in genomic medicine by decentralizing storage and giving patients finer control over sensitive genomic data.",
    abstract:
      "This paper discusses decentralized personal data pods for genomic medicine and highlights how Solid-based approaches can improve privacy, governance, and interoperability. The work motivates pod-centric clinical data sharing workflows that maintain patient control while enabling downstream analysis and collaboration.",
    bibtex: `@inproceedings{crum2024personalized,
  title={Personalized medicine through personal data pods},
  author={Crum, Elias and Taelman, Ruben and Buelens, Ben and Ertaylan, Gokce and Verborgh, Ruben},
  booktitle={Proceedings of the 15th International SWAT4HCLS Conference},
  year={2024},
  url={https://ceur-ws.org/Vol-3890/paper-25.pdf}
}`,
    details: [
      { label: "Publication Type", value: "Conference Paper" },
      { label: "Conference", value: "SWAT4HCLS 2024" },
      { label: "Year", value: "2024" },
      { label: "Full Text", value: "CEUR paper PDF", href: "https://ceur-ws.org/Vol-3890/paper-25.pdf" },
    ],
  },
  {
    id: "coliphages-human-urinary-microbiota-2023",
    title: "Coliphages of the human urinary microbiota",
    authors: "E. Crum, Z. Merchant, A. Ene, T. Miller-Ensminger, G. Johnson, A. J. Wolfe, C. Putonti",
    venue: "PLoS ONE 18(4), e0283930",
    year: 2023,
    sortDate: "2023-04-13",
    type: "Journal Article",
    venueTags: [],
    topicTags: ["Bioinformatics", "Genomics"],
    url: "https://doi.org/10.1371/journal.pone.0283930",
    summary:
      "Catalogs urinary E. coli phage diversity and shows that multiple urinary and non-urinary coliphages can lyse urinary E. coli strains, supporting a role for phages in shaping urobiome composition.",
    abstract:
      "The study characterizes coliphages associated with the human urinary microbiota and explores host range patterns against urinary E. coli isolates. Results suggest that diverse urinary and non-urinary phages can impact urinary microbial ecology and motivate deeper phage-informed analyses in urobiome research.",
    bibtex: `@article{crum2023coliphages,
  title={Coliphages of the human urinary microbiota},
  author={Crum, Elias and Merchant, Zachary and Ene, Adrian and Miller-Ensminger, Terrance and Johnson, Grace and Wolfe, Alan J. and Putonti, Catherine},
  journal={PLOS ONE},
  volume={18},
  number={4},
  pages={e0283930},
  year={2023},
  doi={10.1371/journal.pone.0283930},
  url={https://doi.org/10.1371/journal.pone.0283930}
}`,
    details: [
      { label: "Publication Type", value: "Journal Article" },
      { label: "Journal", value: "PLOS ONE" },
      { label: "Year", value: "2023" },
      { label: "DOI", value: "10.1371/journal.pone.0283930", href: "https://doi.org/10.1371/journal.pone.0283930" },
    ],
  },
  {
    id: "cataloging-engineering-temperate-coliphages-2022",
    title: "Cataloging and Engineering Temperate Coliphages of the Human Urinary Microbiome",
    authors: "E. D. Crum",
    venue: "Loyola University Chicago (Master's Thesis)",
    year: 2022,
    sortDate: "2022-09-01",
    type: "Thesis",
    venueTags: [],
    topicTags: ["Bioinformatics", "Genomics", "Data Science"],
    url: "https://ecommons.luc.edu/luc_theses/4434/",
    summary:
      "Builds a large-scale catalog of urinary E. coli prophages and demonstrates induction plus engineering of temperate phages into obligately lytic variants for targeted lysis of non-native urinary strains.",
    abstract:
      "This master's thesis catalogs urinary E. coli prophages and develops engineering strategies to convert temperate phages into obligately lytic candidates. It combines comparative genomics, induction experiments, and design workflows relevant to targeted microbial interventions.",
    bibtex: `@mastersthesis{crum2022cataloging,
  title={Cataloging and Engineering Temperate Coliphages of the Human Urinary Microbiome},
  author={Crum, Elias D.},
  school={Loyola University Chicago},
  year={2022},
  url={https://ecommons.luc.edu/luc_theses/4434/}
}`,
    details: [
      { label: "Publication Type", value: "Thesis" },
      { label: "Institution", value: "Loyola University Chicago" },
      { label: "Year", value: "2022" },
      { label: "Repository", value: "Loyola eCommons", href: "https://ecommons.luc.edu/luc_theses/4434/" },
    ],
  },
  {
    id: "genome-investigation-urinary-gardnerella-2021",
    title: "Genome Investigation of Urinary Gardnerella Strains and Their Relationship to Isolates of the Vaginal Microbiota",
    authors: "C. Putonti, K. Thomas-White, E. Crum, E. E. Hilt, T. K. Price, A. J. Wolfe",
    venue: "mSphere 6(3), e00154-21",
    year: 2021,
    sortDate: "2021-05-12",
    type: "Journal Article",
    venueTags: [],
    topicTags: ["Bioinformatics", "Genomics"],
    url: "https://doi.org/10.1128/mSphere.00154-21",
    summary:
      "Compares urinary and vaginal Gardnerella genomes, identifying species-level structure and showing that whole-genome analysis is needed for reliable differentiation across groups in urogenital microbiota.",
    abstract:
      "This work investigates genomic diversity among urinary and vaginal Gardnerella isolates and shows that whole-genome analyses are required to resolve species-level structure and strain relationships. The findings improve understanding of Gardnerella population structure in urogenital microbiota studies.",
    bibtex: `@article{putonti2021genome,
  title={Genome Investigation of Urinary Gardnerella Strains and Their Relationship to Isolates of the Vaginal Microbiota},
  author={Putonti, Catherine and Thomas-White, Kimberly and Crum, Elias and Hilt, Elizabeth E. and Price, Thomas K. and Wolfe, Alan J.},
  journal={mSphere},
  volume={6},
  number={3},
  pages={e00154-21},
  year={2021},
  doi={10.1128/mSphere.00154-21},
  url={https://doi.org/10.1128/mSphere.00154-21}
}`,
    details: [
      { label: "Publication Type", value: "Journal Article" },
      { label: "Journal", value: "mSphere" },
      { label: "Year", value: "2021" },
      { label: "DOI", value: "10.1128/mSphere.00154-21", href: "https://doi.org/10.1128/mSphere.00154-21" },
    ],
  },
];

// Edit this map to connect publications with related presentations.
// `talk` links route to an internal talk detail page; `file` links open a PDF path directly.
// Keys must match publication `id` values above.
export const publicationPresentationLinksById: Record<string, PublicationPresentationLink[]> = {
  "pengquin-eswc-2024-paper": [
    {
      kind: "talk",
      talkSlug: "pengquin-eswc-2024",
      label: "Related Presentation (ESWC 2024)",
    },
  ],
  "personalized-medicine-data-pods-2024": [
    {
      kind: "file",
      filePath: "/talks/posters/SWAT4HCLS_24_poster_EDC.pdf",
      label: "Related Presentation Material (SWAT4HCLS 2024)",
    },
  ],
};

export function getPublicationById(publicationId: string): Publication | undefined {
  return publications.find((publication) => publication.id === publicationId);
}

export function getRelatedPublicationLinksForTalkSlug(talkSlug: string): ResolvedPublicationLink[] {
  return getRelatedPublicationLinks((presentationLink) => {
    return presentationLink.kind === "talk" && presentationLink.talkSlug === talkSlug;
  }, talkSlug);
}

export function getRelatedPublicationLinksForPresentationFile(
  filePath: string
): ResolvedPublicationLink[] {
  return getRelatedPublicationLinks((presentationLink) => {
    return presentationLink.kind === "file" && presentationLink.filePath === filePath;
  }, filePath);
}

function getRelatedPublicationLinks(
  predicate: (presentationLink: PublicationPresentationLink) => boolean,
  keyPrefix: string
): ResolvedPublicationLink[] {
  const links: ResolvedPublicationLink[] = [];

  Object.entries(publicationPresentationLinksById).forEach(([publicationId, presentationLinks]) => {
    const publication = getPublicationById(publicationId);
    if (!publication) {
      return;
    }

    presentationLinks.forEach((presentationLink, index) => {
      if (!predicate(presentationLink)) {
        return;
      }

      links.push({
        key: `${keyPrefix}:${publicationId}:${index}`,
        publicationId,
        label: presentationLink.label ?? `Related Publication: ${publication.title}`,
        url: publication.url,
      });
    });
  });

  return links;
}
