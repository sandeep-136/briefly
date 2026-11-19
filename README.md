# Briefly

An extractive text summarizer that runs entirely in the browser. Paste an article, notes, or documentation, choose how much to keep, and Briefly selects the most important sentences. No server, no account, and the text never leaves the page.

Built with React and Vite. The summarization logic is a small, dependency-free module (`src/lib/summarize.js`).

## How it works

1. The text is split into sentences.
2. Stop words ("the", "is", "and", ...) are removed, and every remaining word is counted across the whole document.
3. Each sentence is scored by the average frequency of its content words - sentences rich in distinctive, repeated vocabulary score highest.
4. The top-scoring sentences are kept and shown in their original order, with per-sentence scores and the top keywords for transparency.

This frequency baseline is a classical NLP technique: fast, deterministic, and it never invents facts that were not in the source.

## Run locally

```bash
npm install
npm run dev
```

## Tests

```bash
npm test
```

Vitest covers sentence splitting, tokenization, keyword ranking, selection ratio, ordering, and edge cases.

## Build

```bash
npm run build   # outputs static files to dist/
```

Deployed on Render as a static site: `npm install && npm test && npm run build`, publish directory `dist`.

A project by Sandeep Sagar
