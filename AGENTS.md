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
