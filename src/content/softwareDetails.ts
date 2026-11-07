import type { DetailField, SoftwareRecord } from "./types";
import type { SoftwareReleaseInfo } from "../data/softwareReleases";

export function softwareDetailRows(
  entry: SoftwareRecord,
  sectionTitle: string,
  release?: SoftwareReleaseInfo | null,
): DetailField[] {
  const rows: DetailField[] = [
    { label: "Section", value: sectionTitle },
    { label: "Type", value: entry.type },
    { label: "Purpose", value: entry.purpose },
  ];
  for (const [role, label] of [
    ["repository", "Git Repository"],
    ["website", "Web Page"],
    ["documentation", "Documentation"],
  ] as const) {
    const url = entry.links?.[role];
    if (url) rows.push({ label, value: url, href: url });
  }
  const releaseLabel = release?.name || release?.tagName;
  if (releaseLabel)
    rows.push({
      label: "Latest Release",
      value: releaseLabel,
      href: release?.url ?? undefined,
    });
  if (release?.publishedAt)
    rows.push({
      label: "Latest Release Date",
      value: release.publishedAt.slice(0, 10),
    });
  return [...rows, ...(entry.extraDetails ?? [])];
}
