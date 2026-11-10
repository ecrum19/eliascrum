# Adding content

Every kind of work uses the shared content model: software in
`src/content/software.ts`, publications in `src/content/publications.ts`, talks in
`src/content/talks.ts`, and posters in `src/content/posters.ts`. Their listings, item
pages, filters, search, homepage, CV, recent-work feeds, and RDF export all read those
records through `src/content/catalog.ts`, so adding one record is enough.

## Minimal software entry

Add an object to `softwareEntries`. Keep the explicit `id` and `slug` stable after
publication: the ID identifies the RDF resource and release observations; the slug
identifies the public page.

```ts
{
  kind: "software",
  id: "example-tool",
  slug: "example-tool",
  title: "Example Tool",
  summary: "A short explanation of what the tool does.",
  date: 2026,
  topics: ["Semantic Web"],
  sectionId: "utilities",
  type: "Utility Tool",
  purpose: "Research Communication",
  description: "A longer explanation for the detail page.",
},
```

The common fields are `kind`, `id`, `slug`, `title`, `summary`, `date`, and `topics`.
Software also requires `sectionId`, `type`, `purpose`, and `description`.
Choose a section from `softwareSectionDefinitions`, or add its ID, title, and
description there. A description identical to the summary is shown only once on
the detail page.

`date` is a year (`2026`), a day (`"2026-10-09"`), `"ongoing"`, or `"unknown"`.
Record only the precision you actually know: never turn a year into a day. The RDF
export keeps its existing textual `ec:year` field, so the public vocabulary does not
change.

## Optional information

Omit fields that do not apply. Extra information does not require a component edit:

```ts
links: {
  repository: "https://github.com/example/tool",
  website: "https://example.org/tool",
  documentation: "https://example.org/tool/docs",
},
related: ["publication:solid-cockpit-eswc-2026-demo", "talk:sosy2026", "poster:eswc-2026-print"],
extraDetails: [
  { label: "License", value: "MIT", href: "https://example.org/tool/LICENSE" },
],
```

`related` entries are `kind:id`. Publications and software use their IDs; talks and
posters currently use their stable slugs. Local links use paths relative to
`public`, such as `/guides/tool.pdf`, and validation checks that those files exist.
Release observations are generated in `src/data/softwareReleases.ts` by the weekly
`Update Software Releases` workflow; never hand-author a release date to populate
the UI.

Relationships are stored once. Every item page lists them, plus the reverse links
derived in `src/content/relations.ts`: any software or publication that points at the
item, and talk–poster pairs.

## Minimal publication entry

Add an object to `publicationEntries`. As with software, keep `id` (RDF resource,
citation counts) and `slug` (the `/publications/<slug>/paper` page) stable.

```ts
{
  kind: "publication",
  id: "example-paper-2026",
  slug: "example-paper",
  title: "An Example Paper",
  summary: "A short description of the paper.",
  date: "2026-01-01",
  topics: ["RDF"],
  type: "Conference Paper",
  authors: "A. Author, B. Author",
  venue: "Example Conference 2026",
  venueTags: ["ESWC"],
  links: {},
  bibtex: `@inproceedings{example2026, title={An Example Paper}}`,
},
```

Publications also require `type` (one of `PUBLICATION_TYPE_OPTIONS`), `authors`,
`venue`, `venueTags` (may be empty), and `bibtex`. Use the official publication day
for `date`. Optional fields:

- `typeLabel`: a more specific type shown in Details, such as
  `"Demo Paper (Conference Paper)"`; filters still use `type`.
- `links.paper`: a PDF under `public/` to preview on the paper page;
  `links.publisher`: the DOI or publisher page.
- `related`: the paper's talks and posters (`"talk:<slug>"`, `"poster:<slug>"`). They
  appear as Presentation/Poster buttons on the listing, and the talk and poster pages
  link back automatically.
- `abstract` and `extraDetails` (such as DOI, Status, or Recognition).

The Details list always starts with *Publication Type* and *Date*, generated from the
record, so do not repeat them in `extraDetails`. Citation and download counts are
observations: `npm run update:scholar` matches publication titles to Google Scholar
and writes `src/data/scholarCitations.ts`.

## Minimal talk and poster entries

Add a talk to `talkEntries` and a poster to `posterEntries`. Their `id` and `slug` are
the same and stay stable: they name the page (`/talks/<slug>`,
`/talks/posters/<slug>`) and the RDF resource.

```ts
{
  kind: "talk",
  id: "example-talk",
  slug: "example-talk",
  title: "An Example Talk",
  summary: "What the audience will learn.",
  date: "2026-01-01",
  topics: ["RDF"],
  venueTags: ["Conference"],
  audienceGroups: [],
  slides: { format: "pdf", source: "Example_Talk.pdf" },
},
```

A poster has the same fields, with `kind: "poster"` and `source: "Example_Poster.pdf"`
in place of `slides`. Use the day it was presented for `date`.

- **PDF slides and posters.** Put the PDF in `./slides` (or `./posters`) and run
  `npm run build:slides`. It matches each file to the record naming it in `source`,
  publishes a watermarked, compressed copy (`/talks/slides/<slug>.pdf`, or
  `/talks/posters/<source>`), adds the file to `.talk-assets/*.tar.gz`, and updates
  `src/content/generated/talkAssets.ts`. A file without a record, or a record without a
  file, is an error. Commit the archive, the published PDF, and the inventory; CI
  rebuilds the inventory and fails if it differs.
- **HTML slides.** Use `slides: { format: "html", url: "https://…" }`; nothing needs
  building. Add `embedUrl` to embed a different player URL, or to show a Google Slides
  embed in place of a PDF's preview.
- **The talk's poster.** List it in the talk's `related` (`"poster:<slug>"`); the poster
  page links back to the talk automatically.

Optional fields, each shown only when present: `abstract`, `goal`,
`audienceExpertise` (who the audience was), `durationMinutes`, `audienceSizeApprox`
(with `audienceSizeEstimate` for a range such as `"Approx. 8–10 attendees"`),
`relatedResources` (external links such as an event site or a demo video), `related`,
`highlight`, and `extraDetails`. The Duration (Short ≤ 15 min, Medium ≤ 45, Long) and
Audience Size (Small ≤ 25, Medium ≤ 70, Large) tags are derived from those numbers; an
entry without the number has no tag and is left out only while that filter is active.
Never record a guessed duration or audience size.

## Highlighting part of an item

Any software record, publication, talk, or poster can feature one part of itself,
such as a companion website that is a large part of a paper's contribution. The highlight appears as an
emphasized callout directly under the item's header, and on the publication listing:

```ts
highlight: {
  label: "Federated Query Results Explorer",
  description: "A key part of this paper's contribution: an interactive companion website …",
  href: "https://ecrum19.github.io/fed-survey-results/",
  related: "software:fed-survey-results-explorer",
},
```

Give `href` (an external URL or a local file), `related` (a `kind:id` entry on this
site), or both. `npm run validate:content` checks that each resolves. The highlight is
the one place that entry is featured: the page's Related list leaves out the
highlighted entry, so do not also add it as a detail row.

## RDF identifiers

Every exported resource has a stable IRI under `https://eliascrum.info/id/`. Entries
use their ID (`publication/<id>`, `software/<id>`, `talk/<id>`, `poster/<id>`; talk and
poster IDs are their slugs). Parts of
an entry are named by their owner and label rather than by position, for example
`publication-detail/<id>/doi` or `highlight/publication/<id>`, and carry their
display position as `ec:order`. Reordering or inserting rows therefore keeps existing
IRIs; renaming a detail label renames its resource. Labels must be unique within an
entry, which validation checks.

## Validate and publish a content edit

1. Run `npm run type-check` and `npm run validate:content` for authoring feedback.
2. Regenerate the committed exports with `npm run recent-work:export` and
   `npm run rdf:export`, and the CVs with `npm run build:cv`. Exports are rewritten
   only when their content changes, so an unchanged run leaves no diff.
3. Run `npm run validate`, and commit the regenerated files with the content change.
   CI fails if the committed exports do not match a fresh export.
4. For visual changes, follow `TESTING.md` to compare the local browser snapshots.

## Component and style ownership

- `src/styles/tokens.css`: typography, surfaces, accents, and theme overrides.
- `src/styles/base.css`: element defaults and existing global action treatments.
  Global action classes remain for pages that have not migrated yet.
- `src/components/ui`: `ContentHeading`, `EntryCard`, `TagChip`, `ActionLink`,
  `FilterPanel`, and `FilterSelect` own reusable visual rules and accessible controls.
- `src/components/ui/ListingCard.vue`: a listing entry (linked title, date chip that
  filters by date, tags, then content). `software/SoftwareCard.vue` and
  `publications/PublicationCard.vue` compose it with their typed content.
  `talks/PresentationCard.vue` keeps the talks page's own layout (date above the title,
  an inline preview beside it) from the same `EntryCard`, `TagChip`, and `ActionLink`.
- `src/components/detail`: the shared item-page architecture. `DetailPage` (shell,
  contents panel, not-found state), `DetailHeader` (kicker, title, date, actions,
  tags), `HighlightCallout`, `DetailSection` panels with `MetadataList` and
  `RelatedLinks`, and the `PdfViewer`/`PosterPreview` previews. Software,
  publication, talk, and poster pages all use them in the same order: header,
  highlight, Summary, Abstract/Description, Details, Related, then previews.
- `src/content/listingFilters.ts` (shared sorting and route tags), the per-kind
  `*Filters.ts` and `*Details.ts` modules, and `tags.ts` (shared tag vocabularies):
  pure filtering, ordering, metadata, and relation selection. Vue pages arrange these
  pieces.
- `src/composables/usePdfPreview.ts`: the PDF.js lifecycle (deferred loading, fitted
  rendering, paging, zoom, cleanup) behind `PdfViewer`, used by the paper, slide,
  and fellowship pages.
- `src/utils/links.ts`: deployment-aware link URLs, targets, and `rel` values.

Use slots for content and the documented component props for visual variants.
Avoid copying component CSS into the next page. Preserve existing styles when
migrating a page, then make broad design changes through tokens/components.
