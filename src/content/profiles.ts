/** Elias's research profiles, shown on the About and Publications pages and exported to RDF. */
export interface ExternalProfileLink {
  id: string;
  label: string;
  url: string;
  iconUrl: string;
  variant: "scholar" | "semantic" | "orcid" | "research-portal";
}

export const orcidProfileUrl = "https://orcid.org/0009-0005-3991-754X";

/** The publication-index profiles listed on the Publications page. */
export const publicationProfileLinks: ExternalProfileLink[] = [
  {
    id: "google-scholar",
    label: "Google Scholar",
    url: "https://scholar.google.com/citations?user=fAJsN2kAAAAJ&hl=en",
    iconUrl:
      "https://freepngimg.com/download/science/63222-google-scholar-doctor-science-university-philosophy-computer.png",
    variant: "scholar",
  },
  {
    id: "semantic-scholar",
    label: "Semantic Scholar",
    url: "https://www.semanticscholar.org/author/Elias-Crum/2091963103",
    iconUrl: "https://api.iconify.design/academicons/semantic-scholar.svg?color=%23000",
    variant: "semantic",
  },
  {
    id: "orcid",
    label: "ORCID",
    url: orcidProfileUrl,
    iconUrl: "https://api.iconify.design/academicons/orcid.svg?color=%23000",
    variant: "orcid",
  },
];

/** Every research profile, as listed on the About page and in the RDF export. */
export const researchProfileLinks: ExternalProfileLink[] = [
  ...publicationProfileLinks,
  {
    id: "research-portal",
    label: "Research Portal",
    url: "https://www.researchportal.be/en/researcher/elias-david-crum",
    iconUrl:
      "https://www.datocms-assets.com/53443/1747235092-monogram-vlaamse-overheid.svg?auto=format&fit=max&w=1200",
    variant: "research-portal",
  },
];
