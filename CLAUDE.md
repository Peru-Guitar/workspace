# Peru Guitar workspace

This root runs the Peru Guitar apps locally. Each app folder is its own git repo, so run git commands inside the app you are changing. See `README.md` for setup and local ports.

## Projects

| Folder | What it is | Production | Read next |
|---|---|---|---|
| `pg-web` | Main site: blog, resources and store | https://peruguitar.com | `pg-web/CLAUDE.md` |
| `pg-fretquest` | Fret Quest, the guitar technique gym | https://fretquest.peruguitar.com | `pg-fretquest/CLAUDE.md` |
| `pg-fighters` | PG Fighters, a 2D arcade fighting game | https://fighters.peruguitar.com | `pg-fighters/CLAUDE.md` |

Before working in a project, read its `CLAUDE.md`. Its skills are in `.claude/skills/` inside that folder.

Ignore `pg-composer`.

## Pushing

Every push follows `.claude/skills/push/SKILL.md`: never push automatically and always confirm first. Each project manages its own version and changelog.
