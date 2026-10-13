@AGENTS.md

# Sufra (سُفرة) — notes for Claude

Arabic-first, bilingual (ar/en, RTL) mobile-first food app prototype for a hackathon demo.
Live: https://sufra-hackathon.lovable.app

## Stack
- TanStack Start (React 19, file routes in `src/routes`, `routeTree.gen.ts` is generated) on Vite 8, built with nitro (Cloudflare target) via `@lovable.dev/vite-tanstack-config` — don't add plugins that config already includes (see `vite.config.ts`).
- Tailwind v4 + shadcn/radix components, lucide icons, sonner toasts, zod for validation.
- Server code = `createServerFn` in `src/lib/*.functions.ts`. Those files ship to the client bundle, so server-only modules (`*.server.ts`, e.g. `src/integrations/supabase/client.server.ts`) are loaded with `await import(...)` inside the handler.
- Supabase (Lovable Cloud) only for the `demo_profiles` table; no new tables.
- Commands: `bun run dev`, `bun run test` (vitest; includes the i18n completeness test), `bun run lint`, `bun run build`.

## Lovable sync (critical)
- `main` is two-way synced with Lovable. Never force-push, rebase, amend or squash pushed commits.
- Everything pushed to `main` shows up in Lovable immediately — keep `main` building and working. Run `bun run test` and `bun run build` before pushing.

## Data & state
- `Recipe`, `Ingredient`, `Sub`, allergens (`allergensList`) and demo prices live in `src/lib/data.ts`; `getRecipe(id)` is the single lookup used by recipe/cook/box/profile/import screens.
- Allergen values are the canonical Arabic keys from `allergensList` (`مكسرات`, `ألبان`, `جلوتين`, `بيض`, `مأكولات بحرية`, `سمسم`, `صويا`); matching is exact string equality (`matchesAllergy`).
- Shared user state: `src/lib/store.ts` (localStorage + `demo_profiles`; payload capped at 20 000 chars by `saveDemoProfile`).

## i18n
- All UI text via `t()` from `src/lib/i18n.ts`; Arabic string is the key, English in `src/lib/i18n.en.json`. Add every new Arabic literal to the JSON or `src/test/i18n.test.tsx` fails.
- Strings without Arabic characters pass through `t()` untouched in English mode.

## Real recipe import (/import)
- YouTube links (watch, youtu.be, shorts) go to a server function that calls the Gemini API with the YouTube URL as `file_data.file_uri`; the result is rendered with the existing screens (ImportResultCard, recipe/$id, cook/$id, allergy matching, subs).
- Imported recipe ids are prefixed `imp-`. Demo backups of extractions are JSON files committed in the repo, not database rows.

## Secrets
- Secrets live only in `.env.local` (local dev, gitignored via `*.local`) or Lovable Cloud secrets (production). Never commit them, never put them in `.env` (tracked), and never prefix them with `VITE_` (that inlines them into the client bundle).
- Read secrets only on the server, inside handlers: `process.env.GEMINI_API_KEY`. In dev, TanStack Start's load-env plugin copies all `.env*` vars into `process.env`.
- Never log or return secret values; report only whether a secret is configured.
