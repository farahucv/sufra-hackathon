import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { parseYouTubeId } from "./youtube";

// Real recipe extraction from a YouTube link via Gemini. Errors surface as Error(message = ImportErrorCode).
export const extractRecipe = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ url: z.string().max(500).refine((u) => parseYouTubeId(u) !== null, "BAD_URL") }).parse(d))
  .handler(async ({ data }) => {
    const { extractImportedRecipe } = await import("@/lib/gemini.server");
    return extractImportedRecipe(data.url);
  });
