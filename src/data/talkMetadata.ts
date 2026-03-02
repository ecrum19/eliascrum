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

export type VenueTag = (typeof VENUE_TAG_OPTIONS)[number] | string;
export type TopicTag = (typeof TOPIC_TAG_OPTIONS)[number] | string;

export interface TalkMetadata {
  // Optional display overrides.
  title?: string;
  dateIso?: string; // YYYY-MM-DD
  dateLabel?: string; // Optional display label, e.g. "April 2025"

  // Content used in the UI.
  description: string;
  venueTags: VenueTag[];
  topicTags: TopicTag[];
}

// Edit this object to quickly update talk titles, dates, descriptions, and tags.
// Keys must match talk "slug" values in src/data/talksData.ts.
export const talkMetadataBySlug: Record<string, TalkMetadata> = {
  "sphn-290425": {
    title: "SPHN Talk: Clinical Genomics Data Exchange",
    dateIso: "2025-04-29",
    description:
      "Presentation on integrating personal genomics workflows with interoperable data standards and scalable exchange mechanisms.",
    venueTags: ["Symposium"],
    topicTags: ["Genomics", "Data Science", "Semantic Web"],
  },
  "vital-it-edc-040425": {
    title: "Vital-IT Session: EDC Infrastructure Update",
    dateIso: "2025-04-04",
    description:
      "Technical update on infrastructure decisions for secure querying and lifecycle management of decentralized genomic datasets.",
    venueTags: ["Internal Meeting"],
    topicTags: ["Data Science", "Genomics", "Semantic Web"],
  },
  "edc-dph-25": {
    title: "Digital Precision Health Talk 2025",
    dateIso: "2025-01-01",
    dateLabel: "2025",
    description:
      "Overview of the EDC roadmap, project milestones, and translation of semantic technologies into precision-health use cases.",
    venueTags: ["Internal Meeting"],
    topicTags: ["Genomics", "Semantic Web", "Data Science"],
  },
  "fwo24-pitch-edc-official": {
    title: "FWO Pitch: Enabling Decentralized Clinical Data",
    dateIso: "2024-01-01",
    dateLabel: "2024",
    description:
      "Research pitch highlighting the motivation, expected impact, and implementation strategy for decentralized clinical data solutions.",
    venueTags: ["Non-Academic Event"],
    topicTags: ["Genomics", "Data Science"],
  },
  "isws2024-slytherin-presentation": {
    title: "ISWS 2024: Slytherin Presentation",
    dateIso: "2024-01-01",
    dateLabel: "2024",
    description:
      "Conference presentation focused on semantic data modeling choices, query strategies, and practical trade-offs in deployment.",
    venueTags: ["Conference"],
    topicTags: ["Semantic Web", "Data Science"],
  },
  "pengquin-eswc-2024": {
    title: "ESWC 2024: PENGQUIN Project Talk",
    dateIso: "2024-01-01",
    dateLabel: "2024",
    description:
      "Talk introducing PENGQUIN and detailing how semantic technologies support privacy-aware personal genomics applications.",
    venueTags: ["Conference"],
    topicTags: ["Semantic Web", "Genomics", "Bioinformatics"],
  },
  "solidsymp2024-edc": {
    title: "Solid Symposium 2024: EDC",
    dateIso: "2024-01-01",
    dateLabel: "2024",
    description:
      "Symposium contribution on Solid-based data control patterns and implications for federated health-data ecosystems.",
    venueTags: ["Symposium"],
    topicTags: ["Semantic Web", "Data Science", "Genomics"],
  },
  "edc-18m-vito-jury": {
    title: "EDC 18-Month VITO Jury Review",
    description:
      "Progress review summarizing technical milestones, validation outcomes, and next-phase planning for the EDC program.",
    venueTags: ["Internal Meeting"],
    topicTags: ["Data Science", "Genomics"],
  },
  "sib-reflectionugent": {
    title: "SIB Reflection at UGent",
    description:
      "Discussion-style talk reflecting on lessons learned in semantic interoperability and bioinformatics-driven data integration.",
    venueTags: ["Internal Meeting"],
    topicTags: ["Bioinformatics", "Semantic Web", "Data Science"],
  },
  "solid-intro-triple": {
    title: "TRIPLE Intro to Solid",
    description:
      "Introductory presentation on Solid principles, identity/data ownership patterns, and their research relevance.",
    venueTags: ["Internal Meeting"],
    topicTags: ["Semantic Web", "Data Science"],
  },
  swissprot: {
    title: "SwissProt Session: Knowledge Integration",
    description:
      "Talk covering structured biological knowledge integration and how semantic representations improve downstream discoverability.",
    venueTags: ["Symposium"],
    topicTags: ["Bioinformatics", "Semantic Web", "Genomics"],
  },
  "ugent-pengquin-intro": {
    title: "UGent Intro: PENGQUIN",
    description:
      "Foundational project introduction outlining objectives, architecture direction, and immediate implementation priorities.",
    venueTags: ["Internal Meeting"],
    topicTags: ["Genomics", "Semantic Web", "Data Science"],
  },
};
