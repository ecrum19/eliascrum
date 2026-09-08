# PDF CV generation

`npm run build:cv` generates both static artifacts in `public/cv/`. It also runs in
`predev` and `prebuild`, so the existing GitHub Pages build copies current PDFs into
`dist/cv/` with the rest of the site. No browser, Python, LaTeX, or font downloads are
needed during a build. The supplied November 2024 CV is a visual reference only;
the generator never reads that private local file or copies it to the website.

- `elias-crum-complete-cv.pdf`: every CV item and detail, plus all publications,
  software projects, talks, and posters in the site's catalogs.
- `elias-crum-scoped-cv.pdf`: a two-page application CV focused on
  clinical genomics, semantic technologies, relevant research software, selected
  publications, the FWO fellowship, awards, and clinical/teaching experience.

Edit factual records in `src/data/cvData.ts`, `publicationsData.ts`,
`softwareData.ts`, and the talk/poster catalogs. `content.ts` holds the focused
profile, selected experience/software, and explicit publication selections. Elias's
requested four papers are pinned by ID, so adding newer papers cannot silently
replace the bioinformatics or PhD Symposium entries. Accepted papers and preprints
retain their recorded status/type. Curated software
and experience are explicit selections that should be reconsidered for a new job
target. The PDFs are current to the site's maintained records, not an external
profile lookup. Add any new career information to those records first.

Software titles include printable URLs in parentheses. Related papers come from
each project's `relatedPublicationIds`, with DOI or direct PDF links when available.
The activity metadata in `content.ts` records public GitHub `pushed_at` dates and
archive flags checked on 8 September 2026. Newer dates from the site's release
updater take precedence. "Active" means activity within 180 days; "No recent
activity" means older recorded activity, not a claim of abandonment. Recheck the
repository metadata when changing the software selection. Award descriptions are
grounded in the fellowship record and the supplied certificates.

The complete CV is independent of the web page's active filters. PDF links use the
site's base-path helper for local development, root hosting, and GitHub Pages.
Inside PDFs, links default to `https://eliascrum.github.io/eliascrum/`; set
`CV_SITE_URL` when moving the public site. Set `SOURCE_DATE_EPOCH` (Unix seconds)
for reproducible PDF timestamps. The footer uses the generation date in UTC.

`render.mjs` measures and wraps text, keeps entries with their section headings,
adds continuation headings and page numbers, checks printable bounds and font
coverage, embeds Unicode fonts, and generates clickable links. It fails the build
if the focused version exceeds two pages; shorten the editorial selection instead
of shrinking its 10-point body text. Both documents are generated and validated
before either output is replaced.

`npm run test:cv` checks rendered text completeness, the page limit, margins,
publication status, link destinations, and metadata. For visual review, render
with Poppler, for example:

```sh
mkdir -p tmp/pdfs
pdftoppm -scale-to 1400 -png public/cv/elias-crum-scoped-cv.pdf tmp/pdfs/focused
```

Fonts in `fonts/` are Adobe Source Sans 3 (regular, bold, italic, light), sourced
from the Adobe Source Sans release branch. Their SIL Open Font License is bundled
as `fonts/LICENSE.md`. They preserve the reference's Source Sans typography and
support accented names; the reference's name styling is approximated with Source
Sans light/bold. The original color hierarchy, A4 layout, and ruled headings are
retained with darker accent and body colors for readability.
The contact row places email, GitHub, LinkedIn, and the website on one horizontal
centerline with small locally drawn vector marks, so it does not depend on an icon
font. Icon centers and heading rules use visible glyph bounds for alignment.
The scoped selection includes VCF-Core Vocabulary and its related papers; its
closing website statement has extra space above it to distinguish it from the
teaching entry.
