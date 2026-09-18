# Doctordle cases

`cases/` holds one HTML file per case, numbered in rotation order. They are the
**source**, not what gets served: `scripts/extract-doctordle.mjs` reads the two
data declarations out of each one and writes

- `public/doctordle/puzzles.json` — every case, fetched by the game engine
- `src/doctordle-manifest.json` — id and patient stem only, imported by the
  dashboard so it can list and date cases without spoiling them

The engine that renders them all is `public/doctordle/index.html`.

## Adding a case

1. Drop it in `cases/` as `NN_condition_name_clerking_style.html`, taking the
   next free `NN`. The number is its place in the rotation, so new cases land at
   the end and no already-played day changes meaning.
2. `npm run build:doctordle`
3. Commit the two generated files alongside the new case.

The extractor is strict on purpose — it fails loudly on a case with no `cases`
array, more than one case in it, a missing field, or anything other than five
hints, because scoring assumes five.

## Why the files still look like whole games

Each one is a self-contained copy of an older version of the game, and only
about a kilobyte of it is the case. The extractor ignores everything else, so
there is no need to strip them down; they stay readable and openable on their
own. Only the data declarations matter:

```js
const ALL_DIAGNOSES = [ … ];   // merged across every file into one autocomplete list
const cases = [ { presentingComplaint, location, diagnosis, hints, explanation, management, source } ];
```

## Rotation

One case a day, counted in Europe/London from the epoch stamped into
`scripts/extract-doctordle.mjs`. The rules live in `src/doctordle.js`; the epoch
is fixed once real students have played, because moving it re-dates every case.

With 55 cases the rotation repeats after 55 days — `puzzleForDay` reports which
`round` a day is on, so the count is worth watching.
