import { resolvePublicAssetPath } from "./publicAssetPath";

export const isExternalUrl = (url: string): boolean =>
  /^(?:[a-z][a-z\d+\-.]*:|\/\/)/i.test(url);

/** Public resources get the deployment prefix exactly once. Router links use entryPath instead. */
export function normalizeLinkUrl(url: string): string {
  if (!url || isExternalUrl(url)) return url;
  const base = import.meta.env.BASE_URL || "/";
  const prefix = base.endsWith("/") ? base : `${base}/`;
  return url.startsWith(prefix) ? url : resolvePublicAssetPath(url);
}
export const linkTarget = (url: string): "_blank" | undefined =>
  isExternalUrl(url) ? "_blank" : undefined;
export const linkRel = (url: string): string | undefined =>
  isExternalUrl(url) ? "noopener noreferrer" : undefined;
