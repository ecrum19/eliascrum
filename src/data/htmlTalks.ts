import type { TalkEntry } from "./talksData";

// HTML decks are maintained separately from the generated PDF inventory so that
// build:slides preserves them without requiring a local PDF source.
export const htmlTalks: TalkEntry[] = [
  {
    slug: "metabolinkai",
    title: "From personal genomes to federated queries",
    sourceFile: "https://ecrum19.github.io/MetaboLinkAI-Slides/",
    dateIso: "2026-10-08",
    dateLabel: "08/10/2026",
    slidePath: "https://ecrum19.github.io/MetaboLinkAI-Slides/",
    slideFormat: "html",
  },
];
