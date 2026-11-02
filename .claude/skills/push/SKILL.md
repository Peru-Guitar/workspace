---
name: push
description: Rules for pushing in the Peru Guitar projects (pg-web, pg-fretquest, pg-fighters). Use when the user asks for "push", "sube los cambios" or "sube a main", and before any git push. Never push automatically; each project manages its own version and changelog, and every push is confirmed first.
---

# Pushing in Peru Guitar

Pushing to `main` publishes that project to GitHub Pages. Each project is its own repo and **manages its own version and changelog**: a push in one doesn't change another's version. Work inside the project's folder. If the request doesn't make clear which one, ask.

## 1. Never push automatically

- **Don't run `git push`** unless the user explicitly asks for it in that message.
- Only a message that explicitly says **push** or **sube a main** counts. "dale", "listo", "excelente", "hazlo", "adelante" or "publica el artículo" mean implement, **not** push. If in doubt, ask.
- A push requested in an earlier message doesn't authorize later changes: each push needs its own request.
- Committing doesn't imply pushing. Finishing a task doesn't imply pushing.
- If you think a push would be a good idea, say so in one line and wait.

## 2. Always confirm the version first

Review what will be published (`git log origin/main..HEAD`, `git diff origin/main --stat` and anything uncommitted) and propose the version type from the project's table, even if the user already asked for the push. Reply in the user's language:

> Cambios: <short summary>
> Versión: **patch** — 0.9.2 → 0.9.3 (reason in one line)
> Novedades: · <note 1> · <note 2>
> ¿Subo con esa versión?

Wait for confirmation: the user can choose another type or change the notes. If they say "minor" or "patch" and there's any doubt, repeat the resulting version before touching anything.

## 3. Project specifics

### pg-fretquest

Changelog: `src/data/changelog.ts`, in the student's words. Verification: `npm run build`, `npm run lint` and `npx vitest run`.

It's **in beta**: the version stays at `0.x.y`, and what would be a major bumps the minor. `1.0.0` is only used when the user says we're out of beta.

| Type | When | Example |
|---|---|---|
| **minor** | New screen or feature, or a big change (incompatible saved progress, redesign) | `0.9.2 → 0.10.0` |
| **patch** | **New lessons** (always, however many), lesson tweaks, fixes and visual touch-ups | `0.9.2 → 0.9.3` |

### pg-web

Changelog: `src/content/changelog.ts`, in the reader's words. Verification: `npm run build` and `npm run lint`.

The version stays at `0.x.y` until the user decides on `1.0.0`; what would be a major bumps the minor.

| Type | When | Example |
|---|---|---|
| **minor** | New section, page, resource or feature, or a big change (redesign) | `0.1.0 → 0.2.0` |
| **patch** | Fixes, **new posts** (always) or edited ones, text tweaks, visual touch-ups | `0.1.0 → 0.1.1` |

### pg-fighters

Changelog: `src/data/changelog.ts`, in the player's words. Verification: `npm run build` and any tests that exist. Commit messages in Spanish. Notes must not include real people's names or nicknames either.

| Type | When | Example |
|---|---|---|
| **major** | A change that breaks what came before: incompatible runs or accounts, full redesign, change in game rules | `1.4.2 → 2.0.0` |
| **minor** | New character, stage, mode, screen or feature | `1.4.2 → 1.5.0` |
| **patch** | Fixes, balance tweaks, art or text touch-ups | `1.4.2 → 1.4.3` |

## 4. Once confirmed

1. Update the version with `npm version <type> --no-git-tag-version`, inside the project.
2. Add the version to the project's changelog, at the very top: `version`, `date` (today, `YYYY-MM-DD`) and `notes`. Notes are user-facing, so they're in Spanish.
   - **Very brief** notes, one per improvement, with no technical details.
   - **Never technical or security information**: no keys, emails, internal URLs, file or service names, or user data. A note must never reveal what was exposed or how a flaw could be exploited.
   - Describe security fixes superficially: "Se corrigió un error con el nombre de usuario.".
   - If nothing is visible to the user, a single generic note ("Mejoras y arreglos.").
3. Run the project's verification. If it fails, stop and say so.
4. Commit, including the version and changelog. Don't add untracked files that aren't part of the change.
5. `git push` as the **last, separate step**, never chained with the commit: the user may write "espera" at the last moment.
