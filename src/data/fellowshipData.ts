export interface FellowshipDetailField {
  label: string;
  value: string;
}

export interface FellowshipRecord {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  projectDescriptionPdfUrl: string;
  moreInfoUrl: string;
  defenseSlidesUrl: string;
  details: FellowshipDetailField[];
}

// Centralized fellowship metadata for the About and CV linked detail page.
// Update this object to revise links, summary text, and metadata fields.
export const fwoPhdFellowship: FellowshipRecord = {
  id: "fwo-phd-fellowship",
  slug: "fwo-phd-fellowship",
  title: "FWO PhD Fellowship",
  subtitle: "Strategic Basic Research Fellowship",
  summary:
    "Doctoral fellowship supporting research on semantic-web and decentralized methods for privacy-aware personal genomic data management and querying.",
  projectDescriptionPdfUrl: "/fellowship/FWO_Project_Description_EDC.pdf",
  defenseSlidesUrl: "/talks/fwo-interview",
  moreInfoUrl: "https://github.com/ecrum19/FWO_2024",
  details: [
    { label: "Funding Organization", value: "Research Foundation - Flanders (FWO)" },
    { label: "Funding Scheme", value: "PhD Fellowship - Strategic Basic Research" },
    { label: "Period", value: "2024-2028" },
    { label: "Project", value: "PENGQUIN (PErsoNal Genome QUery IN healthcare and clinical practice)" },
    { label: "Host Institutions", value: "Ghent University (IDLab/KNoWS) and VITO NV" },
  ],
};

export function getFellowshipDetailPath(record: FellowshipRecord = fwoPhdFellowship): string {
  return `/about/fellowships/${record.slug}`;
}
