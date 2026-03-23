#!/usr/bin/env node
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import esbuild from "esbuild";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const dataDir = path.join(rootDir, "src", "data");
const outputPath = path.join(dataDir, "softwareReleases.ts");
const cacheDir = path.join(rootDir, ".cache");
const cachePath = path.join(cacheDir, "github-releases-cache.json");
const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const MAX_REFRESH_PER_RUN = Number.parseInt(process.env.GITHUB_RELEASE_MAX_REFRESH ?? "6", 10);

function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function loadTsModule(relativeFilePath) {
  const absoluteInputPath = path.join(dataDir, relativeFilePath);
  const tempOutputPath = path.join(
    os.tmpdir(),
    `software-release-${slugify(relativeFilePath)}-${Date.now()}-${Math.random().toString(16).slice(2)}.mjs`,
  );

  await esbuild.build({
    entryPoints: [absoluteInputPath],
    bundle: true,
    platform: "node",
    target: ["node20"],
    format: "esm",
    outfile: tempOutputPath,
    logLevel: "silent",
    define: {
      "import.meta.env.BASE_URL": '"/"',
    },
  });

  try {
    return await import(`${pathToFileURL(tempOutputPath).href}?v=${Date.now()}`);
  } finally {
    await fs.unlink(tempOutputPath).catch(() => {});
  }
}

function parseGitHubRepo(repositoryUrl) {
  if (!repositoryUrl || typeof repositoryUrl !== "string") {
    return null;
  }
  try {
    const url = new URL(repositoryUrl);
    if (!/^(www\.)?github\.com$/i.test(url.hostname)) {
      return null;
    }
    const parts = url.pathname.replace(/^\/+|\/+$/g, "").split("/");
    if (parts.length < 2) {
      return null;
    }
    const owner = parts[0];
    const repo = parts[1].replace(/\.git$/i, "");
    if (!owner || !repo) {
      return null;
    }
    return { owner, repo, key: `${owner}/${repo}` };
  } catch {
    return null;
  }
}

function normalizeIsoDate(value) {
  if (!value || typeof value !== "string") {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.toISOString();
}

async function readJsonIfExists(filePath) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function createHeaders(etag) {
  const token = process.env.GITHUB_TOKEN?.trim();
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "eliascrum-recent-work-export",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (etag) {
    headers["If-None-Match"] = etag;
  }
  return headers;
}

async function fetchLatestRelease(owner, repo, etag = null) {
  const endpoint = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
  const response = await fetch(endpoint, { headers: createHeaders(etag) });

  if (response.status === 304) {
    return { status: "not-modified" };
  }
  if (response.status === 404) {
    return { status: "missing" };
  }
  if (!response.ok) {
    return { status: "error", code: response.status };
  }

  const payload = await response.json();
  return {
    status: "ok",
    etag: response.headers.get("etag") ?? null,
    release: {
      tagName: payload?.tag_name ?? null,
      name: payload?.name ?? null,
      url: payload?.html_url ?? null,
      publishedAt: normalizeIsoDate(payload?.published_at),
    },
  };
}

function safeUrl(value) {
  if (!value || typeof value !== "string") {
    return null;
  }
  try {
    return new URL(value).href;
  } catch {
    return null;
  }
}

async function fetchLatestTagRelease(owner, repo) {
  const tagsEndpoint = `https://api.github.com/repos/${owner}/${repo}/tags?per_page=1`;
  const tagsResponse = await fetch(tagsEndpoint, { headers: createHeaders(null) });
  if (!tagsResponse.ok) {
    return null;
  }

  const tags = await tagsResponse.json();
  const latestTag = Array.isArray(tags) && tags.length > 0 ? tags[0] : null;
  const tagName = latestTag?.name ?? null;
  const commitSha = latestTag?.commit?.sha ?? null;
  if (!tagName) {
    return null;
  }

  let publishedAt = null;
  if (commitSha) {
    const commitEndpoint = `https://api.github.com/repos/${owner}/${repo}/commits/${commitSha}`;
    const commitResponse = await fetch(commitEndpoint, { headers: createHeaders(null) });
    if (commitResponse.ok) {
      const commitPayload = await commitResponse.json();
      publishedAt = normalizeIsoDate(
        commitPayload?.commit?.committer?.date ??
          commitPayload?.commit?.author?.date ??
          null,
      );
    }
  }

  return {
    tagName,
    name: tagName,
    url: safeUrl(`https://github.com/${owner}/${repo}/tree/${encodeURIComponent(tagName)}`),
    publishedAt,
  };
}

async function fetchRepositoryFallback(owner, repo) {
  const repoEndpoint = `https://api.github.com/repos/${owner}/${repo}`;
  const repoResponse = await fetch(repoEndpoint, { headers: createHeaders(null) });
  if (!repoResponse.ok) {
    return null;
  }
  const payload = await repoResponse.json();
  return {
    tagName: null,
    name: payload?.default_branch ? `Latest update (${payload.default_branch})` : "Latest update",
    url: safeUrl(payload?.html_url ?? `https://github.com/${owner}/${repo}`),
    publishedAt: normalizeIsoDate(payload?.pushed_at ?? null),
  };
}

async function fetchFallbackRelease(owner, repo) {
  const tagRelease = await fetchLatestTagRelease(owner, repo);
  if (tagRelease) {
    return tagRelease;
  }
  return fetchRepositoryFallback(owner, repo);
}

function toTsLiteralRelease(entry) {
  if (!entry) {
    return "null";
  }
  const esc = (value) => String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const lines = [
    "{",
    `    tagName: ${entry.tagName ? `"${esc(entry.tagName)}"` : "null"},`,
    `    name: ${entry.name ? `"${esc(entry.name)}"` : "null"},`,
    `    url: ${entry.url ? `"${esc(entry.url)}"` : "null"},`,
    `    publishedAt: ${entry.publishedAt ? `"${esc(entry.publishedAt)}"` : "null"},`,
    "  }",
  ];
  return lines.join("\n");
}

function buildOutputFile(lastUpdatedIso, releasesBySoftwareId) {
  const keys = Object.keys(releasesBySoftwareId).sort((a, b) => a.localeCompare(b));
  const body = keys
    .map((key) => `  "${key}": ${toTsLiteralRelease(releasesBySoftwareId[key])},`)
    .join("\n");

  return `// This file is auto-generated by scripts/update-software-releases.mjs
// Run manually with: npm run update:software-releases

export interface SoftwareReleaseInfo {
  tagName: string | null;
  name: string | null;
  url: string | null;
  publishedAt: string | null;
}

export const softwareReleaseLastUpdatedIso: string | null = ${lastUpdatedIso ? `"${lastUpdatedIso}"` : "null"};

export const softwareReleasesBySoftwareId: Record<string, SoftwareReleaseInfo | null> = {
${body}
};
`;
}

async function main() {
  const [softwareModule, existingOutput, cacheData] = await Promise.all([
    loadTsModule("softwareData.ts"),
    loadTsModule("softwareReleases.ts").catch(() => null),
    readJsonIfExists(cachePath),
  ]);

  const existingMap = existingOutput?.softwareReleasesBySoftwareId ?? {};
  const softwareProjects = softwareModule.softwareProjects ?? [];
  const releasesBySoftwareId = { ...existingMap };
  const now = Date.now();
  const nextCache = {
    repos: { ...(cacheData?.repos ?? {}) },
  };
  const repoResultByKey = {};
  let refreshCount = 0;

  for (const software of softwareProjects) {
    const repo = parseGitHubRepo(software.repositoryUrl);
    if (!repo) {
      continue;
    }

    if (repoResultByKey[repo.key] !== undefined) {
      releasesBySoftwareId[software.id] = repoResultByKey[repo.key];
      continue;
    }

    const cacheEntry = nextCache.repos[repo.key] ?? null;
    if (cacheEntry?.fetchedAt && now - cacheEntry.fetchedAt < CACHE_MAX_AGE_MS) {
      const cachedRelease = cacheEntry.release ?? null;
      releasesBySoftwareId[software.id] = cachedRelease;
      repoResultByKey[repo.key] = cachedRelease;
      continue;
    }

    if (refreshCount >= MAX_REFRESH_PER_RUN) {
      const staleRelease = cacheEntry?.release ?? releasesBySoftwareId[software.id] ?? null;
      releasesBySoftwareId[software.id] = staleRelease;
      repoResultByKey[repo.key] = staleRelease;
      continue;
    }

    try {
      refreshCount += 1;
      const result = await fetchLatestRelease(repo.owner, repo.repo, cacheEntry?.etag ?? null);

      if (result.status === "ok") {
        const fetchedRelease = result.release ?? null;
        releasesBySoftwareId[software.id] = fetchedRelease;
        repoResultByKey[repo.key] = fetchedRelease;
        nextCache.repos[repo.key] = {
          fetchedAt: now,
          etag: result.etag ?? null,
          release: fetchedRelease,
        };
        continue;
      }

      if (result.status === "not-modified") {
        const unchangedRelease = cacheEntry?.release ?? releasesBySoftwareId[software.id] ?? null;
        releasesBySoftwareId[software.id] = unchangedRelease;
        repoResultByKey[repo.key] = unchangedRelease;
        nextCache.repos[repo.key] = {
          fetchedAt: now,
          etag: cacheEntry?.etag ?? null,
          release: unchangedRelease,
        };
        continue;
      }

      if (result.status === "missing") {
        const fallbackRelease = await fetchFallbackRelease(repo.owner, repo.repo);
        releasesBySoftwareId[software.id] = fallbackRelease ?? null;
        repoResultByKey[repo.key] = fallbackRelease ?? null;
        nextCache.repos[repo.key] = {
          fetchedAt: now,
          etag: null,
          release: fallbackRelease ?? null,
        };
        continue;
      }

      releasesBySoftwareId[software.id] = releasesBySoftwareId[software.id] ?? null;
      repoResultByKey[repo.key] = releasesBySoftwareId[software.id];
    } catch {
      releasesBySoftwareId[software.id] = releasesBySoftwareId[software.id] ?? null;
      repoResultByKey[repo.key] = releasesBySoftwareId[software.id];
    }
  }

  const timestamp = new Date().toISOString();
  const output = buildOutputFile(timestamp, releasesBySoftwareId);
  await fs.writeFile(outputPath, output, "utf8");
  await fs.mkdir(cacheDir, { recursive: true });
  await fs.writeFile(cachePath, `${JSON.stringify(nextCache, null, 2)}\n`, "utf8");

  // eslint-disable-next-line no-console
  console.log(`Wrote ${path.relative(rootDir, outputPath)}.`);
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exitCode = 1;
});
