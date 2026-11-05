# Refactor baseline — 9 October 2026

Branch: `codex/reusable-content-and-styles`. This implementation combines the
baseline and Software pilot, as requested. Publication/talk/poster migrations and
the Monaco/YASGUI feature remain later steps in `REFACTOR_PLAN.md`.

## Content and routes

| Content | Before | After Software migration |
| --- | ---: | ---: |
| Publications | 14 | 14 |
| Talks (including HTML) | 15 | 15 |
| Posters | 7 | 7 |
| Software entries | 10 | 10 |
| Software sections | 5 | 5 |
| CV sections | 8 | 8 |
| Recent-work items | 46 | 46 |
| RDF triples | 3,607 | 3,607 |

Routes retain `/about`, `/about/cv`, `/about/fellowships/:slug`, `/publications`,
`/publications/:slug/paper`, `/software`, `/software/:slug`, `/talks`,
`/talks/:slug`, `/talks/posters/:slug`, `/blogs`, and `/privacy`. `/` still redirects
to About and `/work` to Publications. Software IDs, slugs, filter-query parameters,
TOC anchors, and relation destinations are preserved.

The export regression tests compare the RDF graph and both recent-work files with
the committed snapshots, ignoring only generation timestamps. No observation API
was refreshed during these comparisons. Both CVs still generate (2-page scoped,
9-page complete), and the existing 11 PDF content/layout checks pass.

## Visual baseline

W3.CSS is now the exact local copy of version 4.15 formerly served by the external
URL. Its provenance and SHA-256 are in `public/vendor/README.md`.

The local screenshot matrix captures 22 route/state examples in eight viewport,
theme, and performance combinations (176 route captures). Another eight browser
tests capture both PDF loading and missing-file states; one renders/paginates a
real PDF. All 185 browser checks pass. TOC expansion is explicit and screenshot-only
resize events are suppressed after layout settles to keep captures stable.
The original committed source is also captured in an isolated temporary checkout
for comparisons; see `TESTING.md` for repeatable local commands.
The final comparison log is `.cache/visual-final-stable.log`.

Intentional visual change: an empty Software filter now says “No matching software”
and suggests changing/clearing filters, rather than asking visitors to edit a source
file. The normal listing and detail treatments are preserved.

## Corrections exposed by validation

- Vue type checking exposed PDF.js 6 API mismatches in the paper, fellowship, and
  slide previews. Rendering now passes the canvas explicitly; disposal uses the
  loading task. Unit tests check controls, rendering, errors, and cleanup, and a
  browser test uses the real worker.
- Keyword ranking previously returned unrelated records because every record
  received a positive bonus. Bonuses now apply only to matching records.
- A failed RDF load previously stayed cached, preventing retry. Failed cache
  promises now reset.
- The idle-callback helper no longer redeclares incompatible optional Window
  members, and a redundant favicon theme branch was removed.

Maintenance scripts have import guards for safe unit testing, a shared TypeScript
content loader, and a pure RDF projection separated from output writes.

## Existing issues assigned to later migrations

- Scholar's publication extractor still regex-parses TypeScript and can associate
  the profile ID `google-scholar` with a publication title. The publication migration
  replaces that extractor and reconciles existing observation keys. Software
  validation currently validates Software release IDs and its outgoing relations.
- Recent-work poster export reads `poster.dateIso` instead of `displayDateIso` and
  constructs `/talks/:slug` instead of `/talks/posters/:slug`. This pilot preserves
  the committed feed; correct and review those outputs in the poster migration.
- Slide generation still uses filename/date heuristics, fuzzy poster relations,
  and the build year for its watermark. Its deterministic asset-only rewrite is
  deferred to the talk/poster step. CI validates the committed inventory and tests
  the current asset helpers; it does not silently regenerate authored slide data.

## Initial bundle measurements

Measured with the same lockfile using `vite build`; sizes are Vite's decimal kB.
PDF and semantic-search payloads remain lazy-loaded.

| Initial baseline chunk | Raw kB | Gzip kB |
| --- | ---: | ---: |
| Main application JS | 58.33 | 21.36 |
| Main application CSS | 14.67 | 3.58 |
| Software listing JS | 11.87 | 3.62 |
| Software listing CSS | 9.60 | 2.32 |
| Software detail JS | 7.12 | 2.32 |
| Software detail CSS | 5.38 | 1.42 |
| Search panel JS | 5.94 | 2.43 |
| PDF viewer JS | 431.00 | 129.58 |

After the refactor: main JS is 58.39 kB (21.38 gzip), listing JS 8.89 kB
(3.33 gzip), detail JS 5.85 kB (2.12 gzip), plus the shared UI chunk at 3.77 kB
(1.42 gzip). Listing/detail CSS is 5.78/1.92 kB, plus 4.49 kB shared UI CSS;
the previous combined listing/detail CSS was 14.98 kB. Main CSS and the PDF
viewer chunk sizes are unchanged. Root and `/eliascrum/` builds both compile.

Validation result: 77 application tests and 16 maintenance tests passed, together
with the seven query-suite checks and 11 existing CV tests. Application coverage
was 83.25% lines, 83.49% statements, 90.44% functions, and 75.28% branches; maintenance
coverage was 67.98%, 67.56%, 71.02%, and 56.13%, respectively. See `TESTING.md`
for enforced thresholds and the separate per-module coverage floors.

The complete local baseline build log is `.cache/refactor-baseline/build.log`;
build output is `.cache/validation.log` and final validation output is
`.cache/validate-final.log`. Compare shared component
chunks as well as page chunks: extracting CSS changes ownership across bundles.
