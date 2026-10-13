import { registerImported, type ImportedRecipe } from "./import";

// Demo safety net: extractions saved by `bun scripts/import-backup.ts <url>` into src/data/imports/<videoId>.json.
// Bundled at build time and registered on load, so their "imp-*" pages also resolve on the server.
// Kept out of import.ts because import.meta.glob is Vite-only (import.ts also runs under Bun scripts).
const files = import.meta.glob<ImportedRecipe>("../data/imports/*.json", { eager: true, import: "default" });
const backups = new Map(Object.values(files).map((b) => [b.source.videoId, b] as const));
backups.forEach(registerImported);

export const backupFor = (videoId: string) => backups.get(videoId);
/** All bundled demo backups — they double as the Import screen's sample videos. */
export const backupList = () => [...backups.values()];
