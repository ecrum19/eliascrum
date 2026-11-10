import { resolvePublicAssetPath } from "../utils/publicAssetPath";
import { blogPosts, type BlogPost } from "./blogPostsData";
import { entryPath, publicationCatalog, talkCatalog } from "../content/catalog";

export type HomepageUpdateType = "Publication" | "Talk" | "Blog";

export interface HomepageUpdate {
  id: string;
  type: HomepageUpdateType;
  dateIso: string; // YYYY-MM-DD
  dateLabel: string;
  title: string;
  summary: string;
  link: string;
  linkLabel: string;
}

// Required source fields for automatic "Recent Work" generation.
export type RequiredBlogUpdateFields = Pick<
  BlogPost,
  "id" | "title" | "dateIso" | "summary" | "url" | "linkLabel"
>;

const DATE_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  year: "numeric",
  month: "short",
  day: "2-digit",
});

function isIsoDateLike(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function toDateLabel(dateIso: string): string {
  if (!isIsoDateLike(dateIso)) {
    return dateIso;
  }

  const parsed = new Date(`${dateIso}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    return dateIso;
  }

  return DATE_FORMATTER.format(parsed);
}

function toComparableDate(dateIso: string): string {
  if (!isIsoDateLike(dateIso)) {
    return "0000-00-00";
  }
  return dateIso;
}

function resolveUpdateLink(url: string): string {
  return url.startsWith("/") ? resolvePublicAssetPath(url) : url;
}

function getPublicationUpdates(): HomepageUpdate[] {
  return publicationCatalog.entries.map((publication) => ({
    id: `publication:${publication.id}`,
    type: "Publication",
    dateIso: String(publication.date),
    dateLabel: toDateLabel(String(publication.date)),
    title: publication.title,
    summary: publication.summary,
    link: resolvePublicAssetPath(entryPath(publication)),
    linkLabel: "Read publication",
  }));
}

function getTalkUpdates(): HomepageUpdate[] {
  return talkCatalog.entries.map((talk) => ({
    id: `talk:${talk.id}`,
    type: "Talk",
    dateIso: String(talk.date),
    dateLabel: toDateLabel(String(talk.date)),
    title: talk.title,
    summary: talk.summary,
    link: resolvePublicAssetPath(entryPath(talk)),
    linkLabel: "View talk",
  }));
}

function getBlogUpdates(): HomepageUpdate[] {
  return blogPosts.map((blogPost: RequiredBlogUpdateFields) => ({
    id: `blog:${blogPost.id}`,
    type: "Blog",
    dateIso: blogPost.dateIso,
    dateLabel: toDateLabel(blogPost.dateIso),
    title: blogPost.title,
    summary: blogPost.summary,
    link: resolveUpdateLink(blogPost.url),
    linkLabel: blogPost.linkLabel,
  }));
}

export function getAllHomepageUpdates(): HomepageUpdate[] {
  const updates = [
    ...getPublicationUpdates(),
    ...getTalkUpdates(),
    ...getBlogUpdates(),
  ];

  // On the same day, a paper leads its own presentation.
  const typeOrder: HomepageUpdateType[] = ["Publication", "Talk", "Blog"];
  return updates.sort((a, b) => {
    const byDate = toComparableDate(b.dateIso).localeCompare(toComparableDate(a.dateIso));
    if (byDate !== 0) {
      return byDate;
    }

    const byType = typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type);
    return byType || a.title.localeCompare(b.title);
  });
}

export function getRecentHomepageUpdates(limit = 1): HomepageUpdate[] {
  if (limit <= 0) {
    return [];
  }

  return getAllHomepageUpdates().slice(0, limit);
}
