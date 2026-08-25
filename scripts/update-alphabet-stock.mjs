#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const outputPath = path.join(rootDir, "public", "alphabet-stock.json");
const ticker = "GOOGL";
const sourceUrl = "https://finance.yahoo.com/quote/GOOGL/";

function getFirstCommitIso() {
  const firstCommitHash = execFileSync(
    "git",
    ["rev-list", "--max-parents=0", "--reverse", "HEAD"],
    { cwd: rootDir, encoding: "utf8" },
  ).trim().split(/\r?\n/)[0];

  if (!firstCommitHash) {
    throw new Error("Could not determine the first commit date.");
  }

  return execFileSync(
    "git",
    ["show", "-s", "--format=%aI", firstCommitHash],
    { cwd: rootDir, encoding: "utf8" },
  ).trim();
}

function roundToCents(value) {
  return Math.round(value * 100) / 100;
}

function toIsoDate(timestamp) {
  return new Date(timestamp * 1000).toISOString().slice(0, 10);
}

async function fetchDailyRows(period1) {
  const period2 = Math.floor(Date.now() / 1000) + 24 * 60 * 60;
  const url = new URL(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}`);
  url.searchParams.set("period1", String(period1));
  url.searchParams.set("period2", String(period2));
  url.searchParams.set("interval", "1d");
  url.searchParams.set("events", "history");
  url.searchParams.set("includeAdjustedClose", "true");

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "eliascrum-personal-website/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Stock data request failed with ${response.status} ${response.statusText}.`);
  }

  const payload = await response.json();
  const result = payload?.chart?.result?.[0];
  const timestamps = result?.timestamp;
  const closes = result?.indicators?.quote?.[0]?.close;

  if (!Array.isArray(timestamps) || !Array.isArray(closes)) {
    throw new Error("Stock data response did not contain daily closing prices.");
  }

  const rows = timestamps
    .map((timestamp, index) => ({
      timestamp,
      close: closes[index],
    }))
    .filter((row) => Number.isFinite(row.timestamp) && Number.isFinite(row.close));

  if (rows.length === 0) {
    throw new Error("Stock data response did not contain a usable daily closing price.");
  }

  return {
    currency: result.meta?.currency ?? "USD",
    rows,
  };
}

function makeSnapshot({ firstCommitDate, initialPrice, initialPriceDate, currentDate, currentClose, currency }) {
  const changeAmount = roundToCents(currentClose - initialPrice);
  const changePercent = roundToCents((changeAmount / initialPrice) * 100);

  return {
    ticker,
    company: "Alphabet Inc. Class A",
    currency,
    firstCommitDate,
    initialPriceDate,
    initialPrice: roundToCents(initialPrice),
    currentDate,
    currentClose: roundToCents(currentClose),
    changeAmount,
    changePercent,
    source: "Yahoo Finance",
    sourceUrl,
  };
}

async function loadExistingSnapshot() {
  const serialized = await fs.readFile(outputPath, "utf8").catch(() => null);
  if (!serialized) {
    return null;
  }

  try {
    return JSON.parse(serialized);
  } catch {
    throw new Error(`${outputPath} contains invalid JSON.`);
  }
}

async function createInitialSnapshot(firstCommitIso) {
  const period1 = Math.floor(new Date(firstCommitIso).getTime() / 1000);
  const { currency, rows } = await fetchDailyRows(period1);
  const initial = rows[0];
  const current = rows.at(-1);

  return makeSnapshot({
    firstCommitDate: firstCommitIso.slice(0, 10),
    initialPriceDate: toIsoDate(initial.timestamp),
    initialPrice: initial.close,
    currentDate: toIsoDate(current.timestamp),
    currentClose: current.close,
    currency,
  });
}

async function updateExistingSnapshot(existing, firstCommitIso) {
  const initialPrice = Number.isFinite(existing.initialPrice)
    ? existing.initialPrice
    : existing.baselineClose;
  const initialPriceDate = existing.initialPriceDate ?? existing.baselineDate;

  if (!Number.isFinite(initialPrice) || !initialPriceDate) {
    return createInitialSnapshot(firstCommitIso);
  }

  const twoWeeksAgo = Math.floor(Date.now() / 1000) - 14 * 24 * 60 * 60;
  const { currency, rows } = await fetchDailyRows(twoWeeksAgo);
  const current = rows.at(-1);

  return makeSnapshot({
    firstCommitDate: existing.firstCommitDate ?? firstCommitIso.slice(0, 10),
    initialPriceDate,
    initialPrice,
    currentDate: toIsoDate(current.timestamp),
    currentClose: current.close,
    currency: existing.currency ?? currency,
  });
}

async function writeSnapshot(snapshot) {
  const serialized = `${JSON.stringify(snapshot, null, 2)}\n`;
  const existing = await fs.readFile(outputPath, "utf8").catch(() => null);

  if (existing === serialized) {
    console.log(`Alphabet stock snapshot is already current for ${snapshot.currentDate}.`);
    return;
  }

  await fs.writeFile(outputPath, serialized, "utf8");
  console.log(
    `Updated ${ticker}: ${snapshot.currentClose} ${snapshot.currency} on ${snapshot.currentDate}; `
      + `${snapshot.changePercent}% since ${snapshot.firstCommitDate}.`,
  );
}

const firstCommitIso = getFirstCommitIso();
const existingSnapshot = await loadExistingSnapshot();
const snapshot = existingSnapshot
  ? await updateExistingSnapshot(existingSnapshot, firstCommitIso)
  : await createInitialSnapshot(firstCommitIso);

await writeSnapshot(snapshot);
