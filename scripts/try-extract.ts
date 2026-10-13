// Run a real extraction locally: bun scripts/try-extract.ts <youtube-url> [model]
// Bun loads GEMINI_API_KEY from .env.local automatically.
import { extractImportedRecipe } from "../src/lib/gemini.server";

const [url, model] = process.argv.slice(2);
if (!url) {
  console.error("Usage: bun scripts/try-extract.ts <youtube-url> [model]");
  process.exit(1);
}

const started = Date.now();
try {
  const { recipe, en, source } = await extractImportedRecipe(url, { model });
  console.log(`# Extracted in ${((Date.now() - started) / 1000).toFixed(1)}s by ${source.model} from ${source.url}\n`);
  console.log("## Recipe");
  console.log(JSON.stringify(recipe, null, 2));
  console.log("\n## English map");
  console.log(JSON.stringify(en, null, 2));
} catch (e) {
  console.error(`Extraction failed after ${((Date.now() - started) / 1000).toFixed(1)}s:`, e instanceof Error ? e.message : e);
  process.exit(1);
}
