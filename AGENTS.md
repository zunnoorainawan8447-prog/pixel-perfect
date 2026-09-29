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

## Architecture rules

- All study material and questions live in `src/lib/content.ts` as localized objects with provenance metadata (source, verification date, translation status), so verified content can replace demo content without UI changes.
- Language/text-size state lives in `src/lib/settings.tsx` and study progress in `src/lib/progress.tsx`, both React contexts persisted to localStorage — the prototype has no backend and no account requirement.
- The study assistant answers offline from app content in `src/routes/assistant.tsx`; any real model call must go through a server function so provider keys stay server-side.
