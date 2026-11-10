# Validation and tests

Use Node 24 and `npm ci`. `npm run validate` runs lint, Vue/TypeScript checking,
content validation, unit/component coverage, Node maintenance coverage, the six
documented SPARQL examples, and the existing PDF CV verification suite.

`npm run build:site` generates exports and CVs and builds the site. `npm run build:ci`
runs `validate` and then `build:site`. The `Validate and Deploy` workflow
(`.github/workflows/site.yml`) runs `build:ci` once per push or pull request, then
checks that the committed RDF and recent-work exports match the fresh ones. On
`master`, a deploy job runs only after that validation passes and builds with
`build:site`. Builds use committed release and slide snapshots, so they do not depend
on GitHub, Scholar, or Yahoo API availability. The `Update Software Releases`
workflow refreshes the release snapshot every Monday, commits it with its exports,
and starts a deployment; the regular `npm run build` retains its own release refresh.

## Unit and component tests

`npm run test:unit` runs browser-facing tests in jsdom. PDF.js, canvas, and browser
observers are mocked at their boundaries. The shared PDF preview lifecycle is tested
once in `tests/unit/usePdfPreview.test.ts`; page tests check each page's wiring, and
`tests/components/detailPages.test.ts` keeps every item page on the shared structure.
Filter tests assert the exact records each selection should show.
`npm run test:unit:watch` supports local editing.

`npm run test:coverage` includes **every** source `.ts` and `.vue` module, including
modules not imported by tests, and enforces 80% statements/lines, 75% functions,
and 70% branches overall. There is no per-module floor: write tests for behavior
that matters rather than to lift a module's percentage.

`npm run test:scripts` runs Node tests for all maintenance modules, real PDF
generation, RDF construction, and saved API-response parsing. It enforces 60%
statements/lines/functions and 50% branches overall. Tests do not refresh external
observations or rewrite the website's checked-in content. Existing `npm run test:cv` additionally checks
the generated PDF text, links, margins, and layout.

Reports are in `coverage/` and `coverage/scripts/`. CI uploads them even if a check
fails. These are coverage floors, not a claim that every possible browser or API
failure is tested.

## Local visual comparisons

1. Install the matching browser: `npx playwright install chromium`.
2. Before editing, run `npm run test:visual:update` to capture the current design.
3. After editing, run `npm run test:visual`. Inspect failures in
   `.cache/visual-results/` before accepting a changed baseline.

The route matrix covers desktop (1440px) and mobile (390px), light/dark themes,
Standard/Lite modes, every route pattern, representative detail types, filtered
and empty lists, missing records, and loading/missing-file PDF states. A separate
browser test renders and paginates a real PDF with the installed PDF.js worker.
Google Fonts are cached under
`.cache/visual-fonts/`; the first capture needs internet access. Tests wait for
fonts and stable layout, stub third-party icons/embeds, and hide moving video and
canvas pixels in layout screenshots. PDF rendering/lifecycle is tested separately.
After layout settles, captures suppress screenshot-induced resize events so the
desktop TOC stays open. Responsive resize behavior has its own component tests.

Snapshots live in `tests/visual/snapshots/` and are deliberately local/ignored.
Compare on the same machine, browser version, and font cache. OS font rendering
differs, so screenshot comparisons do not run in CI. Do not overwrite snapshots
merely to make a comparison pass.

## Export regression checks

`rdf:export` and `recent-work:export` rewrite a file only when more than its
generation timestamp changed, so regenerating unchanged content leaves no diff.
CI regenerates both and fails on any difference from the committed files
(`git diff --exit-code`), so content edits must be committed with their regenerated
exports. CV PDFs embed their generation date and are not part of that check; use a
fixed date through `generateCv()` when comparing PDF content.

CI also rebuilds the talk and poster asset inventory with
`npm run build:slides -- --inventory-only` and fails if
`src/content/generated/talkAssets.ts` changes: talk PDFs and their records must be
committed together with the inventory `npm run build:slides` writes.
