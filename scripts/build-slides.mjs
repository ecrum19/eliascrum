import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { spawn } from "child_process";

const rootDir = process.cwd();
// Input precedence:
// 1) temporary ./slides + ./posters directories (for easy updates)
// 2) archived bundles in ./.talk-assets/*.tar.gz (default long-term storage)
const legacySlidesSourceDir = path.join(rootDir, "slides");
const legacyPostersSourceDir = path.join(rootDir, "posters");
const archivedSourcesDir = path.join(rootDir, ".talk-assets");
const slidesArchivePath = path.join(archivedSourcesDir, "slides.tar.gz");
const postersArchivePath = path.join(archivedSourcesDir, "posters.tar.gz");

const talksBasePublicDir = path.join(rootDir, "public", "talks");
const slidesPublicDir = path.join(talksBasePublicDir, "slides");
const postersPublicDir = path.join(talksBasePublicDir, "posters");

const talksDataPath = path.join(rootDir, "src", "data", "talksData.ts");

const GHOSTSCRIPT_REPLACE_THRESHOLD = 0.97;
const PDF_COLOR_DPI = "200";
const PDF_GRAY_DPI = "200";
const PDF_MONO_DPI = "300";

const MANUAL_POSTER_MAP = {
  "pengquin-eswc-2024": "ESWC_24_Poster_EDC.pdf",
};

const STOP_WORDS = new Set([
  "edc",
  "poster",
  "presentation",
  "intro",
  "official",
  "pitch",
  "the",
  "and",
  "for",
  "talk",
  "slides",
  "slide",
]);

function toSlug(input) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toTitleFromStem(stem) {
  return stem
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function tokenize(input) {
  return input
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function parseDateInfo(name) {
  const compactDateMatch = name.match(/(^|[^0-9])(\d{2})(\d{2})(\d{2})([^0-9]|$)/);
  if (compactDateMatch) {
    const day = compactDateMatch[2];
    const month = compactDateMatch[3];
    const year = Number(compactDateMatch[4]) + 2000;
    const iso = `${year}-${month}-${day}`;
    const label = `${day}/${month}/${year}`;
    return { iso, label };
  }

  const fourDigitYearMatch = name.match(/(20\d{2})/);
  if (fourDigitYearMatch) {
    const year = fourDigitYearMatch[1];
    return { iso: `${year}-01-01`, label: year };
  }

  const twoDigitYearMatch = name.match(/(^|[^0-9])(\d{2})(?=[^a-zA-Z0-9]|$)/);
  if (twoDigitYearMatch) {
    const shortYear = Number(twoDigitYearMatch[2]);
    if (shortYear >= 20 && shortYear <= 39) {
      const year = `20${String(shortYear).padStart(2, "0")}`;
      return { iso: `${year}-01-01`, label: year };
    }
  }

  return {
    iso: "1900-01-01",
    label: "Undated",
  };
}

function jaccardScore(tokensA, tokensB) {
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  const union = new Set([...setA, ...setB]);
  if (union.size === 0) {
    return 0;
  }
  let intersectionCount = 0;
  setA.forEach((token) => {
    if (setB.has(token)) {
      intersectionCount += 1;
    }
  });
  return intersectionCount / union.size;
}

function escapeForTs(value) {
  return JSON.stringify(value);
}

function runCommand(command, args, options = {}) {
  const stdio = options.stdio || "inherit";
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio, cwd: options.cwd });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

async function commandExists(command) {
  try {
    await runCommand("which", [command], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function clearDir(dir) {
  await fs.rm(dir, { recursive: true, force: true });
  await fs.mkdir(dir, { recursive: true });
}

async function listFiles(dir, extension) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(extension))
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function extractArchive(archivePath, targetDir) {
  await ensureDir(targetDir);
  await runCommand("tar", ["-xzf", archivePath, "-C", targetDir], { stdio: "ignore" });
}

async function createArchiveFromDir(sourceDir, archivePath) {
  const pdfFiles = await listFiles(sourceDir, ".pdf");
  if (pdfFiles.length === 0) {
    return false;
  }

  await ensureDir(path.dirname(archivePath));
  await fs.rm(archivePath, { force: true });
  await runCommand("tar", ["-czf", archivePath, "-C", sourceDir, ...pdfFiles], {
    stdio: "ignore",
  });
  return true;
}

async function resolveSourceDir(kind, archivePath, legacyDir, tempDir) {
  const legacyPdfFiles = await listFiles(legacyDir, ".pdf");
  if (legacyPdfFiles.length > 0) {
    return {
      kind,
      dir: legacyDir,
      usedArchive: false,
      archivePath,
      legacyDir,
    };
  }

  if (await fileExists(archivePath)) {
    const extractedDir = path.join(tempDir, kind);
    await extractArchive(archivePath, extractedDir);
    return {
      kind,
      dir: extractedDir,
      usedArchive: true,
      archivePath,
      legacyDir,
    };
  }

  return {
    kind,
    dir: legacyDir,
    usedArchive: false,
    archivePath,
    legacyDir,
  };
}

async function compressPdfInPlace(pdfPath, ghostscriptAvailable) {
  if (!ghostscriptAvailable) {
    return { processed: false, replaced: false, bytesSaved: 0 };
  }

  const tempPath = `${pdfPath}.compressed.pdf`;

  try {
    await runCommand(
      "gs",
      [
        "-sDEVICE=pdfwrite",
        "-dCompatibilityLevel=1.6",
        "-dNOPAUSE",
        "-dBATCH",
        "-dQUIET",
        "-dSAFER",
        "-dDetectDuplicateImages=true",
        "-dCompressFonts=true",
        "-dSubsetFonts=true",
        "-dAutoRotatePages=/None",
        "-dDownsampleColorImages=true",
        "-dColorImageDownsampleType=/Bicubic",
        `-dColorImageResolution=${PDF_COLOR_DPI}`,
        "-dDownsampleGrayImages=true",
        "-dGrayImageDownsampleType=/Bicubic",
        `-dGrayImageResolution=${PDF_GRAY_DPI}`,
        "-dDownsampleMonoImages=true",
        "-dMonoImageDownsampleType=/Subsample",
        `-dMonoImageResolution=${PDF_MONO_DPI}`,
        `-sOutputFile=${tempPath}`,
        pdfPath,
      ],
      { stdio: "ignore" }
    );

    if (!(await fileExists(tempPath))) {
      return { processed: true, replaced: false, bytesSaved: 0 };
    }

    const original = await fs.stat(pdfPath);
    const compressed = await fs.stat(tempPath);

    if (compressed.size < original.size * GHOSTSCRIPT_REPLACE_THRESHOLD) {
      await fs.rm(pdfPath, { force: true });
      await fs.rename(tempPath, pdfPath);
      return {
        processed: true,
        replaced: true,
        bytesSaved: original.size - compressed.size,
      };
    }

    await fs.rm(tempPath, { force: true });
    return { processed: true, replaced: false, bytesSaved: 0 };
  } catch {
    await fs.rm(tempPath, { force: true });
    return { processed: false, replaced: false, bytesSaved: 0 };
  }
}

async function main() {
  await ensureDir(path.dirname(talksDataPath));
  const tarAvailable = await commandExists("tar");
  if (!tarAvailable) {
    throw new Error("`tar` is required but was not found on PATH.");
  }

  const tempSourcesDir = await fs.mkdtemp(path.join(os.tmpdir(), "talk-sources-"));

  try {
    const slideSource = await resolveSourceDir(
      "slides",
      slidesArchivePath,
      legacySlidesSourceDir,
      tempSourcesDir
    );
    const posterSource = await resolveSourceDir(
      "posters",
      postersArchivePath,
      legacyPostersSourceDir,
      tempSourcesDir
    );

    const slidePdfFiles = await listFiles(slideSource.dir, ".pdf");
    const posterFiles = await listFiles(posterSource.dir, ".pdf");

    if (slidePdfFiles.length === 0) {
      throw new Error(
        "No slide PDFs found. Add files to ./slides once, or keep them in ./.talk-assets/slides.tar.gz."
      );
    }

    const ghostscriptAvailable = await commandExists("gs");
    if (!ghostscriptAvailable) {
      console.warn(
        "Ghostscript not found. PDF compression is skipped. Install `ghostscript` for smaller PDFs."
      );
    }

    await clearDir(slidesPublicDir);
    await clearDir(postersPublicDir);

    const posterMeta = [];
    let processedPdfCount = 0;
    let compressedPdfCount = 0;
    let totalBytesSaved = 0;

    for (const fileName of posterFiles) {
      const sourcePath = path.join(posterSource.dir, fileName);
      const outputPath = path.join(postersPublicDir, fileName);
      await fs.copyFile(sourcePath, outputPath);

      const compression = await compressPdfInPlace(outputPath, ghostscriptAvailable);
      if (compression.processed) {
        processedPdfCount += 1;
      }
      if (compression.replaced) {
        compressedPdfCount += 1;
        totalBytesSaved += compression.bytesSaved;
      }

      const stem = fileName.replace(/\.pdf$/i, "");
      posterMeta.push({
        fileName,
        slug: toSlug(stem),
        title: toTitleFromStem(stem),
        path: `/talks/posters/${encodeURIComponent(fileName)}`,
        tokens: tokenize(stem),
      });
    }

    const talks = [];

    for (const fileName of slidePdfFiles) {
      const sourcePdfPath = path.join(slideSource.dir, fileName);
      const stem = fileName.replace(/\.pdf$/i, "");
      const slug = toSlug(stem);
      const date = parseDateInfo(stem);
      const outputPdfPath = path.join(slidesPublicDir, `${slug}.pdf`);

      await fs.copyFile(sourcePdfPath, outputPdfPath);

      const compression = await compressPdfInPlace(outputPdfPath, ghostscriptAvailable);
      if (compression.processed) {
        processedPdfCount += 1;
      }
      if (compression.replaced) {
        compressedPdfCount += 1;
        totalBytesSaved += compression.bytesSaved;
      }

      talks.push({
        slug,
        title: toTitleFromStem(stem),
        sourceFile: fileName,
        dateIso: date.iso,
        dateLabel: date.label,
        slidePath: `/talks/slides/${slug}.pdf`,
        posterPath: undefined,
        posterTitle: undefined,
        tokens: tokenize(stem),
      });
    }

    const assignedPoster = new Set();

    talks.forEach((talk) => {
      const manualPosterFile = MANUAL_POSTER_MAP[talk.slug];
      if (!manualPosterFile) {
        return;
      }
      const poster = posterMeta.find((item) => item.fileName === manualPosterFile);
      if (!poster) {
        return;
      }
      talk.posterPath = poster.path;
      talk.posterTitle = poster.title;
      assignedPoster.add(poster.fileName);
    });

    talks.forEach((talk) => {
      if (talk.posterPath) {
        return;
      }

      let bestPoster = null;
      let bestScore = 0;

      posterMeta.forEach((poster) => {
        if (assignedPoster.has(poster.fileName)) {
          return;
        }

        const score = jaccardScore(talk.tokens, poster.tokens);
        if (score > bestScore) {
          bestScore = score;
          bestPoster = poster;
        }
      });

      if (bestPoster && bestScore >= 0.35) {
        talk.posterPath = bestPoster.path;
        talk.posterTitle = bestPoster.title;
        assignedPoster.add(bestPoster.fileName);
      }
    });

    talks.sort((a, b) => b.dateIso.localeCompare(a.dateIso));

    const talksTsObjects = talks
      .map((talk) => {
        return [
          "  {",
          `    slug: ${escapeForTs(talk.slug)},`,
          `    title: ${escapeForTs(talk.title)},`,
          `    sourceFile: ${escapeForTs(talk.sourceFile)},`,
          `    dateIso: ${escapeForTs(talk.dateIso)},`,
          `    dateLabel: ${escapeForTs(talk.dateLabel)},`,
          `    slidePath: ${escapeForTs(talk.slidePath)},`,
          talk.posterPath ? `    posterPath: ${escapeForTs(talk.posterPath)},` : "",
          talk.posterTitle ? `    posterTitle: ${escapeForTs(talk.posterTitle)},` : "",
          "  },",
        ]
          .filter(Boolean)
          .join("\n");
      })
      .join("\n");

    const postersTsObjects = posterMeta
      .map((poster) => {
        return [
          "  {",
          `    slug: ${escapeForTs(poster.slug)},`,
          `    title: ${escapeForTs(poster.title)},`,
          `    path: ${escapeForTs(poster.path)},`,
          "  },",
        ].join("\n");
      })
      .join("\n");

    const talksData = `/* eslint-disable */
// This file is auto-generated by scripts/build-slides.mjs
// Run: npm run build:slides

export interface TalkEntry {
  slug: string;
  title: string;
  sourceFile: string;
  dateIso: string;
  dateLabel: string;
  slidePath: string;
  posterPath?: string;
  posterTitle?: string;
}

export interface PosterEntry {
  slug: string;
  title: string;
  path: string;
}

export const talks: TalkEntry[] = [
${talksTsObjects}
];

export const posters: PosterEntry[] = [
${postersTsObjects}
];
`;

    await fs.writeFile(talksDataPath, talksData, "utf8");

    let archivedSlides = false;
    let archivedPosters = false;

    if (!slideSource.usedArchive && (await fileExists(slideSource.legacyDir))) {
      const createdArchive = await createArchiveFromDir(slideSource.legacyDir, slideSource.archivePath);
      if (createdArchive) {
        await fs.rm(slideSource.legacyDir, { recursive: true, force: true });
        archivedSlides = true;
      }
    }

    if (
      posterFiles.length > 0 &&
      !posterSource.usedArchive &&
      (await fileExists(posterSource.legacyDir))
    ) {
      const createdArchive = await createArchiveFromDir(posterSource.legacyDir, posterSource.archivePath);
      if (createdArchive) {
        await fs.rm(posterSource.legacyDir, { recursive: true, force: true });
        archivedPosters = true;
      }
    }

    const mbSaved = (totalBytesSaved / (1024 * 1024)).toFixed(2);
    const archiveSummary = [
      archivedSlides ? "slides archived to .talk-assets/slides.tar.gz" : null,
      archivedPosters ? "posters archived to .talk-assets/posters.tar.gz" : null,
    ]
      .filter(Boolean)
      .join("; ");

    console.log(
      `Generated ${talks.length} talks and ${posterMeta.length} posters from PDF inputs. Compressed ${compressedPdfCount}/${processedPdfCount} output PDFs, saved ${mbSaved} MB.${archiveSummary ? ` ${archiveSummary}.` : ""}`
    );
  } finally {
    await fs.rm(tempSourcesDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
