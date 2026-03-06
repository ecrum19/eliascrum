#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const DEFAULT_DATA_PATH = path.join(rootDir, "src", "data", "rdf", "site-data.ttl");
const DEFAULT_PREFIXES = {
  rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
  rdfs: "http://www.w3.org/2000/01/rdf-schema#",
  xsd: "http://www.w3.org/2001/XMLSchema#",
  schema: "https://schema.org/",
  dcterms: "http://purl.org/dc/terms/",
  skos: "http://www.w3.org/2004/02/skos/core#",
  ec: "https://eliascrum.github.io/eliascrum/vocab#",
};

function printUsageAndExit() {
  console.log(
    [
      "Usage:",
      "  node scripts/apply-rdf-update.mjs --update <file.ru> [--data <site-data.ttl>] [--dry-run]",
      "",
      "Supported SPARQL update forms:",
      "  PREFIX ...",
      "  INSERT DATA { <s> <p> <o> . ... }",
      "  DELETE DATA { <s> <p> <o> . ... }",
      "",
      "Notes:",
      "  - Only DATA updates are supported in this script.",
      "  - Triples inside DATA blocks must be one triple per line.",
      "  - Prefixes can be declared with PREFIX statements.",
    ].join("\n"),
  );
  process.exit(1);
}

function parseArgs(argv) {
  const args = {
    updateFile: null,
    dataFile: DEFAULT_DATA_PATH,
    dryRun: false,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--update") {
      args.updateFile = argv[i + 1];
      i += 1;
      continue;
    }
    if (token === "--data") {
      args.dataFile = argv[i + 1];
      i += 1;
      continue;
    }
    if (token === "--dry-run") {
      args.dryRun = true;
      continue;
    }
    if (token === "--help" || token === "-h") {
      printUsageAndExit();
    }
    throw new Error(`Unknown argument: ${token}`);
  }

  if (!args.updateFile) {
    throw new Error("Missing required argument: --update <file.ru>");
  }

  return args;
}

function escapeLiteralValue(value) {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t")
    .replace(/"/g, '\\"');
}

function normalizeLiteralToken(token, prefixMap) {
  const literalMatch = token.match(/^"((?:\\.|[^"\\])*)"(?:(@[A-Za-z0-9-]+)|\^\^(.+))?$/s);
  if (!literalMatch) {
    throw new Error(`Unsupported literal token: ${token}`);
  }

  const [, rawLexicalForm, langTag, datatypeToken] = literalMatch;
  const lexicalForm = rawLexicalForm
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");
  const escapedLexical = escapeLiteralValue(lexicalForm);

  if (langTag) {
    return `"${escapedLexical}"${langTag.toLowerCase()}`;
  }

  if (!datatypeToken) {
    return `"${escapedLexical}"`;
  }

  const datatypeIri = resolveIriToken(datatypeToken.trim(), prefixMap);
  return `"${escapedLexical}"^^<${datatypeIri}>`;
}

function resolveIriToken(token, prefixMap) {
  const trimmed = token.trim();

  const iriMatch = trimmed.match(/^<([^>]+)>$/);
  if (iriMatch) {
    return iriMatch[1];
  }

  const prefixedMatch = trimmed.match(/^([A-Za-z][\w-]*):([A-Za-z0-9._-]+)$/);
  if (prefixedMatch) {
    const [, prefix, local] = prefixedMatch;
    const namespace = prefixMap[prefix];
    if (!namespace) {
      throw new Error(`Unknown prefix: ${prefix} in token ${token}`);
    }
    return `${namespace}${local}`;
  }

  throw new Error(`Unsupported IRI token: ${token}`);
}

function parseObjectToken(token, prefixMap) {
  const trimmed = token.trim();
  if (trimmed.startsWith('"')) {
    return normalizeLiteralToken(trimmed, prefixMap);
  }
  const iriValue = resolveIriToken(trimmed, prefixMap);
  return `<${iriValue}>`;
}

function parseTripleLine(line, prefixMap) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) {
    return null;
  }

  const tripleMatch = trimmed.match(/^(.+?)\s+(.+?)\s+(.+)\s*\.\s*$/);
  if (!tripleMatch) {
    throw new Error(`Invalid triple line: ${line}`);
  }

  const [, rawSubject, rawPredicate, rawObject] = tripleMatch;
  const subjectIri = resolveIriToken(rawSubject, prefixMap);
  const predicateIri = resolveIriToken(rawPredicate, prefixMap);
  const objectTerm = parseObjectToken(rawObject, prefixMap);

  return `<${subjectIri}> <${predicateIri}> ${objectTerm} .`;
}

function parsePrefixesFromText(text) {
  const prefixes = {};
  const prefixRegex = /(?:^|\n)\s*(?:@prefix|PREFIX)\s+([A-Za-z][\w-]*):\s*<([^>]+)>\s*\.\s*(?=\n|$)|(?:^|\n)\s*PREFIX\s+([A-Za-z][\w-]*):\s*<([^>]+)>\s*(?=\n|$)/gi;
  let match = prefixRegex.exec(text);
  while (match) {
    const prefix = match[1] ?? match[3];
    const iri = match[2] ?? match[4];
    prefixes[prefix] = iri;
    match = prefixRegex.exec(text);
  }
  return prefixes;
}

function extractDataBlocks(keyword, text) {
  const blocks = [];
  const regex = new RegExp(`${keyword}\\s+DATA\\s*\\{([\\s\\S]*?)\\}`, "gi");
  let match = regex.exec(text);
  while (match) {
    blocks.push(match[1]);
    match = regex.exec(text);
  }
  return blocks;
}

function parseTriplesFromBlock(block, prefixMap) {
  const triples = [];
  const lines = block
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));

  lines.forEach((line) => {
    const triple = parseTripleLine(line, prefixMap);
    if (triple) {
      triples.push(triple);
    }
  });
  return triples;
}

function compactIri(iri, prefixMap) {
  const candidates = Object.entries(prefixMap)
    .filter(([, ns]) => iri.startsWith(ns))
    .sort((a, b) => b[1].length - a[1].length);

  for (const [prefix, namespace] of candidates) {
    const local = iri.slice(namespace.length);
    if (/^[A-Za-z][A-Za-z0-9._-]*$/.test(local)) {
      return `${prefix}:${local}`;
    }
  }

  return `<${iri}>`;
}

function compactCanonicalTriple(canonicalTriple, prefixMap) {
  const tripleMatch = canonicalTriple.match(/^<([^>]+)>\s+<([^>]+)>\s+(.+)\s+\.$/);
  if (!tripleMatch) {
    throw new Error(`Invalid canonical triple: ${canonicalTriple}`);
  }

  const [, subjectIri, predicateIri, objectToken] = tripleMatch;
  let compactObject = objectToken;
  const iriObjectMatch = objectToken.match(/^<([^>]+)>$/);
  if (iriObjectMatch) {
    compactObject = compactIri(iriObjectMatch[1], prefixMap);
  }

  const literalDatatypeMatch = objectToken.match(/^"((?:\\.|[^"\\])*)"\^\^<([^>]+)>$/);
  if (literalDatatypeMatch) {
    const lexical = literalDatatypeMatch[1];
    const datatypeIri = literalDatatypeMatch[2];
    compactObject = `"${lexical}"^^${compactIri(datatypeIri, prefixMap)}`;
  }

  return `${compactIri(subjectIri, prefixMap)} ${compactIri(predicateIri, prefixMap)} ${compactObject} .`;
}

function serializePrefixMap(prefixMap) {
  const prefixNames = Object.keys(prefixMap).sort((a, b) => a.localeCompare(b));
  return prefixNames.map((prefix) => `@prefix ${prefix}: <${prefixMap[prefix]}> .`).join("\n");
}

async function main() {
  const args = parseArgs(process.argv);
  const absoluteUpdatePath = path.resolve(rootDir, args.updateFile);
  const absoluteDataPath = path.resolve(rootDir, args.dataFile);

  const [updateText, existingDataText] = await Promise.all([
    fs.readFile(absoluteUpdatePath, "utf8"),
    fs.readFile(absoluteDataPath, "utf8").catch(() => ""),
  ]);

  const dataPrefixes = {
    ...DEFAULT_PREFIXES,
    ...parsePrefixesFromText(existingDataText),
  };
  const updatePrefixes = parsePrefixesFromText(updateText);
  const prefixMap = {
    ...dataPrefixes,
    ...updatePrefixes,
  };

  const dataTripleSet = new Set();
  existingDataText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(
      (line) =>
        line.length > 0 &&
        !line.startsWith("#") &&
        !line.startsWith("@prefix"),
    )
    .forEach((line) => {
      const canonical = parseTripleLine(line, prefixMap);
      if (canonical) {
        dataTripleSet.add(canonical);
      }
    });

  const insertTriples = [];
  extractDataBlocks("INSERT", updateText).forEach((block) => {
    insertTriples.push(...parseTriplesFromBlock(block, prefixMap));
  });

  const deleteTriples = [];
  extractDataBlocks("DELETE", updateText).forEach((block) => {
    deleteTriples.push(...parseTriplesFromBlock(block, prefixMap));
  });

  let removedCount = 0;
  deleteTriples.forEach((triple) => {
    if (dataTripleSet.delete(triple)) {
      removedCount += 1;
    }
  });

  let insertedCount = 0;
  insertTriples.forEach((triple) => {
    if (!dataTripleSet.has(triple)) {
      dataTripleSet.add(triple);
      insertedCount += 1;
    }
  });

  const sortedTriples = [...dataTripleSet]
    .sort((a, b) => a.localeCompare(b))
    .map((triple) => compactCanonicalTriple(triple, prefixMap));
  const output = [
    "# Updated by scripts/apply-rdf-update.mjs",
    "",
    serializePrefixMap(prefixMap),
    "",
    sortedTriples.join("\n"),
    "",
  ].join("\n");

  if (!args.dryRun) {
    await fs.mkdir(path.dirname(absoluteDataPath), { recursive: true });
    await fs.writeFile(absoluteDataPath, output, "utf8");
  }

  console.log(
    `${args.dryRun ? "[dry-run] " : ""}Applied RDF update (${insertedCount} inserted, ${removedCount} removed, ${sortedTriples.length} total triples).`,
  );
  console.log(`Data file: ${path.relative(rootDir, absoluteDataPath)}`);
  console.log(`Update file: ${path.relative(rootDir, absoluteUpdatePath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
