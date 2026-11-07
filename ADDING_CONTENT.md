# Adding content

Software is the first migrated content kind. Add software in
`src/content/software.ts`; its listing, detail page, filters, search, CV, recent-work
feeds, and RDF export all read that record through `src/content/catalog.ts`.

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
derived in `src/content/relations.ts`: software that points at a paper, talks and
posters linked to a paper in `publicationPresentationLinksById`, and talk–poster pairs.

## Highlighting part of an item

Any software record, publication (`src/data/publicationsData.ts`), or talk/poster
(`talkMetadataBySlug` in `src/data/talkMetadata.ts`) can feature one part of itself,
such as a companion website that is a large part of a paper's contribution. The
highlight appears as an emphasized callout directly under the item's header:

```ts
highlight: {
  label: "Federated Query Results Explorer",
  description: "Companion website for exploring the study's outcome summaries, …",
  href: "https://ecrum19.github.io/fed-survey-results/",
  related: "software:fed-survey-results-explorer",
},
```

Give `href` (an external URL or a local file), `related` (a `kind:id` entry on this
site), or both. `npm run validate:content` checks that each resolves.

## Validate and publish a content edit

1. Run `npm run type-check` and `npm run validate:content` for authoring feedback.
2. Regenerate the committed exports with `npm run recent-work:export` and
   `npm run rdf:export`, and the CVs with `npm run build:cv`. Exports are rewritten
   only when their content changes, so an unchanged run leaves no diff.
3. Run `npm run validate`, and commit the regenerated files with the content change.
   CI fails if the committed exports do not match a fresh export.
4. For visual changes, follow `TESTING.md` to compare the local browser snapshots.

Publications, talks, and posters still use their existing authoring files
(`publicationsData.ts`, `talkMetadata.ts`, and the slide inventory). Their migration
is a later step of `REFACTOR_PLAN.md`; do not duplicate those records in this catalog.

## Component and style ownership

- `src/styles/tokens.css`: typography, surfaces, accents, and theme overrides.
- `src/styles/base.css`: element defaults and existing global action treatments.
  Global action classes remain for pages that have not migrated yet.
- `src/components/ui`: `ContentHeading`, `EntryCard`, `TagChip`, `ActionLink`,
  `FilterPanel`, and `FilterSelect` own reusable visual rules and accessible controls.
- `src/components/software/SoftwareCard.vue`: typed Software content composition.
- `src/components/detail`: the shared item-page architecture. `DetailPage` (shell,
  contents panel, not-found state), `DetailHeader` (kicker, title, date, actions,
  tags), `HighlightCallout`, `DetailSection` panels with `MetadataList` and
  `RelatedLinks`, and the `PdfViewer`/`PosterPreview` previews. Software,
  publication, talk, and poster pages all use them in the same order: header,
  highlight, Summary, Abstract/Description, Details, Related, then previews.
- `src/content/softwareFilters.ts` and `softwareDetails.ts`: pure filtering,
  ordering, metadata, and relation selection. Vue pages arrange these pieces.
- `src/composables/usePdfPreview.ts`: the PDF.js lifecycle (deferred loading, fitted
  rendering, paging, zoom, cleanup) behind `PdfViewer`, used by the paper, slide,
  and fellowship pages.
- `src/utils/links.ts`: deployment-aware link URLs, targets, and `rel` values.

Use slots for content and the documented component props for visual variants.
Avoid copying component CSS into the next page. Preserve existing styles when
migrating a page, then make broad design changes through tokens/components.
