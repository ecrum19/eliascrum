/** Shared tag vocabularies: offered in the filters even before an entry uses them. */
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

/** Derived from `durationMinutes`: up to 15, up to 45, then longer. */
export const DURATION_TAG_OPTIONS = ["Short", "Medium", "Long"] as const;
/** Derived from `audienceSizeApprox`: up to 25, up to 70, then larger. */
export const AUDIENCE_SIZE_TAG_OPTIONS = ["Small", "Medium", "Large"] as const;

export type DurationTag = (typeof DURATION_TAG_OPTIONS)[number];
export type AudienceSizeTag = (typeof AUDIENCE_SIZE_TAG_OPTIONS)[number];
