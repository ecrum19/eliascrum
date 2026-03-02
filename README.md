# Elias Crum Personal Website

Personal academic website built with Vue 3, Vite, Vuetify, and TypeScript.

## Release

Current release: **v0.1.0**


## Tech Stack

- Vue 3
- TypeScript
- Vue Router 4
- Vuetify 3
- Vite 6
- ESLint

## Local Development

### Prerequisites

- Node.js 20+
- npm 10+
- Optional: Ghostscript (`gs`) for PDF compression in `build:slides`


## Project Scripts

- `npm run dev`: start Vite dev server
- `npm run preview`: preview production build
- `npm run build`: production build (`dist/`)
- `npm run lint`: lint Vue/TypeScript source
- `npm run build:slides`: rebuild generated talks/posters data and PDF outputs
- `npm run update:scholar`: refresh Google Scholar citation counts


## Automation and CI

### Build Validation

- Workflow: `.github/workflows/build-on-push.yml`
- Runs install, optional `build:slides`, lint, and build on each push.

### Scholar Citation Refresh

- Workflow: `.github/workflows/update-scholar-citations.yml`
- Scheduled weekly and available via manual dispatch.
- Updates `src/data/scholarCitations.ts` and auto-commits changes.


