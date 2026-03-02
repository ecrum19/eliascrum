const ABSOLUTE_OR_SPECIAL_URL_PATTERN = /^(?:[a-z][a-z\d+\-.]*:|\/\/)/i;

export function resolvePublicAssetPath(assetPath: string): string {
  if (!assetPath) {
    return assetPath;
  }

  if (ABSOLUTE_OR_SPECIAL_URL_PATTERN.test(assetPath)) {
    return assetPath;
  }

  const baseUrl = import.meta.env.BASE_URL || "/";
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const normalizedPath = assetPath.replace(/^\/+/, "");

  return `${normalizedBase}${normalizedPath}`;
}
