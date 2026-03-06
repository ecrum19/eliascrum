import { type TopicTag, type VenueTag } from "./talkMetadata";

export const PUBLICATION_TYPE_TAG_OPTIONS = [
  "Conference Paper",
  "Journal Article",
  "Workshop Paper",
  "Thesis",
] as const;

export type PublicationTypeTag =
  | (typeof PUBLICATION_TYPE_TAG_OPTIONS)[number]
  | string;

export interface Publication {
  // Required core fields used by automatic homepage updates and list sorting.
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
  "https://www.semanticscholar.org/author/Elias-Crum/2091963103";

export const publications: Publication[] = [
  {
    id: "genome-sharing-review-2026",
    title: "Genomic sequence data sharing for clinical practice: A scoping review",
    authors: "E. Crum, R. Taelman, B. Buelens, G. Ertaylan",
    venue: "Computers in Biology and Medicine",
    year: 2026,
    sortDate: "2026-01-01",
    type: "Journal Article",
    venueTags: [],
    topicTags: ["Clinical Genomics", "Personalized Medicine", "Data Privacy"],
    url: "https://www.sciencedirect.com/science/article/pii/S0010482525016890",
    summary:
      "Scoping review of how genomic sequence data is shared in clinical practice, surveying implementations, infrastructure, and guidance. Identifies key barriers to scalability and adoption, and proposes concrete steps toward more unified, scalable clinical genomic data sharing systems.",
    abstract:
      "A key barrier to scaling genomic medicine is sharing patient genomic data. This study assesses current genomic data sharing approaches, infrastructure, and guidelines, while incorporating insights from national initiatives and industry to ensure broad relevance. We aim to provide a foundation for dialogue by highlighting current challenges and barriers while promoting actionable standards and future points of emphasis. Our analysis uses Arksey & O’Malley’s scoping review framework to survey peer-reviewed articles, gray literature, national genomics initiatives, and corporate strategies to address four questions revolving around what genome data sharing approaches exist in: 1. Clinical-care, 2. Research, 3. National genome initiatives, and 4. Corporations. We identified 55 studies, separated them into groups, and determined 7 core components of an implementable technology. Notably, the studies included 15 clinical genome sharing implementations, 9 research-focused frameworks, and 13 ethical/legal guidelines. We also analyzed 57 active national genome initiatives and 20 major genomics companies. We found implementations for clinical genomic data sharing exist, yet scalability and widespread adoption remain limited. We identify scalability, clinical versus research-grade infrastructure requirements, and genomic medicine maturity as main challenges to overcome and suggest 4 steps that will encourage a unified path forward. Our discussion aims to facilitate discourse and catalyze future genomic data sharing system innovation.",
    bibtex: `@article{crum_genomesharingrev_2025,
    author = {Crum, Elias and Taelman, Ruben and Buelens, Bart and Ertaylan, Gokhan},
    title = {Genomic sequence data sharing for clinical practice: A scoping review},
    month = jan,
    journal = {Computers in Biology and Medicine},
    volume = {200},
    pages = {111335},
    year = {2026},
    issn = {0010-4825},
    doi = {https://doi.org/10.1016/j.compbiomed.2025.111335},
  }`,
    details: [
      { label: "Publication Type", value: "Journal Article" },
      { label: "Journal", value: "Computers in Biology and Medicine" },
      { label: "Date", value: "2026-01-01" },
      {
        label: "DOI",
        value: "10.1016/j.compbiomed.2025.111335",
        href: "https://doi.org/10.1016/j.compbiomed.2025.111335",
      },
    ],
  },
  {
    id: "disjointness-llm-ISWC-2024",
    title:
      "Enriching Ontologies with Disjointness Axioms using Large Language Models",
    authors:
      "E. Crum, A. De Santis, M. Ovide, J. Pan, A. Pisu, N. Lazzari, S. Rudolph",
    venue:
      "International Semantic Web Conference (ISWC) 2024 (KBC-LM'24 workshop)",
    year: 2024,
    sortDate: "2024-12-02",
    type: "Workshop Paper",
    venueTags: ["KBC-LM'24 workshop at ISWC 2024"],
    topicTags: ["Semantic Web", "Data Science", "Knowledge Representation"],
    url: "https://doi.org/10.48550/arXiv.2410.03235",
    summary:
      "Investigates how large language models can propose class disjointness axioms for ontologies, with validation on DBpedia and a workflow that preserves logical consistency while reducing manual effort.",
    abstract:
      "Ontologies often lack explicit disjointness declarations between classes, despite their usefulness for sophisticated reasoning and consistency checking in Knowledge Graphs. In this study, we explore the potential of Large Language Models (LLMs) to enrich ontologies by identifying and asserting class disjointness axioms. Our approach aims at leveraging the implicit knowledge embedded in LLMs, using prompt engineering to elicit this knowledge for classifying ontological disjointness. We validate our methodology on the DBpedia ontology, focusing on open-source LLMs. Our findings suggest that LLMs, when guided by effective prompt strategies, can reliably identify disjoint class relationships, thus streamlining the process of ontology completion without extensive manual input. For comprehensive disjointness enrichment, we propose a process that takes logical relationships between disjointness and subclass statements into account in order to maintain satisfiability and reduce the number of calls to the LLM. This work provides a foundation for future applications of LLMs in automated ontology enhancement and offers insights into optimizing LLM performance through strategic prompt design. Our code is publicly available on GitHub at https://github.com/n28div/llm-disjointness.",
    bibtex: `@misc{disjointness_LLM_2024,
      title={Enriching Ontologies with Disjointness Axioms using Large Language Models}, 
      author={Elias Crum and Antonio De Santis and Manon Ovide and Jiaxin Pan and Alessia Pisu and Nicolas Lazzari and Sebastian Rudolph},
      year={2024},
      eprint={2410.03235},
      archivePrefix={arXiv},
      primaryClass={cs.AI},
      url={https://ceur-ws.org/Vol-3853/paper1.pdf}, 
      urldate={2026-03-05},
}`,
    details: [
      { label: "Publication Type", value: "Workshop Paper" },
      {
        label: "Conference",
        value: "International Semantic Web Conference (ISWC)",
      },
      { label: "Date", value: "2024-12-02" },
      {
        label: "DOI",
        value: "10.48550/arXiv.2410.03235",
        href: "https://doi.org/10.48550/arXiv.2410.03235",
      },
    ],
  },
  {
    id: "wikidata-sparql-ISWC-2025",
    title:
      "Observations on automated client-side query federation over Wikidata SPARQL endpoints",
    authors:
      "J. Hanski, E. Crum, R. Taelman",
    venue:
      "International Semantic Web Conference (ISWC) 2025 (WikiData workshop)",
    year: 2025,
    sortDate: "2025-11-02",
    type: "Workshop Paper",
    venueTags: ["WikiData workshop at ISWC 2025"],
    topicTags: ["Semantic Web", "Data Science", "Semantic Querying"],
    url: "https://wikidataworkshop.github.io/2025/papers/paper5.pdf",
    summary:
      "Client-side query federation can automatically combine data across the newly split Wikidata SPARQL endpoints, reducing the need for manual source annotations in queries while remaining feasible for queries that stay within client resource limits.",
    abstract:
      "The recent Wikidata graph split divided a previously singular SPARQL endpoint into two distinct ones, breaking existing queries that depend on the combined data from these endpoints. To accommodate this graph split, instructions for manual source assignment have been provided. However, the proposed solution of manual source annotations within the queries themselves, through the use of SPARQL SERVICE clauses, not only imposes additional work on users of these endpoints, but also assumes prior knowledge of which data come from which endpoint, and how they should be combined. Potential future graph splits would result in this manual source assignment having to be done again. Within this work, we employ client-side query federation over the two Wikidata endpoints, using state-of-the-art source assignment approaches for query operations, to demonstrate the feasibility and challenges of automated federation as an alternative to manual source assignment. Through our experiments, we show how client-side federation can offer a viable alternative to manual source assignment for certain queries, where the amount of data to process remains within client-side resource limits, and provided no custom behaviour is attached to standard SPARQL operations. Future work will be needed to address the trade-offs between network request counts and client-side data processing, to be able to execute queries that access large amounts of data from multiple sources.",
    bibtex: `@misc{federation_wikidata_2025,
      title={Observations on automated client-side query federation over Wikidata SPARQL endpoints}, 
      author={Jonni Hanski and Elias Crum and Ruben Taelman},
      year={2025},
      url={https://wikidataworkshop.github.io/2025/papers/paper5.pdf}, 
      urldate={2026-03-05},
}`,
    details: [
      { label: "Publication Type", value: "Workshop Paper" },
      {
        label: "Conference",
        value: "International Semantic Web Conference (ISWC)",
      },
      { label: "Date", value: "2025-11-02" },
      {
        label: "Full Text",
        value: "CEUR paper PDF",
        href: "https://wikidataworkshop.github.io/2025/papers/paper5.pdf",
      },
    ],
  },
  {
    id: "vcf2rdf-SWAT4HCLS-2025",
    title: "Theoretical VCF to RDF mapping",
    authors: "E. Crum, R. Taelman, B. Buelens, G. Ertaylan",
    venue:
      "Proceedings of the 16th International SWAT4HCLS Conference (CEUR Workshop Proceedings)",
    year: 2025,
    sortDate: "2025-02-28",
    type: "Conference Paper",
    venueTags: ["SWAT4HCLS"],
    topicTags: ["Semantic Web", "Knowledge Representation", "Clinical Genomics"],
    url: "",
    summary:
      "...",
    abstract:
      "...",
    bibtex: `@inproceedings{crum2025vcf2rdf,
  title={Theoretical VCF to RDF mapping},
  author={Crum, Elias and Taelman, Ruben and Buelens, Bart and Ertaylan, Gokhan},
  booktitle={Proceedings of the 16th International SWAT4HCLS Conference},
  year={2025},
  url={}
  urldate={2026-03-05},
}`,
    details: [
      { label: "Publication Type", value: "Conference Paper" },
      { label: "Conference", value: "SWAT4HCLS" },
      { label: "Date", value: "2025-02-28" },
      {
        label: "Full Text",
        value: "CEUR paper PDF",
        href: "",
      },
    ],
  },
  {
    id: "pengquin-eswc-2024",
    title:
      "PErsoNal Genome QUery IN healthcare and clinical practice (PENGQUIN)",
    authors: "E. Crum",
    venue: "European Semantic Web Conference (ESWC) 2024",
    year: 2024,
    sortDate: "2024-05-26",
    type: "Conference Paper",
    venueTags: ["ESWC"],
    topicTags: ["Semantic Web", "Clinical Genomics", "Semantic Querying", "Data Privacy"],
    url: "https://doi.org/10.1007/978-3-031-78955-7_3",
    summary:
      "Presents the PENGQUIN PhD framework for privacy-preserving genomic data sharing and querying using Solid pods, RDF/Linked Data representations, policy attachments, and link-traversal querying.",
    abstract:
      "Medical care is in the process of becoming increasingly personalized through the use of patient genetic information. At present, data useful for clinical care, including genetic data, is commonly diffuse, organized arbitrarily, and stored in data silos. Thus, unstructured organization, high costs for data storage and generation, and tight privacy restrictions pose serious challenges to scaling personalized clinical strategies. I propose an early stage Ph.D. that aims to improve the connectedness and shareability of genomic data storage(s), while preserving data privacy, to decrease the costs of using patient genome data in clinical practice. In this pursuit, I will integrate various domains of semantic web research into a novel, holistic framework designed for use in clinical practice. Specifically, I will (a) store patient data using Solid pods, (b) represent personal genome sequence data in RDF as Linked Data, (c) attach policies to stored data, and (d) query data through link traversal queries.",
    bibtex: `@inproceedings{crum2024pengquin,
  title={PErsoNal Genome QUery IN healthcare and clinical practice (PENGQUIN)},
  author={Crum, Elias},
  booktitle={European Semantic Web Conference 2024 Satellite Events},
  year={2024},
  publisher="Springer Nature Switzerland",
  isbn="978-3-031-78955-7"
  doi={10.1007/978-3-031-78955-7_3},
}`,
    details: [
      { label: "Publication Type", value: "Conference Paper" },
      { label: "Conference", value: "European Semantic Web Conference (ESWC)" },
      { label: "Date", value: "2024-05-26" },
      {
        label: "DOI",
        value: "10.1007/978-3-031-78955-7_3",
        href: "https://doi.org/10.1007/978-3-031-78955-7_3",
      },
    ],
  },
  {
    id: "pm-pods-SWAT4HCLS-2024",
    title: "Personalized medicine through personal data pods",
    authors: "E. Crum, R. Taelman, B. Buelens, G. Ertaylan, R. Verborgh",
    venue:
      "Proceedings of the 15th International SWAT4HCLS Conference (CEUR Workshop Proceedings)",
    year: 2024,
    sortDate: "2024-02-26",
    type: "Conference Paper",
    venueTags: ["SWAT4HCLS"],
    topicTags: ["Solid", "Semantic Web", "Personalized Medicine", "Clinical Genomics"],
    url: "https://ceur-ws.org/Vol-3890/paper-25.pdf",
    summary:
      "Describes how Solid-based personal data pods can address privacy and data-sharing bottlenecks in genomic medicine by decentralizing storage and giving patients finer control over sensitive genomic data.",
    abstract:
      "Medical care is in the process of becoming increasingly personalized through the use of patient genetic information. Meanwhile, privacy concerns regarding collection and storage of sensitive personal genome sequence data have encouraged public debate and legal regulation. Here we identify two fundamental challenges associated with privacy and shareability of genomic data storage (s) and propose the use of Solid pods to address these challenges. We establish that personal data pods using Solid specifications can enable decentralized storage, increased patient control over their data, and support of Linked Data formats, which when combined, could offer solutions to challenges currently restricting personalized medicine in practice.",
    bibtex: `@inproceedings{crum2024pmpods,
  title={Personalized medicine through personal data pods},
  author={Crum, Elias and Taelman, Ruben and Buelens, Bart and Ertaylan, Gokhan and Verborgh, Ruben},
  booktitle={Proceedings of the 15th International SWAT4HCLS Conference},
  year={2024},
  url={https://ceur-ws.org/Vol-3890/paper-25.pdf}
  urldate={2026-03-05},
}`,
    details: [
      { label: "Publication Type", value: "Conference Paper" },
      { label: "Conference", value: "SWAT4HCLS" },
      { label: "Date", value: "2024-02-26" },
      {
        label: "Full Text",
        value: "CEUR paper PDF",
        href: "https://ceur-ws.org/Vol-3890/paper-25.pdf",
      },
    ],
  },
  {
    id: "TRIPLE-SWAT4HCLS-2024",
    title: "CHIST-ERA Triple: improving data interoperability and federation across RDF knowledge graphs and Solid Pods",
    authors: "J. Bolleman, E. Crum, I. Dragan, J. Galgonek, M. Ibberson, T. Mendes de Farias, M. Moos, M. Pagni, R. Taelman, J. Vondrášek, A. C. Sima",
    venue:
      "Proceedings of the 15th International SWAT4HCLS Conference (CEUR Workshop Proceedings)",
    year: 2024,
    sortDate: "2024-02-26",
    type: "Conference Paper",
    venueTags: ["SWAT4HCLS"],
    topicTags: ["Semantic Web", "Data Science", "Knowledge Representation"],
    url: "https://ceur-ws.org/Vol-3890/paper-28.pdf",
    summary:
      "Describes how Solid-based data pods can address privacy and data-sharing bottlenecks in academic research by allowing felxible sharing of sensitive research data and result/experimental data provenance.",
    abstract:
      "The TRIPLE project, a collaborative effort between the SIB Swiss Institute of Bioinformatics, the University of Ghent and the IOCB Prague, aims to boost the (re) usability of existing knowledge graph resources and improve software tools for RDF data access, documentation and data model visualization. In addition, TRIPLE will increase interoperability between existing public SPARQL endpoints and private data stored in Solid Pods, thus creating an ecosystem of research data that can be seamlessly integrated through efficient and expressive federated SPARQL queries.",
    bibtex: `@inproceedings{bolleman2024triple,
  title={CHIST-ERA Triple: improving data interoperability and federation across RDF knowledge graphs and Solid Pods},
  author={Bolleman, Jerven and Crum, Elias and Dragan, Iulian and Galgonek, Jakub and Ibberson, Mark and Mendes de Farias, Tarcisio and Moos, Marek and Pagni, Marco and Taelman, Ruben and Vondrášek, Jiří and Sima, Ana Claudia},
  booktitle={Proceedings of the 15th International SWAT4HCLS Conference},
  year={2024},
  url={https://ceur-ws.org/Vol-3890/paper-28.pdf}
  urldate={2026-03-05},
}`,
    details: [
      { label: "Publication Type", value: "Conference Paper" },
      { label: "Conference", value: "SWAT4HCLS" },
      { label: "Date", value: "2024-02-26" },
      {
        label: "Full Text",
        value: "CEUR paper PDF",
        href: "https://ceur-ws.org/Vol-3890/paper-28.pdf",
      },
    ],
  },
  {
    id: "urinary-coliphages-2023",
    title: "Coliphages of the human urinary microbiota",
    authors:
      "E. Crum, Z. Merchant, A. Ene, T. Miller-Ensminger, G. Johnson, A. J. Wolfe, C. Putonti",
    venue: "PLoS ONE 18(4), e0283930",
    year: 2023,
    sortDate: "2023-04-13",
    type: "Journal Article",
    venueTags: [],
    topicTags: ["Bioinformatics", "Bacteriophage", "Genomics", "Taxonomy"],
    url: "https://doi.org/10.1371/journal.pone.0283930",
    summary:
      "Catalogs urinary E. coli phage diversity and shows that multiple urinary and non-urinary coliphages can lyse urinary E. coli strains, supporting a role for phages in shaping urobiome composition.",
    abstract:
      "Due to its frequent association with urinary tract infections (UTIs), Escherichia coli is the best characterized constituent of the urinary microbiota (urobiome). However, uropathogenic E. coli is just one member of the urobiome. In addition to bacterial constituents, the urobiome of both healthy and symptomatic individuals is home to a diverse population of bacterial viruses (bacteriophages). A prior investigation found that most bacterial species in the urobiome are lysogens, harboring one or more phages integrated into their genome (prophages). Many of these prophages are temperate phages, capable of entering the lytic cycle and thus lysing their bacterial host. This transition from the lysogenic to lytic life cycle can impact the bacterial diversity of the urobiome. While many phages that infect E. coli (coliphages) have been studied for decades in the laboratory setting, the coliphages within the urobiome have yet to be cataloged. Here, we investigated the diversity of urinary coliphages by first identifying prophages in all publicly available urinary E. coli genomes. We detected 3,038 intact prophage sequences, representative of 1,542 unique phages. These phages include both novel species as well as species also found within the gut microbiota. Ten temperate phages were isolated from urinary E. coli strains included in our analysis, and we assessed their ability to infect and lyse urinary E. coli strains. We also included in these host range assays other urinary coliphages and laboratory coliphages. The temperate phages and other urinary coliphages were successful in lysing urinary E. coli strains. We also observed that coliphages from non-urinary sources were most efficient in killing urinary E. coli strains. The two phages, T2 and N4, were capable of lysing 83.5% (n = 86) of strains isolated from females with UTI symptoms. In conclusion, our study finds a diverse community of coliphages in the urobiome, many of which are predicted to be temperate phages, ten of which were confirmed here. Their ability to infect and lyse urinary E. coli strains suggests that urinary coliphages may play a role in modulating the E. coli strain diversity of the urobiome.",
    bibtex: `@article{crum2023coliphages,
  title={Coliphages of the human urinary microbiota},
  author={Crum, Elias and Merchant, Zubia and Ene, Adriana and Miller-Ensminger, Taylor and Johnson, Genevieve and Wolfe, Alan J. and Putonti, Catherine},
  journal={PLOS ONE},
  volume={18},
  number={4},
  pages={e0283930},
  year={2023},
  doi={10.1371/journal.pone.0283930},
}`,
    details: [
      { label: "Publication Type", value: "Journal Article" },
      { label: "Journal", value: "PLOS ONE" },
      { label: "Date", value: "2023-04-13" },
      {
        label: "DOI",
        value: "10.1371/journal.pone.0283930",
        href: "https://doi.org/10.1371/journal.pone.0283930",
      },
    ],
  },
  {
    id: "engineering-coliphages-2022",
    title:
      "Cataloging and Engineering Temperate Coliphages of the Human Urinary Microbiome",
    authors: "E. Crum",
    venue: "Loyola University Chicago (Master's Thesis)",
    year: 2022,
    sortDate: "2022-09-01",
    type: "Thesis",
    venueTags: [],
    topicTags: ["Bioinformatics", "Bacteriophage", "Genomics", "Genetic Engineering"],
    url: "https://ecommons.luc.edu/luc_theses/4434/",
    summary:
      "Builds a large-scale catalog of urinary E. coli prophages and demonstrates induction plus engineering of temperate phages into obligately lytic variants for targeted lysis of non-native urinary strains.",
    abstract:
      "In the US, around 60% of females will be diagnosed with a Urinary Tract Infection (UTI) in their lifetime, and Escherichia coli is the most implicated etiological agent in UTIs. Despite its frequent association with lower urinary tract symptoms, recent studies have found that the urinary microbiome (UMB), the viral, bacterial, and fungal resident members of the urinary tract, of healthy females can also consist of E. coli. While most research has focused on the bacterial constituents of the UMB, bacteriophages, viruses that infect bacteria, are far more abundant. Bacteriophages (phages) of other human microbiomes have been shown to play a significant role in shaping the bacterial community dynamics. While a handful of E. coli infecting phages (coliphages) have been characterized, little is known about the diversity of coliphages of the human UMB or their role within this microbial community. Of the known types of phages in nature, temperate phages have complex, broad impacts on bacterial populations and therefore, community dynamics, through both lytic and lysogenic means. One such widely studied impact is lysogenic conversion, the alteration of host phenotype by the infection and integration of a temperate phage. Lysogenic conversion has the potential to offer a host bacterium human-relevant phenotypes including antibiotic resistance or virulence factor production. Since it has been shown that UMB phages can exhibit host ranges broader than just their native host, phages could be facilitating the horizontal gene transfer of potentially harmful genes within the human UMB. Despite the threat posed by UMB temperate phages, little work has been done characterizing their integrated form, prophages, in UMB E. coli. Additionally, the ability of these phages to be induced form their native host, then infect and integrate into a non-native host has not been shown previously by phages of the human UMB. Here I present a two-part study into (i) the diversity of E. coli prophages within the human UMB and (ii) the ability of UMB temperate coliphages to be induced from a native host, engineered to be obligately lytic to then infect and lyse a non-native UMB host. First, 3,177 predicted intact prophages were identified from 961 urinary E. coli genome assemblies by the prophage predicting tool PHASTER. Prophages were pervasive; 95% of the strains contained at least one intact prophage (average >3 prophages per genome assembly). Furthermore, ~50% of these predicted prophages did not share significant sequence similarity to characterized phages, thus likely representing novel phages. Some predicted prophage sequences contained antibiotic resistance and virulence genes, but these genes were not common among the prophage sequences. Investigation of the predicted prophages’ integrase gene suggests that the UMB coliphages share common attachment sites for integration in the E. coli chromosome. Collectively, this study provides the first catalog of urinary E. coli temperate phages. Next, predicted intact prophages were induced from urinary E. coli strains using biologically relevant pH conditions. The induced phages were identified using PCR with primers designed based on the PHASTER sequence predictions. One of these induced prophages was then engineered from temperate to obligately lytic through the removal of its integrase gene sequence, and the host range of this engineered phage (d700) and its ancestral strain (i700) was assessed. d700 was able to lyse one strain of UMB E. coli that i700 was not suggesting that i700 infected and lysogenized the bacterium. This study shows that there is substantial diversity in UMB E. coli prophages and shows that some temperate coliphages can be induced, engineered to be obligately lytic, and lyse non-native hosts.",
    bibtex: `@mastersthesis{crum2022cataloging,
  title={Cataloging and Engineering Temperate Coliphages of the Human Urinary Microbiome},
  author={Crum, Elias},
  school={Loyola University Chicago},
  year={2022},
  url={https://ecommons.luc.edu/luc_theses/4434/}
  urldate={2026-03-05},
}`,
    details: [
      { label: "Publication Type", value: "Thesis" },
      { label: "Institution", value: "Loyola University Chicago" },
      { label: "Date", value: "2022-09-01" },
      {
        label: "Repository",
        value: "Loyola eCommons",
        href: "https://ecommons.luc.edu/luc_theses/4434/",
      },
    ],
  },
  {
    id: "gardnerella-characterization-2021",
    title:
      "Genome Investigation of Urinary Gardnerella Strains and Their Relationship to Isolates of the Vaginal Microbiota",
    authors:
      "C. Putonti, K. Thomas-White, E. Crum, E. E. Hilt, T. K. Price, A. J. Wolfe",
    venue: "mSphere 6(3), e00154-21",
    year: 2021,
    sortDate: "2021-05-12",
    type: "Journal Article",
    venueTags: [],
    topicTags: ["Bioinformatics", "Bacteria", "Taxonomy", "Genomics"],
    url: "https://doi.org/10.1128/mSphere.00154-21",
    summary:
      "Compares urinary and vaginal Gardnerella genomes, identifying species-level structure and showing that whole-genome analysis is needed for reliable differentiation across groups in urogenital microbiota.",
    abstract:
      "Gardnerella is a frequent member of the urogenital microbiota. Given the association between Gardnerella vaginalis and bacterial vaginosis (BV), significant efforts have been focused on characterizing this species in the vaginal microbiota. However, Gardnerella also is a frequent member of the urinary microbiota. In an effort to characterize the bacterial species of the urinary microbiota, we present here 10 genomes of urinary Gardnerella isolates from women with and without lower urinary tract symptoms. These genomes complement those of 22 urinary Gardnerella strains previously isolated and sequenced by our team. We included these genomes in a comparative genome analysis of all publicly available Gardnerella genomes, which include 33 urinary isolates, 78 vaginal isolates, and 2 other isolates. While once this genus was thought to consist of a single species, recent comparative genome analyses have revealed 3 new species and an additional 9 groups within Gardnerella. Based upon our analysis, we suggest a new group for the species. We also find that distinction between these Gardnerella species/groups is possible only when considering the core or whole-genome sequence, as neither the sialidase nor vaginolysin genes are sufficient for distinguishing between species/groups despite their clinical importance. In contrast to the vaginal microbiota, we found that only five Gardnerella species/groups have been detected within the lower urinary tract. Although we found no association between a particular Gardnerella species/group(s) and urinary symptoms, further sequencing of urinary Gardnerella isolates is needed for both comprehensive taxonomic characterization and etiological classification of Gardnerella in the urinary tract.",
    bibtex: `@article{putonti2021genome,
  title={Genome Investigation of Urinary Gardnerella Strains and Their Relationship to Isolates of the Vaginal Microbiota},
  author={Putonti, Catherine and Thomas-White, Krystal and Crum, Elias and Hilt, Evann E. and Price, Travis K. and Wolfe, Alan J.},
  journal={mSphere},
  volume={6},
  number={3},
  pages={e00154-21},
  year={2021},
  doi={10.1128/mSphere.00154-21},
}`,
    details: [
      { label: "Publication Type", value: "Journal Article" },
      { label: "Journal", value: "mSphere" },
      { label: "Date", value: "2021-05-12" },
      {
        label: "DOI",
        value: "10.1128/mSphere.00154-21",
        href: "https://doi.org/10.1128/mSphere.00154-21",
      },
    ],
  },
];

// Edit this map to connect publications with related presentations.
// `talk` links route to an internal talk detail page; `file` links open a PDF path directly.
// Keys must match publication `id` values above.
export const publicationPresentationLinksById: Record<
  string,
  PublicationPresentationLink[]
> = {
  "pengquin-eswc-2024-paper": [
    {
      kind: "talk",
      talkSlug: "eswc-phdsymp-pangquin",
      label: "Presentation (PhD Symposium - ESWC 2024)",
    },
    {
      kind: "file",
      filePath: "/talks/posters/ESWC_24_Poster_EDC.pdf",
      label: "Poster (PhD Symposium - ESWC 2024)",
    },
  ],
  "pm-pods-SWAT4HCLS-2024": [
    {
      kind: "file",
      filePath: "/talks/posters/SWAT4HCLS_24_poster_EDC.pdf",
      label: "Poster (SWAT4HCLS 2024)",
    },
  ],
  "TRIPLE-SWAT4HCLS-2024": [
    {
      kind: "file",
      filePath: "/talks/posters/...",
      label: "Consortium Poster (SWAT4HCLS 2024)",
    },
  ],
  "vcf2rdf-SWAT4HCLS-2025": [
    {
      kind: "file",
      filePath: "/talks/posters/swat4hcls_2025.pdf",
      label: "Poster (SWAT4HCLS 2025)",
    },
  ],
};

export function getPublicationById(
  publicationId: string,
): Publication | undefined {
  return publications.find((publication) => publication.id === publicationId);
}

export function getRelatedPublicationLinksForTalkSlug(
  talkSlug: string,
): ResolvedPublicationLink[] {
  return getRelatedPublicationLinks((presentationLink) => {
    return (
      presentationLink.kind === "talk" && presentationLink.talkSlug === talkSlug
    );
  }, talkSlug);
}

export function getRelatedPublicationLinksForPresentationFile(
  filePath: string,
): ResolvedPublicationLink[] {
  return getRelatedPublicationLinks((presentationLink) => {
    return (
      presentationLink.kind === "file" && presentationLink.filePath === filePath
    );
  }, filePath);
}

function getRelatedPublicationLinks(
  predicate: (presentationLink: PublicationPresentationLink) => boolean,
  keyPrefix: string,
): ResolvedPublicationLink[] {
  const links: ResolvedPublicationLink[] = [];

  Object.entries(publicationPresentationLinksById).forEach(
    ([publicationId, presentationLinks]) => {
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
          label:
            presentationLink.label ??
            `Related Publication: ${publication.title}`,
          url: publication.url,
        });
      });
    },
  );

  return links;
}
