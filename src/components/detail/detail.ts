import type { RouteLocationRaw } from "vue-router";
import type { TagColor } from "../ui/tagColors";

/** A header action: a router link (`to`) or a document/external link (`href`). */
export interface DetailAction {
  label: string;
  to?: RouteLocationRaw;
  href?: string;
}

export interface DetailTag {
  label: string;
  category: string;
  color: TagColor;
  to: RouteLocationRaw;
}

/** A tag that links back to its listing, filtered by that tag. */
export function listingTag(
  listingPath: string,
  filter: string,
  value: string,
  category: string,
  color: TagColor,
): DetailTag {
  return { label: value, category, color, to: { path: listingPath, query: { tag: filter, value } } };
}

export interface DetailTocSection {
  id: string;
  label: string;
  /** Previews are top-level entries; descriptive sections nest under the overview. */
  level?: 1 | 2;
  show?: unknown;
}

/** Every detail page lists its sections in page order after the shared overview. */
export function detailToc(sections: DetailTocSection[]) {
  return [
    { id: "detail-overview", label: "Overview", level: 1 },
    ...sections
      .filter((section) => !("show" in section) || Boolean(section.show))
      .map(({ id, label, level = 2 }) => ({ id, label, level })),
  ];
}
