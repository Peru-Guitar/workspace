# Peru Guitar workspace

Runs every Peru Guitar app locally with fixed ports. Each app lives in its own repo.

| App | Repo | Local | Production |
|---|---|---|---|
| Web | [pg-web](https://github.com/Peru-Guitar/pg-web) | http://localhost:4100 | https://peruguitar.com |
| Fret Quest | [pg-fretquest](https://github.com/Peru-Guitar/pg-fretquest) | http://localhost:4200 | https://fretquest.peruguitar.com |
| PG Fighters | [pg-fighters](https://github.com/Peru-Guitar/pg-fighters) | http://localhost:4300 | https://fighters.peruguitar.com |

## Setup

```bash
npm install          # workspace tools (concurrently)
npm run sync         # clones missing apps, updates the rest
npm run install:all  # installs each app's dependencies
```

## Run

```bash
npm run dev               # every app; Ctrl+C stops them all
npm run dev:web           # only one app
npm run dev:fretquest
npm run dev:fighters
```

Ports are strict: if one is taken, the app fails instead of moving to another port.

## Update

```bash
npm run sync
```

Clones missing apps and fast-forwards the others to `origin/main`. It never
discards local work: a repo with uncommitted changes or diverged commits is
skipped with a warning.
