# Website refactoring plan

Preserve the current visual design while making its components, content, and behavior easier to reuse. The main authoring goal is one clear record per publication, software project, talk, or poster, with a shared core and explicit optional fields. This plan covers the whole website, starting with a verification baseline and its three work listings.

Prepared on 9 October 2026 against the current `master` checkout. This is the implementation plan; application changes start on `codex/reusable-content-and-styles`, and each implementation step merges to `master` separately (see [Implementation order and checks](#implementation-order-and-checks)). Working SPARQL examples are in [SPARQL_EXAMPLES.md](SPARQL_EXAMPLES.md).

## Current findings

| Area | Existing structure | Refactoring opportunity |
| --- | --- | --- |
| Global styles | Theme and typography variables, resets, and button variants live in `src/App.vue`. W3.CSS 4 is loaded unpinned from `w3schools.com` in `index.html`; about 140 class references use it, 128 of them in `TheHeader.vue` and `AboutMe.vue`. Its element defaults (body font, line height, heading margins) also reach pages that use none of its classes wherever site styles do not override them. | Separate global style ownership, pin W3.CSS locally, and replace its utilities and element defaults incrementally. |
| Work listings | `MyPublications.vue`, `MySoftware.vue`, and `MySlides.vue` repeat filter controls, cards, tags, actions, headings, responsive rules, and theme overrides. | Share the repeated visual elements and their behavior. These files contain 730, 498, and 606 style lines respectively. |
| Shared layout | `WorkPageLayout`, `WorkSectionBlock`, `WorkToc`, and `DeferredPreviewNotice` already exist. | Extend these foundations rather than introducing competing wrappers. |
| Detail pages | Publication and talk details each exceed 1,400 lines, combining metadata, actions, PDF controls, rendering, and styles. | Extract metadata and preview components after the listing patterns settle. |
| Content | Publications use `topicTags`, software uses `mainTopics`; dates and links have several representations. Publication/presentation relationships live in an additional map. | Define a small shared core, type-specific fields, and reusable link/relation types. |
| Talks and posters | Generated `talksData.ts`, `htmlTalks.ts`, `talkMetadata.ts`, and catalog hydration all contribute to records. `build:slides` maps filenames to slugs, reads dates from `talkMetadata.ts` with a regular expression, and attaches posters to talks through a manual map plus fuzzy title-token matching (Jaccard ≥ 0.35). CI and deployment rerun it from `.talk-assets/*.tar.gz`, so the deployed `talksData.ts` can differ from the committed one. | Give authors one home for each entry, make talk–poster links authored relations, and restrict generation to deterministic asset metadata. |
| Missing information | The publication page displays `sortDate` as the publication date, so any value entered only for ordering would be shown as exact. Three values fall on the first of a month: `genome-sharing-review-2026` (`2026-01-01`) is confirmed as the publisher's official date, while `solid-cockpit-eswc-2026-demo` (`2026-06-01`) and `engineering-coliphages-2022` (`2022-09-01`) are unconfirmed. Talk hydration falls back to a 30-minute duration and 30-person audience, and posters to `1900-01-01`; no current record relies on those fallbacks, but a new one would silently show them. Duration, audience-size, and expertise filters are derived from these values, the last by keyword-matching free text. | Preserve genuinely unknown information, define how derived filters treat absent values, and author the audience level instead of inferring it. |
| Generated observations | `update:scholar` and `update:software-releases` write `scholarCitations.ts` and `softwareReleases.ts` into `src/data/`; the citations workflow commits that path by name, and `prebuild` refetches releases from GitHub. `update:scholar` regex-parses `publicationsData.ts` for `id`/`title` pairs: it matches the profile link `id: "google-scholar"` with the first publication's title, so that publication's count is stored under `google-scholar` and it never receives its own key. | Load the catalog instead of parsing TypeScript source, move scripts and workflow paths together, validate observation keys against catalog IDs, and keep network refreshes out of comparison builds. |
| Search | `SpotlightSearch.vue` combines keyword and SPARQL UI. `siteSearch.ts` combines indexing, query execution, and presentation. | Separate the keyword index, RDF query service, and editor/results components. |
| Data consumers | Homepage updates, PDF CVs, keyword search, recent-work exports, and RDF exports import content separately. | Feed every consumer through the same catalog and preserve published routes and RDF identifiers. |

The Vue files currently contain approximately 7,130 style lines. This is a baseline, not a reduction target: component ownership and preserved behavior matter more than a particular line count. The initial `npm run lint` check passes.

## Shared visual components

Copy existing markup and style values into components first. Keep current fonts, colors, outlines, gradients, spacing, animations, breakpoints, and light/dark appearances. Consolidate values only after comparing the rendered results.

| Component | Responsibility and extension points |
| --- | --- |
| Existing `WorkPageLayout` / `WorkSectionBlock` | Page width, TOC layout, surface treatment, section spacing, and anchor offsets. |
| `PageHeading` / `SectionHeading` | Existing heading/subtitle treatments, with an actions slot where needed. |
| `EntryCard` | Shared card surface and title/date/summary layout; slots for metadata, tags, and actions. |
| `PublicationCard`, `SoftwareCard`, `TalkCard`, `PosterCard` | Small compositions of `EntryCard` that retain each content type's particular fields and appearance. |
| `TagChip` / `TagList` | Consistent tag styling, category treatments, selected states, and filter events; use buttons for actions and text for passive labels. |
| `FilterPanel` / `FilterSelect` | Expand/collapse, labeled selects, result count, reset action, and responsive grid. Page-specific filter definitions remain data. |
| `ActionLink` / `ActionButton` / `ActionGroup` | Shared visual variants while retaining router links, external links, downloads, and button semantics. |
| `MetadataList` / `RelatedResources` | Optional metadata and related entries without repeated tables or link handling. |
| `PdfPreview` / `PreviewControls` | Lazy loading, page/zoom controls, status, error handling, and cleanup. Keep HTML slides as a separate preview implementation. |
| `EmptyState` / `StatusNotice` | Existing no-results, unavailable, loading, and deferred-preview presentations. |

Use props for meaningful variants and slots for content differences. Avoid a universal card with dozens of flags. Extract a component when its visual treatment or behavior is shared, rather than wrapping every HTML element.

Proposed style ownership:

- `src/styles/tokens.css`: existing colors, typography, surfaces, spacing, radii, focus rings, and motion values, including theme overrides.
- `src/styles/base.css`: document defaults, focus behavior, and shared accessibility utilities.
- `src/styles/layout.css`: genuinely shared layout rules and transitions.
- Component-scoped styles: each reusable component owns its appearance. Pages keep only unique arrangements.
- `src/styles/sparql-studio.css`: a narrow wrapper for third-party editor/results theme integration.

Import global styles once from `src/main.ts`. Retain existing variable names during migration. Theme differences should mainly be token values. Keep component-specific differences explicit.

For W3.CSS, first replace the `w3schools.com` link with a pinned local copy. Rendering stays the same, the visual baseline becomes reproducible, and a third-party request disappears. Then replace class utilities file by file, starting with `TheHeader.vue` and `AboutMe.vue`. Before removing the stylesheet, copy any element defaults that pages still depend on into `base.css`; a class inventory alone does not reveal them. Removing the stylesheet is the final step of that migration.

## Consistent content authoring

Keep TypeScript as the authored source during this refactor, consistent with the current phase of `src/data/rdf/TRANSITION_PLAN.md`. Generate the RDF mirror from it. Moving primary storage to RDF is a separate migration, and should not happen simultaneously with changing every rendering component.

Proposed files:

```text
src/content/
  types.ts             # Shared core, discriminated entry types, resources, relations
  publications.ts      # Authored publication records
  software.ts          # Authored software records and section definitions
  talks.ts             # Authored PDF and HTML talk records
  posters.ts           # Authored poster records
  catalog.ts           # Lookups, grouping, sorting, reverse relationships
  validation.ts        # Required fields, date validity, unique IDs, references, assets
  generated/assets.ts  # Asset inventory written by build:slides
```

Use a discriminated union such as `PublicationEntry | SoftwareEntry | TalkEntry | PosterEntry`. The shared fields should be required on every record:

| Shared field | Meaning |
| --- | --- |
| `kind` | Publication, software, talk, or poster. |
| `id` | Stable identifier; references use the pair of kind and ID. |
| `slug` | Explicit, stable route slug. Migrate existing resolved slugs without changing URLs. |
| `title` | Canonical display title. |
| `summary` | Short description used by cards and discovery. |
| `date` | A typed day, year, ongoing, or unknown value. Exact dates use ISO format. |
| `topics` | A consistently named array, allowed to be empty. |

Shared optional fields: `resources` with a label and destination, `relations` containing typed entry references, and `extraDetails` for genuinely additional label/value metadata. Absence means absence; render optional sections only when populated.

The date type should distinguish `{ kind: "day", value: "2026-10-08" }`, `{ kind: "year", value: 2026 }`, `{ kind: "ongoing" }`, and `{ kind: "unknown" }`. A sort date for partial dates is a derived ordering convention, not an asserted publication or event date. Preserve current displayed labels and review ambiguous legacy dates during migration.

Precision and display are separate concerns. Record the most precise value actually known and let each component choose its label. Publications currently store `year` plus a day-precision `sortDate`. Listings show the year, while the paper page shows the full `sortDate`. Confirmed day values become `day` dates, which keeps their within-year order. `genome-sharing-review-2026` keeps `2026-01-01`, which the publisher confirms. Confirm the other first-of-month values before migrating them. A value that only stands in for a year becomes a `year` date, so the paper page stops presenting it as exact. If a value is known only to the month, record the year, or add a `month` kind if that case actually occurs.

| Entry type | Required type-specific content | Optional content |
| --- | --- | --- |
| Publication | Publication type, authors, venue, BibTeX citation | Abstract, DOI, paper PDF, publisher link, venue tags, status, presentation/software relationships |
| Software | Software type, purpose, section, longer description | Repository, live site, documentation, release observations, related work |
| Talk | Slides source with an explicit PDF or HTML format | Abstract, goal, event/venue, audience level and description, measured/estimated duration, poster, video, related work |
| Poster | Poster asset | Abstract, goal, event/venue, audience information, linked talk, related work |

Talk filters currently derive duration (Short/Medium/Long), audience size (Small/Medium/Large), and audience expertise categories. The expertise category comes from keyword matching on free-text descriptions. Replace that with an optional authored `audienceLevel`, initialized from today's derived values so filter results do not change. A record without the underlying value should match no category, and should be excluded only while a filter on that dimension is active.

Treat fetched software releases and citation counts as generated observations keyed by stable IDs. Do not require authors to maintain them. Their update scripts should load the catalog through esbuild, as `export-rdf-data.mjs` already does, rather than parsing TypeScript source. Move each generated file together with its script and the workflow paths that commit it: `update-scholar-citations.yml` runs `git diff --quiet` on a hard-coded path, and that check silently passes when the path no longer exists. Store relationships once and derive reverse links. Use IDs for relationships between known entries, and resource links for external materials. Core metadata such as venue and publication type should generate displayed detail rows automatically instead of being repeated in `extraDetails`.

Illustrative authoring shape after migration:

```ts
const examplePublication = {
  kind: "publication",
  id: "example-paper", slug: "example-paper",
  title: "Example paper", summary: "A short description of this work.",
  date: { kind: "year", value: 2026 }, topics: ["Semantic Web"],
  publicationType: "Conference Paper",
  authors: "A. Researcher", venue: "Example conference",
  bibtex: "@inproceedings{example, title={Example paper}, year={2026}}",
  // Add abstract, DOI, PDF, and relationships only when available.
} satisfies PublicationEntry;

const exampleSoftware = {
  kind: "software",
  id: "example-tool", slug: "example-tool",
  title: "Example tool", summary: "What this tool helps people do.",
  date: { kind: "ongoing" }, topics: ["Semantic Web"],
  softwareType: "Web Application", purpose: "Explore linked data",
  sectionId: "platforms-applications",
  description: "A fuller explanation of the tool and how it works.",
  repositoryUrl: "https://github.com/example/tool",
} satisfies SoftwareEntry;

const exampleTalk = {
  kind: "talk",
  id: "example-talk", slug: "example-talk",
  title: "Example talk", summary: "What the audience will learn.",
  date: { kind: "day", value: "2026-10-08" }, topics: ["Semantic Web"],
  slides: { format: "pdf", assetId: "example-talk-slides" },
  // An HTML talk instead supplies { format: "html", url: "https://..." }.
  durationMinutes: 30,
} satisfies TalkEntry;
```

These illustrate the proposed API; the types do not exist yet. The implementation should include copyable minimal and fully populated examples for each entry type, plus an `ADDING_CONTENT.md` guide. Adding an entry should require only one record and any associated assets, with no changes to Vue templates, search indexing, or RDF mappings for already-supported fields.

`build:slides` must generate asset locations and technical metadata without rewriting authored titles, descriptions, dates, slugs, or relationships. Migrate the existing filename/slug mappings explicitly so existing links survive. Replace the fuzzy talk–poster matching with the relations that matching currently produces, written into the talk records. The builder should then read authored records instead of regex-parsing a TypeScript file. Its output must be deterministic: given the same archives, CI regeneration should produce no diff, and CI can enforce that with `git diff --exit-code` on the generated file. The watermark year currently comes from the build date, so older talks are stamped with the current year; use the talk's own year. Compatibility adapters can temporarily expose the current `src/data/*` interfaces while consumers move to the new catalog.

Validation must catch missing/blank required values, malformed real dates, duplicate IDs or route slugs, invalid section references, missing local assets, dangling relationships, and generated observation keys that match no entry. Use TypeScript `satisfies` for author feedback and build-time validation for cross-record checks. Run validation as an npm script in `prebuild` and CI. Back it with a fixture of minimal records of each kind that pass through validation, the catalog, keyword indexing, and RDF export, so the "add one record" promise is tested rather than asserted. Update RDF shapes alongside schema changes, and preserve existing public vocabulary/IRIs or provide an explicit migration mapping. Entry IRIs are minted from different fields per kind: `publication/{id}` and `software/{id}`, but `talk/{slug}` and `poster/{slug}`. Keep that mapping explicit so that changing a slug or ID never silently changes an IRI. Sub-resources use positional IRIs such as `publication-detail/{id}-{n}` and `related-resource/…-{n}`, which renumber whenever rows are reordered or core metadata leaves `details`. Decide up front that only entry IRIs are stable, or mint sub-resource IRIs from stable keys.

## Reusable behavior

Extract repeated behavior behind small functions or composables with typed inputs:

- Filter selection, reset, sorting, and route-query synchronization, retaining each page's existing URL parameters and filter meaning.
- Date labels and ordering, including year-only, ongoing, and unknown values.
- Route construction, external/resource link handling, and deployment base-path resolution.
- Related-entry lookup and reverse relationships.
- PDF loading/render cancellation and lifecycle cleanup, reused by paper, slide, poster, CV, and fellowship previews where their behavior matches.
- Keyword document construction from the catalog and RDF result navigation.

Keep data transforms usable by Node build scripts without importing Vue or browser globals. Migrate components to a common scripting style only where extraction benefits readability; a whole-site syntax rewrite would obscure the substantive changes.

## Monaco and the YASGUI interface

This is a feature addition, not a refactor, so it runs as its own track on its own branch. It depends only on the exported `public/site-data.ttl` and the existing IRI-to-route mapping (`mapIriToRoute` in `src/utils/siteSearch.ts`), so it can start once the baseline exists. When consumers move onto the catalog, its link resolution switches over too. Do not let it block, or be blocked by, the content and component work.

Use Solid Cockpit's composition as the primary architecture: mount the editor and results viewer independently, let Vue own Run/Cancel, and supply Comunica's results directly to the viewer. This replaces the earlier proposal to investigate intercepting the full Studio application's endpoint-request lifecycle.

The reference is [Solid Cockpit's DataQuery.vue](https://github.com/KNowledgeOnWebScale/solid-cockpit/blob/main/src/components/DataQuery.vue), inspected locally at commit `d37831c` on 9 October 2026. Relevant implementation points in that checkout are:

| Reference | Pattern to carry over |
| --- | --- |
| `DataQuery.vue`: `mounted`, `loadQueryEditors` | Independently construct YASQE/YASR, lazy-load their JavaScript, and set `showQueryButton: false` on the editor. |
| `DataQuery.vue`: `bindYasqeEditorEvents`, `syncYasqeFromExternalQuery` | Typing flows from the editor into Vue state; explicit example/draft changes update the editor only when the text differs. |
| `DataQuery.vue`: `runExecuteQuery`, `executeQueryByMode` | Vue controls execution and passes query text and sources into a separate Comunica service. |
| `services/query/queryPod.ts`: `executeWithEngine`, `streamBindingsToOutput` | Run `engine.queryBindings(query, context)` and turn RDF/JS bindings into a SPARQL Results JSON object. |
| `DataQuery.vue`: `initYasr`, `renderYasrFromJson` | Use the table/response plugins and call `yasr.setResponse({ data: json, contentType: "application/sparql-results+json" }, prefixes)`. |
| `services/query/queryWorker.js`, `DataQuery.vue`: `executeQuery`, `cancelQuery` | Run the ordinary Comunica engine in a worker and return result/error messages to the UI. |

Solid Cockpit uses the CodeMirror-based `@triply/yasqe` and standalone `@triply/yasr`, last published in 2022. Studio's [installation guide](https://sparql.studio/docs/getting-started) documents a standalone Monaco editor, `@rdfjs/sparql-editor-monaco`, and its results page documents `@rdfjs/sparql-results`. The latter takes `new SparqlResults(element, { prefixes })` and `setResponse(json, duration)`, and accepts SPARQL Results JSON directly. However, on 9 October 2026 neither package, nor `@rdfjs/sparql-studio`, resolved on the npm registry or jsDelivr, and GitHub code search found no source for them. The packages actually published from the `rdfjs/Yasgui` repository are `@zazuko/yasqe`, `@zazuko/yasr`, and `@zazuko/yasgui` 4.6.2 (MIT, August 2026), the maintained successors of the Triply packages. `qlue-ls` is published (3.11.1).

**Dependency gate (first task of this track).** Confirm an installable, licensed, version-pinned source for the Monaco editor and the results viewer before writing integration code. If the `@rdfjs` packages are still unavailable, choose between:

- `monaco-editor` with a small SPARQL Monarch grammar for highlighting, plus `@zazuko/yasr` for results. This keeps Monaco; completion waits for qlue-ls.
- `@zazuko/yasqe` with `@zazuko/yasr`. This is Solid Cockpit's exact composition with maintained packages, using CodeMirror instead of Monaco.

Do not depend on an unpublished build or a git branch without a pinned commit and a license check. The architecture below does not depend on this choice; only `SparqlEditor.vue` and `SparqlResults.vue` differ.

### Query flow and component boundaries

```text
Monaco query text + Vue Run action
  -> query worker: Comunica over sources: [n3Store]
  -> SPARQL Results JSON + run status
  -> standalone YASR-style results viewer
```

`public/site-data.ttl` supplies the N3 store. Adapt the existing `getComunicaStore` loading/parsing logic in `src/utils/siteSearch.ts`, preserving base-path resolution and the website base IRI. Replace Solid Cockpit's Pod/endpoint sources with this RDF/JS store and its normal `@comunica/query-sparql` engine. Pod authentication, traversal, permissions, provenance caches, and query-result uploads are outside this site's search flow.

Keep the integration in small modules:

- `src/components/search/SparqlSearchPanel.vue`: query state, examples, Run/Cancel, status/error notices, and editor/results composition.
- `src/components/search/SparqlEditor.vue`: Monaco initialization, text/change events, run commands, theming, resize handling, and disposal.
- `src/components/search/SparqlResults.vue`: the viewer's response API, table/response plugins, prefixes, result links, and downloads. Vendor-specific calls remain inside this wrapper.
- `src/services/search/sparqlService.ts`: cached Turtle loading, typed worker messages, request IDs, cancellation, and worker lifecycle.
- `src/services/search/sparql.worker.ts`: N3 parsing, a reused Comunica engine/store, bounded execution, and JSON serialization.
- `src/data/sparqlExamples.ts`: the curated `{ id, title, question, query, description }` records.

`SpotlightSearch.vue` continues to own the search modal and keyword/SPARQL switch. It mounts `SparqlSearchPanel` when needed; it should not manage editor internals or flatten SPARQL rows into keyword-style result cards.

### Implementation steps

1. **Mount the standalone components.** Load Monaco and the results viewer only when SPARQL mode opens in Standard mode. Import their CSS with the lazy-loaded component and ensure it is applied before constructing/measuring the editor. Use template refs and `shallowRef`/`markRaw` for imperative instances, following Solid Cockpit's approach. Bind the site's theme and container dimensions through Monaco's APIs.
2. **Give Vue sole ownership of execution.** Hide the editor's built-in endpoint Run button and route the visible button, Cmd/Ctrl+Enter, and any Run context-menu action to the same local service. Hiding a button alone does not disable shortcuts or endpoint execution; verify and replace those bindings in the pinned Monaco package. Use the wrapper's public command APIs and a small, explicit editor adapter if needed. Keep endpoint-request behavior out of the execution path.
3. **Initialize a store inside the worker.** Resolve and cache the Turtle text through the service, then send that text to the worker and construct `new Store(new Parser({ baseIRI }).parse(turtle))` there. An N3 Store instance must not be passed through `postMessage`, which does not preserve its prototype/methods. Reuse the initialized store and engine for successive queries; reset failed loading promises so Retry works.
4. **Return standard SPARQL JSON.** Preserve Solid Cockpit's JSON boundary while using Comunica's native serializer where practical: `engine.query(query, { sources: [store] })`, check for a bindings result, then `engine.resultToString(result, "application/sparql-results+json")`. Feed the complete parsed JSON to the results wrapper, with prefixes from the query. This preserves projected columns, RDF term types, datatypes, and language tags. Start with SELECT; report unsupported query forms explicitly.
5. **Bound and cancel execution.** Apply the configured row budget to the bindings stream before serialization, retaining its projected-variable metadata, and report any truncation. Never trim serialized JSON in the middle or append a textual LIMIT blindly. Use request IDs so a canceled/older query cannot overwrite a later result. Worker termination provides a reliable stop for CPU-bound local queries; settle the canceled request and reinitialize from cached Turtle for the next run. Destroy completed streams and terminate the worker when the panel is disposed. Distinguish cancellation, empty results, parse errors, data-loading failures, and execution errors.
6. **Keep editing stable.** Follow the reference's one-way editor-to-model updates; example/draft restoration updates the model and editor deliberately. Result rendering must not reset query text, selection, focus, or undo history. Reuse the viewer where supported, and dispose any replaced instance before rebuilding it. Resize on actual layout changes and handle modal open/close without leaking models, listeners, observers, or workers.
7. **Add the query examples.** Pair each query in [SPARQL_EXAMPLES.md](SPARQL_EXAMPLES.md) with its plain-language question and explanation. Selection loads the text into Monaco and focuses it; execution remains an explicit Run action. These are curated question/query pairs. Table columns remain visible for zero-row results and variables that happen to be unbound. Resolve known site IRIs through the content catalog to their detail routes; keep other resource links usable.
8. **Verify the complete search experience.** Check keyboard focus trapping/restoration, suggestion popups and Escape, Cmd/Ctrl+Enter, modal scrolling, and narrow-screen layout. Preserve keyword search and Lite-mode loading behavior, with a basic textarea available if the enhanced editor fails to initialize. Keep the results viewer's table/response views and verify downloads describe any imposed result cap accurately.

Use the reference's serializer as a guide to the result shape, with two deliberate improvements: its inspected implementations derive columns from the first binding and serialize terms using only `type` and `value`. Here, obtain projected variables from query metadata/native serialization, including for empty results, and preserve `datatype` or `xml:lang` on literals. These details belong in the query service, not in the visual component.

The optional qlue-ls language server remains a later enhancement for completion and diagnostics. The [installation guide](https://sparql.studio/docs/getting-started) describes its worker/WASM setup. First ship highlighting and local execution; then evaluate vocabulary-aware assistance against this site's graph and measure its bundle cost.

After the dependency gate, the first integration check verifies concrete package APIs, run-command routing, and browser/worker behavior. The application-controlled Comunica-to-results architecture is established by Solid Cockpit. Query tabs, if subsequently added, should reuse this same service and associate results with tab/run IDs; they are not a prerequisite for replacing the existing single-query textarea.

Local verification on 9 October 2026: the website's installed Comunica engine successfully ran all six example queries over the exported N3 graph and serialized their results as SPARQL JSON. Additional checks confirmed projected columns for empty results and unbound variables, language tags, integer datatypes, blank nodes, and IRIs. The Monaco/viewer components, worker transport, cancellation, and browser layout remain implementation checks.

## Implementation order and checks

Each step merges to `master` as its own pull request and must deploy on its own; the compatibility adapters make that possible. A single long-lived branch would drift from `master`, which receives bot commits (`public/alphabet-stock.json` daily and `src/data/scholarCitations.ts` on demand). It would also put the whole refactor behind one review. The SPARQL editor is a separate track (Track S below).

1. **Establish the baseline and guardrails.**
   - Add a `type-check` script using `vue-tsc` and run it in CI next to lint. Authoring feedback through `satisfies` and checked component props both depend on it; Vite compilation and the current `shims-vue.d.ts` do not check templates or props. Fix or record existing errors.
   - Script the visual baseline with Playwright, added as a dev dependency. Cover every route at desktop and mobile widths, in light and dark themes and Standard and Lite modes. Include filtered, empty, loading, missing-resource, and detail-preview states. Wait for `document.fonts.ready`, since KoHo and Cinzel load from Google Fonts, and stub third-party content such as remote icons and embedded HTML slides so captures are stable. Run comparisons locally on one machine rather than in CI, because font rendering differs across operating systems. Captured by hand, this would take well over a hundred screenshots per comparison.
   - Pin W3.CSS locally (no visual change).
   - Add a query check that runs every example in [SPARQL_EXAMPLES.md](SPARQL_EXAMPLES.md) against the exported graph and asserts its projected columns and non-empty results; run it in CI. The content migration will change the RDF export, and the examples depend on `ec:publicationYear`, `ec:sortDate`, and `ec:displayDate`.
   - Record routes, content counts, committed generated outputs (`public/site-data.ttl`, `public/recent_work.json`, `public/recent_work.ttl`), CV test results, and initial and lazy bundle sizes. Record existing failures separately.
2. **Build the Software vertical slice.** Add `types.ts`, `validation.ts`, `catalog.ts`, and the adapters, then migrate `software.ts`. Move tokens and base styles. Extract headings, cards, tags, actions, and filters, typed against the new entry types, and use them for the Software listing and detail page. Publish `ADDING_CONTENT.md` with the software examples. Before continuing, verify appearance, filtering, sorting, URLs, TOC behavior, and unchanged RDF and recent-work output. Piloting content and components together on the simplest kind tests both designs at once. It also avoids typing components against the old data shapes and rewriting them one step later.
3. **Publications.** Migrate the records, including the date review above, and move the listing and paper page onto the shared components. Move `update:scholar` onto the catalog so citations are keyed by real publication IDs.
4. **Talks and posters.** Migrate the records, replace fuzzy poster matching with authored relations, restrict `build:slides` to deterministic asset metadata, and add the CI no-diff check. Move the talks listing and the talk and poster detail pages onto the shared components.
5. **Move consumers onto the catalog and remove the adapters.** Migrate homepage updates, CV generation, recent-work export, keyword search, and RDF export. Compare record and relationship counts and generated outputs, allowing only identified intentional changes, such as unconfirmed dates losing false precision.
6. **Simplify the rest of the site.** Apply shared layout, headings, metadata, actions, and preview behavior to About, CV, Blogs, fellowship, privacy, header/footer, and consent UI where appropriate. Finish replacing W3.CSS and remove obsolete styles and helpers after all usages are migrated.
7. **Finalize documentation.** Document component ownership and how to add or extend entries, and confirm that every check above runs in CI.

**Track S: SPARQL editor.** This track is independent and can start after step 1. Pass the dependency gate, then implement the composition above: the editor, Vue-owned execution, the Comunica/N3 query worker, SPARQL Results JSON, and the results viewer. Verify the pinned editor/viewer APIs and run-command routing, then add the curated query gallery. Check Vite 8, root and subpath deployments, current browsers, Lite-mode loading, result links, cancellation and restart, empty and unbound columns, RDF literal metadata, and modal keyboard behavior.

The existing full build has a `prebuild` lifecycle that refreshes release data from GitHub and regenerates exports and CVs, so its output varies between runs. When comparing outputs, run `rdf:export`, `recent-work:export`, and `build:cv` directly against a fixed release snapshot, and review generated diffs deliberately. Use a direct Vite build for isolated rendering work when regeneration is irrelevant.

Completion criteria:

- Every existing route and asset link still resolves, including filtered URLs and HTML slide embeds.
- Existing visual treatments survive in both themes and performance modes, with intentional behavior corrections recorded.
- A minimal new publication, software item, talk, or poster appears correctly without editing presentation or export code, as verified by the fixture test in CI.
- Optional metadata produces appropriate UI only when present; unknown dates/durations/audience sizes remain unknown.
- Shared components own repeated visual rules, and shared functions own repeated filter/date/link/preview behavior.
- Search, homepage updates, CVs, and RDF derive from the same content; validation catches broken references before deployment.
- Generated files are reproducible: regenerating talk assets in CI produces no diff, no script parses TypeScript source, and every observation key matches an entry.
- All query examples execute against the exported graph in CI, and the editor/results integration is verified in the browser without adding its payload to ordinary keyword search.
