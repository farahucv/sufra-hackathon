<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Prototype is frontend-only: demo data lives in src/lib/data.ts and shared user state in src/lib/store.ts — keeps the hackathon demo self-contained with no backend.
- Every screen wraps content in AppShell (phone-width frame, RTL, bottom nav) — consistent mobile-first layout.
- Demo user state persists to localStorage plus the `demo_profiles` table via server functions keyed by an anonymous device id (service role only, no client RLS policies) — gives persistence without mandatory sign-up.
- Never add artificial loading delays for local interactions; only the Import extraction demo is staged (~1.7s) — keeps the prototype feeling instant.
