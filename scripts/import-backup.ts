// Save a demo backup of a real extraction: bun scripts/import-backup.ts <youtube-url> [model]
// Runs the extraction plus a consistency pass (steps vs ingredient list) and writes
// src/data/imports/<videoId>.json, which the Import screen falls back to on error/timeout.
// Bun loads GEMINI_API_KEY from .env.local automatically.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { extractForBackup } from "../src/lib/gemini.server";

const [url, model] = process.argv.slice(2);
if (!url) {
  console.error("Usage: bun scripts/import-backup.ts <youtube-url> [model]");
  process.exit(1);
}

const started = Date.now();
try {
  const { imported, added } = await extractForBackup(url, { model });
  const dir = join(import.meta.dir, "..", "src", "data", "imports");
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `${imported.source.videoId}.json`);
  writeFileSync(file, JSON.stringify(imported, null, 2) + "\n");
  const r = imported.recipe;
  console.log(`# Saved ${file} in ${((Date.now() - started) / 1000).toFixed(1)}s (${imported.source.model})`);
  console.log(`${r.title} / ${r.en} · ${r.ingredients.length} ingredients · ${r.steps.length} steps · ${Object.keys(imported.en).length} English entries`);
  console.log(added.length ? `Consistency pass added: ${added.join("، ")}` : "Consistency pass: nothing missing");
} catch (e) {
  console.error(`Backup failed after ${((Date.now() - started) / 1000).toFixed(1)}s:`, e instanceof Error ? e.message : e);
  process.exit(1);
}
