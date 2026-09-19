# Crosswords

`puzzles/` holds one HTML file per crossword, numbered in rotation order. They
are the **source**, not what gets served: `scripts/extract-crosswords.mjs` reads
the `PUZZLE` object out of each one and writes

- `public/crosswords/puzzles.json` — every puzzle, fetched by the game engine
- `src/crossword-manifest.json` — title and word count, imported by the dashboard

The engine that renders them all is `public/crosswords/index.html`.

## Adding a crossword

1. Drop it in `puzzles/` as `NN_topic_crossword.html`, taking the next free `NN`.
   The number is its place in the rotation, so new puzzles land at the end and no
   already-played day changes meaning.
2. `npm run build:crosswords`
3. Commit the two generated files alongside the new puzzle.

The extractor is strict on purpose — it fails loudly on a missing `PUZZLE`, a
clue without a `row`/`col`/`answer`/`text`, or an answer containing anything but
uppercase letters.

## What gets extracted

Four things vary between source files; everything else is the shared engine.

```js
const PUZZLE = {
  title: "Cardiology",
  clues: {
    across: [{ number, answer, row, col, text }, …],
    down:   [{ number, answer, row, col, text }, …],
  }
};
```

plus three bits of chrome the old files carried outside `PUZZLE`: the
`.subtitle` ("Cardiology Edition"), the `.source-note` (the guidelines line), and
the `Review …` message shown on a low score.

## Rotation

One puzzle a day, counted in Europe/London from the epoch in
`scripts/extract-crosswords.mjs`. The shared rules live in `src/daily.js` — the
same ones Doctordle runs on — and `src/crossword.js` only names the manifest and
the storage key. The epoch is fixed once real students have played, because
moving it re-dates every puzzle.

Unlike Doctordle, the archive may name a puzzle: a crossword's topic is its theme
rather than its answer, so "Cardiology" spoils nothing.

With 31 puzzles the rotation repeats after 31 days — `puzzleForDay` reports which
`round` a day is on, and both the picker and the puzzle itself say "seen before".
