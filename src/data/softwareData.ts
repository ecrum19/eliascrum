export interface SoftwareEntry {
  id: string;
  title: string;
  kind: string;
  year: string;
  summary: string;
  url: string;
  repositoryUrl?: string;
  demoUrl?: string;
  tags: string[];
}

// Update this array to add/edit software, tools, and web resources shown on the Work page.
export const softwareProjects: SoftwareEntry[] = [
  {
    id: "vcf-rdfizer-vocabulary",
    title: "VCF-RDFizer Vocabulary",
    kind: "Ontology Reference Website",
    year: "2026",
    summary:
      "Interactive ontology reference for VCF-RDFizer classes and properties, with browsable documentation sections.",
    url: "https://ecrum19.github.io/VCF-RDFizer-vocabulary/ontology-reference.html",
    tags: ["Semantic Web", "Genomics", "Ontology Engineering", "Documentation"],
  },
];
