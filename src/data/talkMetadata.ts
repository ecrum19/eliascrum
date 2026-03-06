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

  // Required content used in the UI and homepage update aggregation.
  description: string;
  venueTags: VenueTag[];
  topicTags: TopicTag[];
}

// Edit this object to quickly update talk titles, dates, descriptions, and tags.
// Keys must match talk "slug" values in src/data/talksData.ts.
export const talkMetadataBySlug: Record<string, TalkMetadata> = {
  "sphn-pengquin-talk": {
    title: "Swiss Public Health Network Talk: Clinical Genomics Semantic Modelling and Possibilities",
    dateIso: "2025-04-29",
    description:
      "...",
    venueTags: ["Research Stay Presentation"],
    topicTags: ["Clinical Genomics", "Data Science", "Semantic Web", "Data Privacy"],
  },
  "sib-vital-it-talk": {
    title: "SIB Vital-IT: Federated SPARQL Querying ...",
    dateIso: "2025-04-04",
    description:
      "...",
    venueTags: ["Internal Meeting"],
    topicTags: ["Data Science", "Genomics", "Semantic Web"],
  },
  "dph-day-talk": {
    title: "Digital Precision Health Day 2025 Talk",
    dateIso: "2025-10-10",
    dateLabel: "2025",
    description:
      "...",
    venueTags: ["Internal Meeting"],
    topicTags: ["Genomics", "Semantic Web", "Data Science"],
  },
  "fwo-interview": {
    title: "FWO Interview Presentation",
    dateIso: "2024-09-05",
    dateLabel: "2024",
    description:
      "...",
    venueTags: ["Fellowship Interview"],
    topicTags: ["Genomics", "Data Science"],
  },
  "isws-group-project-presentation": {
    title: "International Semantic Web Summer School (ISWS) 2024: Group Project Presentation",
    dateIso: "2024-06-15",
    dateLabel: "2024",
    description:
      "...",
    venueTags: ["Summer School"],
    topicTags: ["Semantic Web", "Data Science"],
  },
  "eswc-phdsymp-pangquin": {
    title: "ESWC PhD Symposium 2024: PENGQUIN Presentation",
    dateIso: "2024-05-28",
    dateLabel: "2024",
    description:
      "...",
    venueTags: ["Conference"],
    topicTags: ["Semantic Web", "Genomics", "Bioinformatics"],
  },
  "solidsymp-genomepods": {
    title: "Solid Symposium 2024: Genome Pods Talk",
    dateIso: "2024-04-02",
    dateLabel: "2024",
    description:
      "...",
    venueTags: ["Symposium"],
    topicTags: ["Semantic Web", "Data Science", "Genomics"],
  },
  "18m-vito-internal-jury": {
    title: "18-Month Internal VITO PhD Jury Presentation",
    dateIso: "2025-11-20",
    dateLabel: "2025",
    description:
      "Progress review summarizing technical milestones, validation outcomes, and next-phase planning for the PENGQUIN PhD.",
    venueTags: ["Internal Meeting"],
    topicTags: ["Data Science", "Genomics"],
  },
  "sib-researchstay-reflection": {
    title: "SIB Research Stay Reflection Talk",
    dateIso: "2025-05-015",
    dateLabel: "2025",
    description:
      "...",
    venueTags: ["Internal Meeting"],
    topicTags: ["Bioinformatics", "Semantic Web", "Data Science"],
  },
  "solid-intro-triple-consortium": {
    title: "TRIPLE Intro to Solid",
    dateIso: "2025-10-10",
    dateLabel: "2024",
    description:
      "...",
    venueTags: ["Consortium Meeting"],
    topicTags: ["Semantic Web", "Data Science"],
  },
  "swissprot-talk": {
    title: "SwissProt Presentation",
    dateIso: "2025-03-25",
    dateLabel: "2025",
    description:
      "...",
    venueTags: ["Research Stay Presentation"],
    topicTags: ["Bioinformatics", "Semantic Web", "Genomics"],
  },
  "ugent-genomics-talk": {
    title: "An Intro to Genomics for Computer Scientists",
    dateIso: "2024-03-04",
    dateLabel: "2024",
    description:
      "...",
    venueTags: ["Internal Meeting"],
    topicTags: ["Genomics", "Data Science"],
  },
};
